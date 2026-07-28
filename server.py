import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
A300_USECASE_ROOT = ROOT / "A300_Usecase"
F2M_SCRIPT = ROOT / "calc_mctf_f2m_roi_n_modified.py"
IMC_SETTINGS = Path(
    os.environ.get(
        "IMC_OVERRIDE_SETTINGS_PATH",
        A300_USECASE_ROOT / "imcoverridesettings(1).txt",
    )
)
USECASE_SCRIPT = Path(
    os.environ.get(
        "USECASE_SCRIPT_PATH",
        A300_USECASE_ROOT / "3840x2176_30_ainr_yuvflow_eis_on_c10_sensormode42.sh",
    )
)
PIPELINE_DIAGRAM = Path(
    os.environ.get(
        "PIPELINE_DIAGRAM_PATH",
        A300_USECASE_ROOT / "imcmctfnnnoainrpipeline.svg",
    )
)
EDITABLE_FILES = {
    "/api/imc-overrides": IMC_SETTINGS,
    "/api/usecase-script": USECASE_SCRIPT,
}
RESULT_PATTERN = re.compile(r"^(d1|d2|d4):\s*\[([^\]]+)\]\s*$", re.MULTILINE)
INVALID_FILENAME_PATTERN = re.compile(r'[<>:"/\\|?*]')


def renamed_file(source_file, filename):
    if not isinstance(filename, str):
        raise ValueError("文件名必须是文本")
    filename = filename.strip()
    if (
        not filename
        or filename in {".", ".."}
        or Path(filename).name != filename
        or INVALID_FILENAME_PATTERN.search(filename)
        or filename.endswith((" ", "."))
    ):
        raise ValueError("文件名无效")
    if Path(filename).suffix.lower() != source_file.suffix.lower():
        raise ValueError(f"文件扩展名必须保持为 {source_file.suffix}")
    return source_file.with_name(filename)


def file_payload(source_file):
    stat = source_file.stat()
    return {
        "name": source_file.name,
        "path": str(source_file),
        "modified_at": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
    }


class AppHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        try:
            super().log_message(format, *args)
        except (OSError, ValueError):
            # A detached Windows launcher may close its inherited stderr.
            pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        request_path = urlparse(self.path).path
        if request_path == "/api/health":
            self.send_json(
                200,
                {
                    "ok": True,
                    "script": str(F2M_SCRIPT),
                    "imc_settings": str(EDITABLE_FILES["/api/imc-overrides"]),
                    "usecase_script": str(EDITABLE_FILES["/api/usecase-script"]),
                    "pipeline_diagram": str(PIPELINE_DIAGRAM),
                },
            )
            return
        if request_path == "/api/pipeline-diagram-info":
            if not PIPELINE_DIAGRAM.is_file():
                self.send_json(404, {"error": f"找不到文件：{PIPELINE_DIAGRAM}"})
                return
            self.send_json(200, file_payload(PIPELINE_DIAGRAM))
            return
        if request_path == "/api/pipeline-diagram.svg":
            if not PIPELINE_DIAGRAM.is_file():
                self.send_json(404, {"error": f"找不到文件：{PIPELINE_DIAGRAM}"})
                return
            try:
                body = PIPELINE_DIAGRAM.read_bytes()
            except OSError as exc:
                self.send_json(500, {"error": f"读取图片失败：{exc}"})
                return
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        source_file = EDITABLE_FILES.get(request_path)
        if source_file:
            if not source_file.is_file():
                self.send_json(404, {"error": f"找不到文件：{source_file}"})
                return
            try:
                content = source_file.read_text(encoding="utf-8-sig")
            except UnicodeDecodeError:
                content = source_file.read_text(encoding="gb18030")
            self.send_json(200, {**file_payload(source_file), "content": content})
            return
        super().do_GET()

    def do_PUT(self):
        global PIPELINE_DIAGRAM
        request_path = urlparse(self.path).path
        if request_path == "/api/pipeline-diagram.svg":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > 12 * 1024 * 1024:
                    raise ValueError("SVG 文件大小无效")
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                content = payload["content"]
                if not isinstance(content, str):
                    raise ValueError("SVG 文件内容必须是文本")
                root = ET.fromstring(content.lstrip("\ufeff"))
                if root.tag.rsplit("}", 1)[-1].lower() != "svg":
                    raise ValueError("导入文件不是有效的 SVG")
                target_file = renamed_file(PIPELINE_DIAGRAM, payload["filename"])
            except (KeyError, TypeError, ValueError, ET.ParseError, json.JSONDecodeError) as exc:
                self.send_json(400, {"error": str(exc) or "SVG 文件无效"})
                return
            temp_path = None
            try:
                target_file.parent.mkdir(parents=True, exist_ok=True)
                descriptor, temp_name = tempfile.mkstemp(
                    prefix=f".{target_file.name}.", suffix=".tmp", dir=target_file.parent
                )
                os.close(descriptor)
                temp_path = Path(temp_name)
                with temp_path.open("w", encoding="utf-8", newline="\n") as output_file:
                    output_file.write(content)
                os.replace(temp_path, target_file)
                PIPELINE_DIAGRAM = target_file
                self.send_json(200, file_payload(PIPELINE_DIAGRAM))
            except OSError as exc:
                self.send_json(500, {"error": f"导入 SVG 失败：{exc}"})
            finally:
                if temp_path and temp_path.exists():
                    temp_path.unlink()
            return
        if request_path == "/api/pipeline-diagram-info":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > 4096:
                    raise ValueError("请求体大小无效")
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                target_file = renamed_file(PIPELINE_DIAGRAM, payload["filename"])
            except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
                self.send_json(400, {"error": str(exc) or "文件名无效"})
                return
            if target_file != PIPELINE_DIAGRAM and target_file.exists():
                self.send_json(409, {"error": f"目标文件已存在：{target_file}"})
                return
            try:
                if target_file != PIPELINE_DIAGRAM:
                    PIPELINE_DIAGRAM.rename(target_file)
                    PIPELINE_DIAGRAM = target_file
                self.send_json(200, file_payload(PIPELINE_DIAGRAM))
            except OSError as exc:
                self.send_json(500, {"error": f"重命名图片失败：{exc}"})
            return
        source_file = EDITABLE_FILES.get(request_path)
        if not source_file:
            self.send_json(404, {"error": "API not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 2 * 1024 * 1024:
                raise ValueError("文件内容大小无效")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            content = payload["content"]
            if not isinstance(content, str):
                raise ValueError("文件内容必须是文本")
            target_file = renamed_file(source_file, payload.get("filename", source_file.name))
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc) or "文件内容无效"})
            return

        temp_path = None
        try:
            if target_file != source_file and target_file.exists():
                self.send_json(409, {"error": f"目标文件已存在：{target_file}"})
                return
            target_file.parent.mkdir(parents=True, exist_ok=True)
            descriptor, temp_name = tempfile.mkstemp(
                prefix=f".{target_file.name}.", suffix=".tmp", dir=target_file.parent
            )
            os.close(descriptor)
            temp_path = Path(temp_name)
            with temp_path.open("w", encoding="utf-8", newline="\n") as output_file:
                output_file.write(content)
            os.replace(temp_path, target_file)
            if target_file != source_file:
                source_file.unlink()
                EDITABLE_FILES[request_path] = target_file
            self.send_json(200, file_payload(target_file))
        except Exception as exc:
            self.send_json(500, {"error": f"保存文件失败：{exc}"})
        finally:
            if temp_path and temp_path.exists():
                temp_path.unlink()

    def do_POST(self):
        request_path = urlparse(self.path).path
        if request_path.endswith("/import"):
            endpoint = request_path[: -len("/import")]
            source_file = EDITABLE_FILES.get(endpoint)
            if not source_file:
                self.send_json(404, {"error": "API not found"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > 2 * 1024 * 1024:
                    raise ValueError("文件内容大小无效")
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                content = payload["content"]
                if not isinstance(content, str):
                    raise ValueError("文件内容必须是文本")
                target_file = renamed_file(source_file, payload["filename"])
            except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
                self.send_json(400, {"error": str(exc) or "导入文件无效"})
                return
            temp_path = None
            try:
                target_file.parent.mkdir(parents=True, exist_ok=True)
                descriptor, temp_name = tempfile.mkstemp(
                    prefix=f".{target_file.name}.", suffix=".tmp", dir=target_file.parent
                )
                os.close(descriptor)
                temp_path = Path(temp_name)
                with temp_path.open("w", encoding="utf-8", newline="\n") as output_file:
                    output_file.write(content)
                os.replace(temp_path, target_file)
                EDITABLE_FILES[endpoint] = target_file
                self.send_json(200, file_payload(target_file))
            except OSError as exc:
                self.send_json(500, {"error": f"导入文件失败：{exc}"})
            finally:
                if temp_path and temp_path.exists():
                    temp_path.unlink()
            return
        if request_path != "/api/calc-f2m":
            self.send_json(404, {"error": "API not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4096:
                raise ValueError("请求体大小无效")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            width = int(payload["width"])
            height = int(payload["height"])
            if not (1 <= width <= 32768 and 1 <= height <= 32768):
                raise ValueError("w 和 h 必须是 1 到 32768 的整数")
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            self.send_json(400, {"error": str(exc) or "w/h 参数无效"})
            return

        if not F2M_SCRIPT.is_file():
            self.send_json(500, {"error": f"找不到计算脚本：{F2M_SCRIPT}"})
            return

        output_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as output_file:
                output_path = Path(output_file.name)

            command = [
                sys.executable,
                str(F2M_SCRIPT),
                "--width",
                str(width),
                "--height",
                str(height),
                "--out",
                str(output_path),
            ]
            completed = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=20,
                check=False,
            )
            output_text = output_path.read_text(encoding="utf-8") if output_path.exists() else ""
            log_lines = [
                "[iq-f2m] 获取 main-D1 V1-gdc0 参数",
                f"width={width}, height={height}",
                "",
                "[iq-f2m] 执行 Python 脚本",
                subprocess.list2cmdline(command),
                f"exit_code={completed.returncode}",
            ]
            if completed.stdout.strip():
                log_lines.extend(["", "[stdout]", completed.stdout.strip()])
            if completed.stderr.strip():
                log_lines.extend(["", "[stderr]", completed.stderr.strip()])
            if output_text.strip():
                log_lines.extend(["", "[脚本输出文件]", output_text.strip()])
            run_log = "\n".join(log_lines)

            if completed.returncode != 0:
                self.send_json(500, {"error": "Python 脚本执行失败", "log": run_log})
                return

            results = {}
            for name, raw_values in RESULT_PATTERN.findall(output_text):
                values = [float(value.strip()) for value in raw_values.split(",")]
                if len(values) == 4:
                    results[name] = values
            if set(results) != {"d1", "d2", "d4"}:
                self.send_json(500, {"error": "脚本输出缺少 d1/d2/d4 结果", "log": run_log})
                return

            self.send_json(200, {"results": results, "log": run_log})
        except subprocess.TimeoutExpired:
            self.send_json(504, {"error": "Python 脚本运行超时"})
        except Exception as exc:
            self.send_json(500, {"error": f"运行脚本时发生错误：{exc}"})
        finally:
            if output_path:
                try:
                    os.unlink(output_path)
                except FileNotFoundError:
                    pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    handler = partial(AppHandler, directory=str(ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving {ROOT} at http://{args.host}:{args.port}", flush=True)
    print(f"F2M script: {F2M_SCRIPT}", flush=True)
    print(f"IMC settings: {IMC_SETTINGS}", flush=True)
    print(f"Usecase script: {USECASE_SCRIPT}", flush=True)
    print(f"Pipeline diagram: {PIPELINE_DIAGRAM}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

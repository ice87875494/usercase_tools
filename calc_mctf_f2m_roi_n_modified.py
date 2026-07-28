import argparse


def align64(x):
    return (x // 64) * 64


def calc_roi(w, h):

    size_x = align64(w)
    size_y = align64(h)

    start_x = (w - size_x) // 2
    start_y = (h - size_y) // 2

    return {
        "size_x": size_x,
        "size_y": size_y,
        "start_x": start_x,
        "start_y": start_y,
    }


def blend_roi(roi1, roi2, k1x, k2x, k1y, k2y, w, h):

    size_x = int(k1x * roi1["size_x"] + k2x * roi2["size_x"])
    size_y = int(k1y * roi1["size_y"] + k2y * roi2["size_y"])

    start_x = (w - size_x) // 2
    start_y = (h - size_y) // 2

    return {
        "size_x": size_x,
        "size_y": size_y,
        "start_x": start_x,
        "start_y": start_y,
    }


def compute(w_d1, h_d1):

    w_d2 = w_d1 // 4
    h_d2 = h_d1 // 4

    w_d4 = w_d1 // 16
    h_d4 = h_d1 // 16

    # roi1
    d1_roi1 = calc_roi(w_d1, h_d1)
    d2_roi1 = calc_roi(w_d2, h_d2)
    d4_roi1 = calc_roi(w_d4, h_d4)

    # roi2
    d4_roi2 = calc_roi(w_d4, h_d4)

    d2_roi2 = {
        "size_x": d4_roi2["size_x"] * 4,
        "size_y": d4_roi2["size_y"] * 4,
        "start_x": d4_roi2["start_x"] * 4,
        "start_y": d4_roi2["start_y"] * 4,
    }

    d1_roi2 = {
        "size_x": d4_roi2["size_x"] * 16,
        "size_y": d4_roi2["size_y"] * 16,
        "start_x": d4_roi2["start_x"] * 16,
        "start_y": d4_roi2["start_y"] * 16,
    }

    # k parameters
    k1_d4x, k2_d4x = 1.0, 0.0
    k1_d4y, k2_d4y = 1.0, 0.0

    k1_d1x, k2_d1x = 1.0, 0.0
    k1_d1y, k2_d1y = 1.0, 0.0

    k1_d2x = (((d2_roi1["size_x"] - d2_roi2["size_x"]) // 64) // 2 * 64) / d2_roi1["size_x"]
    k2_d2x = 1.0

    k1_d2y = (((d2_roi1["size_y"] - d2_roi2["size_y"]) // 64) // 2 * 64) / d2_roi1["size_y"]
    k2_d2y = 1.0

    # blend
    d4_roi = blend_roi(d4_roi1, d4_roi2, k1_d4x, k2_d4x, k1_d4y, k2_d4y, w_d4, h_d4)
    d2_roi = blend_roi(d2_roi1, d2_roi2, k1_d2x, k2_d2x, k1_d2y, k2_d2y, w_d2, h_d2)
    d1_roi = blend_roi(d1_roi1, d1_roi2, k1_d1x, k2_d1x, k1_d1y, k2_d1y, w_d1, h_d1)

    return {
        "d1": (d1_roi1, d1_roi2, d1_roi, w_d1, h_d1),
        "d2": (d2_roi1, d2_roi2, d2_roi, w_d2, h_d2),
        "d4": (d4_roi1, d4_roi2, d4_roi, w_d4, h_d4),
    }


def normalize_roi(roi, w, h):
    return [
        roi["start_x"] / w,
        roi["start_y"] / h,
        roi["size_x"] / w,
        roi["size_y"] / h,
    ]


def format_norm_roi(roi, w, h):
    n = normalize_roi(roi, w, h)
    return f"[{n[0]:.12f}, {n[1]:.12f}, {n[2]:.12f}, {n[3]:.12f}]"


def write_txt(data, filename):

    with open(filename, "w") as f:
        f.write("==== ROI RAW (not normalized) ====\n")
        for level, (roi1, roi2, roi, w, h) in data.items():
            f.write(f"{level} image_size: [{w}, {h}]\n")
            f.write(f"{level}_roi1_independent: {roi1}\n")
            f.write(f"{level}_roi2_from_d4:      {roi2}\n")
            f.write(f"{level}_roi_final_blend:  {roi}\n")
            f.write("\n")

        f.write("==== ROI NORMALIZED ====\n")
        for level, (roi1, roi2, roi, w, h) in data.items():
            f.write(f"{level}_roi1_independent: {format_norm_roi(roi1, w, h)}\n")
            f.write(f"{level}_roi2_from_d4:      {format_norm_roi(roi2, w, h)}\n")
            f.write(f"{level}_roi_final_blend:  {format_norm_roi(roi, w, h)}\n")
            f.write("\n")

        f.write("==== FULL TO MESH ROI NORMALIZED (final only) ====\n")
        for level, (_, _, roi, w, h) in data.items():
            f.write(f"{level}: {format_norm_roi(roi, w, h)}\n")


def main():

    parser = argparse.ArgumentParser()

    parser.add_argument("--width", type=int, default=3840)
    parser.add_argument("--height", type=int, default=2176)

    parser.add_argument("--out", default="f2m_roi_n.txt")

    args = parser.parse_args()

    data = compute(args.width, args.height)

    write_txt(data, args.out)


if __name__ == "__main__":
    main()

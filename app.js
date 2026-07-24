const DIAGRAM_SIZE = { width: 1161, height: 1121 };
const TEMPLATE_ID = '4k30-normal-preview';
const SCHEMA_VERSION = 1;
const STORAGE_KEY = 'pipeline-page-generator-v1';
const TITLE_STORAGE_KEY = '4k30-table-editor-title-v1';
const TABLE_START_Y = 0;
const GROUPS = [['pipeline', 'Pipeline 节点'], ['usecase', 'Usecase 定义'], ['resolution', '分辨率表'], ['gdc1', 'GDC1 配置'], ['gdc0', 'GDC0 配置'], ['ast', '3AST 配置'], ['f2m', 'F2M 配置']];

const viewport = document.querySelector('#viewport');
const stage = document.querySelector('#stage');
const diagram = document.querySelector('#diagram');
const zoomValue = document.querySelector('#zoomValue');
const saveStatus = document.querySelector('#saveStatus');
const fieldMenu = document.querySelector('#fieldMenu');
const toast = document.querySelector('#toast');
const pageTitle = document.querySelector('#pageTitle');
const documentTitle = document.querySelector('#documentTitle');
const fieldGroups = document.querySelector('#fieldGroups');
const fieldSearch = document.querySelector('#fieldSearch');
const importErrors = document.querySelector('#importErrors');
const fileInput = document.querySelector('#fileInput');
const configPanel = document.querySelector('#configPanel');
const view = { scale: 1, x: 0, y: 0, dragging: false, pointerX: 0, pointerY: 0 };
const cells = [];
let activeOptionCell = null;
let toastTimer;

function normalize(value) {
  return String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function coordinate(node, property) {
  const layout = node.firstElementChild;
  const raw = property === 'x' ? layout?.style.marginLeft : layout?.style.paddingTop;
  return Math.round(Number.parseFloat(raw || '0'));
}

function groupFor(x, y) {
  if (y < 240) return 'pipeline';
  if (x >= 620 && y < 400) return 'ast';
  if (x >= 620 && y < 600) return 'f2m';
  if (y < 400) return 'usecase';
  if (x < 600 && y < 680) return 'resolution';
  return x >= 500 ? 'gdc1' : 'gdc0';
}
function slug(value) { return normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 32) || 'field'; }
function cellKey(cell) { return cell.id || `${cell.x}:${cell.y}`; }
function makeCellId(group, x, y, value) { return `${group}.${x}.${y}.${slug(value)}`; }

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800);
}

function renderView() {
  stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  zoomValue.textContent = `${Math.round(view.scale * 100)}%`;
}

function fitToView() {
  const padding = viewport.clientWidth < 680 ? 16 : 38;
  view.scale = Math.min(
    (viewport.clientWidth - padding * 2) / DIAGRAM_SIZE.width,
    (viewport.clientHeight - padding * 2) / DIAGRAM_SIZE.height,
    1
  );
  view.x = (viewport.clientWidth - DIAGRAM_SIZE.width * view.scale) / 2;
  view.y = (viewport.clientHeight - DIAGRAM_SIZE.height * view.scale) / 2;
  renderView();
}

function zoomAt(nextScale, clientX, clientY) {
  nextScale = Math.min(3, Math.max(.2, nextScale));
  const rect = viewport.getBoundingClientRect();
  const cursorX = clientX - rect.left;
  const cursorY = clientY - rect.top;
  const contentX = (cursorX - view.x) / view.scale;
  const contentY = (cursorY - view.y) / view.scale;
  view.x = cursorX - contentX * nextScale;
  view.y = cursorY - contentY * nextScale;
  view.scale = nextScale;
  renderView();
}

function zoomFromCenter(factor) {
  const rect = viewport.getBoundingClientRect();
  zoomAt(view.scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function readDraft() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.fields || {}; }
  catch { return {}; }
}

function saveDraft() {
  const values = Object.fromEntries(cells.map((cell) => [cellKey(cell), cell.value]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, templateId: TEMPLATE_ID, title: pageTitle.textContent.trim(), fields: values }));
  saveStatus.textContent = '已自动保存';
}

function bindTitleEditor() {
  let savedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
  try { savedTitle = JSON.parse(localStorage.getItem(STORAGE_KEY))?.title || savedTitle; } catch { /* Use the legacy title. */ }
  if (savedTitle) pageTitle.textContent = savedTitle;
  documentTitle.value = pageTitle.textContent.trim();
  document.title = pageTitle.textContent.trim() || '4K30 Normal Preview';
  pageTitle.addEventListener('input', () => {
    const value = pageTitle.textContent.trim();
    localStorage.setItem(TITLE_STORAGE_KEY, value);
    document.title = value || '4K30 Normal Preview';
    if (documentTitle.value !== value) documentTitle.value = value;
    saveStatus.textContent = '已自动保存';
    saveDraft();
  });
  pageTitle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      pageTitle.blur();
    }
  });
}

function updateCell(cell, value, save = true) {
  cell.value = String(value);
  if (cell.editor.innerText !== cell.value) cell.editor.innerText = cell.value;
  if (cell.fallback) {
    const text = normalize(cell.value);
    cell.fallback.textContent = text;
    const weightedLength = [...text].reduce((sum, character) => sum + (/[^\u0000-\u00ff]/.test(character) ? 1 : .58), 0);
    const fittedSize = Math.max(4.5, Math.min(cell.defaultFontSize || 14, (cell.availableWidth || 100) / Math.max(weightedLength, 1) * .9));
    cell.fallback.setAttribute('font-size', fittedSize.toFixed(1));
  }
  if (cell.input && cell.input.value !== cell.value) cell.input.value = cell.value;
  if (save) saveDraft();
}

function selectCellText(editor) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  selection.removeAllRanges();
  selection.addRange(range);
}

function moveCell(current, direction) {
  const index = cells.indexOf(current);
  const next = cells[index + direction];
  if (!next) return;
  next.editor.focus();
  selectCellText(next.editor);
}

function closeFieldMenu() {
  fieldMenu.hidden = true;
  fieldMenu.replaceChildren();
  activeOptionCell = null;
}

function placeFieldMenu(cell) {
  const rect = cell.editor.getBoundingClientRect();
  const width = Math.max(96, rect.width);
  const height = cell.optionType === 'mode' ? 128 : 68;
  const left = Math.min(window.innerWidth - width - 8, Math.max(8, rect.left));
  const top = rect.bottom + height + 5 > window.innerHeight ? rect.top - height - 5 : rect.bottom + 5;
  fieldMenu.style.left = `${left}px`;
  fieldMenu.style.top = `${Math.max(8, top)}px`;
  fieldMenu.style.width = `${width}px`;
}

function beginCustomEdit(cell) {
  cell.foreignObject.classList.add('manual-cell');
  cell.manual = true;
  updateCell(cell, '');
  cell.editor.focus();
}

function openFieldMenu(cell) {
  activeOptionCell = cell;
  const options = cell.optionType === 'mode' ? ['normal', 'ainr', 'rmsc', '自定义'] : ['开', '关'];
  fieldMenu.replaceChildren(...options.map((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'option');
    button.textContent = option;
    button.setAttribute('aria-selected', String(normalize(cell.value).toLowerCase() === option.toLowerCase()));
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      closeFieldMenu();
      if (option === '自定义') {
        beginCustomEdit(cell);
        return;
      }
      cell.manual = false;
      cell.foreignObject.classList.remove('manual-cell');
      updateCell(cell, option);
    });
    return button;
  }));
  fieldMenu.hidden = false;
  placeFieldMenu(cell);
}

function configureOptions() {
  const modeCell = cells.find((cell) => cell.defaultValue.toLowerCase() === 'normal');
  const eisCell = cells.find((cell) => cell.defaultValue === '开');
  [[modeCell, 'mode', '选择链路模式'], [eisCell, 'toggle', '选择开关状态']].forEach(([cell, type, label]) => {
    if (!cell) return;
    cell.optionType = type;
    cell.manual = type === 'mode' && !['normal', 'ainr', 'rmsc'].includes(cell.value.toLowerCase());
    cell.foreignObject.classList.add('option-cell');
    if (cell.manual) cell.foreignObject.classList.add('manual-cell');
    cell.editor.setAttribute('role', 'combobox');
    cell.editor.setAttribute('aria-label', label);
    cell.editor.setAttribute('aria-haspopup', 'listbox');
    cell.editor.addEventListener('click', (event) => {
      if (cell.manual) return;
      event.stopPropagation();
      openFieldMenu(cell);
    });
  });
}

function renderFieldPanel() {
  fieldGroups.replaceChildren();
  for (const [groupId, groupName] of GROUPS) {
    const groupCells = cells.filter((cell) => cell.group === groupId);
    if (!groupCells.length) continue;
    const details = document.createElement('details'); details.className = 'field-group'; details.open = groupId === 'pipeline' || groupId === 'usecase';
    const summary = document.createElement('summary'); summary.append(document.createTextNode(groupName));
    const count = document.createElement('span'); count.className = 'group-count'; count.textContent = groupCells.length; summary.append(count); details.append(summary);
    const container = document.createElement('div'); container.className = 'group-fields';
    for (const cell of groupCells) {
      const row = document.createElement('div'); row.className = 'field-row'; row.dataset.search = `${cell.id} ${cell.defaultValue}`.toLowerCase();
      const label = document.createElement('label'); label.htmlFor = `input-${cell.id}`; label.title = cell.defaultValue; label.textContent = cell.defaultValue.length > 18 ? `${cell.defaultValue.slice(0, 18)}…` : cell.defaultValue || `${cell.x}, ${cell.y}`;
      const input = document.createElement('input'); input.id = `input-${cell.id}`; input.type = 'text'; input.value = cell.value; input.autocomplete = 'off'; input.dataset.fieldId = cell.id;
      input.addEventListener('input', () => updateCell(cell, input.value)); row.append(label, input); container.append(row); cell.input = input; cell.row = row;
    }
    details.append(container); fieldGroups.append(details);
  }
  document.querySelector('#fieldCount').textContent = cells.length;
}

function filterFields(query) {
  const needle = query.trim().toLowerCase(); let visible = 0;
  for (const cell of cells) { const show = !needle || cell.row.dataset.search.includes(needle) || cell.value.toLowerCase().includes(needle); cell.row.hidden = !show; if (show) visible += 1; }
  for (const details of fieldGroups.querySelectorAll('details')) { const count = [...details.querySelectorAll('.field-row')].filter((row) => !row.hidden).length; details.hidden = count === 0; if (needle && count) details.open = true; }
  document.querySelector('#emptySearch').hidden = visible !== 0;
}

function bindTableCells(svg) {
  cells.length = 0;
  const draft = readDraft();
  for (const foreignObject of svg.querySelectorAll('foreignObject')) {
    const x = coordinate(foreignObject, 'x');
    const y = coordinate(foreignObject, 'y');
    if (y < TABLE_START_Y) continue;
    const editor = foreignObject.querySelector('div > div > div');
    if (!editor) continue;
    const fallback = foreignObject.closest('switch')?.querySelector('text') || null;
    const defaultValue = normalize(editor.innerText);
    const group = groupFor(x, y);
    const id = makeCellId(group, x, y, defaultValue);
    const availableWidth = Number.parseFloat(foreignObject.firstElementChild?.style.width || '100');
    const defaultFontSize = Number.parseFloat(fallback?.getAttribute('font-size') || '14');
    const cell = { id, group, x, y, editor, fallback, foreignObject, defaultValue, value: defaultValue, availableWidth, defaultFontSize, input: null, row: null, optionType: null, manual: false };
    cells.push(cell);
    foreignObject.classList.add('editable-cell');
    editor.contentEditable = 'true';
    editor.spellcheck = false;
    editor.setAttribute('role', 'textbox');
    editor.setAttribute('aria-label', `编辑表格单元格：${defaultValue || `${x},${y}`}`);
    updateCell(cell, defaultValue, false);
    const saved = draft[cellKey(cell)];
    if (typeof saved === 'string') updateCell(cell, saved, false);
    editor.addEventListener('input', () => updateCell(cell, normalize(editor.innerText)));
    editor.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        moveCell(cell, event.shiftKey ? -1 : 1);
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        editor.blur();
      } else if (event.key === 'Escape') {
        editor.blur();
      } else if (cell.optionType && !cell.manual && (event.key === 'ArrowDown' || event.key === ' ')) {
        event.preventDefault();
        openFieldMenu(cell);
      } else if (cell.optionType && !cell.manual && event.key.length === 1) {
        event.preventDefault();
      }
    });
  }
  cells.sort((a, b) => a.y - b.y || a.x - b.x);
  configureOptions();
  renderFieldPanel();
  saveStatus.textContent = Object.keys(draft).length ? '已恢复本地表格' : '表格自动保存';
}

function exportSvgSource() {
  const svg = diagram.querySelector('svg');
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', DIAGRAM_SIZE.width);
  clone.setAttribute('height', DIAGRAM_SIZE.height);
  clone.style.background = '#ffffff';
  clone.querySelectorAll('foreignObject').forEach((node) => node.remove());
  return new XMLSerializer().serializeToString(clone);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function collectDocument() {
  return { schemaVersion: SCHEMA_VERSION, templateId: TEMPLATE_ID, title: pageTitle.textContent.trim(), fields: Object.fromEntries(cells.map((cell) => [cell.id, cell.value])) };
}
function showImportErrors(errors = []) { importErrors.hidden = errors.length === 0; importErrors.textContent = errors.join('\n'); }
function validateDocument(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['配置必须是 JSON 对象。'];
  if (data.schemaVersion !== SCHEMA_VERSION) errors.push(`schemaVersion 必须为 ${SCHEMA_VERSION}。`);
  if (data.templateId !== TEMPLATE_ID) errors.push(`templateId 必须为 ${TEMPLATE_ID}。`);
  if (typeof data.title !== 'string') errors.push('title 必须是字符串。');
  if (!data.fields || typeof data.fields !== 'object' || Array.isArray(data.fields)) errors.push('fields 必须是对象。');
  else {
    const known = new Set(cells.map((cell) => cell.id));
    const unknown = Object.keys(data.fields).filter((id) => !known.has(id));
    const invalid = Object.entries(data.fields).filter(([, value]) => typeof value !== 'string').map(([id]) => id);
    if (unknown.length) errors.push(`未知字段：${unknown.slice(0, 6).join(', ')}${unknown.length > 6 ? '…' : ''}`);
    if (invalid.length) errors.push(`字段值必须是字符串：${invalid.slice(0, 6).join(', ')}`);
  }
  return errors;
}
function applyDocument(data) {
  pageTitle.textContent = data.title; documentTitle.value = data.title; document.title = data.title || '4K30 Normal Preview';
  for (const cell of cells) updateCell(cell, Object.hasOwn(data.fields, cell.id) ? data.fields[cell.id] : cell.defaultValue, false);
  saveDraft();
}
function exportJson() { downloadBlob(new Blob([JSON.stringify(collectDocument(), null, 2)], { type: 'application/json;charset=utf-8' }), `${TEMPLATE_ID}.json`); showToast('JSON 配置已导出'); }
async function importJson(file) {
  showImportErrors();
  try { const data = JSON.parse(await file.text()); const errors = validateDocument(data); if (errors.length) { showImportErrors(errors); return; } applyDocument(data); showToast('JSON 配置已导入'); }
  catch { showImportErrors(['文件不是有效的 UTF-8 JSON。']); }
}

function bytesFromDataUrl(dataUrl) { const binary = atob(dataUrl.split(',')[1]); const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i); return bytes; }
function buildPdf(jpeg, imageWidth, imageHeight) {
  const encoder = new TextEncoder(), chunks = [], offsets = [0]; let length = 0;
  const push = (value) => { const bytes = typeof value === 'string' ? encoder.encode(value) : value; chunks.push(bytes); length += bytes.length; };
  const object = (number, body, stream) => { offsets[number] = length; push(`${number} 0 obj\n${body}`); if (stream) { push('\nstream\n'); push(stream); push('\nendstream'); } push('\nendobj\n'); };
  push('%PDF-1.4\n'); object(1, '<< /Type /Catalog /Pages 2 0 R >>'); object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${DIAGRAM_SIZE.width} ${DIAGRAM_SIZE.height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  object(4, `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
  const content = encoder.encode(`q\n${DIAGRAM_SIZE.width} 0 0 ${DIAGRAM_SIZE.height} 0 0 cm\n/Im0 Do\nQ`); object(5, `<< /Length ${content.length} >>`, content);
  const xref = length; push('xref\n0 6\n0000000000 65535 f \n'); for (let i = 1; i <= 5; i += 1) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`); push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const result = new Uint8Array(length); let cursor = 0; for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; } return result;
}

async function renderCanvas() {
  const source = exportSvgSource(); const sourceUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try { const image = new Image(); await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = sourceUrl; }); const canvas = document.createElement('canvas'); canvas.width = DIAGRAM_SIZE.width * 2; canvas.height = DIAGRAM_SIZE.height * 2; const context = canvas.getContext('2d'); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); return canvas; }
  finally { URL.revokeObjectURL(sourceUrl); }
}

async function exportPng() {
  document.body.classList.add('exporting');
  document.activeElement?.blur();
  try {
    const source = exportSvgSource();
    const sourceUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = sourceUrl; });
      const canvas = document.createElement('canvas');
      canvas.width = DIAGRAM_SIZE.width * 2;
      canvas.height = DIAGRAM_SIZE.height * 2;
      const context = canvas.getContext('2d');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      downloadBlob(png, '4k30-normal-preview.png');
      showToast('图片已导出');
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  } catch {
    showToast('图片导出失败');
  } finally {
    document.body.classList.remove('exporting');
  }
}

async function exportPdf() {
  document.activeElement?.blur();
  try { const canvas = await renderCanvas(); const jpeg = bytesFromDataUrl(canvas.toDataURL('image/jpeg', .96)); const pdf = buildPdf(jpeg, canvas.width, canvas.height); downloadBlob(new Blob([pdf], { type: 'application/pdf' }), `${TEMPLATE_ID}.pdf`); showToast('PDF 已导出'); }
  catch { showToast('PDF 导出失败'); }
}

function resetTable() {
  for (const cell of cells) {
    cell.manual = false;
    cell.foreignObject.classList.remove('manual-cell');
    updateCell(cell, cell.optionType === 'mode' ? cell.defaultValue.toLowerCase() : cell.defaultValue, false);
  }
  saveDraft();
  showImportErrors();
  showToast('表格已恢复默认值');
}

async function loadDiagram() {
  const response = await fetch('assets/4k30-normal-preview.svg');
  if (!response.ok) throw new Error('图表加载失败');
  diagram.innerHTML = await response.text();
  const svg = diagram.querySelector('svg');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  bindTableCells(svg);
  fitToView();
}

viewport.addEventListener('wheel', (event) => {
  event.preventDefault();
  closeFieldMenu();
  zoomAt(view.scale * Math.exp(-event.deltaY * .0012), event.clientX, event.clientY);
}, { passive: false });
viewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('[contenteditable=true]')) return;
  closeFieldMenu();
  view.dragging = true;
  view.pointerX = event.clientX;
  view.pointerY = event.clientY;
  viewport.classList.add('dragging');
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', (event) => {
  if (!view.dragging) return;
  view.x += event.clientX - view.pointerX;
  view.y += event.clientY - view.pointerY;
  view.pointerX = event.clientX;
  view.pointerY = event.clientY;
  renderView();
});
function stopDragging(event) {
  view.dragging = false;
  viewport.classList.remove('dragging');
  if (event.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
}
viewport.addEventListener('pointerup', stopDragging);
viewport.addEventListener('pointercancel', stopDragging);
document.addEventListener('click', (event) => { if (!fieldMenu.contains(event.target)) closeFieldMenu(); });
document.querySelector('#zoomIn').addEventListener('click', () => zoomFromCenter(1.2));
document.querySelector('#zoomOut').addEventListener('click', () => zoomFromCenter(1 / 1.2));
document.querySelector('#fitView').addEventListener('click', fitToView);
document.querySelector('#fullscreen').addEventListener('click', async () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
document.querySelector('#exportPng').addEventListener('click', exportPng);
document.querySelector('#exportPdf').addEventListener('click', exportPdf);
document.querySelector('#exportJson').addEventListener('click', exportJson);
document.querySelector('#importJson').addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { const [file] = fileInput.files; if (file) importJson(file); fileInput.value = ''; });
documentTitle.addEventListener('input', () => { pageTitle.textContent = documentTitle.value; document.title = documentTitle.value || '4K30 Normal Preview'; saveDraft(); });
fieldSearch.addEventListener('input', () => filterFields(fieldSearch.value));
document.querySelector('#clearSearch').addEventListener('click', () => { fieldSearch.value = ''; filterFields(''); fieldSearch.focus(); });
document.querySelector('#togglePanel').addEventListener('click', () => configPanel.classList.toggle('open'));
document.querySelector('#closePanel').addEventListener('click', () => configPanel.classList.remove('open'));
document.querySelector('#resetTable').addEventListener('click', () => {
  if (confirm('恢复所有表格单元格的默认值？')) resetTable();
});
window.addEventListener('resize', fitToView);
bindTitleEditor();
setTimeout(() => document.querySelector('.canvas-hint').style.opacity = '0', 4200);
loadDiagram().catch(() => showToast('图表加载失败'));

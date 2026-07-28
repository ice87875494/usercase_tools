const SIZE = { width: 1161, height: 1601 };
const DEFAULT_TITLE = '4K30 16:9 Normal 1path2scale 2path3scale\u00a0 preview';
const STORAGE_KEY = '4k30-table-editor-v1';
const TITLE_KEY = '4k30-table-editor-title-v1';
const LAYOUT_KEY = '4k30-table-layout-v2';
const F2M_TRIGGER_LAYOUT_KEY = '4k30-f2m-trigger-layout-v1';
const IMC_CODE_LAYOUT_KEY = '4k30-imc-code-layout-v1';
const SCRIPT_CODE_LAYOUT_KEY = '4k30-script-code-layout-v1';
const PIPELINE_IMAGE_LAYOUT_KEY = '4k30-pipeline-image-layout-v1';
const PIPELINE_NODE_STORAGE_KEY = '4k30-pipeline-nodes-v1';
const STATE_VERSION_KEY = '4k30-table-editor-state-version';
const STATE_VERSION = '2026-07-27-v1';
const PERSISTED_STATE_KEYS = [STORAGE_KEY,TITLE_KEY,LAYOUT_KEY,F2M_TRIGGER_LAYOUT_KEY,IMC_CODE_LAYOUT_KEY,SCRIPT_CODE_LAYOUT_KEY,PIPELINE_IMAGE_LAYOUT_KEY,PIPELINE_NODE_STORAGE_KEY];
function migratePersistedState() {
  if(localStorage.getItem(STATE_VERSION_KEY)===STATE_VERSION)return;
  for(const key of PERSISTED_STATE_KEYS)localStorage.removeItem(key);
  localStorage.setItem(STATE_VERSION_KEY,STATE_VERSION);
}
migratePersistedState();
const PIPELINE_NODE_MODE_RULES = new Map([
  ['470:74',{path:1,minScale:1}],['540:74',{path:1,minScale:1}],['645:74',{path:1,minScale:1}],
  ['470:124',{path:1,minScale:2}],['540:124',{path:1,minScale:2}],['645:124',{path:1,minScale:2}],
  ['470:174',{path:1,minScale:3}],['540:174',{path:1,minScale:3}],['645:174',{path:1,minScale:3}],
  ['770:74',{path:2,minScale:1}],['840:74',{path:2,minScale:1}],['945:74',{path:2,minScale:1}],
  ['770:124',{path:2,minScale:2}],['840:124',{path:2,minScale:2}],['945:124',{path:2,minScale:2}],
  ['770:174',{path:2,minScale:3}],['840:174',{path:2,minScale:3}],['945:174',{path:2,minScale:3}]
]);
const PIPELINE_CONNECTOR_RULES = new Map([
  ['M 490 70 L 515.53 70',{path:1,minScale:1}],['M 560 70 L 585.53 70',{path:1,minScale:1}],
  ['M 560 120 L 585.53 120',{path:1,minScale:2}],['M 645 100 L 645 92.24',{path:1,minScale:2}],
  ['M 560 170 L 585.53 170',{path:1,minScale:3}],['M 645 150 L 645 142.24',{path:1,minScale:3}],
  ['M 790 70 L 815.53 70',{path:2,minScale:1}],['M 860 70 L 885.53 70',{path:2,minScale:1}],
  ['M 860 120 L 885.53 120',{path:2,minScale:2}],['M 860 170 L 885.53 170',{path:2,minScale:3}],
  ['M 945 100 L 945 92.24',{path:2,minScale:2}],['M 945 150 L 945 142.24',{path:2,minScale:3}]
]);
const SPLIT_PIPELINE_CONNECTORS = new Map([
  ['M 420 70 L 430 70 L 430 120 L 515.53 120',{shared:'M 420 70 L 430 70',segments:['M 430 70 L 430 120 L 515.53 120'],path:1,minScale:2}],
  ['M 420 70 L 430 70 L 430 170 L 515.53 170',{shared:'M 420 70 L 430 70',segments:['M 430 120 L 430 170 L 515.53 170'],path:1,minScale:3}],
  ['M 700 70 L 745.53 70',{shared:'M 700 70 L 730 70',segments:['M 730 70 L 745.53 70'],path:2,minScale:1}],
  ['M 720 70 L 730 70 L 730 120 L 815.53 120',{shared:'M 720 70 L 730 70',segments:['M 730 70 L 730 120 L 750 120','M 790 120 L 815.53 120'],path:2,minScale:2}],
  ['M 700 70 L 730 70 L 730 170 L 815.53 170',{shared:'M 700 70 L 730 70',segments:['M 730 120 L 730 170 L 750 170','M 790 170 L 815.53 170'],path:2,minScale:3}]
]);
const PIPELINE_JUNCTIONS = [{x:430,y:70},{x:430,y:120},{x:730,y:70},{x:730,y:120}];
const TABLE_START_Y = 250;
const TABLE_DEFINITIONS = [
  { id:'pipeline',name:'流程图',x:0,y:0,width:1160,height:240,defaultLayout:{x:-3.52104,y:5.67429,width:1254.68,height:259.902} },
  { id:'usecase',name:'Usecase定义',x:0,y:250,width:600,height:120,defaultLayout:{x:-5.70787,y:282.462,width:687.31,height:176.591} },
  { id:'ast',name:'iq-3ast配置',x:640,y:250,width:320,height:120,defaultLayout:{x:750.597,y:286.457,width:500.011,height:167.761} },
  { id:'resolution',name:'分辨率变化表',x:0,y:410,width:600,height:240,defaultLayout:{x:-2.93002,y:483.786,width:684.532,height:273.334} },
  { id:'f2m',name:'iq-f2m配置',x:640,y:410,width:320,height:120,defaultLayout:{x:750.769,y:493.508,width:503.597,height:168.647} },
  { id:'sensor',name:'Sensor定义',x:640,y:550,width:320,height:120,defaultLayout:{x:-370.332,y:5.1256,width:320,height:120} },
  { id:'gdc0',name:'main-iq-gdc0配置',x:0,y:680,width:480,height:441,defaultLayout:{x:-4.47496,y:779.594,width:622.534,height:491.841} },
  { id:'gdc1',name:'main-iq-gdc1配置',x:520,y:680,width:480,height:441,defaultLayout:{x:684.937,y:777.895,width:576.176,height:491.834} },
  { id:'subgdc0',name:'sub-iq-gdc0配置',x:0,y:1160,width:480,height:441,sourceId:'gdc0',defaultLayout:{x:-3.23941,y:1333.11,width:619.487,height:529.644} },
  { id:'subgdc1',name:'sub-iq-gdc1配置',x:520,y:1160,width:480,height:441,sourceId:'gdc1',defaultLayout:{x:679.948,y:1333.85,width:595.869,height:523.033} }
];
const SENSOR_CELL_KEY = '76:503';
const FPP_CELL_KEY = '152:503';
const V2_WR_D1_KEY = '526:503';
const V1_GDC0_D1_KEY = '301:503';
const V1_YSC_D4_KEY = '227:545';
const V1_YSC_D16_KEY = '227:587';
const V2_YSC_D4_KEY = '452:545';
const V2_YSC_D16_KEY = '452:587';
const V1_GDC0_D4_KEY = '301:545';
const V1_GDC0_D16_KEY = '301:587';
const SUB_V1_YSC_KEY = '227:629';
const SUB_V1_GDC0_KEY = '301:629';
const SUB_V1_WR_KEY = '377:629';
const EMPHASIZED_DIMENSION_KEYS = new Set([SENSOR_CELL_KEY,V2_WR_D1_KEY,SUB_V1_WR_KEY]);
const GDC0_RATIO_D1_KEY = '121:980';
const GDC0_RATIO_D4_KEY = '241:980';
const GDC0_RATIO_D16_KEY = '361:980';
const SUB_GDC0_RATIO_D1_KEY = 'subgdc0:121:980';
const GDC1_MESH_D1_KEY = '641:820';
const GDC1_MESH_D4_KEY = '761:820';
const GDC1_MESH_D16_KEY = '881:820';
const F2M_D1_KEY = '761:455';
const F2M_D2_KEY = '761:484';
const F2M_D4_KEY = '761:515';
const WRAPPED_F2M_EXPORT_KEYS = new Set([F2M_D2_KEY,F2M_D4_KEY]);
const SENSOR_BIT_DEPTH_KEY = '801:603';
const SENSOR_TYPE_KEY = '801:648';
const SENSOR_LAYOUT_VERSION = 1;
const GDC_HEADER_LAYOUT_VERSION = 1;
const DEFAULT_CELL_VALUES = {
  '301:629':'w:1920 h:1088','526:503':'w:3840 h:2160',
  [F2M_D2_KEY]:'[0.066666666667, 0.029411764706, 0.866666666667, 0.941176470588]',
  [F2M_D4_KEY]:'[0.10, 0.029411764706, 0.80, 0.941176470588]',
  'subgdc0:241:980':'[0.9375,\n0.6071428571428571]','subgdc0:361:980':'[0.9375,\n0.6071428571428571]',
  'subgdc1:641:820':'37/29','subgdc1:641:860':'2','subgdc1:641:900':'[1.0, 1.0]','subgdc1:641:1100':'0',
  'subgdc1:761:820':'37/29','subgdc1:761:860':'2','subgdc1:761:900':'[1.0, 1.0]','subgdc1:761:1100':'0',
  'subgdc1:881:820':'37/29','subgdc1:881:900':'[1.0, 1.0]','subgdc1:881:1100':'0'
};
const CONFIGS = {
  '1:342': { type: 'single', label: '工作模式', options: ['录制（含录制中预览）', '低功耗预览流'], defaultValue: '录制（含录制中预览）' },
  '172:342': { type: 'single', label: '链路模式', options: ['normal', 'ainr', 'rmsc'], defaultValue: 'normal' },
  '257:342': { type: 'single', label: 'EIS', options: ['开', '关'], defaultValue: '开' },
  '343:342': { type: 'parts', label: '对齐类型', parts: [
    { key: 'main', label: 'main', options: ['关闭', 'align', '光流'], defaultValue: '光流' },
    { key: 'sub', label: 'sub', options: ['关闭', 'align', '光流'], defaultValue: 'align' }
  ] },
  '430:342': { type: 'parts', label: 'VEPP1', parts: [
    { key: 'main', label: 'main', options: ['d1', 'd1d4', 'd1d4d16'], defaultValue: 'd1d4d16' },
    { key: 'sub', label: 'sub', options: ['有', '无'], defaultValue: '有' }
  ] },
  '515:342': { type: 'parts', label: 'VEPP2 main', parts: [
    { key: 'main', label: 'main', options: ['关闭', 'd1', 'd1d4', 'd1d4d16'], defaultValue: 'd1d4d16' }
  ] },
  [SENSOR_BIT_DEPTH_KEY]: { type: 'number', label: 'ISP支持接入的bit位宽', min: 10, max: 20, defaultValue: '10' },
  [SENSOR_TYPE_KEY]: { type: 'single', label: 'sensor类型', options: ['binning', 'DCG-HDR', 'fullr-rmsc_on', 'fullr-rmsc_off'], defaultValue: 'DCG-HDR' }
};

const viewport = document.querySelector('#viewport');
const stage = document.querySelector('#stage');
const diagram = document.querySelector('#diagram');
const zoomValue = document.querySelector('#zoomValue');
const saveStatus = document.querySelector('#saveStatus');
const pageTitle = document.querySelector('#pageTitle');
const pipelineStrikeButton = document.querySelector('#pipelineStrike');
const fieldMenu = document.querySelector('#fieldMenu');
const toast = document.querySelector('#toast');
const tableControls = document.querySelector('#tableControls');
const f2mTriggerControl = document.querySelector('#f2mTriggerControl');
const f2mTriggerDrag = document.querySelector('#f2mTriggerDrag');
const f2mTrigger = document.querySelector('#f2mTrigger');
const f2mLogDialog = document.querySelector('#f2mLogDialog');
const f2mLog = document.querySelector('#f2mLog');
const f2mLogClose = document.querySelector('#f2mLogClose');
const view = { scale: 1, x: 0, y: 0, dragging: false, pointerX: 0, pointerY: 0 };
const f2mTriggerLayout = { x: 1064.01, y: 686.06, baseX: 1064.01, baseY: 686.06 };
const textFileModules = [
  { name:'imcoverridesettings(1).txt',extension:'.txt',endpoint:'/api/imc-overrides',layoutKey:IMC_CODE_LAYOUT_KEY,panel:document.querySelector('#imcCodePanel'),drag:document.querySelector('#imcCodeDrag'),importButton:document.querySelector('#imcCodeImport'),fileInput:document.querySelector('#imcCodeFileInput'),save:document.querySelector('#imcCodeSave'),refresh:document.querySelector('#imcCodeRefresh'),resize:document.querySelector('#imcCodeResize'),title:document.querySelector('#imcCodeName'),path:document.querySelector('#imcCodePath'),code:document.querySelector('#imcCode'),layout:{x:1351.25,y:2.23012,width:651.505,height:532.134,baseX:1351.25,baseY:2.23012,baseWidth:651.505,baseHeight:532.134},dirty:false,sourceLabel:'',currentName:''},
  { name:'Usecase 脚本',extension:'.sh',endpoint:'/api/usecase-script',layoutKey:SCRIPT_CODE_LAYOUT_KEY,panel:document.querySelector('#scriptCodePanel'),drag:document.querySelector('#scriptCodeDrag'),importButton:document.querySelector('#scriptCodeImport'),fileInput:document.querySelector('#scriptCodeFileInput'),save:document.querySelector('#scriptCodeSave'),refresh:document.querySelector('#scriptCodeRefresh'),resize:document.querySelector('#scriptCodeResize'),title:document.querySelector('#scriptCodeName'),path:document.querySelector('#scriptCodePath'),code:document.querySelector('#scriptCode'),layout:{x:1349.45,y:610.713,width:654.113,height:621.357,baseX:1349.45,baseY:610.713,baseWidth:654.113,baseHeight:621.357},dirty:false,sourceLabel:'',currentName:''}
];
const pipelineImageModule = {
  extension:'.svg',panel:document.querySelector('#pipelineImagePanel'),drag:document.querySelector('#pipelineImageDrag'),importButton:document.querySelector('#pipelineImageImport'),fileInput:document.querySelector('#pipelineImageFileInput'),save:document.querySelector('#pipelineImageSave'),refresh:document.querySelector('#pipelineImageRefresh'),resize:document.querySelector('#pipelineImageResize'),title:document.querySelector('#pipelineImageName'),path:document.querySelector('#pipelineImagePath'),canvas:document.querySelector('#pipelineImageCanvas'),image:document.querySelector('#pipelineImage'),status:document.querySelector('#pipelineImageStatus'),dirty:false,sourceLabel:'',currentName:'',viewer:{active:false,scale:1,x:0,y:0,dragging:false,pointerX:0,pointerY:0},layout:{x:2099.23,y:345.457,width:1142.54,height:722.874,baseX:2099.23,baseY:345.457,baseWidth:1142.54,baseHeight:722.874}
};
const cells = [];
const pipelineNodes = [];
const pipelineConnectors = [];
const exportFallbackStyles = new Map();
let activeCell = null;
let activePipelineNode = null;
let toastTimer;
let tableLayouts=[];
let freeModuleZIndex=20;

const normalize = (value) => String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
const normalizeMultiline = (value) => String(value ?? '').replace(/\u00a0/g,' ').replace(/\r/g,'').trim();
function coordinate(node, property) { const layout = node.firstElementChild; const raw = property === 'x' ? layout?.style.marginLeft : layout?.style.paddingTop; return Math.round(Number.parseFloat(raw || '0')); }
const keyFor = (cell) => `${cell.scope?`${cell.scope}:`:''}${cell.x}:${cell.y}`;
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('visible'); toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800); }
function payloadFileName(payload,fallback='') { return payload?.name||String(payload?.path||'').split(/[\\/]/).pop()||fallback; }
function hasExpectedExtension(file,extension) { return file?.name?.toLowerCase().endsWith(extension); }
async function readImportedText(file) { const bytes=await file.arrayBuffer();try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/^\ufeff/,'');}catch{return new TextDecoder('gb18030').decode(bytes).replace(/^\ufeff/,'');} }
function bringFreeModuleToFront(panel) { panel.style.zIndex=String(++freeModuleZIndex); }
function renderView() { stage.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.scale})`; zoomValue.textContent = `${Math.round(view.scale * 100)}%`; }
function fitToView() { const padding = viewport.clientWidth < 680 ? 16 : 38; view.scale = Math.min((viewport.clientWidth-padding*2)/SIZE.width,(viewport.clientHeight-padding*2)/SIZE.height,1); view.x=(viewport.clientWidth-SIZE.width*view.scale)/2; view.y=(viewport.clientHeight-SIZE.height*view.scale)/2; renderView(); }
function zoomAt(scale,clientX,clientY) { scale=Math.min(3,Math.max(.2,scale)); const rect=viewport.getBoundingClientRect(), cx=clientX-rect.left, cy=clientY-rect.top, px=(cx-view.x)/view.scale, py=(cy-view.y)/view.scale; view.x=cx-px*scale; view.y=cy-py*scale; view.scale=scale; renderView(); }
function zoomCenter(factor) { const rect=viewport.getBoundingClientRect(); zoomAt(view.scale*factor,rect.left+rect.width/2,rect.top+rect.height/2); }
function readDraft() { try { const draft=JSON.parse(localStorage.getItem(STORAGE_KEY))||{};if(draft[SENSOR_BIT_DEPTH_KEY]===undefined&&draft['901:603']!==undefined)draft[SENSOR_BIT_DEPTH_KEY]=draft['901:603'];if(draft[SENSOR_TYPE_KEY]===undefined&&draft['901:648']!==undefined)draft[SENSOR_TYPE_KEY]=draft['901:648'];return draft; } catch { return {}; } }
function saveDraft() { localStorage.setItem(STORAGE_KEY,JSON.stringify(Object.fromEntries(cells.map(cell=>[keyFor(cell),cell.value])))); saveStatus.textContent='已自动保存'; }
function updateFallback(fallback,value) {
  if(!fallback)return;const lines=normalizeMultiline(value).split('\n');
  if(lines.length===1){fallback.textContent=lines[0];return;}
  const parsedCenterY=Number.parseFloat(fallback.dataset.centerY||fallback.getAttribute('y')||'0'),parsedLineHeight=Number.parseFloat(fallback.dataset.lineHeight||fallback.getAttribute('font-size')||'11'),centerY=Number.isFinite(parsedCenterY)?parsedCenterY:0,lineHeight=Number.isFinite(parsedLineHeight)&&parsedLineHeight>0?parsedLineHeight:11,x=fallback.getAttribute('x');
  fallback.replaceChildren(...lines.map((text,index)=>{const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('x',x);span.setAttribute('y',String(centerY+(index-(lines.length-1)/2)*lineHeight));span.textContent=text;return span;}));
}
function wrapExportValueAfterComma(value,commaNumber) { const text=normalizeMultiline(value);if(text.includes('\n'))return text;let seen=0;for(let index=0;index<text.length;index++){if(text[index]!==',')continue;seen++;if(seen===commaNumber)return`${text.slice(0,index+1)}\n${text.slice(index+1).trimStart()}`;}return text; }
function isGdc0ScaleRatioCell(cell) { return(cell.tableId==='gdc0'||cell.tableId==='subgdc0')&&cell.y===980&&cell.x!==1; }
function exportValueForCell(cell) { const key=keyFor(cell);if(WRAPPED_F2M_EXPORT_KEYS.has(key))return wrapExportValueAfterComma(cell.value,2);if(isGdc0ScaleRatioCell(cell))return wrapExportValueAfterComma(cell.value,1);return cell.value; }
function pipelineNodeKey(fallback) { return`${Math.round(Number.parseFloat(fallback.getAttribute('x')||'0'))}:${Math.round(Number.parseFloat(fallback.getAttribute('y')||'0'))}`; }
function readPipelineNodeDraft() { try{return JSON.parse(localStorage.getItem(PIPELINE_NODE_STORAGE_KEY))||{};}catch{return{};} }
function savePipelineNodeDraft() { localStorage.setItem(PIPELINE_NODE_STORAGE_KEY,JSON.stringify(Object.fromEntries(pipelineNodes.map(node=>[node.key,{name:node.value,struck:node.struck}]))));saveStatus.textContent='已自动保存'; }
function restoreElementAttributes(element,snapshot) { for(const [name,value] of Object.entries(snapshot)){if(value===null)element.removeAttribute(name);else element.setAttribute(name,value);} }
function renderPipelineNode(node,restoreMarkup=false) {
  if(restoreMarkup&&node.value===node.defaultValue)node.editor.innerHTML=node.defaultHtml;else if(normalize(node.editor.innerText)!==node.value)node.editor.textContent=node.value;
  node.foreignObject.classList.toggle('pipeline-node-struck',node.struck);node.fallback.textContent=node.value;
  if(node.struck)node.fallback.setAttribute('text-decoration','line-through');else node.fallback.removeAttribute('text-decoration');
  node.editor.setAttribute('aria-label',`编辑流程模块：${node.value||node.defaultValue}`);
}
function setActivePipelineNode(node) { if(activePipelineNode===node)return;if(activePipelineNode)activePipelineNode.foreignObject.classList.remove('pipeline-node-active');activePipelineNode=node;if(node)node.foreignObject.classList.add('pipeline-node-active');pipelineStrikeButton.disabled=!node;pipelineStrikeButton.setAttribute('aria-pressed',String(Boolean(node?.struck))); }
function togglePipelineNodeStrike() { if(!activePipelineNode)return;activePipelineNode.struck=!activePipelineNode.struck;renderPipelineNode(activePipelineNode);pipelineStrikeButton.setAttribute('aria-pressed',String(activePipelineNode.struck));savePipelineNodeDraft(); }
function setPipelineNodeDisabledState(node,disabled) {
  node.foreignObject.classList.toggle('pipeline-node-auto-disabled',disabled);
  if(node.shape){if(disabled){node.shape.setAttribute('fill','#e5e7e9');node.shape.setAttribute('stroke','#a4aab0');node.shape.style.fill='#e5e7e9';node.shape.style.stroke='#a4aab0';}else restoreElementAttributes(node.shape,node.shapeBase);}
  if(disabled){node.fallback.setAttribute('fill','#8a9199');node.fallback.style.fill='#8a9199';}else restoreElementAttributes(node.fallback,node.fallbackPaintBase);
}
function setPipelineConnectorDisabledState(connector,disabled) {
  connector.paths.forEach((path,index)=>{if(disabled){path.setAttribute('stroke','#8a9199');path.style.stroke='#8a9199';if(index===0){path.setAttribute('stroke-dasharray','5 4');path.style.strokeDasharray='5 4';}}else restoreElementAttributes(path,connector.base[index]);});
}
function titlePathScales() { const modes={1:null,2:null};for(const match of pageTitle.textContent.matchAll(/([12])\s*path\s*([123])\s*scale/ig))modes[Number(match[1])]=Number(match[2]);if(modes[1]===null&&modes[2]===null)return{1:3,2:3};return modes; }
function applyPipelineModes() { const scales=titlePathScales();for(const node of pipelineNodes){const rule=PIPELINE_NODE_MODE_RULES.get(node.key);setPipelineNodeDisabledState(node,Boolean(rule)&&((scales[rule.path]??0)<rule.minScale));}for(const connector of pipelineConnectors)setPipelineConnectorDisabledState(connector,(scales[connector.path]??0)<connector.minScale); }
function addPipelineJunctions(group) { for(const point of PIPELINE_JUNCTIONS){const marker=document.createElementNS('http://www.w3.org/2000/svg','circle');marker.setAttribute('cx',String(point.x));marker.setAttribute('cy',String(point.y));marker.setAttribute('r','3');marker.setAttribute('fill','#000000');marker.setAttribute('pointer-events','none');marker.dataset.pipelineJunction='';group.append(marker);} }
function bindPipelineNodes(svg) {
  pipelineNodes.length=0;pipelineConnectors.length=0;const group=svg.querySelector('[data-table-content="pipeline"]');if(!group)return;const draft=readPipelineNodeDraft(),rects=[...group.querySelectorAll('rect')];
  for(const foreignObject of group.querySelectorAll('foreignObject')){
    const editor=foreignObject.querySelector('div > div > div'),fallback=foreignObject.closest('switch')?.querySelector('text');if(!editor||!fallback)continue;const x=Math.round(Number.parseFloat(fallback.getAttribute('x')||'0')),y=Math.round(Number.parseFloat(fallback.getAttribute('y')||'0'));if(y>=200)continue;
    const key=`${x}:${y}`,defaultValue=normalize(editor.innerText),defaultStruck=Boolean(editor.querySelector('strike,s,del'));for(const struck of [...editor.querySelectorAll('strike,s,del')])struck.replaceWith(...struck.childNodes);const defaultHtml=editor.innerHTML,saved=draft[key],value=typeof saved?.name==='string'?normalize(saved.name):defaultValue,struck=typeof saved?.struck==='boolean'?saved.struck:defaultStruck,pointY=y-4;
    const shape=rects.filter(rect=>{const rx=Number.parseFloat(rect.getAttribute('x')),ry=Number.parseFloat(rect.getAttribute('y')),width=Number.parseFloat(rect.getAttribute('width')),height=Number.parseFloat(rect.getAttribute('height'));return Number.isFinite(rx)&&Number.isFinite(ry)&&Number.isFinite(width)&&Number.isFinite(height)&&rect.getAttribute('fill')!=='none'&&x>=rx&&x<=rx+width&&pointY>=ry&&pointY<=ry+height;}).sort((a,b)=>Number.parseFloat(a.getAttribute('width'))*Number.parseFloat(a.getAttribute('height'))-Number.parseFloat(b.getAttribute('width'))*Number.parseFloat(b.getAttribute('height')))[0]||null;
    const node={key,x,y,editor,fallback,foreignObject,shape,shapeBase:shape?{fill:shape.getAttribute('fill'),stroke:shape.getAttribute('stroke'),style:shape.getAttribute('style')}:null,fallbackPaintBase:{fill:fallback.getAttribute('fill'),style:fallback.getAttribute('style')},defaultValue,defaultStruck,defaultHtml,value:value||defaultValue,struck};pipelineNodes.push(node);foreignObject.classList.add('pipeline-node-label');foreignObject.dataset.pipelineNodeKey=key;editor.contentEditable='true';editor.spellcheck=false;editor.tabIndex=0;editor.setAttribute('role','textbox');renderPipelineNode(node,true);
    editor.addEventListener('pointerdown',(event)=>{event.stopPropagation();setActivePipelineNode(node);});editor.addEventListener('focus',()=>setActivePipelineNode(node));editor.addEventListener('input',()=>{node.value=normalize(editor.innerText);node.fallback.textContent=node.value;node.editor.setAttribute('aria-label',`编辑流程模块：${node.value||node.defaultValue}`);savePipelineNodeDraft();});editor.addEventListener('blur',()=>{node.value=normalize(editor.innerText)||node.defaultValue;renderPipelineNode(node,true);savePipelineNodeDraft();});editor.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();editor.blur();}else if(event.key==='Escape'){event.preventDefault();node.value=normalize(editor.innerText)||node.defaultValue;renderPipelineNode(node,true);editor.blur();}});
  }
  for(const [sourceD,parts] of SPLIT_PIPELINE_CONNECTORS){const source=[...group.querySelectorAll('path')].find(path=>path.getAttribute('d')===sourceD);if(!source)continue;const arrow=[...source.parentElement.querySelectorAll(':scope > path')].find(path=>path!==source);source.setAttribute('d',parts.shared);let previous=source;parts.segments.forEach((d,index)=>{const segment=source.cloneNode(false);segment.setAttribute('d',d);previous.after(segment);previous=segment;const paths=index===parts.segments.length-1?[segment,arrow].filter(Boolean):[segment];pipelineConnectors.push({paths,base:paths.map(item=>({stroke:item.getAttribute('stroke'),'stroke-dasharray':item.getAttribute('stroke-dasharray'),style:item.getAttribute('style')})),path:parts.path,minScale:parts.minScale});});}
  for(const path of group.querySelectorAll('path')){const rule=PIPELINE_CONNECTOR_RULES.get(path.getAttribute('d'));if(!rule)continue;const paths=[...path.parentElement.querySelectorAll(':scope > path')];pipelineConnectors.push({paths,base:paths.map(item=>({stroke:item.getAttribute('stroke'),'stroke-dasharray':item.getAttribute('stroke-dasharray'),style:item.getAttribute('style')})),...rule});}
  addPipelineJunctions(group);
  applyPipelineModes();
}
function resetPipelineNodes() { localStorage.removeItem(PIPELINE_NODE_STORAGE_KEY);for(const node of pipelineNodes){node.value=node.defaultValue;node.struck=node.defaultStruck;renderPipelineNode(node,true);}setActivePipelineNode(null);applyPipelineModes(); }
function syncDimensionInputs(cell) { const dimensions=parseDimensions(cell.value);cell.dimensionInputs.width.value=dimensions?String(dimensions.width):'';cell.dimensionInputs.height.value=dimensions?String(dimensions.height):''; }
function updateCell(cell,value,save=true) { cell.value=String(value); if(cell.dimensionInputs)syncDimensionInputs(cell);else if(cell.editor.innerText!==cell.value)cell.editor.innerText=cell.value; updateFallback(cell.fallback,cell.value); if(save) saveDraft(); }
function captureCellInput(cell) { if(cell.dimensionInputs){const width=cell.dimensionInputs.width.value.trim(),height=cell.dimensionInputs.height.value.trim();cell.value=`w:${width}\nh:${height}`;}else cell.value=normalizeMultiline(cell.editor.innerText);updateFallback(cell.fallback,cell.value);saveDraft(); }
function selectText(editor) { const selection=window.getSelection(),range=document.createRange(); range.selectNodeContents(editor); selection.removeAllRanges(); selection.addRange(range); }
function focusCell(cell,direction=1) { if(cell.dimensionInputs){const input=direction<0?cell.dimensionInputs.height:cell.dimensionInputs.width;input.focus();input.select();return;}cell.editor.focus();if(cell.editor.isContentEditable)selectText(cell.editor); }
function moveCell(cell,direction) { let index=cells.indexOf(cell)+direction;while(index>=0&&index<cells.length){const next=cells[index];if(!next.disabled){focusCell(next,direction);return;}index+=direction;} }
function handleCellKeydown(cell,event) {
  if(event.key==='Tab'){
    if(cell.dimensionInputs&&event.target===cell.dimensionInputs.width&&!event.shiftKey){event.preventDefault();cell.dimensionInputs.height.focus();cell.dimensionInputs.height.select();return;}
    if(cell.dimensionInputs&&event.target===cell.dimensionInputs.height&&event.shiftKey){event.preventDefault();cell.dimensionInputs.width.focus();cell.dimensionInputs.width.select();return;}
    event.preventDefault();moveCell(cell,event.shiftKey?-1:1);
  } else if(event.key==='Enter'&&!event.shiftKey){
    event.preventDefault();
    if(cell.dimensionInputs&&event.target===cell.dimensionInputs.width){cell.dimensionInputs.height.focus();cell.dimensionInputs.height.select();}else event.target.blur();
  } else if(event.key==='Escape')event.target.blur();
  else if(cell.config&&(event.key==='ArrowDown'||event.key===' ')){event.preventDefault();openMenu(cell);}
}
function closeMenu() { if(activeCell)activeCell.editor.setAttribute('aria-expanded','false');fieldMenu.hidden=true; fieldMenu.replaceChildren(); activeCell=null; }
function placeMenu(cell) { const rect=cell.editor.getBoundingClientRect(), width=Math.max(150,rect.width), rows=cell.config.type==='parts'?cell.config.parts.length:1, height=18+rows*38; fieldMenu.style.left=`${Math.min(innerWidth-width-8,Math.max(8,rect.left))}px`; fieldMenu.style.top=`${Math.max(8,rect.bottom+height+5>innerHeight?rect.top-height-5:rect.bottom+5)}px`; fieldMenu.style.width=`${width}px`; }
function parseParts(cell) { const values={}; for(const part of cell.config.parts){ const match=cell.value.match(new RegExp(`${part.key}\\s*[:：]\\s*([^\\n]+)`,'i')); const candidate=normalize(match?.[1]||'').toLowerCase(); values[part.key]=part.options.find(option=>option.toLowerCase()===candidate)||part.defaultValue; } return values; }
function formatParts(cell) { return cell.config.parts.map(part=>`${part.label}:${cell.partValues[part.key]}`).join('\n'); }
function normalizeConfiguredCell(cell) {
  if(cell.config.type==='number') { const parsed=Number.parseInt(cell.value,10);const value=Number.isFinite(parsed)?Math.min(cell.config.max,Math.max(cell.config.min,parsed)):Number(cell.config.defaultValue);updateCell(cell,String(value),false);return; }
  if(cell.config.type==='single') {
    let candidate=normalize(cell.value);
    if(keyFor(cell)==='1:342' && candidate.startsWith('录制')) candidate=cell.config.defaultValue;
    const match=cell.config.options.find(option=>option.toLowerCase()===candidate.toLowerCase());
    updateCell(cell,match||cell.config.defaultValue,false);
  } else { cell.partValues=parseParts(cell); updateCell(cell,formatParts(cell),false); }
}
function makeSelect(label,options,value,onChange) { const row=document.createElement('div'); row.className='select-row'; const caption=document.createElement('label'); caption.textContent=label; const select=document.createElement('select'); for(const option of options){ const element=document.createElement('option'); element.value=option; element.textContent=option; select.append(element); } select.value=value; select.addEventListener('change',()=>onChange(select.value)); row.append(caption,select); return {row,select}; }
function openMenu(cell) {
  if(activeCell&&activeCell!==cell)closeMenu();activeCell=cell;cell.editor.setAttribute('aria-expanded','true');fieldMenu.replaceChildren();
  if(cell.config.type==='single') { const control=makeSelect(cell.config.label,cell.config.options,cell.value,(value)=>{updateCell(cell,value);closeMenu();}); fieldMenu.append(control.row); fieldMenu.hidden=false; placeMenu(cell); control.select.focus(); }
  else { for(const part of cell.config.parts){ const control=makeSelect(part.label,part.options,cell.partValues[part.key],(value)=>{cell.partValues[part.key]=value;updateCell(cell,formatParts(cell));}); fieldMenu.append(control.row); } fieldMenu.hidden=false; placeMenu(cell); fieldMenu.querySelector('select')?.focus(); }
}
function configureCell(cell) { cell.config=CONFIGS[keyFor(cell)]||null; if(!cell.config)return; normalizeConfiguredCell(cell); if(cell.config.type==='number'){cell.foreignObject.classList.add('numeric-cell');cell.editor.setAttribute('role','spinbutton');cell.editor.setAttribute('inputmode','numeric');cell.editor.setAttribute('aria-label',`填写${cell.config.label}`);cell.editor.setAttribute('aria-valuemin',String(cell.config.min));cell.editor.setAttribute('aria-valuemax',String(cell.config.max));cell.editor.tabIndex=0;cell.editor.addEventListener('beforeinput',(event)=>{if(event.data&&!/^\d+$/.test(event.data))event.preventDefault();});cell.editor.addEventListener('blur',()=>{normalizeConfiguredCell(cell);cell.foreignObject.classList.remove('invalid-cell');saveDraft();});cell.editor.addEventListener('input',()=>{const value=Number.parseInt(cell.editor.innerText,10),valid=Number.isFinite(value)&&value>=cell.config.min&&value<=cell.config.max;cell.foreignObject.classList.toggle('invalid-cell',!valid);cell.editor.setAttribute('aria-invalid',String(!valid));});return;}cell.foreignObject.classList.add('option-cell'); cell.foreignObject.dataset.optionKey=keyFor(cell); cell.editor.contentEditable='false'; cell.editor.tabIndex=0; cell.editor.setAttribute('role','combobox'); cell.editor.setAttribute('aria-label',`设置${cell.config.label}`); cell.editor.setAttribute('aria-haspopup','dialog');cell.editor.setAttribute('aria-expanded','false');const openFromPointer=(event)=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();openMenu(cell);};cell.editor.addEventListener('pointerdown',openFromPointer);cell.foreignObject.addEventListener('pointerdown',openFromPointer);cell.editor.addEventListener('click',(event)=>{event.stopPropagation();if(fieldMenu.hidden)openMenu(cell);}); }
function parseDimensions(value) { const width=String(value).match(/w\s*[:：]\s*(\d+)/i),height=String(value).match(/h\s*[:：]\s*(\d+)/i); if(!width||!height)return null; return {width:Number(width[1]),height:Number(height[1])}; }
function floorTo32(value) { return Math.floor(value/32)*32; }
function ceilTo32(value) { return Math.ceil(value/32)*32; }
function findCell(key) { return cells.find(cell=>keyFor(cell)===key); }
function formatDimensions(dimensions) { return `w:${dimensions.width}\nh:${dimensions.height}`; }
function validateSource(cell) { const dimensions=cell&&parseDimensions(cell.value),valid=dimensions&&dimensions.width>0&&dimensions.height>0; if(cell){cell.foreignObject.classList.toggle('invalid-cell',!valid);cell.editor.setAttribute('aria-invalid',String(!valid));} return valid?dimensions:null; }
function setComputedCell(key,label) { const cell=findCell(key); if(!cell)return null; cell.foreignObject.classList.add('computed-cell'); cell.editor.contentEditable=cell.dimensionInputs?'false':'true'; cell.editor.tabIndex=cell.dimensionInputs?-1:0; cell.editor.setAttribute('role',cell.dimensionInputs?'group':'textbox'); cell.editor.setAttribute('aria-label',label.replace(/^自动计算的\s*/,'编辑')); return cell; }
function ratioText(numerator,denominator) { if(!numerator||!denominator||!denominator.width||!denominator.height)return null; return `[${numerator.width/denominator.width}, ${numerator.height/denominator.height}]`; }
function updateSubGdc0Ratio(save=true) { const numerator=parseDimensions(findCell(SUB_V1_GDC0_KEY)?.value),denominator=parseDimensions(findCell(SUB_V1_YSC_KEY)?.value),ratio=ratioText(numerator,denominator);if(ratio)updateCell(findCell(SUB_GDC0_RATIO_D1_KEY),ratio,false);if(save)saveDraft(); }
function meshGridText(dimensions) { return `${dimensions.width/32+1}/${dimensions.height/32+1}`; }
function titleAspectRatio() { const match=pageTitle.textContent.match(/(\d+(?:\.\d+)?)\s*[:：]\s*(\d+(?:\.\d+)?)/);if(!match)return null;const width=Number(match[1]),height=Number(match[2]);return width>0&&height>0?width/height:null; }
function formatF2mNumber(value) { const fixed=value.toFixed(12),[integer,fraction]=fixed.split('.'),doubleZero=fraction.indexOf('00');return doubleZero<0?fixed:`${integer}.${fraction.slice(0,doubleZero+1)}`; }
function formatF2mValues(values) { if(!Array.isArray(values)||values.length!==4||values.some(value=>!Number.isFinite(Number(value))))throw new Error('脚本返回的 ROI 格式无效');return `[${values.map(value=>formatF2mNumber(Number(value))).join(', ')}]`; }
function applyF2mResults(results) { const rows=[[F2M_D1_KEY,results?.d1],[F2M_D2_KEY,results?.d2],[F2M_D4_KEY,results?.d4]];for(const [key,values] of rows)updateCell(findCell(key),formatF2mValues(values),false); }
function openF2mLog(message) { f2mLog.textContent=message;if(!f2mLogDialog.open)f2mLogDialog.showModal(); }
async function runF2mScript() { const dimensions=parseDimensions(findCell(V1_GDC0_D1_KEY)?.value);openF2mLog(dimensions?`准备运行...\nwidth=${dimensions.width}, height=${dimensions.height}`:'main-D1 V1-gdc0 分辨率无效');if(!dimensions){showToast('main-D1 V1-gdc0 分辨率无效');return;}f2mTrigger.disabled=true;f2mTrigger.setAttribute('aria-busy','true');try{const response=await fetch('/api/calc-f2m',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(dimensions)}),payload=await response.json();f2mLog.textContent=payload.log||payload.error||'服务未返回运行日志';if(!response.ok)throw new Error(payload.error||'Python 脚本执行失败');applyF2mResults(payload.results);saveDraft();f2mLog.textContent+=`\n\n[iq-f2m] 回填完成\nd1: ${findCell(F2M_D1_KEY).value}\nd2: ${findCell(F2M_D2_KEY).value}\nd4: ${findCell(F2M_D4_KEY).value}`;showToast('iq-f2m配置已更新');}catch(error){f2mLog.textContent+=`\n\n[error] ${error.message}`;showToast('iq-f2m配置计算失败');}finally{f2mTrigger.disabled=false;f2mTrigger.removeAttribute('aria-busy');} }
function calculateResolutionRules(save=true) {
  const sensor=findCell(SENSOR_CELL_KEY),fpp=findCell(FPP_CELL_KEY),v2wr=findCell(V2_WR_D1_KEY),v1gdc0=findCell(V1_GDC0_D1_KEY);
  const sensorSize=validateSource(sensor);
  if(sensorSize&&fpp) updateCell(fpp,formatDimensions({width:floorTo32(sensorSize.width),height:floorTo32(sensorSize.height)}),false);
  const fppSize=fpp&&parseDimensions(fpp.value);
  if(fppSize){
    updateCell(findCell(V1_YSC_D4_KEY),formatDimensions({width:fppSize.width/4,height:fppSize.height/4}),false);
    updateCell(findCell(V1_YSC_D16_KEY),formatDimensions({width:fppSize.width/16,height:fppSize.height/16}),false);
    updateCell(findCell(SUB_V1_YSC_KEY),formatDimensions({width:fppSize.width/2,height:fppSize.height/2}),false);
    const aspectRatio=titleAspectRatio();
    if(aspectRatio)updateCell(findCell(SUB_V1_GDC0_KEY),formatDimensions({width:floorTo32(1088*aspectRatio),height:1088}),false);
  }
  const v2wrSize=validateSource(v2wr);
  if(v2wrSize&&v1gdc0) updateCell(v1gdc0,formatDimensions({width:ceilTo32(v2wrSize.width),height:ceilTo32(v2wrSize.height)}),false);
  const v1gdc0Size=v1gdc0&&parseDimensions(v1gdc0.value);
  if(v1gdc0Size){
    updateCell(findCell(V1_GDC0_D4_KEY),formatDimensions({width:v1gdc0Size.width/4,height:v1gdc0Size.height/4}),false);
    updateCell(findCell(V1_GDC0_D16_KEY),formatDimensions({width:v1gdc0Size.width/16,height:v1gdc0Size.height/16}),false);
    updateCell(findCell(V2_YSC_D4_KEY),formatDimensions({width:v1gdc0Size.width/4,height:v1gdc0Size.height/4}),false);
    updateCell(findCell(V2_YSC_D16_KEY),formatDimensions({width:v1gdc0Size.width/16,height:v1gdc0Size.height/16}),false);
    const meshGrid=meshGridText(v1gdc0Size);
    updateCell(findCell(GDC1_MESH_D1_KEY),meshGrid,false);
    updateCell(findCell(GDC1_MESH_D4_KEY),meshGrid,false);
    updateCell(findCell(GDC1_MESH_D16_KEY),meshGrid,false);
  }
  const d4Ysc=parseDimensions(findCell(V1_YSC_D4_KEY)?.value),d16Ysc=parseDimensions(findCell(V1_YSC_D16_KEY)?.value),d4Gdc=parseDimensions(findCell(V1_GDC0_D4_KEY)?.value),d16Gdc=parseDimensions(findCell(V1_GDC0_D16_KEY)?.value);
  const d1Ratio=ratioText(v1gdc0Size,fppSize),d4Ratio=ratioText(d4Gdc,d4Ysc),d16Ratio=ratioText(d16Gdc,d16Ysc);
  if(d1Ratio)updateCell(findCell(GDC0_RATIO_D1_KEY),d1Ratio,false);
  if(d4Ratio)updateCell(findCell(GDC0_RATIO_D4_KEY),d4Ratio,false);
  if(d16Ratio)updateCell(findCell(GDC0_RATIO_D16_KEY),d16Ratio,false);
  updateSubGdc0Ratio(false);
  if(save) saveDraft();
}
function configureResolutionRules() {
  const sensor=findCell(SENSOR_CELL_KEY),v2wr=findCell(V2_WR_D1_KEY),subYsc=findCell(SUB_V1_YSC_KEY),subGdc0=findCell(SUB_V1_GDC0_KEY);
  if(sensor){sensor.foreignObject.classList.add('source-cell');sensor.editor.setAttribute('aria-label','输入 Sensor 分辨率 w 和 h');sensor.editor.addEventListener('input',()=>calculateResolutionRules());}
  if(v2wr){v2wr.foreignObject.classList.add('source-cell');v2wr.editor.setAttribute('aria-label','输入 main-D1 V2-wr 分辨率 w 和 h');v2wr.editor.addEventListener('input',()=>calculateResolutionRules());}
  setComputedCell(FPP_CELL_KEY,'自动计算的 FPP 分辨率');
  setComputedCell(V1_GDC0_D1_KEY,'自动计算的 main-D1 V1-gdc0 分辨率');
  setComputedCell(V1_YSC_D4_KEY,'自动计算的 main-D4 V1-ysc 分辨率');
  setComputedCell(V1_YSC_D16_KEY,'自动计算的 main-D16 V1-ysc 分辨率');
  setComputedCell(V2_YSC_D4_KEY,'自动计算的 main-D4 V2-ysc 分辨率');
  setComputedCell(V2_YSC_D16_KEY,'自动计算的 main-D16 V2-ysc 分辨率');
  setComputedCell(V1_GDC0_D4_KEY,'自动计算的 main-D4 V1-gdc0 分辨率');
  setComputedCell(V1_GDC0_D16_KEY,'自动计算的 main-D16 V1-gdc0 分辨率');
  setComputedCell(SUB_V1_YSC_KEY,'自动计算的 sub V1-ysc 分辨率');
  setComputedCell(SUB_V1_GDC0_KEY,'自动计算的 sub V1-gdc0 分辨率');
  setComputedCell(GDC0_RATIO_D1_KEY,'自动计算的 D1 scale_ratio');
  setComputedCell(GDC0_RATIO_D4_KEY,'自动计算的 D4 scale_ratio');
  setComputedCell(GDC0_RATIO_D16_KEY,'自动计算的 D16 scale_ratio');
  setComputedCell(SUB_GDC0_RATIO_D1_KEY,'自动计算的 sub D1 scale_ratio');
  setComputedCell(GDC1_MESH_D1_KEY,'自动计算的 GDC1 D1 mesh_nx/mesh_ny');
  setComputedCell(GDC1_MESH_D4_KEY,'自动计算的 GDC1 D4 mesh_nx/mesh_ny');
  setComputedCell(GDC1_MESH_D16_KEY,'自动计算的 GDC1 D16 mesh_nx/mesh_ny');
  setComputedCell(F2M_D1_KEY,'Python算法计算的 f2m d1 ROI');
  setComputedCell(F2M_D2_KEY,'Python算法计算的 f2m d2 ROI');
  setComputedCell(F2M_D4_KEY,'Python算法计算的 f2m d4 ROI');
  subYsc?.editor.addEventListener('input',()=>updateSubGdc0Ratio());subGdc0?.editor.addEventListener('input',()=>updateSubGdc0Ratio());
  calculateResolutionRules(false);
}
function svgElement(name,attributes={}) { const node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node; }
function addText(group,text,x,y,options={}) { const node=svgElement('text',{x,y,'text-anchor':options.anchor||'middle','font-family':'Helvetica','font-size':options.size||11,fill:options.fill||'#000','font-weight':options.weight||'normal'});node.textContent=text;group.append(node);return node; }
function addEditableDefinitionCell(parent,x,y,width,height,value) { const switchNode=svgElement('switch');const foreignObject=svgElement('foreignObject',{x:0,y:0,width:'100%',height:'100%'});const layout=document.createElementNS('http://www.w3.org/1999/xhtml','div');layout.setAttribute('style',`display:flex;align-items:center;justify-content:center;width:${width-2}px;height:1px;padding-top:${y+height/2}px;margin-left:${x+1}px;`);const box=document.createElementNS('http://www.w3.org/1999/xhtml','div');box.setAttribute('style','box-sizing:border-box;font-size:0;text-align:center;color:#000;');const editor=document.createElementNS('http://www.w3.org/1999/xhtml','div');editor.setAttribute('style','display:inline-block;width:100%;font-size:12px;font-family:Helvetica;line-height:1.2;white-space:normal;word-wrap:normal;');editor.textContent=value;box.append(editor);layout.append(box);foreignObject.append(layout);switchNode.append(foreignObject);addText(switchNode,value,x+width/2,y+height/2+4,{size:12});parent.append(switchNode); }
function addSensorDefinition(svg) { if(svg.querySelector('[data-sensor-definition]'))return;const x=640,y=550,width=320,left=160,titleHeight=30,row1Height=45,row2Height=45;const container=svgElement('g',{'data-sensor-definition':'true','data-table-content':'sensor'}),group=svgElement('g');group.append(svgElement('rect',{x,y,width,height:titleHeight,fill:'#000',stroke:'#000'}));addText(group,'Sensor定义',x+width/2,y+20,{size:12,fill:'#fff',weight:'bold'});const row1Y=y+titleHeight,row2Y=row1Y+row1Height;group.append(svgElement('rect',{x,y:row1Y,width:left,height:row1Height,fill:'#ccc',stroke:'#000'}),svgElement('rect',{x:x+left,y:row1Y,width:width-left,height:row1Height,fill:'#fff',stroke:'#000'}),svgElement('rect',{x,y:row2Y,width:left,height:row2Height,fill:'#ccc',stroke:'#000'}),svgElement('rect',{x:x+left,y:row2Y,width:width-left,height:row2Height,fill:'#fff',stroke:'#000'}));addText(group,'ISP支持接入的bit位宽',x+left/2,row1Y+28,{size:12});addText(group,'常见的sensor类型',x+left/2,row2Y+28,{size:12});container.append(group);addEditableDefinitionCell(container,x+left,row1Y,width-left,row1Height,'10');addEditableDefinitionCell(container,x+left,row2Y,width-left,row2Height,'DCG-HDR');svg.append(container); }
function nodePoint(node) { const foreignObject=node.querySelector?.('foreignObject');if(foreignObject)return{x:coordinate(foreignObject,'x'),y:coordinate(foreignObject,'y')};try{const box=node.getBBox();return{x:box.x+box.width/2,y:box.y+box.height/2};}catch{return null;} }
function setGdcTableTitle(group,definition,geometry=definition) {
  const oldName=definition.id.endsWith('0')?'iq-gdc0配置':'iq-gdc1配置';
  let title=group.querySelector('[data-gdc-title-text]')||[...group.querySelectorAll('text')].find(node=>node.textContent.replace(/\s+/g,'')===oldName);
  let header=group.querySelector('[data-gdc-title-background]');
  if(!header){header=svgElement('rect',{'data-gdc-title-background':'true'});group.append(header);}
  for(const [key,value] of Object.entries({x:geometry.x,y:geometry.y-1,width:geometry.width,height:31,fill:'#000',stroke:'#000'}))header.setAttribute(key,String(value));
  if(!title)title=addText(group,definition.name,geometry.x+geometry.width/2,geometry.y+20);
  title.dataset.gdcTitleText='true';title.textContent=definition.name;
  for(const [key,value] of Object.entries({x:geometry.x+geometry.width/2,y:geometry.y+20,'text-anchor':'middle','font-family':'Helvetica','font-size':12,fill:'#fff','font-weight':'bold'}))title.setAttribute(key,String(value));
  group.append(title);
}
function prepareMovableTables(svg) {
  const root=svg.querySelector(':scope > g'),available=[...(root?.children||[])],assigned=new Set(),layouts=[];
  for(const definition of TABLE_DEFINITIONS.filter(item=>!item.sourceId)){
    let group;
    if(definition.id==='sensor')group=svg.querySelector('[data-table-content="sensor"]');
    else{
      group=svgElement('g',{'data-table-content':definition.id});
      for(const node of available){if(assigned.has(node))continue;const point=nodePoint(node);if(point&&point.x>=definition.x&&point.x<=definition.x+definition.width&&point.y>=definition.y&&point.y<=definition.y+definition.height){assigned.add(node);group.append(node);}}
      root?.append(group);
    }
    if(!group)continue;
    const background=svgElement('rect',{x:definition.x,y:definition.y,width:definition.width,height:definition.height,fill:'#f8fafc',stroke:'none','data-layout-background':'true'});group.insertBefore(background,group.firstChild);
    if(definition.id==='gdc0'||definition.id==='gdc1')setGdcTableTitle(group,definition);
    const defaults=definition.defaultLayout||definition;
    layouts.push({...definition,defaultX:defaults.x,defaultY:defaults.y,defaultWidth:defaults.width,defaultHeight:defaults.height,baseX:definition.x,baseY:definition.y,baseWidth:definition.width,baseHeight:definition.height,element:group});
  }
  for(const definition of TABLE_DEFINITIONS.filter(item=>item.sourceId)){
    const source=layouts.find(layout=>layout.id===definition.sourceId);if(!source)continue;
    const group=source.element.cloneNode(true),geometry={x:source.baseX,y:source.baseY,width:source.baseWidth,height:source.baseHeight};
    group.dataset.tableContent=definition.id;setGdcTableTitle(group,definition,geometry);root?.append(group);
    const defaults=definition.defaultLayout||definition;
    layouts.push({...definition,defaultX:defaults.x,defaultY:defaults.y,defaultWidth:defaults.width,defaultHeight:defaults.height,baseX:geometry.x,baseY:geometry.y,baseWidth:geometry.width,baseHeight:geometry.height,element:group});
  }
  return layouts;
}
function readLayouts() { try{return JSON.parse(localStorage.getItem(LAYOUT_KEY))||{};}catch{return{};} }
function saveLayouts() { localStorage.setItem(LAYOUT_KEY,JSON.stringify(Object.fromEntries(tableLayouts.map(layout=>[layout.id,{x:layout.x,y:layout.y,width:layout.width,height:layout.height,...(layout.id==='sensor'?{compactVersion:SENSOR_LAYOUT_VERSION}:{}),...(layout.id.includes('gdc')?{headerVersion:GDC_HEADER_LAYOUT_VERSION}:{})}])))); }
function renderTableLayout(layout) {
  const scaleX=layout.width/layout.baseWidth,scaleY=layout.height/layout.baseHeight,translateX=layout.x-scaleX*layout.baseX,translateY=layout.y-scaleY*layout.baseY;
  layout.element.setAttribute('transform',`matrix(${scaleX} 0 0 ${scaleY} ${translateX} ${translateY})`);
  layout.frame.style.left=`${layout.x+.5}px`;layout.frame.style.top=`${layout.y+.5}px`;layout.frame.style.width=`${layout.width}px`;layout.frame.style.height=`${layout.height}px`;
}
function activateFrame(frame) { for(const node of tableControls.querySelectorAll('.table-frame')){const active=node===frame;node.classList.toggle('active',active);node.setAttribute('aria-selected',String(active));} }
function beginLayoutPointer(event,layout,mode) { event.preventDefault();event.stopPropagation();closeMenu();activateFrame(layout.frame);const start={x:event.clientX,y:event.clientY,layoutX:layout.x,layoutY:layout.y,width:layout.width,height:layout.height};document.body.classList.add(mode==='move'?'layout-dragging':'layout-resizing');const move=(next)=>{const dx=(next.clientX-start.x)/view.scale,dy=(next.clientY-start.y)/view.scale;if(mode==='move'){layout.x=start.layoutX+dx;layout.y=start.layoutY+dy;}else{layout.width=Math.max(120,start.width+dx);layout.height=Math.max(70,start.height+dy);}renderTableLayout(layout);};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-dragging','layout-resizing');saveLayouts();};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish); }
function initializeTableControls() {
  const saved=readLayouts();let migrated=false;tableControls.replaceChildren();
  for(const layout of tableLayouts){
    const state=saved[layout.id]||{},isGdc=layout.id==='gdc0'||layout.id==='gdc1',legacyGdc=isGdc&&Number.isFinite(state.y)&&state.headerVersion!==GDC_HEADER_LAYOUT_VERSION,legacyScale=legacyGdc&&Number.isFinite(state.height)?state.height/411:1;
    layout.x=Number.isFinite(state.x)?state.x:layout.defaultX;
    layout.y=legacyGdc?state.y-30*legacyScale:(Number.isFinite(state.y)?state.y:layout.defaultY);
    const compactSensor=layout.id==='sensor'&&state.compactVersion!==SENSOR_LAYOUT_VERSION;if(compactSensor||legacyGdc)migrated=true;
    layout.width=compactSensor?layout.defaultWidth:(Number.isFinite(state.width)?state.width:layout.defaultWidth);
    const legacyResolution=layout.id==='resolution'&&state.height===270;
    layout.height=legacyGdc?(Number.isFinite(state.height)?state.height+30*legacyScale:layout.defaultHeight):(compactSensor||legacyResolution?layout.defaultHeight:(Number.isFinite(state.height)?state.height:layout.defaultHeight));
    const frame=document.createElement('div');frame.className='table-frame';frame.dataset.tableId=layout.id;const drag=document.createElement('button');drag.type='button';drag.className='table-drag-handle';drag.title=`拖动${layout.name}`;drag.setAttribute('aria-label',`拖动${layout.name}`);const resize=document.createElement('button');resize.type='button';resize.className='table-resize-handle';resize.title=`调整${layout.name}大小`;resize.setAttribute('aria-label',`调整${layout.name}大小`);frame.append(drag,resize);tableControls.append(frame);layout.frame=frame;drag.addEventListener('pointerdown',(event)=>beginLayoutPointer(event,layout,'move'));resize.addEventListener('pointerdown',(event)=>beginLayoutPointer(event,layout,'resize'));renderTableLayout(layout);
  }
  if(migrated)saveLayouts();
}
function resetTableLayouts() { localStorage.removeItem(LAYOUT_KEY);for(const layout of tableLayouts){layout.x=layout.defaultX;layout.y=layout.defaultY;layout.width=layout.defaultWidth;layout.height=layout.defaultHeight;renderTableLayout(layout);} }
function readF2mTriggerLayout() { try{return JSON.parse(localStorage.getItem(F2M_TRIGGER_LAYOUT_KEY))||{};}catch{return{};} }
function renderF2mTriggerLayout() { f2mTriggerControl.style.left=`${f2mTriggerLayout.x}px`;f2mTriggerControl.style.top=`${f2mTriggerLayout.y}px`; }
function saveF2mTriggerLayout() { localStorage.setItem(F2M_TRIGGER_LAYOUT_KEY,JSON.stringify({x:f2mTriggerLayout.x,y:f2mTriggerLayout.y})); }
function resetF2mTriggerLayout() { localStorage.removeItem(F2M_TRIGGER_LAYOUT_KEY);f2mTriggerLayout.x=f2mTriggerLayout.baseX;f2mTriggerLayout.y=f2mTriggerLayout.baseY;renderF2mTriggerLayout(); }
function initializeF2mTrigger() { const saved=readF2mTriggerLayout();f2mTriggerLayout.x=Number.isFinite(saved.x)?saved.x:f2mTriggerLayout.baseX;f2mTriggerLayout.y=Number.isFinite(saved.y)?saved.y:f2mTriggerLayout.baseY;renderF2mTriggerLayout();f2mTriggerDrag.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();activateFrame(null);closeMenu();const start={clientX:event.clientX,clientY:event.clientY,x:f2mTriggerLayout.x,y:f2mTriggerLayout.y};document.body.classList.add('layout-dragging');const move=(next)=>{f2mTriggerLayout.x=start.x+(next.clientX-start.clientX)/view.scale;f2mTriggerLayout.y=start.y+(next.clientY-start.clientY)/view.scale;renderF2mTriggerLayout();};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-dragging');saveF2mTriggerLayout();};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});f2mTrigger.addEventListener('pointerdown',(event)=>event.stopPropagation());f2mTrigger.addEventListener('click',(event)=>{event.stopPropagation();activateFrame(null);closeMenu();runF2mScript();});f2mLogClose.addEventListener('click',()=>f2mLogDialog.close()); }
function readTextFileLayout(module) { try{return JSON.parse(localStorage.getItem(module.layoutKey))||{};}catch{return{};} }
function renderTextFileLayout(module) { const layout=module.layout;module.panel.style.left=`${layout.x}px`;module.panel.style.top=`${layout.y}px`;module.panel.style.width=`${layout.width}px`;module.panel.style.height=`${layout.height}px`; }
function saveTextFileLayout(module) { const layout=module.layout;localStorage.setItem(module.layoutKey,JSON.stringify({x:layout.x,y:layout.y,width:layout.width,height:layout.height})); }
function resetTextFileLayouts() { for(const module of textFileModules){const layout=module.layout;localStorage.removeItem(module.layoutKey);Object.assign(layout,{x:layout.baseX,y:layout.baseY,width:layout.baseWidth,height:layout.baseHeight});renderTextFileLayout(module);} }
function readPipelineImageLayout() { try{return JSON.parse(localStorage.getItem(PIPELINE_IMAGE_LAYOUT_KEY))||{};}catch{return{};} }
function renderPipelineImageLayout() { const layout=pipelineImageModule.layout;pipelineImageModule.panel.style.left=`${layout.x}px`;pipelineImageModule.panel.style.top=`${layout.y}px`;pipelineImageModule.panel.style.width=`${layout.width}px`;pipelineImageModule.panel.style.height=`${layout.height}px`; }
function savePipelineImageLayout() { const layout=pipelineImageModule.layout;localStorage.setItem(PIPELINE_IMAGE_LAYOUT_KEY,JSON.stringify({x:layout.x,y:layout.y,width:layout.width,height:layout.height})); }
function resetPipelineImageLayout() { const layout=pipelineImageModule.layout;localStorage.removeItem(PIPELINE_IMAGE_LAYOUT_KEY);Object.assign(layout,{x:layout.baseX,y:layout.baseY,width:layout.baseWidth,height:layout.baseHeight});renderPipelineImageLayout(); }
async function loadPipelineImage() {
  const module=pipelineImageModule;module.refresh.disabled=true;module.status.hidden=false;module.status.textContent='正在读取...';
  try{const response=await fetch('/api/pipeline-diagram-info'),payload=await response.json();if(!response.ok)throw new Error(payload.error||'读取流程图失败');module.currentName=payloadFileName(payload,'imcmctfnnnoainrpipeline.svg');module.title.textContent=module.currentName;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setPipelineImageDirty(false);await new Promise((resolve,reject)=>{module.image.onload=resolve;module.image.onerror=()=>reject(new Error('流程图图片加载失败'));module.image.src=`/api/pipeline-diagram.svg?t=${Date.now()}`;});module.status.hidden=true;}
  catch(error){module.path.textContent='读取失败';module.status.textContent=error.message;module.status.hidden=false;}
  finally{module.refresh.disabled=false;}
}
function setPipelineImageDirty(dirty) { const module=pipelineImageModule;module.dirty=dirty;module.panel.classList.toggle('dirty',dirty);module.save.disabled=!dirty;module.path.textContent=`${module.sourceLabel}${dirty?' · 未保存':''}`; }
async function savePipelineImageName() { const module=pipelineImageModule,filename=module.title.innerText.trim(),previousName=module.currentName;module.save.disabled=true;try{const response=await fetch('/api/pipeline-diagram-info',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'保存文件名失败');module.currentName=payloadFileName(payload,filename);module.title.textContent=module.currentName;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setPipelineImageDirty(false);showToast(previousName!==module.currentName?'SVG 文件已重命名':'SVG 文件名未变化');}catch(error){setPipelineImageDirty(true);showToast(error.message);} }
async function importPipelineImage(file) {
  const module=pipelineImageModule;if(!hasExpectedExtension(file,module.extension)){showToast('请选择 .svg 文件');return;}if(module.dirty&&!confirm('SVG 文件名有未保存修改，确认导入并替换当前模块？'))return;
  module.importButton.disabled=true;module.importButton.setAttribute('aria-busy','true');module.status.hidden=false;module.status.textContent='正在导入 SVG...';
  try{const content=await readImportedText(file),response=await fetch('/api/pipeline-diagram.svg',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:file.name,content})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'导入 SVG 失败');await loadPipelineImage();showToast(`${payloadFileName(payload,file.name)} 已导入`);}
  catch(error){module.status.textContent=error.message;module.status.hidden=false;showToast(error.message);}
  finally{module.importButton.disabled=false;module.importButton.removeAttribute('aria-busy');}
}
function renderPipelineViewer() { const module=pipelineImageModule,{scale,x,y}=module.viewer;module.image.style.transform=`translate(${x}px,${y}px) scale(${scale})`; }
function resetPipelineViewer() { const module=pipelineImageModule;Object.assign(module.viewer,{active:false,scale:1,x:0,y:0,dragging:false});module.canvas.classList.remove('viewer-dragging');renderPipelineViewer(); }
function zoomPipelineViewer(event) {
  const module=pipelineImageModule,viewer=module.viewer;if(!viewer.active)return;
  event.preventDefault();event.stopPropagation();const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1),oldScale=viewer.scale,newScale=Math.min(10,Math.max(1,oldScale*Math.exp(-delta*.0015)));if(newScale===oldScale)return;
  const rect=module.canvas.getBoundingClientRect(),centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2,ratio=newScale/oldScale;
  viewer.x=event.clientX-centerX-(event.clientX-centerX-viewer.x)*ratio;viewer.y=event.clientY-centerY-(event.clientY-centerY-viewer.y)*ratio;viewer.scale=newScale;if(newScale===1){viewer.x=0;viewer.y=0;}renderPipelineViewer();
}
function beginPipelineViewerDrag(event) {
  const module=pipelineImageModule,viewer=module.viewer;if(!viewer.active||event.button!==0||viewer.scale<=1)return;
  event.preventDefault();viewer.dragging=true;viewer.pointerX=event.clientX;viewer.pointerY=event.clientY;module.canvas.classList.add('viewer-dragging');module.image.setPointerCapture(event.pointerId);
}
function movePipelineViewer(event) { const module=pipelineImageModule,viewer=module.viewer;if(!viewer.dragging)return;viewer.x+=event.clientX-viewer.pointerX;viewer.y+=event.clientY-viewer.pointerY;viewer.pointerX=event.clientX;viewer.pointerY=event.clientY;renderPipelineViewer(); }
function stopPipelineViewerDrag(event) { const module=pipelineImageModule,viewer=module.viewer;if(!viewer.dragging)return;viewer.dragging=false;module.canvas.classList.remove('viewer-dragging');if(module.image.hasPointerCapture(event.pointerId))module.image.releasePointerCapture(event.pointerId); }
function initializePipelineImageModule() {
  const module=pipelineImageModule,saved=readPipelineImageLayout(),layout=module.layout;layout.x=Number.isFinite(saved.x)?saved.x:layout.baseX;layout.y=Number.isFinite(saved.y)?saved.y:layout.baseY;layout.width=Number.isFinite(saved.width)?saved.width:layout.baseWidth;layout.height=Number.isFinite(saved.height)?saved.height:layout.baseHeight;renderPipelineImageLayout();
  module.panel.addEventListener('pointerdown',()=>bringFreeModuleToFront(module.panel),true);
  module.panel.addEventListener('pointerdown',(event)=>event.stopPropagation());
  module.drag.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();activateFrame(null);closeMenu();const start={clientX:event.clientX,clientY:event.clientY,x:layout.x,y:layout.y};document.body.classList.add('layout-dragging');const move=(next)=>{layout.x=start.x+(next.clientX-start.clientX)/view.scale;layout.y=start.y+(next.clientY-start.clientY)/view.scale;renderPipelineImageLayout();};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-dragging');savePipelineImageLayout();};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  module.resize.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();const start={clientX:event.clientX,clientY:event.clientY,width:layout.width,height:layout.height};document.body.classList.add('layout-resizing');const move=(next)=>{layout.width=Math.max(360,start.width+(next.clientX-start.clientX)/view.scale);layout.height=Math.max(140,start.height+(next.clientY-start.clientY)/view.scale);renderPipelineImageLayout();};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-resizing');savePipelineImageLayout();};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  for(const control of [module.importButton,module.save,module.refresh,module.title,module.image])control.addEventListener('pointerdown',(event)=>event.stopPropagation());module.importButton.addEventListener('click',(event)=>{event.stopPropagation();module.fileInput.click();});module.fileInput.addEventListener('change',()=>{const file=module.fileInput.files?.[0];module.fileInput.value='';if(file)importPipelineImage(file);});module.title.addEventListener('input',()=>setPipelineImageDirty(true));module.title.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();module.title.blur();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(module.dirty)savePipelineImageName();}});module.save.addEventListener('click',(event)=>{event.stopPropagation();savePipelineImageName();});module.refresh.addEventListener('click',(event)=>{event.stopPropagation();loadPipelineImage();});module.image.addEventListener('dblclick',async()=>{if(module.viewer.active){Object.assign(module.viewer,{scale:1,x:0,y:0});renderPipelineViewer();return;}if(module.canvas.requestFullscreen){resetPipelineViewer();module.viewer.active=true;try{await module.canvas.requestFullscreen();}catch{resetPipelineViewer();showToast('无法打开全屏图片');}}});module.image.addEventListener('dragstart',(event)=>event.preventDefault());module.canvas.addEventListener('wheel',zoomPipelineViewer,{passive:false});module.image.addEventListener('pointerdown',beginPipelineViewerDrag);module.image.addEventListener('pointermove',movePipelineViewer);module.image.addEventListener('pointerup',stopPipelineViewerDrag);module.image.addEventListener('pointercancel',stopPipelineViewerDrag);document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===module.canvas)module.viewer.active=true;else resetPipelineViewer();});loadPipelineImage();
}
function setTextFileDirty(module,dirty) { module.dirty=dirty;module.panel.classList.toggle('dirty',dirty);module.save.disabled=!dirty;module.path.textContent=`${module.sourceLabel}${dirty?' · 未保存':''}`; }
async function loadTextFileModule(module,confirmDiscard=true) {
  if(confirmDiscard&&module.dirty&&!confirm(`${module.name} 有未保存修改，确认重新读取源文件？`))return;
  module.refresh.disabled=true;module.refresh.setAttribute('aria-busy','true');module.code.contentEditable='false';module.code.textContent='正在读取...';
  try{const response=await fetch(module.endpoint),payload=await response.json();if(!response.ok)throw new Error(payload.error||'读取文件失败');module.currentName=payloadFileName(payload,module.name);module.title.textContent=module.currentName;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;module.code.textContent=payload.content||'';setTextFileDirty(module,false);}
  catch(error){module.sourceLabel='读取失败';module.code.textContent=error.message;setTextFileDirty(module,false);}
  finally{module.code.contentEditable='true';module.refresh.disabled=false;module.refresh.removeAttribute('aria-busy');}
}
async function saveTextFileModule(module) {
  const content=module.code.innerText.replace(/\r/g,''),filename=module.title.innerText.trim(),previousName=module.currentName;module.save.disabled=true;module.save.setAttribute('aria-busy','true');
  try{const response=await fetch(module.endpoint,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,filename})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'保存文件失败');module.currentName=payloadFileName(payload,filename);module.title.textContent=module.currentName;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setTextFileDirty(module,false);showToast(`${module.currentName} ${previousName!==module.currentName?'已重命名并保存':'已保存'}`);return true;}
  catch(error){setTextFileDirty(module,true);showToast(error.message);return false;}
  finally{module.save.removeAttribute('aria-busy');}
}
async function importTextFileModule(module,file) {
  if(!hasExpectedExtension(file,module.extension)){showToast(`请选择 ${module.extension} 文件`);return;}if(module.dirty&&!confirm(`${module.name} 有未保存修改，确认导入并替换当前内容？`))return;
  module.importButton.disabled=true;module.importButton.setAttribute('aria-busy','true');
  try{const content=await readImportedText(file),response=await fetch(`${module.endpoint}/import`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename:file.name,content})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'导入文件失败');module.currentName=payloadFileName(payload,file.name);module.title.textContent=module.currentName;module.code.textContent=content;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setTextFileDirty(module,false);showToast(`${module.currentName} 已导入`);}
  catch(error){showToast(`导入失败：${error.message}`);}
  finally{module.importButton.disabled=false;module.importButton.removeAttribute('aria-busy');}
}
function initializeTextFileModule(module) {
  const saved=readTextFileLayout(module),layout=module.layout;layout.x=Number.isFinite(saved.x)?saved.x:layout.baseX;layout.y=Number.isFinite(saved.y)?saved.y:layout.baseY;layout.width=Number.isFinite(saved.width)?saved.width:layout.baseWidth;layout.height=Number.isFinite(saved.height)?saved.height:layout.baseHeight;renderTextFileLayout(module);
  module.panel.addEventListener('pointerdown',()=>bringFreeModuleToFront(module.panel),true);
  module.drag.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();activateFrame(null);closeMenu();const start={clientX:event.clientX,clientY:event.clientY,x:layout.x,y:layout.y};document.body.classList.add('layout-dragging');const move=(next)=>{layout.x=start.x+(next.clientX-start.clientX)/view.scale;layout.y=start.y+(next.clientY-start.clientY)/view.scale;renderTextFileLayout(module);};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-dragging');saveTextFileLayout(module);};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  module.resize.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();const start={clientX:event.clientX,clientY:event.clientY,width:layout.width,height:layout.height};document.body.classList.add('layout-resizing');const move=(next)=>{layout.width=Math.max(280,start.width+(next.clientX-start.clientX)/view.scale);layout.height=Math.max(180,start.height+(next.clientY-start.clientY)/view.scale);renderTextFileLayout(module);};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-resizing');saveTextFileLayout(module);};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  for(const control of [module.importButton,module.save,module.refresh,module.title,module.code])control.addEventListener('pointerdown',(event)=>event.stopPropagation());
  module.importButton.addEventListener('click',(event)=>{event.stopPropagation();module.fileInput.click();});module.fileInput.addEventListener('change',()=>{const file=module.fileInput.files?.[0];module.fileInput.value='';if(file)importTextFileModule(module,file);});module.title.addEventListener('input',()=>setTextFileDirty(module,true));module.title.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();module.title.blur();}});module.code.addEventListener('input',()=>setTextFileDirty(module,true));module.code.addEventListener('keydown',(event)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(module.dirty)saveTextFileModule(module);}});module.save.addEventListener('click',(event)=>{event.stopPropagation();saveTextFileModule(module);});module.refresh.addEventListener('click',(event)=>{event.stopPropagation();loadTextFileModule(module);});loadTextFileModule(module,false);
}
function initializeTextFileModules() { for(const module of textFileModules)initializeTextFileModule(module); }
function configureDimensionCell(cell) {
  if(cell.tableId!=='resolution'||cell.y<503||cell.x===1)return;
  const dimensions=parseDimensions(cell.value);
  if(!dimensions){updateCell(cell,'---',false);if(cell.fallback){cell.fallback.setAttribute('fill','#111111');cell.fallback.setAttribute('font-weight','normal');}return;}
  const rowName={503:'main-D1',545:'main-D4',587:'main-D16',629:'sub'}[cell.y]||'',columnName={76:'Sensor',152:'FPP',227:'V1-ysc',301:'V1-gdc0',377:'V1-wr',452:'V2-ysc',526:'V2-wr'}[cell.x]||'',name=`${rowName} ${columnName}`.trim(),makeRow=(axis,value)=>{const row=document.createElement('label');row.className='dimension-input-row';const caption=document.createElement('span');caption.textContent=axis;const input=document.createElement('input');input.type='number';input.min='1';input.step='1';input.inputMode='numeric';input.value=value;input.setAttribute('aria-label',`编辑 ${name} ${axis==='w'?'宽度':'高度'} ${axis}`);input.addEventListener('pointerdown',(event)=>event.stopPropagation());row.append(caption,input);return{row,input};},width=makeRow('w',String(dimensions.width)),height=makeRow('h',String(dimensions.height));
  cell.editor.replaceChildren(width.row,height.row);cell.editor.classList.add('dimension-inputs');cell.editor.contentEditable='false';cell.editor.tabIndex=-1;cell.editor.setAttribute('role','group');cell.editor.setAttribute('aria-label',`编辑 ${name} 分辨率`);cell.dimensionInputs={width:width.input,height:height.input};cell.foreignObject.classList.add('dimension-cell');cell.foreignObject.dataset.cellKey=keyFor(cell);
  const emphasized=EMPHASIZED_DIMENSION_KEYS.has(keyFor(cell));cell.foreignObject.classList.toggle('emphasized-dimension-cell',emphasized);
  if(cell.fallback){cell.fallback.setAttribute('fill','#111111');cell.fallback.setAttribute('font-weight',emphasized?'700':'normal');}
}
function configureDisabledSubCell(cell) { const disabled=cell.tableId==='subgdc0'&&(cell.x===241||cell.x===361)||cell.tableId==='subgdc1'&&(cell.x===761||cell.x===881);if(!disabled)return;cell.disabled=true;cell.foreignObject.classList.add('disabled-cell');cell.editor.contentEditable='false';cell.editor.tabIndex=-1;cell.editor.setAttribute('aria-disabled','true'); }
function bindCells(svg) {
  cells.length=0; const draft=readDraft();
  for(const foreignObject of svg.querySelectorAll('foreignObject')) { const x=coordinate(foreignObject,'x'),y=coordinate(foreignObject,'y'); if(y<TABLE_START_Y)continue; const editor=foreignObject.querySelector('div > div > div'); if(!editor)continue; const fallback=foreignObject.closest('switch')?.querySelector('text')||null,tableId=foreignObject.closest('[data-table-content]')?.dataset.tableContent||'',scope=tableId.startsWith('subgdc')?tableId:'',key=`${scope?`${scope}:`:''}${x}:${y}`,sourceDefault=normalizeMultiline(editor.innerText),defaultValue=DEFAULT_CELL_VALUES[key]??sourceDefault,layout=scope?tableLayouts.find(item=>item.id===scope):null,sortY=y+(layout?layout.defaultY-layout.baseY:0);if(defaultValue!==sourceDefault)editor.innerText=defaultValue;const cell={x,y,sortY,scope,tableId,editor,fallback,foreignObject,defaultValue,value:defaultValue,config:null,partValues:null,disabled:false,dimensionInputs:null}; cells.push(cell); foreignObject.classList.add('editable-cell'); editor.contentEditable='true'; editor.tabIndex=0; editor.spellcheck=false; editor.setAttribute('role','textbox'); editor.setAttribute('aria-label',`编辑${scope?'sub ':''}表格单元格：${defaultValue||`${x},${y}`}`); editor.addEventListener('pointerdown',(event)=>{if(editor.getAttribute('contenteditable')==='true'){event.stopPropagation();editor.focus();}}); const saved=draft[keyFor(cell)]; if(typeof saved==='string')updateCell(cell,saved,false);else if(defaultValue!==sourceDefault||defaultValue.includes('\n'))updateFallback(fallback,defaultValue); editor.addEventListener('input',()=>captureCellInput(cell)); editor.addEventListener('keydown',(event)=>handleCellKeydown(cell,event)); }
  cells.sort((a,b)=>a.sortY-b.sortY||a.x-b.x); cells.forEach(configureCell);cells.forEach(configureDimensionCell);cells.forEach(configureDisabledSubCell);configureResolutionRules(); saveStatus.textContent=Object.keys(draft).length?'已恢复本地表格':'表格自动保存';
}
function resetTitle() { pageTitle.textContent=DEFAULT_TITLE;localStorage.setItem(TITLE_KEY,DEFAULT_TITLE);document.title=DEFAULT_TITLE; }
function resetTable() { resetTitle();for(const cell of cells){ updateCell(cell,cell.defaultValue,false); if(cell.config)normalizeConfiguredCell(cell); }resetPipelineNodes();calculateResolutionRules(false);resetTableLayouts();resetF2mTriggerLayout();resetTextFileLayouts();resetPipelineImageLayout();saveDraft();showToast('标题、表格、流程模块和布局已恢复默认值'); }
function exportBounds() {
  const padding=20,items=[
    ...tableLayouts,
    {x:f2mTriggerLayout.x,y:f2mTriggerLayout.y,width:190,height:34},
    ...textFileModules.map(module=>module.layout),
    pipelineImageModule.layout
  ];
  const minX=Math.min(...items.map(item=>item.x))-padding,minY=Math.min(...items.map(item=>item.y))-padding;
  const maxX=Math.max(...items.map(item=>item.x+item.width))+padding,maxY=Math.max(...items.map(item=>item.y+item.height))+padding;
  return{x:minX,y:minY,width:maxX-minX,height:maxY-minY};
}
function syncExportFallbacks() { exportFallbackStyles.clear();for(const cell of cells){if(cell.fallback&&(isGdc0ScaleRatioCell(cell)||cell.disabled)){exportFallbackStyles.set(cell.fallback,{fontSize:cell.fallback.getAttribute('font-size'),lineHeight:cell.fallback.dataset.lineHeight,fill:cell.fallback.getAttribute('fill')});if(isGdc0ScaleRatioCell(cell)){cell.fallback.setAttribute('font-size','11px');cell.fallback.dataset.lineHeight='11';}if(cell.disabled)cell.fallback.setAttribute('fill','#8a9199');}updateFallback(cell.fallback,exportValueForCell(cell));} }
function restorePageFallbacks() { for(const [fallback,style] of exportFallbackStyles){if(style.fontSize===null)fallback.removeAttribute('font-size');else fallback.setAttribute('font-size',style.fontSize);if(style.lineHeight===undefined)delete fallback.dataset.lineHeight;else fallback.dataset.lineHeight=style.lineHeight;if(style.fill===null)fallback.removeAttribute('fill');else fallback.setAttribute('fill',style.fill);}exportFallbackStyles.clear();for(const cell of cells)updateFallback(cell.fallback,cell.value); }
function download(blob,filename) { const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.hidden=true;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000); }
function exportSource() { syncExportFallbacks();try{const svg=diagram.querySelector('svg'),clone=svg.cloneNode(true),bounds=exportBounds();clone.setAttribute('viewBox',`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);clone.setAttribute('width',bounds.width);clone.setAttribute('height',bounds.height);clone.style.background='#fff';clone.style.overflow='visible';clone.querySelectorAll('foreignObject').forEach(node=>node.remove());return{source:new XMLSerializer().serializeToString(clone),bounds};}finally{restorePageFallbacks();} }
function roundedRect(context,x,y,width,height,radius=5) {
  const r=Math.min(radius,width/2,height/2);context.beginPath();context.moveTo(x+r,y);context.lineTo(x+width-r,y);context.quadraticCurveTo(x+width,y,x+width,y+r);context.lineTo(x+width,y+height-r);context.quadraticCurveTo(x+width,y+height,x+width-r,y+height);context.lineTo(x+r,y+height);context.quadraticCurveTo(x,y+height,x,y+height-r);context.lineTo(x,y+r);context.quadraticCurveTo(x,y,x+r,y);context.closePath();
}
function fitCanvasText(context,value,maxWidth) {
  const text=String(value||'');if(context.measureText(text).width<=maxWidth)return text;let low=0,high=text.length;while(low<high){const middle=Math.ceil((low+high)/2);if(context.measureText(`${text.slice(0,middle)}...`).width<=maxWidth)low=middle;else high=middle-1;}return `${text.slice(0,low)}...`;
}
function drawModuleHeader(context,module,layout) {
  context.fillStyle='#f5f7f9';context.fillRect(layout.x+1,layout.y+1,layout.width-2,47);context.fillStyle='#c5cbd1';context.fillRect(layout.x+1,layout.y+47,layout.width-2,1);
  context.fillStyle='#64717d';for(let row=0;row<2;row++)for(let column=0;column<3;column++){context.beginPath();context.arc(layout.x+10+column*6,layout.y+20+row*6,1.5,0,Math.PI*2);context.fill();}
  const textWidth=Math.max(20,layout.width-154);context.fillStyle='#252a31';context.font='600 12px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.fillText(fitCanvasText(context,module.title.textContent.trim(),textWidth),layout.x+42,layout.y+19);
  context.fillStyle='#6b747e';context.font='9px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.fillText(fitCanvasText(context,module.sourceLabel,textWidth),layout.x+42,layout.y+35);
  context.fillStyle='#6b747e';context.font='16px "Segoe UI Symbol","Segoe UI",sans-serif';context.fillText('...  S  ↻',layout.x+layout.width-94,layout.y+29);
}
function drawCodeModule(context,module) {
  const layout=module.layout;context.save();roundedRect(context,layout.x,layout.y,layout.width,layout.height);context.clip();context.fillStyle='#20252a';context.fillRect(layout.x,layout.y,layout.width,layout.height);drawModuleHeader(context,module,layout);
  context.save();context.beginPath();context.rect(layout.x+1,layout.y+48,layout.width-2,layout.height-49);context.clip();context.fillStyle='#edf1f4';context.font='11px Consolas,"SFMono-Regular",monospace';context.textBaseline='alphabetic';const lineHeight=17.05,lines=module.code.textContent.replace(/\r/g,'').split('\n'),startLine=Math.max(0,Math.floor(module.code.scrollTop/lineHeight)),offsetY=module.code.scrollTop-startLine*lineHeight,x=layout.x+14-module.code.scrollLeft;let y=layout.y+48+12+11-offsetY;for(let index=startLine;index<lines.length&&y<layout.y+layout.height-8;index++,y+=lineHeight)context.fillText(lines[index].replace(/\t/g,'  '),x,y);context.restore();context.restore();
  context.strokeStyle=module.dirty?'#d39a2c':'#9faab5';context.lineWidth=1;roundedRect(context,layout.x+.5,layout.y+.5,layout.width-1,layout.height-1);context.stroke();
}
function drawPipelineModule(context,module) {
  const layout=module.layout,body={x:layout.x+1,y:layout.y+48,width:layout.width-2,height:layout.height-49};context.save();roundedRect(context,layout.x,layout.y,layout.width,layout.height);context.clip();context.fillStyle='#fff';context.fillRect(layout.x,layout.y,layout.width,layout.height);drawModuleHeader(context,module,layout);
  if(module.image.complete&&module.image.naturalWidth&&module.image.naturalHeight){const scale=Math.min(body.width/module.image.naturalWidth,body.height/module.image.naturalHeight),width=module.image.naturalWidth*scale,height=module.image.naturalHeight*scale;context.drawImage(module.image,body.x+(body.width-width)/2,body.y+(body.height-height)/2,width,height);}else{context.fillStyle='#6b747e';context.font='11px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.textAlign='center';context.fillText(module.status.textContent||'流程图未加载',body.x+body.width/2,body.y+body.height/2);context.textAlign='start';}context.restore();
  context.strokeStyle=module.dirty?'#d39a2c':'#9faab5';context.lineWidth=1;roundedRect(context,layout.x+.5,layout.y+.5,layout.width-1,layout.height-1);context.stroke();
}
function drawF2mModule(context) {
  const {x,y}=f2mTriggerLayout;context.fillStyle='#e9eef2';context.fillRect(x+1,y+1,29,32);context.fillStyle='#2577b7';context.fillRect(x+30,y+1,159,32);context.fillStyle='#64717d';for(let row=0;row<2;row++)for(let column=0;column<3;column++){context.beginPath();context.arc(x+9+column*6,y+12+row*6,1.5,0,Math.PI*2);context.fill();}context.fillStyle='#fff';context.font='600 11px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.textAlign='center';context.fillText(f2mTrigger.textContent,x+109.5,y+22);context.textAlign='start';context.strokeStyle='#9faab5';roundedRect(context,x+.5,y+.5,189,33);context.stroke();
}
async function renderExportCanvas() {
  document.body.classList.add('exporting');document.activeElement?.blur();const headerHeight=58,scale=2;
  try{
    const exported=exportSource(),sourceUrl=URL.createObjectURL(new Blob([exported.source],{type:'image/svg+xml;charset=utf-8'}));
    try{
      const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=sourceUrl;});const canvas=document.createElement('canvas');canvas.width=Math.ceil(exported.bounds.width*scale);canvas.height=Math.ceil((exported.bounds.height+headerHeight)*scale);const context=canvas.getContext('2d');context.scale(scale,scale);context.fillStyle='#fff';context.fillRect(0,0,exported.bounds.width,exported.bounds.height+headerHeight);
      context.fillStyle='#26313a';context.font='600 18px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.fillText(pageTitle.textContent.trim()||DEFAULT_TITLE,20,27);context.fillStyle='#7a828c';context.font='11px "Segoe UI","Microsoft YaHei",Arial,sans-serif';context.fillText('4K30 配置总览',20,44);context.fillStyle='#d9dee4';context.fillRect(0,headerHeight-1,exported.bounds.width,1);
      context.save();context.translate(-exported.bounds.x,headerHeight-exported.bounds.y);context.drawImage(image,exported.bounds.x,exported.bounds.y,exported.bounds.width,exported.bounds.height);drawF2mModule(context);for(const module of textFileModules)drawCodeModule(context,module);drawPipelineModule(context,pipelineImageModule);context.restore();
      return canvas;
    }finally{URL.revokeObjectURL(sourceUrl);}
  }finally{document.body.classList.remove('exporting');}
}
async function exportPng() {
  try{const canvas=await renderExportCanvas(),png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('无法生成 PNG');download(png,'4k30-normal-preview.png');showToast('已导出全部模块');}
  catch(error){console.error(error);showToast('图片导出失败');}
}
async function load() { if(location.protocol==='file:')throw new Error('FILE_PROTOCOL');const response=await fetch('../assets/4k30-normal-preview.svg');if(!response.ok)throw new Error();diagram.innerHTML=await response.text();const svg=diagram.querySelector('svg');svg.removeAttribute('width');svg.removeAttribute('height');svg.setAttribute('viewBox',`-.5 -.5 ${SIZE.width} ${SIZE.height}`);addSensorDefinition(svg);tableLayouts=prepareMovableTables(svg);bindPipelineNodes(svg);bindCells(svg);initializeTableControls();initializeF2mTrigger();initializeTextFileModules();initializePipelineImageModule();fitToView(); }
function normalizeTitleModes(value) { return String(value||'').replace(/(?:Mutil|Multi)-\s*scale/ig,'3scale').replace(/([12])\s*path\s*([123])\s*scale/ig,'$1path$2scale'); }
function migrateLegacyTitle(value) { const normalized=normalizeTitleModes(value),path1=/1path([123])scale/i.test(normalized),path2=normalized.match(/2path([123])scale/i);return!path1&&path2?normalized.replace(path2[0],`1path${path2[1]}scale ${path2[0]}`):normalized; }
function bindTitle() { const saved=localStorage.getItem(TITLE_KEY),legacyDefaults=new Set(['4K30 Normal Preview','4K30 16:9 Normal 2path Multi-scale Preview','4K30 16:9 Normal 2path Multi-scale\u00a0Preview']),migrated=migrateLegacyTitle(saved),value=saved&&!legacyDefaults.has(saved)?migrated:DEFAULT_TITLE;pageTitle.textContent=value||DEFAULT_TITLE;if(saved!==pageTitle.textContent)localStorage.setItem(TITLE_KEY,pageTitle.textContent);document.title=pageTitle.textContent.trim()||DEFAULT_TITLE;pageTitle.addEventListener('input',()=>{const next=pageTitle.textContent.trim();localStorage.setItem(TITLE_KEY,next);document.title=next||DEFAULT_TITLE;if(cells.length)calculateResolutionRules();if(pipelineNodes.length)applyPipelineModes();saveStatus.textContent='已自动保存';});pageTitle.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();pageTitle.textContent=normalizeTitleModes(pageTitle.textContent.trim())||DEFAULT_TITLE;pageTitle.dispatchEvent(new InputEvent('input',{bubbles:true}));pageTitle.blur();}}); }
viewport.addEventListener('wheel',(event)=>{event.preventDefault();closeMenu();zoomAt(view.scale*Math.exp(-event.deltaY*.0012),event.clientX,event.clientY);},{passive:false});
viewport.addEventListener('pointerdown',(event)=>{if(!event.target.closest('.pipeline-node-label'))setActivePipelineNode(null);if(event.target.closest('[contenteditable=true],.option-cell,.numeric-cell')){activateFrame(null);return;}const contentGroup=event.composedPath().find(node=>node?.dataset?.tableContent);if(contentGroup){const layout=tableLayouts.find(item=>item.id===contentGroup.dataset.tableContent);if(layout)activateFrame(layout.frame);return;}activateFrame(null);closeMenu();view.dragging=true;view.pointerX=event.clientX;view.pointerY=event.clientY;viewport.classList.add('dragging');viewport.setPointerCapture(event.pointerId);});
viewport.addEventListener('pointermove',(event)=>{if(!view.dragging)return;view.x+=event.clientX-view.pointerX;view.y+=event.clientY-view.pointerY;view.pointerX=event.clientX;view.pointerY=event.clientY;renderView();});
function stopDrag(event){view.dragging=false;viewport.classList.remove('dragging');if(event.pointerId!==undefined&&viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);}viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);
document.addEventListener('click',(event)=>{if(!fieldMenu.contains(event.target))closeMenu();});pipelineStrikeButton.addEventListener('click',togglePipelineNodeStrike);document.querySelector('#zoomIn').addEventListener('click',()=>zoomCenter(1.2));document.querySelector('#zoomOut').addEventListener('click',()=>zoomCenter(1/1.2));document.querySelector('#fitView').addEventListener('click',fitToView);document.querySelector('#fullscreen').addEventListener('click',async()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen());document.querySelector('#exportPng').addEventListener('click',exportPng);document.querySelector('#resetTable').addEventListener('click',()=>{if(confirm('恢复表格、流程模块和布局的默认内容？'))resetTable();});window.addEventListener('resize',fitToView);bindTitle();setTimeout(()=>document.querySelector('.canvas-hint').style.opacity='0',4200);load().catch((error)=>{if(error.message==='FILE_PROTOCOL'){diagram.innerHTML='<div class="launch-notice"><strong>需要通过本地服务打开</strong><span>请双击上一级目录中的 start-table-editor.cmd</span></div>';return;}showToast('图表加载失败');});

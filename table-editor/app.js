const SIZE = { width: 1161, height: 1601 };
const STORAGE_KEY = '4k30-table-editor-v1';
const TITLE_KEY = '4k30-table-editor-title-v1';
const LAYOUT_KEY = '4k30-table-layout-v2';
const F2M_TRIGGER_LAYOUT_KEY = '4k30-f2m-trigger-layout-v1';
const IMC_CODE_LAYOUT_KEY = '4k30-imc-code-layout-v1';
const SCRIPT_CODE_LAYOUT_KEY = '4k30-script-code-layout-v1';
const PIPELINE_IMAGE_LAYOUT_KEY = '4k30-pipeline-image-layout-v1';
const TABLE_START_Y = 250;
const TABLE_DEFINITIONS = [
  { id:'pipeline',name:'流程图',x:0,y:0,width:1160,height:240 },
  { id:'usecase',name:'Usecase定义',x:0,y:250,width:600,height:120 },
  { id:'ast',name:'iq-3ast配置',x:640,y:250,width:320,height:120 },
  { id:'resolution',name:'分辨率变化表',x:0,y:410,width:600,height:240 },
  { id:'f2m',name:'iq-f2m配置',x:640,y:410,width:320,height:120 },
  { id:'sensor',name:'Sensor定义',x:640,y:550,width:320,height:120 },
  { id:'gdc0',name:'main-iq-gdc0配置',x:0,y:680,width:480,height:441 },
  { id:'gdc1',name:'main-iq-gdc1配置',x:520,y:680,width:480,height:441 },
  { id:'subgdc0',name:'sub-iq-gdc0配置',x:0,y:1160,width:480,height:441,sourceId:'gdc0' },
  { id:'subgdc1',name:'sub-iq-gdc1配置',x:520,y:1160,width:480,height:441,sourceId:'gdc1' }
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
const GDC0_RATIO_D1_KEY = '121:980';
const GDC0_RATIO_D4_KEY = '241:980';
const GDC0_RATIO_D16_KEY = '361:980';
const GDC1_MESH_D1_KEY = '641:820';
const GDC1_MESH_D4_KEY = '761:820';
const GDC1_MESH_D16_KEY = '881:820';
const F2M_D1_KEY = '761:455';
const F2M_D2_KEY = '761:484';
const F2M_D4_KEY = '761:515';
const SENSOR_BIT_DEPTH_KEY = '801:603';
const SENSOR_TYPE_KEY = '801:648';
const SENSOR_LAYOUT_VERSION = 1;
const GDC_HEADER_LAYOUT_VERSION = 1;
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
  [SENSOR_TYPE_KEY]: { type: 'single', label: 'sensor类型', options: ['binning', 'DCG-HDR', 'fullr-rmsc_on', 'fullr-rmsc_off'], defaultValue: 'binning' }
};

const viewport = document.querySelector('#viewport');
const stage = document.querySelector('#stage');
const diagram = document.querySelector('#diagram');
const zoomValue = document.querySelector('#zoomValue');
const saveStatus = document.querySelector('#saveStatus');
const pageTitle = document.querySelector('#pageTitle');
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
const f2mTriggerLayout = { x: 970, y: 675, baseX: 970, baseY: 675 };
const textFileModules = [
  { name:'imcoverridesettings.txt',endpoint:'/api/imc-overrides',layoutKey:IMC_CODE_LAYOUT_KEY,panel:document.querySelector('#imcCodePanel'),drag:document.querySelector('#imcCodeDrag'),save:document.querySelector('#imcCodeSave'),refresh:document.querySelector('#imcCodeRefresh'),resize:document.querySelector('#imcCodeResize'),title:document.querySelector('#imcCodeName'),path:document.querySelector('#imcCodePath'),code:document.querySelector('#imcCode'),layout:{x:1175,y:80,width:420,height:500,baseX:1175,baseY:80,baseWidth:420,baseHeight:500},dirty:false,sourceLabel:''},
  { name:'Usecase 脚本',endpoint:'/api/usecase-script',layoutKey:SCRIPT_CODE_LAYOUT_KEY,panel:document.querySelector('#scriptCodePanel'),drag:document.querySelector('#scriptCodeDrag'),save:document.querySelector('#scriptCodeSave'),refresh:document.querySelector('#scriptCodeRefresh'),resize:document.querySelector('#scriptCodeResize'),title:document.querySelector('#scriptCodeName'),path:document.querySelector('#scriptCodePath'),code:document.querySelector('#scriptCode'),layout:{x:1175,y:620,width:520,height:520,baseX:1175,baseY:620,baseWidth:520,baseHeight:520},dirty:false,sourceLabel:''}
];
const pipelineImageModule = {
  panel:document.querySelector('#pipelineImagePanel'),drag:document.querySelector('#pipelineImageDrag'),save:document.querySelector('#pipelineImageSave'),refresh:document.querySelector('#pipelineImageRefresh'),resize:document.querySelector('#pipelineImageResize'),title:document.querySelector('#pipelineImageName'),path:document.querySelector('#pipelineImagePath'),canvas:document.querySelector('#pipelineImageCanvas'),image:document.querySelector('#pipelineImage'),status:document.querySelector('#pipelineImageStatus'),dirty:false,sourceLabel:'',viewer:{active:false,scale:1,x:0,y:0,dragging:false,pointerX:0,pointerY:0},layout:{x:1175,y:1180,width:900,height:260,baseX:1175,baseY:1180,baseWidth:900,baseHeight:260}
};
const cells = [];
let activeCell = null;
let toastTimer;
let tableLayouts=[];
let freeModuleZIndex=20;

const normalize = (value) => String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
function coordinate(node, property) { const layout = node.firstElementChild; const raw = property === 'x' ? layout?.style.marginLeft : layout?.style.paddingTop; return Math.round(Number.parseFloat(raw || '0')); }
const keyFor = (cell) => `${cell.scope?`${cell.scope}:`:''}${cell.x}:${cell.y}`;
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('visible'); toastTimer = setTimeout(() => toast.classList.remove('visible'), 1800); }
function payloadFileName(payload,fallback='') { return payload?.name||String(payload?.path||'').split(/[\\/]/).pop()||fallback; }
function bringFreeModuleToFront(panel) { panel.style.zIndex=String(++freeModuleZIndex); }
function renderView() { stage.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.scale})`; zoomValue.textContent = `${Math.round(view.scale * 100)}%`; }
function fitToView() { const padding = viewport.clientWidth < 680 ? 16 : 38; view.scale = Math.min((viewport.clientWidth-padding*2)/SIZE.width,(viewport.clientHeight-padding*2)/SIZE.height,1); view.x=(viewport.clientWidth-SIZE.width*view.scale)/2; view.y=(viewport.clientHeight-SIZE.height*view.scale)/2; renderView(); }
function zoomAt(scale,clientX,clientY) { scale=Math.min(3,Math.max(.2,scale)); const rect=viewport.getBoundingClientRect(), cx=clientX-rect.left, cy=clientY-rect.top, px=(cx-view.x)/view.scale, py=(cy-view.y)/view.scale; view.x=cx-px*scale; view.y=cy-py*scale; view.scale=scale; renderView(); }
function zoomCenter(factor) { const rect=viewport.getBoundingClientRect(); zoomAt(view.scale*factor,rect.left+rect.width/2,rect.top+rect.height/2); }
function readDraft() { try { const draft=JSON.parse(localStorage.getItem(STORAGE_KEY))||{};if(draft[SENSOR_BIT_DEPTH_KEY]===undefined&&draft['901:603']!==undefined)draft[SENSOR_BIT_DEPTH_KEY]=draft['901:603'];if(draft[SENSOR_TYPE_KEY]===undefined&&draft['901:648']!==undefined)draft[SENSOR_TYPE_KEY]=draft['901:648'];return draft; } catch { return {}; } }
function saveDraft() { localStorage.setItem(STORAGE_KEY,JSON.stringify(Object.fromEntries(cells.map(cell=>[keyFor(cell),cell.value])))); saveStatus.textContent='已自动保存'; }
function updateFallback(fallback,value) { const wrap=Number(fallback?.dataset.wrapChars||0); if(!fallback)return; if(!wrap){fallback.textContent=normalize(value);return;} const words=normalize(value).split(/(?<=,)|\s+/),lines=[]; let line=''; for(const word of words){const next=`${line}${line?' ':''}${word}`.trim();if(line&&next.length>wrap){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);const centerY=Number(fallback.dataset.centerY);const lineHeight=Number(fallback.dataset.lineHeight||11);fallback.replaceChildren(...lines.map((text,index)=>{const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.setAttribute('x',fallback.getAttribute('x'));span.setAttribute('y',String(centerY+(index-(lines.length-1)/2)*lineHeight));span.textContent=text;return span;})); }
function updateCell(cell,value,save=true) { cell.value=String(value); if(cell.editor.innerText!==cell.value) cell.editor.innerText=cell.value; updateFallback(cell.fallback,cell.value); if(save) saveDraft(); }
function captureCellInput(cell) { cell.value=String(cell.editor.innerText).replace(/\u00a0/g,' ').replace(/\r/g,'').trim();updateFallback(cell.fallback,cell.value);saveDraft(); }
function selectText(editor) { const selection=window.getSelection(),range=document.createRange(); range.selectNodeContents(editor); selection.removeAllRanges(); selection.addRange(range); }
function moveCell(cell,direction) { const next=cells[cells.indexOf(cell)+direction]; if(!next)return; next.editor.focus(); if(next.editor.isContentEditable) selectText(next.editor); }
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
function setComputedCell(key,label) { const cell=findCell(key); if(!cell)return null; cell.foreignObject.classList.add('computed-cell'); cell.editor.contentEditable='true'; cell.editor.tabIndex=0; cell.editor.setAttribute('role','textbox'); cell.editor.setAttribute('aria-label',label.replace(/^自动计算的\s*/,'编辑')); return cell; }
function ratioText(numerator,denominator) { if(!numerator||!denominator||!denominator.width||!denominator.height)return null; return `[${numerator.width/denominator.width}, ${numerator.height/denominator.height}]`; }
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
  if(save) saveDraft();
}
function configureResolutionRules() {
  const sensor=findCell(SENSOR_CELL_KEY),v2wr=findCell(V2_WR_D1_KEY);
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
  setComputedCell(GDC1_MESH_D1_KEY,'自动计算的 GDC1 D1 mesh_nx/mesh_ny');
  setComputedCell(GDC1_MESH_D4_KEY,'自动计算的 GDC1 D4 mesh_nx/mesh_ny');
  setComputedCell(GDC1_MESH_D16_KEY,'自动计算的 GDC1 D16 mesh_nx/mesh_ny');
  setComputedCell(F2M_D1_KEY,'Python算法计算的 f2m d1 ROI');
  setComputedCell(F2M_D2_KEY,'Python算法计算的 f2m d2 ROI');
  setComputedCell(F2M_D4_KEY,'Python算法计算的 f2m d4 ROI');
  calculateResolutionRules(false);
}
function svgElement(name,attributes={}) { const node=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,String(value));return node; }
function addText(group,text,x,y,options={}) { const node=svgElement('text',{x,y,'text-anchor':options.anchor||'middle','font-family':'Helvetica','font-size':options.size||11,fill:options.fill||'#000','font-weight':options.weight||'normal'});node.textContent=text;group.append(node);return node; }
function addEditableDefinitionCell(parent,x,y,width,height,value,wrapChars=0) { const switchNode=svgElement('switch');const foreignObject=svgElement('foreignObject',{x:0,y:0,width:'100%',height:'100%'});const layout=document.createElementNS('http://www.w3.org/1999/xhtml','div');layout.setAttribute('style',`display:flex;align-items:center;justify-content:center;width:${width-2}px;height:1px;padding-top:${y+height/2}px;margin-left:${x+1}px;`);const box=document.createElementNS('http://www.w3.org/1999/xhtml','div');box.setAttribute('style','box-sizing:border-box;font-size:0;text-align:center;color:#000;');const editor=document.createElementNS('http://www.w3.org/1999/xhtml','div');editor.setAttribute('style','display:inline-block;width:100%;font-size:12px;font-family:Helvetica;line-height:1.2;white-space:normal;word-wrap:normal;');editor.textContent=value;box.append(editor);layout.append(box);foreignObject.append(layout);switchNode.append(foreignObject);const fallback=addText(switchNode,value,x+width/2,y+height/2+4,{size:12});if(wrapChars){fallback.dataset.wrapChars=String(wrapChars);fallback.dataset.centerY=String(y+height/2+4);fallback.dataset.lineHeight='12';updateFallback(fallback,value);}parent.append(switchNode); }
function addSensorDefinition(svg) { if(svg.querySelector('[data-sensor-definition]'))return;const x=640,y=550,width=320,left=160,titleHeight=30,row1Height=45,row2Height=45;const container=svgElement('g',{'data-sensor-definition':'true','data-table-content':'sensor'}),group=svgElement('g');group.append(svgElement('rect',{x,y,width,height:titleHeight,fill:'#000',stroke:'#000'}));addText(group,'Sensor定义',x+width/2,y+20,{size:12,fill:'#fff',weight:'bold'});const row1Y=y+titleHeight,row2Y=row1Y+row1Height;group.append(svgElement('rect',{x,y:row1Y,width:left,height:row1Height,fill:'#ccc',stroke:'#000'}),svgElement('rect',{x:x+left,y:row1Y,width:width-left,height:row1Height,fill:'#fff',stroke:'#000'}),svgElement('rect',{x,y:row2Y,width:left,height:row2Height,fill:'#ccc',stroke:'#000'}),svgElement('rect',{x:x+left,y:row2Y,width:width-left,height:row2Height,fill:'#fff',stroke:'#000'}));addText(group,'ISP支持接入的bit位宽',x+left/2,row1Y+28,{size:12});addText(group,'常见的sensor类型',x+left/2,row2Y+28,{size:12});container.append(group);addEditableDefinitionCell(container,x+left,row1Y,width-left,row1Height,'10');addEditableDefinitionCell(container,x+left,row2Y,width-left,row2Height,'binning');svg.append(container); }
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
    layouts.push({...definition,defaultX:definition.x,defaultY:definition.y,baseX:definition.x,baseY:definition.y,baseWidth:definition.width,baseHeight:definition.height,element:group});
  }
  for(const definition of TABLE_DEFINITIONS.filter(item=>item.sourceId)){
    const source=layouts.find(layout=>layout.id===definition.sourceId);if(!source)continue;
    const group=source.element.cloneNode(true),geometry={x:source.baseX,y:source.baseY,width:source.baseWidth,height:source.baseHeight};
    group.dataset.tableContent=definition.id;setGdcTableTitle(group,definition,geometry);root?.append(group);
    layouts.push({...definition,defaultX:definition.x,defaultY:definition.y,baseX:geometry.x,baseY:geometry.y,baseWidth:geometry.width,baseHeight:geometry.height,element:group});
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
    layout.width=compactSensor?layout.baseWidth:(Number.isFinite(state.width)?state.width:layout.baseWidth);
    const legacyResolution=layout.id==='resolution'&&state.height===270;
    layout.height=legacyGdc?(Number.isFinite(state.height)?state.height+30*legacyScale:layout.baseHeight):(compactSensor||legacyResolution?layout.baseHeight:(Number.isFinite(state.height)?state.height:layout.baseHeight));
    const frame=document.createElement('div');frame.className='table-frame';frame.dataset.tableId=layout.id;const drag=document.createElement('button');drag.type='button';drag.className='table-drag-handle';drag.title=`拖动${layout.name}`;drag.setAttribute('aria-label',`拖动${layout.name}`);const resize=document.createElement('button');resize.type='button';resize.className='table-resize-handle';resize.title=`调整${layout.name}大小`;resize.setAttribute('aria-label',`调整${layout.name}大小`);frame.append(drag,resize);tableControls.append(frame);layout.frame=frame;drag.addEventListener('pointerdown',(event)=>beginLayoutPointer(event,layout,'move'));resize.addEventListener('pointerdown',(event)=>beginLayoutPointer(event,layout,'resize'));renderTableLayout(layout);
  }
  if(migrated)saveLayouts();
}
function resetTableLayouts() { localStorage.removeItem(LAYOUT_KEY);for(const layout of tableLayouts){layout.x=layout.defaultX;layout.y=layout.defaultY;layout.width=layout.baseWidth;layout.height=layout.baseHeight;renderTableLayout(layout);} }
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
  try{const response=await fetch('/api/pipeline-diagram-info'),payload=await response.json();if(!response.ok)throw new Error(payload.error||'读取流程图失败');module.title.textContent=payloadFileName(payload,'imcmctfnnnoainrpipeline.svg');module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setPipelineImageDirty(false);await new Promise((resolve,reject)=>{module.image.onload=resolve;module.image.onerror=()=>reject(new Error('流程图图片加载失败'));module.image.src=`/api/pipeline-diagram.svg?t=${Date.now()}`;});module.status.hidden=true;}
  catch(error){module.path.textContent='读取失败';module.status.textContent=error.message;module.status.hidden=false;}
  finally{module.refresh.disabled=false;}
}
function setPipelineImageDirty(dirty) { const module=pipelineImageModule;module.dirty=dirty;module.panel.classList.toggle('dirty',dirty);module.save.disabled=!dirty;module.path.textContent=`${module.sourceLabel}${dirty?' · 未保存':''}`; }
async function savePipelineImageName() { const module=pipelineImageModule,filename=module.title.innerText.trim();module.save.disabled=true;try{const response=await fetch('/api/pipeline-diagram-info',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({filename})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'保存文件名失败');module.title.textContent=payloadFileName(payload,filename);module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setPipelineImageDirty(false);showToast('流程图文件名已保存');}catch(error){setPipelineImageDirty(true);showToast(error.message);} }
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
  for(const control of [module.save,module.refresh,module.title,module.image])control.addEventListener('pointerdown',(event)=>event.stopPropagation());module.title.addEventListener('input',()=>setPipelineImageDirty(true));module.title.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();module.title.blur();}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(module.dirty)savePipelineImageName();}});module.save.addEventListener('click',(event)=>{event.stopPropagation();savePipelineImageName();});module.refresh.addEventListener('click',(event)=>{event.stopPropagation();loadPipelineImage();});module.image.addEventListener('dblclick',async()=>{if(module.viewer.active){Object.assign(module.viewer,{scale:1,x:0,y:0});renderPipelineViewer();return;}if(module.canvas.requestFullscreen){resetPipelineViewer();module.viewer.active=true;try{await module.canvas.requestFullscreen();}catch{resetPipelineViewer();showToast('无法打开全屏图片');}}});module.image.addEventListener('dragstart',(event)=>event.preventDefault());module.canvas.addEventListener('wheel',zoomPipelineViewer,{passive:false});module.image.addEventListener('pointerdown',beginPipelineViewerDrag);module.image.addEventListener('pointermove',movePipelineViewer);module.image.addEventListener('pointerup',stopPipelineViewerDrag);module.image.addEventListener('pointercancel',stopPipelineViewerDrag);document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement===module.canvas)module.viewer.active=true;else resetPipelineViewer();});loadPipelineImage();
}
function setTextFileDirty(module,dirty) { module.dirty=dirty;module.panel.classList.toggle('dirty',dirty);module.save.disabled=!dirty;module.path.textContent=`${module.sourceLabel}${dirty?' · 未保存':''}`; }
async function loadTextFileModule(module,confirmDiscard=true) {
  if(confirmDiscard&&module.dirty&&!confirm(`${module.name} 有未保存修改，确认重新读取源文件？`))return;
  module.refresh.disabled=true;module.refresh.setAttribute('aria-busy','true');module.code.contentEditable='false';module.code.textContent='正在读取...';
  try{const response=await fetch(module.endpoint),payload=await response.json();if(!response.ok)throw new Error(payload.error||'读取文件失败');module.title.textContent=payloadFileName(payload,module.name);module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;module.code.textContent=payload.content||'';setTextFileDirty(module,false);}
  catch(error){module.sourceLabel='读取失败';module.code.textContent=error.message;setTextFileDirty(module,false);}
  finally{module.code.contentEditable='true';module.refresh.disabled=false;module.refresh.removeAttribute('aria-busy');}
}
async function saveTextFileModule(module) {
  const content=module.code.innerText.replace(/\r/g,''),filename=module.title.innerText.trim();module.save.disabled=true;module.save.setAttribute('aria-busy','true');
  try{const response=await fetch(module.endpoint,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,filename})}),payload=await response.json();if(!response.ok)throw new Error(payload.error||'保存文件失败');const savedName=payloadFileName(payload,filename);module.title.textContent=savedName;module.sourceLabel=`${payload.path} · ${payload.modified_at}`;module.path.title=payload.path;setTextFileDirty(module,false);showToast(`${savedName} 已保存`);}
  catch(error){setTextFileDirty(module,true);showToast(error.message);}
  finally{module.save.removeAttribute('aria-busy');}
}
function initializeTextFileModule(module) {
  const saved=readTextFileLayout(module),layout=module.layout;layout.x=Number.isFinite(saved.x)?saved.x:layout.baseX;layout.y=Number.isFinite(saved.y)?saved.y:layout.baseY;layout.width=Number.isFinite(saved.width)?saved.width:layout.baseWidth;layout.height=Number.isFinite(saved.height)?saved.height:layout.baseHeight;renderTextFileLayout(module);
  module.panel.addEventListener('pointerdown',()=>bringFreeModuleToFront(module.panel),true);
  module.drag.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();activateFrame(null);closeMenu();const start={clientX:event.clientX,clientY:event.clientY,x:layout.x,y:layout.y};document.body.classList.add('layout-dragging');const move=(next)=>{layout.x=start.x+(next.clientX-start.clientX)/view.scale;layout.y=start.y+(next.clientY-start.clientY)/view.scale;renderTextFileLayout(module);};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-dragging');saveTextFileLayout(module);};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  module.resize.addEventListener('pointerdown',(event)=>{event.preventDefault();event.stopPropagation();const start={clientX:event.clientX,clientY:event.clientY,width:layout.width,height:layout.height};document.body.classList.add('layout-resizing');const move=(next)=>{layout.width=Math.max(280,start.width+(next.clientX-start.clientX)/view.scale);layout.height=Math.max(180,start.height+(next.clientY-start.clientY)/view.scale);renderTextFileLayout(module);};const finish=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',finish);document.body.classList.remove('layout-resizing');saveTextFileLayout(module);};document.addEventListener('pointermove',move);document.addEventListener('pointerup',finish);});
  for(const control of [module.save,module.refresh,module.title,module.code])control.addEventListener('pointerdown',(event)=>event.stopPropagation());
  module.title.addEventListener('input',()=>setTextFileDirty(module,true));module.title.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();module.title.blur();}});module.code.addEventListener('input',()=>setTextFileDirty(module,true));module.code.addEventListener('keydown',(event)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();if(module.dirty)saveTextFileModule(module);}});module.save.addEventListener('click',(event)=>{event.stopPropagation();saveTextFileModule(module);});module.refresh.addEventListener('click',(event)=>{event.stopPropagation();loadTextFileModule(module);});loadTextFileModule(module,false);
}
function initializeTextFileModules() { for(const module of textFileModules)initializeTextFileModule(module); }
function bindCells(svg) {
  cells.length=0; const draft=readDraft();
  for(const foreignObject of svg.querySelectorAll('foreignObject')) { const x=coordinate(foreignObject,'x'),y=coordinate(foreignObject,'y'); if(y<TABLE_START_Y)continue; const editor=foreignObject.querySelector('div > div > div'); if(!editor)continue; const fallback=foreignObject.closest('switch')?.querySelector('text')||null,defaultValue=normalize(editor.innerText),tableId=foreignObject.closest('[data-table-content]')?.dataset.tableContent||'',scope=tableId.startsWith('subgdc')?tableId:'',layout=scope?tableLayouts.find(item=>item.id===scope):null,sortY=y+(layout?layout.defaultY-layout.baseY:0); const cell={x,y,sortY,scope,editor,fallback,foreignObject,defaultValue,value:defaultValue,config:null,partValues:null}; cells.push(cell); foreignObject.classList.add('editable-cell'); editor.contentEditable='true'; editor.tabIndex=0; editor.spellcheck=false; editor.setAttribute('role','textbox'); editor.setAttribute('aria-label',`编辑${scope?'sub ':''}表格单元格：${defaultValue||`${x},${y}`}`); editor.addEventListener('pointerdown',(event)=>{if(editor.getAttribute('contenteditable')==='true'){event.stopPropagation();editor.focus();}}); const saved=draft[keyFor(cell)]; if(typeof saved==='string')updateCell(cell,saved,false); editor.addEventListener('input',()=>captureCellInput(cell)); editor.addEventListener('keydown',(event)=>{ if(event.key==='Tab'){event.preventDefault();moveCell(cell,event.shiftKey?-1:1);} else if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();editor.blur();} else if(event.key==='Escape')editor.blur(); else if(cell.config&&(event.key==='ArrowDown'||event.key===' ')){event.preventDefault();openMenu(cell);} }); }
  cells.sort((a,b)=>a.sortY-b.sortY||a.x-b.x); cells.forEach(configureCell); configureResolutionRules(); saveStatus.textContent=Object.keys(draft).length?'已恢复本地表格':'表格自动保存';
}
function resetTable() { for(const cell of cells){ updateCell(cell,cell.defaultValue,false); if(cell.config)normalizeConfiguredCell(cell); } calculateResolutionRules(false);resetTableLayouts();resetF2mTriggerLayout();resetTextFileLayouts();resetPipelineImageLayout();saveDraft();showToast('表格内容和布局已恢复默认值'); }
function exportBounds() { const padding=20,minX=Math.min(...tableLayouts.map(layout=>layout.x))-padding,minY=Math.min(...tableLayouts.map(layout=>layout.y))-padding,maxX=Math.max(...tableLayouts.map(layout=>layout.x+layout.width))+padding,maxY=Math.max(...tableLayouts.map(layout=>layout.y+layout.height))+padding;return{x:minX,y:minY,width:maxX-minX,height:maxY-minY}; }
function exportSource() { const svg=diagram.querySelector('svg'),clone=svg.cloneNode(true),bounds=exportBounds();clone.setAttribute('viewBox',`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);clone.setAttribute('width',bounds.width);clone.setAttribute('height',bounds.height);clone.style.background='#fff';clone.style.overflow='visible';clone.querySelectorAll('foreignObject').forEach(node=>node.remove());return{source:new XMLSerializer().serializeToString(clone),bounds}; }
function download(blob,filename) { const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
async function exportPng() { document.body.classList.add('exporting');document.activeElement?.blur();try{const exported=exportSource(),sourceUrl=URL.createObjectURL(new Blob([exported.source],{type:'image/svg+xml;charset=utf-8'}));try{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=sourceUrl;});const canvas=document.createElement('canvas');canvas.width=Math.ceil(exported.bounds.width*2);canvas.height=Math.ceil(exported.bounds.height*2);const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));download(png,'4k30-normal-preview.png');showToast('图片已导出');}finally{URL.revokeObjectURL(sourceUrl);}}catch{showToast('图片导出失败');}finally{document.body.classList.remove('exporting');}}
async function load() { const response=await fetch('../assets/4k30-normal-preview.svg');if(!response.ok)throw new Error();diagram.innerHTML=await response.text();const svg=diagram.querySelector('svg');svg.removeAttribute('width');svg.removeAttribute('height');svg.setAttribute('viewBox',`-.5 -.5 ${SIZE.width} ${SIZE.height}`);addSensorDefinition(svg);tableLayouts=prepareMovableTables(svg);bindCells(svg);initializeTableControls();initializeF2mTrigger();initializeTextFileModules();initializePipelineImageModule();fitToView(); }
function bindTitle() { const saved=localStorage.getItem(TITLE_KEY);if(saved)pageTitle.textContent=saved;document.title=pageTitle.textContent.trim()||'4K30 Normal Preview';pageTitle.addEventListener('input',()=>{const value=pageTitle.textContent.trim();localStorage.setItem(TITLE_KEY,value);document.title=value||'4K30 Normal Preview';if(cells.length)calculateResolutionRules();saveStatus.textContent='已自动保存';});pageTitle.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();pageTitle.blur();}}); }
viewport.addEventListener('wheel',(event)=>{event.preventDefault();closeMenu();zoomAt(view.scale*Math.exp(-event.deltaY*.0012),event.clientX,event.clientY);},{passive:false});
viewport.addEventListener('pointerdown',(event)=>{if(event.target.closest('[contenteditable=true],.option-cell,.numeric-cell')){activateFrame(null);return;}const contentGroup=event.composedPath().find(node=>node?.dataset?.tableContent);if(contentGroup){const layout=tableLayouts.find(item=>item.id===contentGroup.dataset.tableContent);if(layout)activateFrame(layout.frame);return;}activateFrame(null);closeMenu();view.dragging=true;view.pointerX=event.clientX;view.pointerY=event.clientY;viewport.classList.add('dragging');viewport.setPointerCapture(event.pointerId);});
viewport.addEventListener('pointermove',(event)=>{if(!view.dragging)return;view.x+=event.clientX-view.pointerX;view.y+=event.clientY-view.pointerY;view.pointerX=event.clientX;view.pointerY=event.clientY;renderView();});
function stopDrag(event){view.dragging=false;viewport.classList.remove('dragging');if(event.pointerId!==undefined&&viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);}viewport.addEventListener('pointerup',stopDrag);viewport.addEventListener('pointercancel',stopDrag);
document.addEventListener('click',(event)=>{if(!fieldMenu.contains(event.target))closeMenu();});document.querySelector('#zoomIn').addEventListener('click',()=>zoomCenter(1.2));document.querySelector('#zoomOut').addEventListener('click',()=>zoomCenter(1/1.2));document.querySelector('#fitView').addEventListener('click',fitToView);document.querySelector('#fullscreen').addEventListener('click',async()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen());document.querySelector('#exportPng').addEventListener('click',exportPng);document.querySelector('#resetTable').addEventListener('click',()=>{if(confirm('恢复所有表格单元格的默认值？'))resetTable();});window.addEventListener('resize',fitToView);bindTitle();setTimeout(()=>document.querySelector('.canvas-hint').style.opacity='0',4200);load().catch(()=>showToast('图表加载失败'));

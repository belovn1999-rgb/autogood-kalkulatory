// Structural editing for AUTO1's text/vector PDFs. Original image streams and
// fonts are copied; a page is never rendered into the output PDF.
const IDENTITY = [1, 0, 0, 1, 0, 0];
const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)$/;
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const matrix = (a, b) => [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
const point = (m, x, y) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]];
const bounds = (points) => [Math.min(...points.map(p=>p[0])), Math.min(...points.map(p=>p[1])), Math.max(...points.map(p=>p[0])), Math.max(...points.map(p=>p[1]))];
const intersect = (a,b) => [Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])];
const empty = (b) => b[2] < b[0] || b[3] < b[1];
const fmt = (n) => n.toFixed(10).replace(/\.?0+$/, '') || '0';
const cm = (m) => `${m.map(fmt).join(' ')} cm`;
function inverse(m) {
  const d=m[0]*m[3]-m[1]*m[2];
  if (Math.abs(d)<1e-12) throw new Error('Unsupported singular PDF transform');
  return [m[3]/d,-m[1]/d,-m[2]/d,m[0]/d,(m[2]*m[5]-m[3]*m[4])/d,(m[1]*m[4]-m[0]*m[5])/d];
}

// Tokens preserve literal/hex strings and nested arrays/dictionaries as units.
// Thus operator-like text inside strings can never be mistaken for an operator.
export function tokenize(content) {
  const out=[]; let i=0;
  const ws=()=>{ while(i<content.length) { if (/\s|\0/.test(content[i])) i++; else if(content[i]==='%') {while(i<content.length&&!/[\r\n]/.test(content[i]))i++;} else break; } };
  function token() {
    ws(); const start=i, c=content[i++];
    if(c==='(') { let depth=1; while(i<content.length&&depth) {const v=content[i++]; if(v==='\\')i++; else if(v==='(')depth++; else if(v===')')depth--; } if(depth)throw new Error('Unterminated PDF string'); }
    else if(c==='[' || (c==='<'&&content[i]==='<')) {
      const end=c==='['?']':'>>'; if(c==='<')i++;
      while(i<content.length) {ws(); if(content.slice(i,i+end.length)===end) {i+=end.length;return content.slice(start,i);} token();}
      throw new Error('Unterminated PDF container');
    } else if(c==='<') {while(i<content.length&&content[i]!=='>')i++;if(i===content.length)throw new Error('Unterminated PDF hex string');i++;}
    else {while(i<content.length&&!/[\s\0()[\]<>/%]/.test(content[i]))i++;}
    return content.slice(start,i);
  }
  while(i<content.length) {ws();if(i<content.length)out.push(token());}
  return out;
}

function operations(content) {
  const ops=[];let args=[];
  for(const t of tokenize(content)) {
    if(NUMBER.test(t)||/^[\/([<]/.test(t)||['true','false','null'].includes(t)) args.push(t);
    else { if(t==='BI')throw new Error('Inline images need manual review'); ops.push({op:t,args});args=[]; }
  }
  if(args.length)throw new Error('Incomplete PDF operation');
  return ops;
}

function bytesText(bytes) {let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return s;}
function textBytes(s) {return Uint8Array.from(s,c=>c.charCodeAt(0));}
const styleOps=new Set(['w','J','j','M','d','ri','i','gs','CS','cs','SC','SCN','sc','scn','G','g','RG','rg','K','k']);
const textOps=new Set(['Tf','Tc','Tw','Tz','TL','Tr','Ts']);
const paintOps=new Set(['S','s','f','F','f*','B','B*','b','b*']);
const marks=new Set(['BMC','BDC','EMC','MP','DP']);

function serialize(r) {
  const lines=['q'];
  // Each clipping path is emitted in its own original coordinate system.
  let cursor=IDENTITY;
  for(const c of r.clips) {
    lines.push(cm(matrix(inverse(cursor),c.matrix)),c.path,c.rule+' n');
    cursor=c.matrix;
  }
  lines.push(cm(matrix(inverse(cursor),r.matrix)),...Object.values(r.style));
  if(r.kind==='text')lines.push('BT',...Object.values(r.textStyle),r.body,'ET');
  else lines.push(r.body);
  lines.push('Q');return lines.join('\n');
}

function streamText(lib,doc,ref) {const s=doc.context.lookup(ref);return bytesText(lib.decodePDFRawStream(s).decode());}

export function readRecords(lib, source, page, pageIndex) {
  const name=lib.PDFName.of;
  const refs=page.node.Contents();
  const content=refs ? (refs.asArray?refs.asArray():[refs]).map(r=>streamText(lib,source,r)).join('\n') : '';
  const records=[]; const resources={};let serial=0;
  const pageBox=[0,0,page.getWidth(),page.getHeight()];
  function parse(content,res,initial,depth=0) {
    if(depth>8)throw new Error('PDF form nesting is too deep');
    const prefix=`P${pageIndex}R${serial++}_`;
    const mapped={};
    for(const cat of ['Font','XObject','ExtGState','ColorSpace','Pattern','Shading']) {
      const dict=res.lookupMaybe(name(cat),lib.PDFDict); mapped[cat]={};
      if(dict)for(const [key,ref] of dict.entries()) {
        const old=key.toString(), fresh='/'+prefix+old.slice(1);
        mapped[cat][old]=fresh;(resources[cat] ||= {})[fresh]=ref;
      }
    }
    let state={matrix:[...initial.matrix],clips:[...initial.clips],clipBox:[...initial.clipBox],style:{...initial.style},textStyle:{...initial.textStyle}};
    const stack=[];let path=[],pathPoints=[],clipRule=null, text=null;
    const snap=()=>({matrix:[...state.matrix],clips:[...state.clips],style:{...state.style},textStyle:{...state.textStyle}});
    const add=(kind,body,box,extra={})=>{
      const visible=intersect(box,state.clipBox);
      if(!empty(visible))records.push({kind,body,box:visible,...snap(),...extra});
    };
    for(const raw of operations(content)) {
      const {op}=raw;const args=[...raw.args];
      let cat=op==='Tf'?'Font':op==='Do'?'XObject':op==='gs'?'ExtGState':['CS','cs'].includes(op)?'ColorSpace':['SCN','scn'].includes(op)?'Pattern':op==='sh'?'Shading':null;
      if(cat)for(let i=0;i<args.length;i++)if(mapped[cat][args[i]])args[i]=mapped[cat][args[i]];
      const line=[...args,op].join(' '), nums=args.map(Number);
      if(marks.has(op))continue;
      if(text && op!=='ET') {
        if(op==='Tr'&&nums[0]>=4)throw new Error('Text clipping needs manual review');
        if(textOps.has(op))state.textStyle[op]=line;
        if(op==='Tm')text.anchors.push(point(state.matrix,nums[4],nums[5]));
        text.lines.push(line);continue;
      }
      if(op==='q')stack.push(structuredClone(state));
      else if(op==='Q') {if(!stack.length)throw new Error('Unbalanced PDF graphics state');state=stack.pop();}
      else if(op==='cm') {if(path.length)throw new Error('Transform inside a path needs manual review');state.matrix=matrix(state.matrix,nums);}
      else if(styleOps.has(op)) {
        // Setting a colour in a device colour space replaces prior colour-space state.
        if(['g','rg','k'].includes(op)){delete state.style.cs;delete state.style.sc;delete state.style.scn;for(const x of ['g','rg','k'])delete state.style[x];}
        if(['G','RG','K'].includes(op)){delete state.style.CS;delete state.style.SC;delete state.style.SCN;for(const x of ['G','RG','K'])delete state.style[x];}
        state.style[op]=line;
      } else if(textOps.has(op))state.textStyle[op]=line;
      else if(op==='BT')text={lines:[],anchors:[],snapshot:snap()};
      else if(op==='ET') {
        if(!text)throw new Error('Unbalanced PDF text');
        if(!text.anchors.length)throw new Error('Text without an explicit position needs manual review');
        const anchor=text.anchors[0];
        // Text width is supplied by PDF.js during planning; baseline anchors
        // suffice to associate original BT/ET objects with their source rows.
        add('text',text.lines.join('\n'),[anchor[0],anchor[1],anchor[0],anchor[1]],{...text.snapshot,anchor});text=null;
      } else if(['m','l','c','v','y','re','h'].includes(op)) {
        path.push(line);
        if(op==='re') {const [x,y,w,h]=nums;for(const p of [[x,y],[x+w,y],[x+w,y+h],[x,y+h]])pathPoints.push(point(state.matrix,...p));}
        else for(let i=0;i+1<nums.length;i+=2)pathPoints.push(point(state.matrix,nums[i],nums[i+1]));
      } else if(op==='W'||op==='W*')clipRule=op;
      else if(paintOps.has(op)||op==='n') {
        if(paintOps.has(op)&&pathPoints.length)add('path',[...path,op].join('\n'),bounds(pathPoints));
        if(clipRule) {if(!pathPoints.length)throw new Error('Empty clipping path');state.clips.push({matrix:[...state.matrix],path:path.join('\n'),rule:clipRule});state.clipBox=intersect(state.clipBox,bounds(pathPoints));}
        path=[];pathPoints=[];clipRule=null;
      } else if(op==='Do') {
        const ref=resources.XObject?.[args[0]], obj=source.context.lookup(ref);
        if(!obj?.dict)throw new Error('Missing PDF XObject');
        const subtype=obj.dict.get(name('Subtype'))?.toString();
        if(subtype==='/Image')add('image',line,bounds([[0,0],[1,0],[1,1],[0,1]].map(p=>point(state.matrix,...p))),{resource:args[0]});
        else if(subtype==='/Form') {
          
          const m=obj.dict.lookupMaybe(name('Matrix'),lib.PDFArray)?.asArray().map(n=>n.asNumber())||IDENTITY;
          const b=obj.dict.lookup(name('BBox'),lib.PDFArray).asArray().map(n=>n.asNumber());
          const formMatrix=matrix(state.matrix,m), formPath=`${b[0]} ${b[1]} ${b[2]-b[0]} ${b[3]-b[1]} re`;
          const formBox=bounds([[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]].map(p=>point(formMatrix,...p)));
          if(obj.dict.has(name('Group')))add('form',line,formBox,{resource:args[0]});
          else parse(bytesText(lib.decodePDFRawStream(obj).decode()),obj.dict.lookupMaybe(name('Resources'),lib.PDFDict)||res,{...state,matrix:formMatrix,clips:[...state.clips,{matrix:formMatrix,path:formPath,rule:'W'}],clipBox:intersect(state.clipBox,formBox)},depth+1);
        } else throw new Error('Unsupported PDF XObject');
      } else if(op==='sh')add('shading',line,state.clipBox);
      else if(!['BX','EX'].includes(op))throw new Error(`Unsupported PDF operator: ${op}`);
    }
    if(stack.length||text||path.length)throw new Error('Incomplete PDF graphics state');
  }
  parse(content,page.node.Resources(),{matrix:IDENTITY,clips:[],clipBox:pageBox,style:{},textStyle:{}});
  return {records,resources,width:page.getWidth(),height:page.getHeight()};
}

export function writeRecords(lib, output, source, model, records, copier) {
  const page=output.addPage([model.width,model.height]);
  const used={}; const all=records.map(r=>serialize(r)).join('\n');
  const referenced=new Set(tokenize(all).filter(t=>t.startsWith('/')));
  for(const [cat,entries] of Object.entries(model.resources))for(const [key,ref] of Object.entries(entries)) {
    if(referenced.has(key))(used[cat] ||= {})[key.slice(1)]=copier.copy(ref);
  }
  page.node.set(lib.PDFName.of('Resources'),output.context.obj(used));
  page.node.set(lib.PDFName.of('Contents'),output.context.obj([output.context.register(output.context.flateStream(textBytes(all)))]));
  return page;
}

export function moveRecord(record,dx,dy,scale=1,origin=[0,0]) {
  const m=[scale,0,0,scale,dx+origin[0]*(1-scale),dy+origin[1]*(1-scale)];
  return {...record,matrix:matrix(m,record.matrix),clips:record.clips.map(c=>({...c,matrix:matrix(m,c.matrix)}))};
}

export { norm, serialize };

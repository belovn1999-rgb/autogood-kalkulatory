import {readRecords, writeRecords, moveRecord, norm} from './auto1-engine.mjs?v=20260912-structural';

const BASE_WIDTH=594.96, BASE_HEIGHT=841.92;
const section=/MAIN CAR DETAILS|TEST DRIVE INFORMATION|VEHICLE CONDITION|DAMAGE SUMMARY|CAR EQUIPMENT|CAR SERVICE DETAILS|TECHNICAL INSPECTION|CAR DATA ACCORDING/i;
const logistics=/Delivery to my address|Delivery to closest pickup|Pickup at car location|Delivery or pick up process|Enjoy free parking|Delivery time is shown/i;
const promotion=/Premium Return Right|Stock number|Save cash|Export advantage|watchlist|high demand|Minimum bid|Purchase now|auction fee|VAT rate|^€/i;

export function textRows(textContent) {
  const rows=[];
  for(const item of textContent.items.filter(i=>norm(i.str)).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])) {
    const [x,y]=item.transform.slice(4);let row=rows.find(r=>Math.abs(r.y-y)<.8);
    if(!row){row={y,items:[]};rows.push(row);}row.items.push({x,y,width:item.width,height:item.height||Math.hypot(item.transform[2],item.transform[3]),text:norm(item.str)});
  }
  return rows.flatMap(row=>{
    row.items.sort((a,b)=>a.x-b.x);
    const groups=[];
    for(const item of row.items) {
      let group=groups.at(-1),last=group?.at(-1);
      if(!last||item.x-last.x-last.width>Math.max(24,item.height*2.5)){group=[];groups.push(group);}
      group.push(item);
    }
    return groups.map(items=>({y:items[0].y,items,text:norm(items.map(i=>i.text).join(' ')),x:items[0].x,right:Math.max(...items.map(i=>i.x+i.width)),height:Math.max(...items.map(i=>i.height))}));
  }).sort((a,b)=>b.y-a.y);
}

function nearRow(r,row,x0=row.x-2,x1=row.right+2) {return r.kind==='text'&&Math.abs(r.anchor[1]-row.y)<1.2&&r.anchor[0]>=x0&&r.anchor[0]<=x1;}
function rgb(r) {const line=r.style.rg||r.style.RG||'';return line.split(' ').slice(0,3).map(Number);}
function grey(r) {const c=rgb(r);return c.length===3&&c.every(Number.isFinite)&&Math.max(...c)-Math.min(...c)<.015&&c[0]>.75&&c[0]<.98;}
function rail(r,m) {const [x,y,x1,y1]=r.box,w=x1-x,h=y1-y;return r.kind!=='text'&&x>=m.width*.952&&w<m.width*.045&&h>m.height*.04;}
function frame(r,m) {
  if(r.kind!=='path'||!grey(r))return false;
  const [x,y,x1,y1]=r.box,w=x1-x,h=y1-y;
  return (w<1.6&&h>30&&(x<m.width*.06||x>m.width*.945))||(h<1.6&&w>m.width*.85);
}
function realImage(r,m) {return r.kind==='image'&&!rail(r,m)&&r.box[2]-r.box[0]>20&&r.box[3]-r.box[1]>18;}
function mediaRecords(m,rows,cover=false) {
  const timerRows=rows.filter(r=>/\b\d+:\d+\s*\/\s*\d+:\d+\b/.test(r.text));
  return m.records.filter(r=>realImage(r,m)&&(!cover||r.box[3]<m.height-65*m.height/BASE_HEIGHT)&&!timerRows.some(t=>t.x>=r.box[0]-4&&t.x<=r.box[2]+4&&t.y>=r.box[1]-4&&t.y<=r.box[3]+4));
}
function mergeResources(a,b) {for(const [cat,dict] of Object.entries(b))Object.assign(a[cat] ||= {},dict);}

function makeCover(models,data,titleHint) {
  const m=models[0],sx=m.width/BASE_WIDTH,sy=m.height/BASE_HEIGHT;
  const rows=data[0].rows;
  const build=rows.find(r=>/^Build year\s*:/i.test(r.text));
  if(!build)throw new Error('Nie rozpoznano pól pierwszej strony. Potrzebna jest kontrola pliku.');
  const rightX=build.x-3;
  let locationPage=-1,locationRows=[];
  for(let i=0;i<Math.min(data.length,3);i++) {
    const ri=data[i].rows.findIndex(r=>/^Car location\b/i.test(r.text));
    if(ri>=0) {
      locationPage=i;const label=data[i].rows[ri];
      locationRows=data[i].rows.filter(r=>r.y<=label.y+.8&&r.y>=label.y-40*sy&&r.x>=rightX-10&&!/\d+:\d+/.test(r.text));break;
    }
  }
  if(locationPage<0||locationRows.length<2)throw new Error('Nie znaleziono pełnej lokalizacji auta. Potrzebna jest kontrola pliku.');
  const titleCandidates=rows.filter(r=>r.y>build.y&&r.x>=rightX&&!promotion.test(r.text)&&!/^Build year/i.test(r.text));
  const titleRow=titleCandidates.find(r=>norm(r.text)===norm(titleHint))||titleCandidates.filter(r=>r.height>=12*sy).sort((a,b)=>b.height-a.height)[0];
  if(!titleRow)throw new Error('Nie rozpoznano nazwy samochodu. Potrzebna jest kontrola pliku.');
  const titleRows=titleCandidates.filter(r=>Math.abs(r.height-titleRow.height)<.5&&Math.abs(r.y-titleRow.y)<titleRow.height*2.5);
  const fields=[];
  let previousBottom=null;
  for(let pageIndex=0;pageIndex<=locationPage;pageIndex++) {
    const fieldRows=data[pageIndex].rows.filter(r=>r.x>=rightX&&(pageIndex!==0||r.y<=build.y+.8)&&(pageIndex!==locationPage||r.y>locationRows[0].y+1));
    if(fieldRows.some(r=>promotion.test(r.text)||section.test(r.text)))throw new Error('Niejednoznaczny blok danych auta. Potrzebna jest kontrola pliku.');
    if(!fieldRows.length)continue;
    const pageTop=Math.max(...fieldRows.map(r=>r.y));
    const offset=previousBottom===null?0:previousBottom-22*sy-pageTop;
    for(const row of fieldRows)fields.push({row,pageIndex,offset});
    previousBottom=Math.min(...fieldRows.map(r=>r.y))+offset;
    mergeResources(m.resources,models[pageIndex].resources);
  }
  const records=mediaRecords(m,rows,true);
  if(!records.length)throw new Error('Nie rozpoznano oryginalnych zdjęć pierwszej strony.');
  const titleLeft=Math.min(...titleRows.map(r=>r.x)),titleRight=Math.max(...titleRows.map(r=>r.right));
  const titleTop=Math.max(...titleRows.map(r=>r.y));
  const titleScale=Math.min(1, (285*sx)/(titleRight-titleLeft));
  if(titleScale<.7)throw new Error('Nazwa samochodu nie mieści się w nagłówku.');
  const titleX=440*sx-(titleRight-titleLeft)*titleScale/2;
  for(const r of m.records)if(titleRows.some(row=>nearRow(r,row)))records.push(moveRecord(r,titleX-titleLeft,m.height-87.25*sy-titleTop,titleScale,[titleLeft,titleTop]));
  const titleBottom=m.height-87.25*sy-(titleTop-Math.min(...titleRows.map(r=>r.y)))*titleScale;
  const buildTarget=Math.min(m.height-144*sy,titleBottom-45*sy);
  const fieldBottom=Math.min(...fields.map(f=>f.row.y+f.offset));
  const scale=Math.min(1,(buildTarget-(m.height-680*sy))/Math.max(1,build.y-fieldBottom));
  if(scale<.85)throw new Error('Parametry nie mieszczą się czytelnie na pierwszej stronie.');
  for(let pageIndex=0;pageIndex<=locationPage;pageIndex++) {
    const matches=fields.filter(f=>f.pageIndex===pageIndex);
    for(const r of models[pageIndex].records) {
      const match=matches.find(f=>nearRow(r,f.row));
      if(match)records.push(moveRecord(r,0,buildTarget-build.y+match.offset*scale,scale,[build.x,build.y]));
    }
  }
  const locationY=Math.min(m.height-722.5*sy,buildTarget-(build.y-fieldBottom)*scale-54*sy);
  if(locationY<65*sy)throw new Error('Lokalizacja nie mieści się na pierwszej stronie.');
  mergeResources(m.resources,models[locationPage].resources);
  for(const r of models[locationPage].records)if(locationRows.some(row=>nearRow(r,row)))records.push(moveRecord(r,build.x-locationRows[0].x,locationY-locationRows[0].y));
  return {records,orange:m.height-63*sy,blue:titleBottom-20*sy,requiredRows:[...titleRows,...fields.map(f=>f.row),...locationRows].flatMap(r=>r.items.map(i=>i.text))};
}

export async function buildAuto1Pdf(lib,source,pageData,onProgress=()=>{}) {
  const data=pageData.map(p=>({...p,rows:textRows(p.textContent)}));
  const models=[];
  for(const [i,p] of source.getPages().entries()) {
    const crop=p.getCropBox(),media=p.getMediaBox();
    if(p.getRotation().angle%360||crop.x!==0||crop.y!==0||crop.width!==media.width||crop.height!==media.height)throw new Error(`Strona ${i+1}: nietypowy obrót lub obszar strony wymaga kontroli.`);
    try {models.push(readRecords(lib,source,p,i));}catch(error){throw new Error(`Strona ${i+1}: ${error.message}`);}
  }
  const output=await lib.PDFDocument.create(), copier=lib.PDFObjectCopier.for(source.context,output.context);
  const report={pages:[],removedPages:0,removedObjects:0,requiredRows:[]};
  const cover=makeCover(models,data,source.getTitle());
  const firstSection=data.findIndex((p,i)=>i>0&&section.test(p.text));
  if(firstSection<0)throw new Error('Nie rozpoznano sekcji raportu AUTO1.');
  for(let i=0;i<models.length;i++) {
    const m=models[i],d=data[i],text=norm(d.text);let reason='',records,requiredRows=[];
    const images=mediaRecords(m,d.rows);
    const legal=/^Copyright\s+©?\s*\d{4}\s+Auto1\.com\s+Privacy\s+Terms and Conditions\s+Imprint$/i.test(text);
    const logisticsTail=i>0&&logistics.test(data[i-1].text)&&/^location\. Thereafter, a fee of €[\d.,]+ per day applies\.$/i.test(text);
    const italyNote=/^OTHER NOTES\s+Some content has been automatically translated\. Show original\s+"Italian traders:.*VAT margin scheme\..*registration failure in Italy\."$/i.test(text);
    if(legal||logisticsTail||italyNote) {
      reason=legal?'legal-only':italyNote?'italian-trader-notice':'logistics-only';records=[];
    } else if(i===0) {records=cover.records;reason='cover';requiredRows=cover.requiredRows;}
    else if(i<firstSection&&images.length) {
      records=images;reason='gallery';
      // Only discard the recognised logistics column and text moved to the
      // cover. An unfamiliar caption must never disappear with gallery UI.
      const delivery=d.rows.filter(row=>logistics.test(row.text));
      const deliveryLeft=delivery.length?Math.min(...delivery.map(row=>row.x))-3:Infinity;
      const remaining=d.rows.filter(row=>row.x<deliveryLeft&&!/^\d+:\d+\s*\/\s*\d+:\d+$/.test(row.text)&&!row.items.every(item=>cover.requiredRows.includes(item.text)));
      if(remaining.length)throw new Error(`Strona ${i+1}: nierozpoznany tekst przy zdjęciach wymaga kontroli.`);
    }
    else if(i<firstSection)throw new Error(`Strona ${i+1}: nie rozpoznano bezpiecznej reguły usunięcia strony.`);
    else {
      const counters=d.rows.filter(r=>/^Total Pictures\b|^No images were taken\./i.test(r.text));
      const notices=/CAR DATA ACCORDING TO IDENTIFICATION NUMBER/i.test(text)?d.rows.filter(r=>/^Some content has been automatically translated\.?$/i.test(r.text)):[];
      const photo=m.records.find(r=>realImage(r,m)&&r.box[2]-r.box[0]>m.width*.5);
      const damagePage=/\bDamages\b/.test(text)&&photo;
      const tracks=damagePage?m.records.filter(r=>r.kind==='path'&&r.style.cs==='/Pattern cs'&&r.box[2]-r.box[0]>m.width*.3&&r.box[3]-r.box[1]>5&&r.box[3]-r.box[1]<20&&r.box[3]<photo.box[1]):[];
      records=m.records.filter(r=>{
        if(rail(r,m)||frame(r,m)||[...counters,...notices].some(row=>nearRow(r,row)))return false;
        if(damagePage&&r.kind==='path'&&r.box[3]<photo.box[1]) {
          const [x,y,x1,y1]=r.box,c=rgb(r),w=x1-x,h=y1-y;
          const selection=c.length===3&&Math.abs(c[0]-.2078)<.005&&Math.abs(c[1]-.549)<.005&&Math.abs(c[2]-.7961)<.005;
          if(selection&&((h<1.6&&w>20)||(w<1.6&&h>15)))return false;
          if(tracks.some(t=>x>=t.box[0]-1&&x1<=t.box[2]+1&&y>=t.box[1]-1&&y1<=t.box[3]+1))return false;
          if(tracks.length&&grey(r)&&/\bS$/.test(r.body)&&w>m.width*.5&&h>25)return false;
        }
        // Remove the counter's camera glyph, not the image below it.
        if(counters.length&&photo&&r.kind==='path'&&r.box[2]-r.box[0]<20&&r.box[3]-r.box[1]<20&&r.box[1]>photo.box[3]-22&&r.box[0]<photo.box[0]+30)return false;
        return true;
      });
      reason='content';
      requiredRows=d.rows.filter(row=>![...counters,...notices].includes(row)).flatMap(r=>r.items.map(i=>i.text));
    }
    if(!records.length)report.removedPages++;
    else {
      const page=writeRecords(lib,output,source,m,records,copier);
      if(i===0) {
        const sx=m.width/BASE_WIDTH;
        page.drawLine({start:{x:15*sx,y:cover.orange},end:{x:584*sx,y:cover.orange},thickness:.75,color:lib.rgb(1,.4,.1)});
        page.drawLine({start:{x:262*sx,y:cover.blue},end:{x:536*sx,y:cover.blue},thickness:1,color:lib.rgb(.62,.75,.89)});
      }
    }
    report.requiredRows.push(...requiredRows);
    report.removedObjects+=Math.max(0,m.records.length-records.length);
    report.pages.push({sourcePage:i+1,outputPage:records.length?output.getPageCount():null,reason,requiredRows,sourceImages:m.records.filter(r=>realImage(r,m)).length,outputImages:records.filter(r=>realImage(r,m)).length});
    onProgress(i+1,models.length);
  }
  return {pdfDoc:output,report};
}

// A result is not marked ready until a second reader confirms that required
// text survived and recognisable commercial blocks did not survive.
export function validateOutputText(pages,report) {
  const compact=s=>norm(s).replace(/\s/g,'').toLowerCase();
  if(!Array.isArray(pages)||pages.length!==report.pages.filter(p=>p.outputPage!==null).length)throw new Error('Kontrola PDF: niezgodna liczba stron.');
  for(const page of report.pages.filter(p=>p.outputPage!==null)) {
    const output=compact(pages[page.outputPage-1]);
    const expected=new Map();
    for(const row of page.requiredRows) {
      const key=compact(row);if(key)expected.set(key,(expected.get(key)||0)+1);
    }
    for(const [key,count] of expected)if(output.split(key).length-1<count)throw new Error(`Kontrola PDF: nie zachowano wszystkich danych na stronie ${page.outputPage}.`);
  }
  if(/Premium Return Right|Stock number|watchlist|Save cash|Export advantage|Delivery to my address|Delivery to closest pickup|Pickup at car location|Total Pictures|\b\d+:\d+\s*\/\s*\d+:\d+\b/i.test(pages.join('\n')))throw new Error('Kontrola PDF: pozostały elementy aukcyjne. Plik wymaga sprawdzenia.');
}

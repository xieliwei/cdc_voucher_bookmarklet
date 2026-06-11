var CdcVoucherCollector=(()=>{var V=Object.defineProperty;var at=Object.getOwnPropertyDescriptor;var st=Object.getOwnPropertyNames;var ct=Object.prototype.hasOwnProperty;var lt=(o,i)=>{for(var a in i)V(o,a,{get:i[a],enumerable:!0})},ut=(o,i,a,s)=>{if(i&&typeof i=="object"||typeof i=="function")for(let c of st(i))!ct.call(o,c)&&c!==a&&V(o,c,{get:()=>i[c],enumerable:!(s=at(i,c))||s.enumerable});return o};var dt=o=>ut(V({},"__esModule",{value:!0}),o);var It={};lt(It,{buildPrintHtml:()=>D,collectAndRemember:()=>it,collectVouchers:()=>v,detectPage:()=>I,openPrintPreview:()=>C,print:()=>nt,run:()=>ot,verifyAgainstShowView:()=>L});var G="https://api-cdc.redeem.gov.sg/v1/public",B="voucher.redeem.gov.sg",R=Object.freeze({HEARTLAND:"heartland",SUPERMARKET:"supermarket"}),U=Object.freeze({UNUSED:"unused",REDEEMED:"redeemed",VOIDED:"voided"});function F(){return`rsg-voucher-${typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,i=>{let a=Math.random()*16|0;return(i==="x"?a:a&3|8).toString(16)})}`}async function j(o,i={},a=F()){let s=`${G}${o}`,c=new Headers(i.headers||{});c.set("Accept","application/json"),c.set("X-Redeem-Session-Id",a),i.body&&!c.has("Content-Type")&&c.set("Content-Type","application/json");let d=await fetch(s,{...i,headers:c});if(!d.ok){let p=await d.text().catch(()=>"");throw new Error(`RedeemSG API ${d.status} ${d.statusText} for ${o}${p?`: ${p.slice(0,200)}`:""}`)}return d.json()}async function q(o,i){let a=await j(`/vouchers/groups/${encodeURIComponent(o)}`,{method:"GET"},i);if(a?.object!=="grouped_vouchers")throw new Error(`Unexpected API response object: ${a?.object??"missing"}`);return a}async function Y(o,i,a){let s=await j("/vouchers/groups/alias",{method:"POST",body:JSON.stringify({group_id:o,voucher_ids:[i]})},a);if(!s?.alias)throw new Error("Alias API did not return an alias");return s.alias}var ht=new Set(["404","expired-nea-cfhp-vouchers"]),pt=20;function ft(o){return typeof o=="string"&&o.length>=pt&&/^[A-Za-z0-9_-]+$/.test(o)}function K(o,i){if(!i)return!1;let a=o.pathname.replace(/\/+$/,"")||"/";return a===`/${i}`||a.startsWith(`/${i}/`)}function S(o=window.location){if(o.hostname!==B)return null;let i=o.pathname.replace(/^\/+|\/+$/g,"").split("/")[0];return!i||ht.has(i)?null:ft(i)?i:null}function mt(){let o=document.getElementById("root"),i=!!o&&o.childElementCount>0;return{reactRoot:!!o,reactRootPopulated:i,selectVoucherTypePage:!!document.getElementById("select-voucher-type-page"),selectVoucherTypeContainer:!!document.getElementById("select-voucher-type-container"),voucherGroupPage:!!document.getElementById("voucher-group-page"),qrShowView:!!document.getElementById("qrcode-reference-container"),qrCanvas:!!document.getElementById("qr-code"),redemptionCard:!!document.querySelector(".redemption-card"),voucherTile:!!document.querySelector("[id^='rsg-voucher-']"),redeemButton:!!document.getElementById("redeem-button")}}function gt(){let o=document.title||"",i=document.querySelector('meta[name="description"]')?.content||"",a=document.querySelector('meta[property="og:image"]')?.content||"";return{redeemSgTitle:/RedeemSG/i.test(o),cdcTitle:/CDC\s+Vouchers?/i.test(o),voucherTitle:/vouchers?/i.test(o),redeemSgMetaDescription:/redeemsg|trusted voucher/i.test(i),redeemSgOgImage:/voucher\.redeem\.gov\.sg|redeem\.gov\.sg/i.test(a)}}function I(o=window.location){let i=S(o),a=gt(),s=mt(),c=o.hostname===B,d=i!==null,p=K(o,i),t=a.redeemSgTitle||a.redeemSgMetaDescription||a.redeemSgOgImage,e=a.cdcTitle||a.voucherTitle,r=s.selectVoucherTypePage||s.selectVoucherTypeContainer||s.voucherGroupPage||s.qrShowView||s.qrCanvas||s.redemptionCard||s.voucherTile||s.redeemButton,n=c&&d&&p;return{isRedeemSgVoucherPage:n&&(s.reactRoot||t)&&(t||r||e||s.reactRootPopulated),canCollect:n,groupId:i,signals:{hostname:c,groupIdInPath:d,pathMatchesGroup:p,canCollect:n,...a,...s,hasBranding:t,hasCdcContext:e,hasWalletUi:r}}}var At={[R.HEARTLAND]:"{{prefix}} Vouchers",[R.SUPERMARKET]:"{{prefix}} Supermarket Vouchers"};function X(o){let i=o?.features?.category_prefix;return i||((o?.name||"").match(/^CDC\b/i)?"CDC":(o?.category||"Voucher").toUpperCase())}function Z(o,i){return(At[o]||"{{prefix}} {{type}} Vouchers").replace("{{prefix}}",i).replace("{{type}}",o)}function W({voucherId:o,extraQrPrefix:i,alias:a}){return`${i?`rsg-${i}`:"rsg"}:${a??o}`}async function v(o={}){let{groupId:i,requirePageDetection:a=!0,onProgress:s}=o,c=I(),d=i??c.groupId??S();if(!d)throw new Error("No voucher group id found. Open your RedeemSG voucher link first.");if(a)if(c.canCollect)c.isRedeemSgVoucherPage||s?.({phase:"warn",message:"Page detection signals are weak; continuing because URL looks like a voucher wallet.",signals:c.signals});else throw new Error("Not on a RedeemSG voucher link (need voucher.redeem.gov.sg with group id in URL). "+JSON.stringify(c.signals));let p=F();s?.({phase:"fetching",groupId:d});let t=await q(d,p),e=t.campaign??{},r=t.data??{},n=Array.isArray(r.vouchers)?r.vouchers:[],l=X(e),h=e.extra_qr_prefix??null,u=!!e.is_voucher_alias_enabled,g=n.filter(f=>f.state===U.UNUSED);s?.({phase:"building-qr",unusedCount:g.length,aliasRequired:u});let m=[];for(let f=0;f<g.length;f++){let A=g[f],y=null;u&&(y=await Y(d,A.id,p));let T=W({voucherId:A.id,extraQrPrefix:h,alias:y});m.push({id:A.id,type:A.type,typeLabel:Z(A.type,l),amount:A.voucher_value,state:A.state,qrPayload:T}),((f+1)%10===0||f===g.length-1)&&s?.({phase:"building-qr",done:f+1,total:g.length})}let E=m.reduce((f,A)=>(f[A.type]=f[A.type]||{count:0,totalAmount:0},f[A.type].count+=1,f[A.type].totalAmount+=A.amount,f),{}),b=m.reduce((f,A)=>{let y=String(A.amount);return f[y]=(f[y]||0)+1,f},{});return{ok:!0,groupId:d,page:c,campaign:{id:e.id,name:e.name,category:e.category,validity:e.validity,validityEnd:e.validity_end,categoryPrefix:l,isVoucherAliasEnabled:u,extraQrPrefix:h},group:{id:r.id,virtualAddress:r.virtual_address},vouchers:m,summary:{total:n.length,unused:m.length,redeemed:n.filter(f=>f.state===U.REDEEMED).length,voided:n.filter(f=>f.state===U.VOIDED).length,byType:E,byAmount:b}}}var Q={heartland:{src:"data:image/jpeg;base64,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",width:140,height:74},supermarket:{src:"data:image/jpeg;base64,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",width:140,height:76}};var yt=Object.freeze({2:"#BC92AB",5:"#6D8C4B",10:"#FF7269",20:"#B38300",50:"#232D51",100:"#BD6348"});function J(o){return yt[o]??"#111111"}function $(o,i){if(o!=null&&o!==""){let a=bt(o);if(a)return Et(a)}return i&&String(i).trim()?String(i).trim():null}function bt(o){if(typeof o=="number"){let s=o<1e12?o*1e3:o,c=new Date(s);return Number.isNaN(c.getTime())?null:c}let i=String(o).trim();if(!i)return null;if(/^\d+$/.test(i)){let s=Number(i),c=s<1e12?s*1e3:s,d=new Date(c);return Number.isNaN(d.getTime())?null:d}let a=new Date(i);return Number.isNaN(a.getTime())?null:a}function Et(o){return o.toLocaleDateString("en-SG",{day:"numeric",month:"short",year:"numeric",timeZone:"Asia/Singapore"})}function O(o,i="Valid until"){return o?`${i} ${o}`:""}var _=[R.HEARTLAND,R.SUPERMARKET],M=10,w=2,H=5;function tt(o){let i=new Map;for(let s of o){let c=`${s.type}:${s.amount}`;i.has(c)||i.set(c,[]),i.get(c).push(s)}return[...i.keys()].sort((s,c)=>{let[d,p]=s.split(":"),[t,e]=c.split(":"),r=_.indexOf(d),n=_.indexOf(t),l=r===-1?99:r,h=n===-1?99:n;return l!==h?l-h:Number(p)-Number(e)}).map(s=>{let[c,d]=s.split(":"),p=i.get(s)??[],t=[];for(let e=0;e<p.length;e+=M)t.push(p.slice(e,e+M));return{type:c,amount:Number(d),typeLabel:p[0]?.typeLabel??c,pages:t}})}var x;(d=>{class o{constructor(t,e,r,n){this.version=t;this.errorCorrectionLevel=e;if(t<o.MIN_VERSION||t>o.MAX_VERSION)throw new RangeError("Version value out of range");if(n<-1||n>7)throw new RangeError("Mask value out of range");this.size=t*4+17;let l=[];for(let u=0;u<this.size;u++)l.push(!1);for(let u=0;u<this.size;u++)this.modules.push(l.slice()),this.isFunction.push(l.slice());this.drawFunctionPatterns();let h=this.addEccAndInterleave(r);if(this.drawCodewords(h),n==-1){let u=1e9;for(let g=0;g<8;g++){this.applyMask(g),this.drawFormatBits(g);let m=this.getPenaltyScore();m<u&&(n=g,u=m),this.applyMask(g)}}s(0<=n&&n<=7),this.mask=n,this.applyMask(n),this.drawFormatBits(n),this.isFunction=[]}static encodeText(t,e){let r=d.QrSegment.makeSegments(t);return o.encodeSegments(r,e)}static encodeBinary(t,e){let r=d.QrSegment.makeBytes(t);return o.encodeSegments([r],e)}static encodeSegments(t,e,r=1,n=40,l=-1,h=!0){if(!(o.MIN_VERSION<=r&&r<=n&&n<=o.MAX_VERSION)||l<-1||l>7)throw new RangeError("Invalid value");let u,g;for(u=r;;u++){let f=o.getNumDataCodewords(u,e)*8,A=c.getTotalBits(t,u);if(A<=f){g=A;break}if(u>=n)throw new RangeError("Data too long")}for(let f of[o.Ecc.MEDIUM,o.Ecc.QUARTILE,o.Ecc.HIGH])h&&g<=o.getNumDataCodewords(u,f)*8&&(e=f);let m=[];for(let f of t){i(f.mode.modeBits,4,m),i(f.numChars,f.mode.numCharCountBits(u),m);for(let A of f.getData())m.push(A)}s(m.length==g);let E=o.getNumDataCodewords(u,e)*8;s(m.length<=E),i(0,Math.min(4,E-m.length),m),i(0,(8-m.length%8)%8,m),s(m.length%8==0);for(let f=236;m.length<E;f^=253)i(f,8,m);let b=[];for(;b.length*8<m.length;)b.push(0);return m.forEach((f,A)=>b[A>>>3]|=f<<7-(A&7)),new o(u,e,b,l)}size;mask;modules=[];isFunction=[];getModule(t,e){return 0<=t&&t<this.size&&0<=e&&e<this.size&&this.modules[e][t]}drawFunctionPatterns(){for(let r=0;r<this.size;r++)this.setFunctionModule(6,r,r%2==0),this.setFunctionModule(r,6,r%2==0);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);let t=this.getAlignmentPatternPositions(),e=t.length;for(let r=0;r<e;r++)for(let n=0;n<e;n++)r==0&&n==0||r==0&&n==e-1||r==e-1&&n==0||this.drawAlignmentPattern(t[r],t[n]);this.drawFormatBits(0),this.drawVersion()}drawFormatBits(t){let e=this.errorCorrectionLevel.formatBits<<3|t,r=e;for(let l=0;l<10;l++)r=r<<1^(r>>>9)*1335;let n=(e<<10|r)^21522;s(n>>>15==0);for(let l=0;l<=5;l++)this.setFunctionModule(8,l,a(n,l));this.setFunctionModule(8,7,a(n,6)),this.setFunctionModule(8,8,a(n,7)),this.setFunctionModule(7,8,a(n,8));for(let l=9;l<15;l++)this.setFunctionModule(14-l,8,a(n,l));for(let l=0;l<8;l++)this.setFunctionModule(this.size-1-l,8,a(n,l));for(let l=8;l<15;l++)this.setFunctionModule(8,this.size-15+l,a(n,l));this.setFunctionModule(8,this.size-8,!0)}drawVersion(){if(this.version<7)return;let t=this.version;for(let r=0;r<12;r++)t=t<<1^(t>>>11)*7973;let e=this.version<<12|t;s(e>>>18==0);for(let r=0;r<18;r++){let n=a(e,r),l=this.size-11+r%3,h=Math.floor(r/3);this.setFunctionModule(l,h,n),this.setFunctionModule(h,l,n)}}drawFinderPattern(t,e){for(let r=-4;r<=4;r++)for(let n=-4;n<=4;n++){let l=Math.max(Math.abs(n),Math.abs(r)),h=t+n,u=e+r;0<=h&&h<this.size&&0<=u&&u<this.size&&this.setFunctionModule(h,u,l!=2&&l!=4)}}drawAlignmentPattern(t,e){for(let r=-2;r<=2;r++)for(let n=-2;n<=2;n++)this.setFunctionModule(t+n,e+r,Math.max(Math.abs(n),Math.abs(r))!=1)}setFunctionModule(t,e,r){this.modules[e][t]=r,this.isFunction[e][t]=!0}addEccAndInterleave(t){let e=this.version,r=this.errorCorrectionLevel;if(t.length!=o.getNumDataCodewords(e,r))throw new RangeError("Invalid argument");let n=o.NUM_ERROR_CORRECTION_BLOCKS[r.ordinal][e],l=o.ECC_CODEWORDS_PER_BLOCK[r.ordinal][e],h=Math.floor(o.getNumRawDataModules(e)/8),u=n-h%n,g=Math.floor(h/n),m=[],E=o.reedSolomonComputeDivisor(l);for(let f=0,A=0;f<n;f++){let y=t.slice(A,A+g-l+(f<u?0:1));A+=y.length;let T=o.reedSolomonComputeRemainder(y,E);f<u&&y.push(0),m.push(y.concat(T))}let b=[];for(let f=0;f<m[0].length;f++)m.forEach((A,y)=>{(f!=g-l||y>=u)&&b.push(A[f])});return s(b.length==h),b}drawCodewords(t){if(t.length!=Math.floor(o.getNumRawDataModules(this.version)/8))throw new RangeError("Invalid argument");let e=0;for(let r=this.size-1;r>=1;r-=2){r==6&&(r=5);for(let n=0;n<this.size;n++)for(let l=0;l<2;l++){let h=r-l,g=(r+1&2)==0?this.size-1-n:n;!this.isFunction[g][h]&&e<t.length*8&&(this.modules[g][h]=a(t[e>>>3],7-(e&7)),e++)}}s(e==t.length*8)}applyMask(t){if(t<0||t>7)throw new RangeError("Mask value out of range");for(let e=0;e<this.size;e++)for(let r=0;r<this.size;r++){let n;switch(t){case 0:n=(r+e)%2==0;break;case 1:n=e%2==0;break;case 2:n=r%3==0;break;case 3:n=(r+e)%3==0;break;case 4:n=(Math.floor(r/3)+Math.floor(e/2))%2==0;break;case 5:n=r*e%2+r*e%3==0;break;case 6:n=(r*e%2+r*e%3)%2==0;break;case 7:n=((r+e)%2+r*e%3)%2==0;break;default:throw new Error("Unreachable")}!this.isFunction[e][r]&&n&&(this.modules[e][r]=!this.modules[e][r])}}getPenaltyScore(){let t=0;for(let l=0;l<this.size;l++){let h=!1,u=0,g=[0,0,0,0,0,0,0];for(let m=0;m<this.size;m++)this.modules[l][m]==h?(u++,u==5?t+=o.PENALTY_N1:u>5&&t++):(this.finderPenaltyAddHistory(u,g),h||(t+=this.finderPenaltyCountPatterns(g)*o.PENALTY_N3),h=this.modules[l][m],u=1);t+=this.finderPenaltyTerminateAndCount(h,u,g)*o.PENALTY_N3}for(let l=0;l<this.size;l++){let h=!1,u=0,g=[0,0,0,0,0,0,0];for(let m=0;m<this.size;m++)this.modules[m][l]==h?(u++,u==5?t+=o.PENALTY_N1:u>5&&t++):(this.finderPenaltyAddHistory(u,g),h||(t+=this.finderPenaltyCountPatterns(g)*o.PENALTY_N3),h=this.modules[m][l],u=1);t+=this.finderPenaltyTerminateAndCount(h,u,g)*o.PENALTY_N3}for(let l=0;l<this.size-1;l++)for(let h=0;h<this.size-1;h++){let u=this.modules[l][h];u==this.modules[l][h+1]&&u==this.modules[l+1][h]&&u==this.modules[l+1][h+1]&&(t+=o.PENALTY_N2)}let e=0;for(let l of this.modules)e=l.reduce((h,u)=>h+(u?1:0),e);let r=this.size*this.size,n=Math.ceil(Math.abs(e*20-r*10)/r)-1;return s(0<=n&&n<=9),t+=n*o.PENALTY_N4,s(0<=t&&t<=2568888),t}getAlignmentPatternPositions(){if(this.version==1)return[];{let t=Math.floor(this.version/7)+2,e=Math.floor((this.version*8+t*3+5)/(t*4-4))*2,r=[6];for(let n=this.size-7;r.length<t;n-=e)r.splice(1,0,n);return r}}static getNumRawDataModules(t){if(t<o.MIN_VERSION||t>o.MAX_VERSION)throw new RangeError("Version number out of range");let e=(16*t+128)*t+64;if(t>=2){let r=Math.floor(t/7)+2;e-=(25*r-10)*r-55,t>=7&&(e-=36)}return s(208<=e&&e<=29648),e}static getNumDataCodewords(t,e){return Math.floor(o.getNumRawDataModules(t)/8)-o.ECC_CODEWORDS_PER_BLOCK[e.ordinal][t]*o.NUM_ERROR_CORRECTION_BLOCKS[e.ordinal][t]}static reedSolomonComputeDivisor(t){if(t<1||t>255)throw new RangeError("Degree out of range");let e=[];for(let n=0;n<t-1;n++)e.push(0);e.push(1);let r=1;for(let n=0;n<t;n++){for(let l=0;l<e.length;l++)e[l]=o.reedSolomonMultiply(e[l],r),l+1<e.length&&(e[l]^=e[l+1]);r=o.reedSolomonMultiply(r,2)}return e}static reedSolomonComputeRemainder(t,e){let r=e.map(n=>0);for(let n of t){let l=n^r.shift();r.push(0),e.forEach((h,u)=>r[u]^=o.reedSolomonMultiply(h,l))}return r}static reedSolomonMultiply(t,e){if(t>>>8||e>>>8)throw new RangeError("Byte out of range");let r=0;for(let n=7;n>=0;n--)r=r<<1^(r>>>7)*285,r^=(e>>>n&1)*t;return s(r>>>8==0),r}finderPenaltyCountPatterns(t){let e=t[1];s(e<=this.size*3);let r=e>0&&t[2]==e&&t[3]==e*3&&t[4]==e&&t[5]==e;return(r&&t[0]>=e*4&&t[6]>=e?1:0)+(r&&t[6]>=e*4&&t[0]>=e?1:0)}finderPenaltyTerminateAndCount(t,e,r){return t&&(this.finderPenaltyAddHistory(e,r),e=0),e+=this.size,this.finderPenaltyAddHistory(e,r),this.finderPenaltyCountPatterns(r)}finderPenaltyAddHistory(t,e){e[0]==0&&(t+=this.size),e.pop(),e.unshift(t)}static MIN_VERSION=1;static MAX_VERSION=40;static PENALTY_N1=3;static PENALTY_N2=3;static PENALTY_N3=40;static PENALTY_N4=10;static ECC_CODEWORDS_PER_BLOCK=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]];static NUM_ERROR_CORRECTION_BLOCKS=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]]}d.QrCode=o;function i(p,t,e){if(t<0||t>31||p>>>t)throw new RangeError("Value out of range");for(let r=t-1;r>=0;r--)e.push(p>>>r&1)}function a(p,t){return(p>>>t&1)!=0}function s(p){if(!p)throw new Error("Assertion error")}class c{constructor(t,e,r){this.mode=t;this.numChars=e;this.bitData=r;if(e<0)throw new RangeError("Invalid argument");this.bitData=r.slice()}static makeBytes(t){let e=[];for(let r of t)i(r,8,e);return new c(c.Mode.BYTE,t.length,e)}static makeNumeric(t){if(!c.isNumeric(t))throw new RangeError("String contains non-numeric characters");let e=[];for(let r=0;r<t.length;){let n=Math.min(t.length-r,3);i(parseInt(t.substring(r,r+n),10),n*3+1,e),r+=n}return new c(c.Mode.NUMERIC,t.length,e)}static makeAlphanumeric(t){if(!c.isAlphanumeric(t))throw new RangeError("String contains unencodable characters in alphanumeric mode");let e=[],r;for(r=0;r+2<=t.length;r+=2){let n=c.ALPHANUMERIC_CHARSET.indexOf(t.charAt(r))*45;n+=c.ALPHANUMERIC_CHARSET.indexOf(t.charAt(r+1)),i(n,11,e)}return r<t.length&&i(c.ALPHANUMERIC_CHARSET.indexOf(t.charAt(r)),6,e),new c(c.Mode.ALPHANUMERIC,t.length,e)}static makeSegments(t){return t==""?[]:c.isNumeric(t)?[c.makeNumeric(t)]:c.isAlphanumeric(t)?[c.makeAlphanumeric(t)]:[c.makeBytes(c.toUtf8ByteArray(t))]}static makeEci(t){let e=[];if(t<0)throw new RangeError("ECI assignment value out of range");if(t<128)i(t,8,e);else if(t<16384)i(2,2,e),i(t,14,e);else if(t<1e6)i(6,3,e),i(t,21,e);else throw new RangeError("ECI assignment value out of range");return new c(c.Mode.ECI,0,e)}static isNumeric(t){return c.NUMERIC_REGEX.test(t)}static isAlphanumeric(t){return c.ALPHANUMERIC_REGEX.test(t)}getData(){return this.bitData.slice()}static getTotalBits(t,e){let r=0;for(let n of t){let l=n.mode.numCharCountBits(e);if(n.numChars>=1<<l)return 1/0;r+=4+l+n.bitData.length}return r}static toUtf8ByteArray(t){t=encodeURI(t);let e=[];for(let r=0;r<t.length;r++)t.charAt(r)!="%"?e.push(t.charCodeAt(r)):(e.push(parseInt(t.substring(r+1,r+3),16)),r+=2);return e}static NUMERIC_REGEX=/^[0-9]*$/;static ALPHANUMERIC_REGEX=/^[A-Z0-9 $%*+.\/:-]*$/;static ALPHANUMERIC_CHARSET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"}d.QrSegment=c})(x||={});(i=>{let o;(s=>{class a{constructor(d,p){this.ordinal=d;this.formatBits=p}static LOW=new a(0,1);static MEDIUM=new a(1,0);static QUARTILE=new a(2,3);static HIGH=new a(3,2)}s.Ecc=a})(o=i.QrCode||={})})(x||={});(i=>{let o;(s=>{class a{constructor(d,p){this.modeBits=d;this.numBitsCharCount=p}static NUMERIC=new a(1,[10,12,14]);static ALPHANUMERIC=new a(2,[9,11,13]);static BYTE=new a(4,[8,16,16]);static KANJI=new a(8,[8,10,12]);static ECI=new a(7,[0,0,0]);numCharCountBits(d){return this.numBitsCharCount[Math.floor((d+7)/17)]}}s.Mode=a})(o=i.QrSegment||={})})(x||={});var z=x.QrCode,_t=x.QrSegment;function vt(o,i=1,a=8){let s=o.size,c=i,d=(s+c*2)*a,p=new Uint8ClampedArray(d*d*4);for(let t=0;t<p.length;t+=4)p[t]=255,p[t+1]=255,p[t+2]=255,p[t+3]=255;for(let t=0;t<s;t++)for(let e=0;e<s;e++)if(o.getModule(e,t))for(let r=0;r<a;r++)for(let n=0;n<a;n++){let l=(e+c)*a+n,u=(((t+c)*a+r)*d+l)*4;p[u]=0,p[u+1]=0,p[u+2]=0,p[u+3]=255}return{width:d,height:d,data:p}}function et(o,{sizePx:i=472,margin:a=1}={}){let s=z.encodeText(o,z.Ecc.HIGH),c=s.size+a*2,d=Math.max(1,Math.floor(i/c)),{width:p,height:t,data:e}=vt(s,a,d),r=document.createElement("canvas");r.width=p,r.height=t;let n=r.getContext("2d");if(!n)throw new Error("Canvas 2D context unavailable");return n.putImageData(new ImageData(e,p,t),0,0),r.toDataURL("image/png")}var wt=`
@page {
  size: A4 portrait;
  margin: 10mm;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
}

.print-doc {
  width: 100%;
}

.voucher-sheet {
  width: 190mm;
  height: 277mm;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  page-break-after: always;
  break-after: page;
}

.voucher-sheet:last-child {
  page-break-after: auto;
  break-after: auto;
}

.sheet-header {
  flex: 0 0 auto;
  text-align: center;
  padding: 0 0 1mm;
}

.sheet-title {
  margin: 0;
  font-size: 10pt;
  font-weight: 700;
  line-height: 1.2;
}

.sheet-expiry {
  margin: 0.5mm 0 0;
  font-size: 8pt;
  color: #333;
}

.sheet-grid {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, 1fr);
  width: 100%;
  min-height: 0;
}

.voucher-slot--empty {
  width: 100%;
  height: 100%;
}

.voucher-cell {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0.2cm;
  overflow: hidden;
  border-style: solid;
  border-color: #111;
  border-width: 0;
}

.voucher-cell.border-top {
  border-top-width: 0.5mm;
}

.voucher-cell.border-right {
  border-right-width: 0.5mm;
}

.voucher-cell.border-bottom {
  border-bottom-width: 0.5mm;
}

.voucher-cell.border-left {
  border-left-width: 0.5mm;
}

.voucher-left {
  display: grid;
  grid-template-rows: 1fr auto;
  align-items: center;
  justify-items: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.voucher-amount-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: size;
}

.voucher-amount {
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  text-align: center;
  font-size: min(36mm, 78cqh, 62cqmin);
}

.voucher-type-image {
  flex: 0 0 auto;
  width: auto;
  height: auto;
  max-height: 14mm;
  object-fit: contain;
  margin-bottom: 0.5mm;
}

.voucher-type-image-fallback {
  flex: 0 0 auto;
  font-size: 7pt;
  text-align: center;
  margin-bottom: 0.5mm;
}

.voucher-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.voucher-right-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
  gap: 0.3mm;
}

.voucher-expiry {
  flex: 0 0 auto;
  text-align: center;
  font-size: 6pt;
  line-height: 1.1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(4cm, 100%);
}

.voucher-qr {
  flex: 0 0 auto;
  width: min(4cm, 100%);
  height: min(4cm, 100%);
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  image-rendering: pixelated;
}

.sheet-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 1mm;
  font-size: 8pt;
  color: #333;
}

.voucher-sheet + .voucher-sheet {
  break-before: right;
  page-break-before: right;
}

.print-instructions {
  max-width: 190mm;
  margin: 0 auto 12mm;
  padding: 4mm 6mm;
  font-size: 10pt;
  line-height: 1.4;
  color: #222;
  background: #fff8e6;
  border: 1px solid #e6c200;
  border-radius: 2mm;
}

@media screen {
  body {
    background: #ececec;
    padding: 12mm 0;
  }

  .voucher-sheet {
    background: #fff;
    box-shadow: 0 2mm 6mm rgba(0, 0, 0, 0.12);
    margin-bottom: 12mm;
  }
}

@media print {
  html, body {
    margin: 0;
    padding: 0;
    width: 190mm;
    background: #fff;
  }

  .print-instructions {
    display: none !important;
  }

  .print-doc {
    width: 190mm;
    margin: 0 auto;
  }

  .voucher-sheet {
    width: 190mm;
    height: 277mm;
    max-height: 277mm;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: none;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .voucher-cell {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;function xt(o){return et(o,{sizePx:472,margin:1})}function Rt(o,i){let a=Math.floor(o/w),s=o%w,c=[],d=a>0&&i[o-w],p=a<H-1&&i[o+w],t=s>0&&i[o-1],e=s<w-1&&i[o+1];return(a===0||!d)&&c.push("border-top"),(s===0||!t)&&c.push("border-left"),(s===w-1||e||!e)&&c.push("border-right"),(a===H-1||p||!p)&&c.push("border-bottom"),c.join(" ")}function Pt(o,i,a){let s=Q[o.type],c=J(o.amount),d=s?`<img class="voucher-type-image" src="${s.src}" width="${s.width}" height="${s.height}" alt="">`:`<div class="voucher-type-image-fallback">${P(o.typeLabel)}</div>`,p=a?`<div class="voucher-expiry">${P(a)}</div>`:"";return`
    <div class="voucher-left">
      <div class="voucher-amount-wrap">
        <div class="voucher-amount" style="color:${c}">$${o.amount}</div>
      </div>
      ${d}
    </div>
    <div class="voucher-right">
      <div class="voucher-right-inner">
        <img class="voucher-qr" src="${i}" alt="">
        ${p}
      </div>
    </div>`}function St(o,i,a,s){let c=Array.from({length:M},(t,e)=>!!i[e]),d=[];for(let t=0;t<M;t++){let e=i[t];if(!e){d.push('<div class="voucher-slot voucher-slot--empty"></div>');continue}let r=Rt(t,c),n=Pt(e,a.get(e.qrPayload),s.expiryCellLabel);d.push(`<div class="voucher-cell ${r}">${n}</div>`)}let p=s.expirySheetLabel?`<p class="sheet-expiry">${P(s.expirySheetLabel)}</p>`:"";return`
    <section class="voucher-sheet" data-type="${P(o.type)}" data-amount="${o.amount}">
      <header class="sheet-header">
        <h1 class="sheet-title">${P(o.typeLabel)} - $${o.amount}</h1>
        ${p}
      </header>
      <div class="sheet-grid">${d.join("")}</div>
      <footer class="sheet-footer">Page ${s.pageNumber} of ${s.totalPages}</footer>
    </section>`}function P(o){return String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function D(o,i){let a=tt(o.vouchers),s=[...new Set(o.vouchers.map(h=>h.qrPayload))];i?.({phase:"rendering-qr",total:s.length});let c=new Map;for(let h=0;h<s.length;h++){let u=s[h];c.set(u,xt(u)),((h+1)%5===0||h===s.length-1)&&i?.({phase:"rendering-qr",done:h+1,total:s.length})}let d=$(o.campaign?.validityEnd,o.campaign?.validity),p=O(d,"Valid until"),t=O(d,"Valid till"),e=a.reduce((h,u)=>h+u.pages.length,0),r=[],n=0;for(let h of a)for(let u of h.pages)n+=1,r.push(St(h,u,c,{expirySheetLabel:p,expiryCellLabel:t,pageNumber:n,totalPages:e}));return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${P(o.campaign?.name??"CDC Vouchers")} - print</title>
  <style>${wt}</style>
</head>
<body>
  <p class="print-instructions"><strong>Print settings:</strong> A4 portrait, scale <strong>100%</strong> (not &ldquo;Fit to page&rdquo;), <strong>single-sided / one-sided</strong>. If duplex is on, blank backs may be inserted so each voucher page prints on its own sheet front.</p>
  <div class="print-doc">${r.join("")}</div>
</body>
</html>`}async function C(o,i={}){if(!o.vouchers?.length)return alert("No unused vouchers to print."),null;let{autoPrint:a=!0,onProgress:s}=i,c=await D(o,s),d=window.open("","_blank");if(!d)throw new Error("Pop-up blocked. Allow pop-ups for voucher.redeem.gov.sg.");return d.document.open(),d.document.write(c),d.document.close(),a&&d.addEventListener("load",()=>{d.focus(),d.print()}),d}async function rt(o){if(typeof BarcodeDetector>"u")return console.warn("BarcodeDetector unavailable. Use Chrome/Edge or scan with a phone for L4 verification."),null;try{let a=await new BarcodeDetector({formats:["qr_code"]}).detect(o);if(a.length>0&&a[0].rawValue)return a[0].rawValue}catch{}return null}var N=null;function k(o){N=o}async function L(o={}){let i=document.getElementById("qr-code");if(!i||i.tagName!=="CANVAS")throw new Error("No #qr-code canvas found. Select one voucher and tap Show voucher first.");let a=await rt(i);if(!a)throw new Error("Could not decode QR from official show view.");let s=o.voucherId??null,c=null;if(N){let t=N.vouchers.filter(e=>e.qrPayload===a||e.id===s);!s&&t.length===1?(s=t[0].id,c=t[0].qrPayload):s?c=N.vouchers.find(r=>r.id===s)?.qrPayload??null:t.length>0&&(c=t.find(e=>e.qrPayload===a)?.qrPayload??null,s=t.find(e=>e.qrPayload===a)?.id??null)}if(!c){let t=await v({requirePageDetection:!1});k(t);let e=t.vouchers.find(r=>r.qrPayload===a||r.id===s);c=e?.qrPayload??null,s=e?.id??s}let p={match:c!==null&&a===c,official:a,expected:c,voucherId:s};return console.log("CDC voucher QR verification:",p),p}async function ot(o={}){let{print:i=!1,autoPrint:a=!0,...s}=o,c=await v({onProgress:d=>console.log("[cdc-voucher]",d),...s});return k(c),console.log("CDC voucher collection result:",c),i&&await C(c,{autoPrint:a,onProgress:d=>console.log("[cdc-voucher]",d)}),c}async function nt(o,i={}){return C(o,{onProgress:a=>console.log("[cdc-voucher]",a),...i})}async function it(o={}){let i=await v(o);return k(i),i}typeof window<"u"&&(window.CdcVoucherCollector={run:ot,print:nt,collectVouchers:v,collectAndRemember:it,detectPage:I,buildPrintHtml:D,openPrintPreview:C,verifyAgainstShowView:L});return dt(It);})();

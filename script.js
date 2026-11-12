const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const INSTAGRAM_URL='https://www.instagram.com/jvbrandz/';
let iphoneModels=[],products=[],category='Todos',selectedProduct;
const grid=document.getElementById('products'),search=document.getElementById('search'),filters=document.getElementById('filters'),sort=document.getElementById('sort');
const dialog=document.getElementById('iphoneDialog'),modelSelect=document.getElementById('iphoneModel'),colorSelect=document.getElementById('iphoneColor'),storageSelect=document.getElementById('iphoneStorage'),summary=document.getElementById('iphoneSummary'),status=document.getElementById('copyStatus');
const productDialog=document.getElementById('productDialog'),quantity=document.getElementById('productQuantity'),configuration=document.getElementById('productConfiguration'),productSummary=document.getElementById('productSummary'),productStatus=document.getElementById('productStatus');
function render(){
 const words=normalize(search.value.trim()).split(/\s+/).filter(Boolean);
 const filtered=products.filter(p=>{
  const haystack=normalize([p.name,p.cat,p.desc,p.tag,p.generation?iphoneModels.filter(m=>m.generation===p.generation).map(m=>m.name).join(' '):''].join(' '));
  return(category==='Todos'||p.cat===category)&&words.every(w=>haystack.includes(w));
 });
 if(sort.value!=='default')filtered.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR',{numeric:true})*(sort.value==='az'?1:-1));
 document.getElementById('resultCount').textContent=`${filtered.length} ${filtered.length===1?'resultado':'resultados'}${category==='Todos'?' no catálogo':' em '+category}`;
 grid.innerHTML=filtered.length?filtered.map(p=>{
 const action=p.generation?`data-generation="${p.generation}"`:`data-product="${escapeHtml(p.id)}"`;
 return `<article class="product"><button class="product-visual" ${action} aria-label="Ver ${escapeHtml(p.name)}"><span class="pill">${escapeHtml(p.tag)}</span><img class="product-photo" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></button><div class="product-info"><small>${escapeHtml(p.cat)}</small><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p><div class="product-bottom"><span class="price">${escapeHtml(p.price)}</span><button class="ask" ${action}>${p.generation?'Escolher opções':'Ver detalhes'}</button></div></div></article>`;
 }).join(''):'<div class="empty">Nenhum produto encontrado. Tente outra palavra ou categoria.</div>';
}
filters.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;filters.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});render()});
search.addEventListener('input',render);sort.addEventListener('change',render);
document.getElementById('year').textContent=new Date().getFullYear();
function updateSummary(){summary.value=`Olá! Gostaria de consultar o ${modelSelect.value}, cor ${colorSelect.value}, com ${storageSelect.value}. Qual o valor e a disponibilidade?`;status.textContent=''}
function updateModel(){const m=iphoneModels.find(m=>m.name===modelSelect.value);if(!m)return;document.getElementById('selectedPrice').textContent=m.price;colorSelect.replaceChildren(...m.colors.map(v=>new Option(v,v)));storageSelect.replaceChildren(...m.storage.map(v=>new Option(v,v)));const photo=document.getElementById('iphonePreview');photo.src=m.image;photo.alt=m.name+' — imagem de referência';updateSummary()}
function updateProductSummary(){if(!selectedProduct)return;const n=Math.min(99,Math.max(1,Math.floor(Number(quantity.value)||1)));productSummary.value=`Olá! Gostaria de consultar ${selectedProduct.name}. Quantidade: ${n}.${configuration.value.trim()?` Preferências: ${configuration.value.trim()}.`:""} Quais são o valor, as opções e a disponibilidade?`;productStatus.textContent=''}
grid.addEventListener('click',e=>{
 const b=e.target.closest('[data-generation],[data-product]');if(!b)return;
 if(b.dataset.generation){const m=iphoneModels.find(m=>m.generation===Number(b.dataset.generation));if(!m)return;modelSelect.value=m.name;updateModel();dialog.showModal();return}
 selectedProduct=products.find(p=>p.id===b.dataset.product);if(!selectedProduct)return;
 document.getElementById('productTitle').textContent=selectedProduct.name;document.getElementById('productCategory').textContent=selectedProduct.cat;document.getElementById('productDescription').textContent=selectedProduct.desc;const img=document.getElementById('productPreview');img.src=selectedProduct.image;img.alt=selectedProduct.alt;quantity.value='1';configuration.value='';configuration.placeholder=selectedProduct.configurationHint||'Ex.: cor ou versão desejada';updateProductSummary();productDialog.showModal();
});
modelSelect.addEventListener('change',updateModel);colorSelect.addEventListener('change',updateSummary);storageSelect.addEventListener('change',updateSummary);quantity.addEventListener('input',updateProductSummary);configuration.addEventListener('input',updateProductSummary);quantity.addEventListener('change',()=>{quantity.value=String(Math.min(99,Math.max(1,Math.floor(Number(quantity.value)||1))));updateProductSummary()});
document.getElementById('closeIphone').addEventListener('click',()=>dialog.close());document.getElementById('closeProduct').addEventListener('click',()=>productDialog.close());
async function copyMessage(field,feedback){try{await navigator.clipboard.writeText(field.value);feedback.textContent='Copiado. Abra o Instagram e cole a mensagem no atendimento.'}catch{field.focus();field.select();feedback.textContent='Selecione e copie a mensagem para enviar no Instagram.'}}
document.getElementById('copyIphone').addEventListener('click',()=>copyMessage(summary,status));document.getElementById('copyProduct').addEventListener('click',()=>copyMessage(productSummary,productStatus));
async function loadCatalog(){try{
 const response=await fetch('./catalog.json?v=20261112b');if(!response.ok)throw new Error('catalog');const result=await response.json();iphoneModels=result.data.models.filter(p=>p.available);products=result.data.products.filter(p=>p.available);
 const generations=[...new Set(iphoneModels.map(m=>m.generation))].sort((a,b)=>a-b);
 products=[...generations.map(g=>{const m=iphoneModels.find(m=>m.generation===g);return {id:'iphone-'+g,name:`Linha iPhone ${g}`,cat:'iPhones',desc:'Escolha modelo, cor e armazenamento. Disponibilidade sob consulta.',image:m.image,alt:m.name,tag:'Configure seu iPhone',price:'Consultar',generation:g}}),...products];
 const cats=['Todos',...new Set(products.map(p=>p.cat))];filters.innerHTML=cats.map(c=>`<button class="filter${c==='Todos'?' active':''}" data-cat="${escapeHtml(c)}" aria-pressed="${c==='Todos'}">${escapeHtml(c)}</button>`).join('');
 modelSelect.replaceChildren(...iphoneModels.map(m=>new Option(m.name,m.name)));render();
 }catch{grid.innerHTML='<div class="empty">Não foi possível carregar o catálogo. Atualize a página para tentar novamente.</div>';document.getElementById('resultCount').textContent='Catálogo indisponível no momento.'}}
loadCatalog();

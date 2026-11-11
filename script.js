const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
// Catálogo carregado do servidor.
const INSTAGRAM_URL="https://www.instagram.com/jvbrandz/";
let iphoneModels=[];
let products=[];
const grid=document.getElementById("products"), search=document.getElementById("search");
let category="Todos";
function render(){
 const term=search.value.trim().toLowerCase();
 const filtered=products.filter(p=>(category==="Todos"||p.cat===category)&&(`${escapeHtml(p.name)} ${escapeHtml(p.cat)} ${escapeHtml(p.desc)} ${p.generation ? iphoneModels.filter(model => model.generation === p.generation).map(model => model.name).join(" ") : ""}`).toLowerCase().includes(term));
 grid.innerHTML=filtered.length?filtered.map(p=>`<article class="product"><div class="product-visual"><span class="pill">${escapeHtml(p.tag)}</span><img class="product-photo" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></div><div class="product-info"><small>${escapeHtml(p.cat)}</small><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.desc)}</p><div class="product-bottom"><span class="price">${escapeHtml(p.price)}</span>${p.generation ? `<button class="ask" data-generation="${p.generation}">Escolher opções</button>` : `<a class="ask" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Consultar ↗</a>`}</div></div></article>`).join(""):`<div class="empty">Nenhum produto encontrado. Tente outra busca.</div>`;
}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{category=b.dataset.cat;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));render()}));
search.addEventListener("input",render);
document.getElementById("year").textContent=new Date().getFullYear();
loadCatalog();

const dialog = document.getElementById("iphoneDialog");
const modelSelect = document.getElementById("iphoneModel");
const colorSelect = document.getElementById("iphoneColor");
const storageSelect = document.getElementById("iphoneStorage");
const summary = document.getElementById("iphoneSummary");
const status = document.getElementById("copyStatus");

function updateSummary() {
 summary.value = `Olá! Gostaria de consultar o ${modelSelect.value}, cor ${colorSelect.value}, com ${storageSelect.value}. Qual o valor e a disponibilidade?`;
 status.textContent = "";
}
function updateModel() {
 const model = iphoneModels.find(item => item.name === modelSelect.value);
 document.getElementById("selectedPrice").textContent = model.price;
 colorSelect.replaceChildren(...model.colors.map(color => new Option(color,color)));
 storageSelect.replaceChildren(...model.storage.map(size => new Option(size,size)));
 const photo = document.getElementById("iphonePreview");
 photo.src = model.image;
 photo.alt = model.name + " — imagem de referência do modelo";
 updateSummary();
}
grid.addEventListener("click", event => {
 const button = event.target.closest("[data-generation]");
 if (!button) return;
 const model = iphoneModels.find(item => item.generation === Number(button.dataset.generation));
 modelSelect.value = model.name;
 updateModel();
 dialog.showModal();
});
modelSelect.addEventListener("change", updateModel);
colorSelect.addEventListener("change", updateSummary);
storageSelect.addEventListener("change", updateSummary);
document.getElementById("closeIphone").addEventListener("click", () => dialog.close());
document.getElementById("copyIphone").addEventListener("click", async () => {
 try {
  await navigator.clipboard.writeText(summary.value);
  status.textContent = "Copiado. Abra o Instagram e cole a mensagem no atendimento.";
 } catch {
  summary.focus();
  summary.select();
  status.textContent = "Selecione e copie a mensagem para enviar no Instagram.";
 }
});

async function loadCatalog(){
try{const response=await fetch('./catalog.json');if(!response.ok)throw new Error();const result=await response.json();iphoneModels=result.data.models.filter(p=>p.available);products=result.data.products.filter(p=>p.available);
for (let generation = 30; generation >= 12; generation--) {
 const model = iphoneModels.find(item => item.generation === generation);
 if (!model) continue;
 products.unshift({name: `Linha iPhone ${generation}`, cat: "iPhones", desc: "Escolha modelo, cor e armazenamento. Disponibilidade sob consulta.", image: model.image, alt: model.name, tag: "Configure seu iPhone", price: "Consultar", generation});
}

modelSelect.replaceChildren(...iphoneModels.map(model=>new Option(model.name,model.name)));render();}catch{grid.textContent='Não foi possível carregar o catálogo. Atualize a página para tentar novamente.'}}

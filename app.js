let db={};

const input=document.getElementById("barcode"),
box=document.getElementById("box"),
address=document.getElementById("address"),
status=document.getElementById("status"),
info=document.getElementById("info");

function focus(){
  input.focus();
  input.select();
}

function fmtEndereco(valor){
  const s=String(valor||"").trim();
  const m=s.match(/^(\d+)\s*-\s*(\d+)$/);
  return m ? "RUA "+m[1]+" - PRÉDIO "+m[2] : s;
}

function show(){
  let c=input.value.trim();
  if(!c)return;

  let x=db[c];

  if(x){
    box.className="ok";
    address.textContent=fmtEndereco(x.address);
    status.textContent="CÓDIGO ENCONTRADO";
    info.innerHTML=(x.reference?"<b>Ref.:</b> "+x.reference:" ")+(x.description?"<br><b>Produto:</b> "+x.description:"");
  }else{
    box.className="bad";
    address.textContent="NÃO ENCONTRADO";
    status.textContent="Código: "+c;
    info.textContent="Este código não está na base carregada.";
  }

  setTimeout(focus,50);
}

input.addEventListener("keydown",e=>{
  if(e.key==="Enter")show();
});

document.getElementById("clear").onclick=()=>{
  input.value="";
  box.className="neutral";
  address.textContent="—";
  status.textContent="Aguardando bip...";
  info.textContent="";
  focus();
};

async function carregarBase(){
  try{
    // O parâmetro impede que o navegador reutilize uma resposta HTTP antiga.
    const resposta=await fetch("data.json?atualizacao="+Date.now(),{
      cache:"no-store"
    });

    if(!resposta.ok)throw new Error("Falha ao carregar data.json");

    db=await resposta.json();
    focus();
  }catch(e){
    status.textContent="Erro ao carregar a base";
    focus();
  }
}

carregarBase();

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").then(reg=>{
    // Verifica imediatamente se existe uma versão nova do Service Worker.
    reg.update();
  }).catch(()=>{});
}

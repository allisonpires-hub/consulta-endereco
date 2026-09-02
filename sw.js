const CACHE_NAME="consulta-endereco-v2";
const ASSETS=[
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.json",
  "./manifest.webmanifest"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(
        keys
          .filter(key=>key!==CACHE_NAME)
          .map(key=>caches.delete(key))
      )
    ).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;

  const url=new URL(event.request.url);

  // A base é a parte que muda. Sempre tenta buscar a versão atual
  // primeiro; somente usa o cache se estiver sem conexão.
  if(url.pathname.endsWith("/data.json")){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>{
            cache.put("./data.json",copy);
          });
          return response;
        })
        .catch(()=>caches.match("./data.json"))
    );
    return;
  }

  // Arquivos estáticos: cache primeiro.
  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request))
  );
});

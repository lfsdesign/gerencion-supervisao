// sw.js — Service Worker de AUTODESTRUIÇÃO
// Substitui o SW antigo que estava servindo a versão velha do app.
// Ao ativar: apaga TODOS os caches, se desregistra e recarrega as abas abertas
// uma única vez, forçando o navegador a baixar os arquivos novos da Vercel.
// Depois disso não há mais SW: o app passa a carregar sempre a versão mais recente.

self.addEventListener('install', function(e){
  self.skipWaiting(); // assume o controle imediatamente
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.map(function(k){ return caches.delete(k); }));
      })
      .then(function(){
        return self.registration.unregister();
      })
      .then(function(){
        return self.clients.matchAll();
      })
      .then(function(clients){
        clients.forEach(function(c){
          // recarrega cada aba aberta uma vez, já sem SW
          if (c.navigate) { c.navigate(c.url); }
        });
      })
      .catch(function(){})
  );
});

// Rede sempre em primeiro lugar (enquanto este SW existir, nunca serve cache velho)
self.addEventListener('fetch', function(e){
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});

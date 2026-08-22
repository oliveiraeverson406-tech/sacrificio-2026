// Este service worker existe apenas para LIMPAR qualquer cache antigo
// que ficou travado de uma versão anterior, e depois se desativar.
// Depois disso, o site passa a carregar sempre a versão mais recente
// direto do servidor, sem cache escondido atrapalhando.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});

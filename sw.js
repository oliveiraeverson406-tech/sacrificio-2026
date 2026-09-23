const CACHE_NAME = 'sacrificio-cache-v1';
const URLS_PARA_CACHEAR = [
  './',
  './index.html',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        URLS_PARA_CACHEAR.map((url) =>
          cache.add(url).catch(() => {}) // se algum recurso falhar, não trava o resto
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(event.request)
        .then((resposta) => {
          // guarda uma cópia no cache pra próxima vez que estiver offline
          const copia = resposta.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          return resposta;
        })
        .catch(() => respostaCache);
    })
  );
});

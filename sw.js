// Service worker: sempre tenta a internet primeiro (pega a versão nova do app)
// e só usa o cache quando estiver offline.
const CACHE = 'sacrificio-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const permitido = url.origin === self.location.origin || url.hostname === 'www.gstatic.com';
  if (!permitido) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

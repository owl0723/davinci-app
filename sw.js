// da Vinci症例管理アプリ改 — Service Worker
const CACHE_NAME = 'davinci-app-v3';
const STATIC_FILES = [
    './',
    './index.html',
    './manifest.json',
    './sw.js',
    './icon192.png',
    './icon512.png'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => clients.claim())
    );
});

self.addEventListener('message', e => {
    if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
    // Network-first: always try network, fall back to cache
    e.respondWith(
        fetch(e.request)
            .then(resp => {
                if (resp && resp.status === 200 && resp.type === 'basic') {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return resp;
            })
            .catch(() =>
                caches.match(e.request).then(r => r || caches.match('./index.html'))
            )
    );
});

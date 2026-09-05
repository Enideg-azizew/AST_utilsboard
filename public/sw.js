// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Basic offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline - LabAST Pro', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});

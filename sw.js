// Guarda la app en el teléfono para abrirla sin conexión.
// Los datos (Apps Script) nunca pasan por la caché: la app los guarda por su cuenta.
const CACHE = 'cronometro-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e) {
  // cache: 'reload' evita copias viejas de la caché del navegador (GitHub Pages las conserva ~10 min)
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(SHELL.map(function(u) { return new Request(u, { cache: 'reload' }); })); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      // Las cachés son compartidas por origen: borrar solo las de esta app.
      .then(function(ks) { return Promise.all(ks.filter(function(k) { return k.startsWith('cronometro-') && k !== CACHE; }).map(function(k) { return caches.delete(k); })); })
      .then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Apps Script: siempre directo a la red
  if (url.hostname.endsWith('script.google.com') || url.hostname.endsWith('googleusercontent.com')) return;

  // Fuentes de Google: se guardan la primera vez que se ven
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async function(c) {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); c.put(req, r.clone()); return r; } catch (err) { return Response.error(); }
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  // Archivos de la app: primero lo guardado, y se actualiza en segundo plano
  // (siempre revalidando contra el servidor, no contra la caché del navegador)
  e.respondWith(caches.open(CACHE).then(async function(c) {
    const key = req.mode === 'navigate' ? new Request(url.origin + url.pathname) : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const red = fetch(req.url, { cache: 'no-cache' })
      .then(function(r) { if (r.ok) c.put(key, r.clone()); return r; })
      .catch(function() { return null; });
    return hit || (await red) || (await c.match('./index.html')) || Response.error();
  }));
});

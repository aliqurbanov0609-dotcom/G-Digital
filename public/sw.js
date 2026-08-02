const CACHE = "gdigital-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([
        "/G-Digital/",
        "/G-Digital/index.html",
        "/G-Digital/manifest.json",
        "/G-Digital/icons/icon-192.png",
        "/G-Digital/icons/icon-512.png"
      ])
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(
      (cached) => cached || fetch(event.request)
    )
  );
});

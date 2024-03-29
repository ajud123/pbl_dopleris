const CACHE_NAME = `temperature-converter-v003`;

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      '/pbl_dopleris/',
      '/pbl_dopleris/speed.js'
    ]);
  })());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);

          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // The network failed.
        }
    }
  })());
});

self.addEventListener('updatefound', async event => {
  const reg = await navigator.serviceWorker.ready;
  const newSW = reg.installing;
  console.log("pwa update found")
  newSW.addEventListener("statechange", event => {
    if(newSW.state == "installed"){
      console.log("pwa installed")
    }
  })
})
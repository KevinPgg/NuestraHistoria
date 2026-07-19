// Service worker mínimo. Solo existe para que la app sea instalable como PWA.
// NO cachea respuestas: las fotos usan URLs firmadas que expiran, así que
// cachearlas rompería las imágenes. Deja pasar todo a la red tal cual.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", () => {
  // Passthrough: no respondemos con caché; el navegador maneja la petición.
});

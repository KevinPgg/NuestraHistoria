import type { MetadataRoute } from "next";

// Manifest de la PWA. Con display "standalone", al instalar el icono en la
// pantalla de inicio la app abre a pantalla completa (sin barra ni pestaña de
// navegador). Next enlaza este manifest automáticamente en el <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nuestra Historia",
    short_name: "Historia",
    description: "Nuestro espacio privado.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf3",
    theme_color: "#f472b6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

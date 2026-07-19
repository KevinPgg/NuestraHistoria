"use client";
// Registra el service worker (solo en el navegador y si está soportado).
// Necesario para que la app sea instalable como PWA.
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silencioso: si falla el registro, la app sigue funcionando (sin PWA).
    });
  }, []);
  return null;
}

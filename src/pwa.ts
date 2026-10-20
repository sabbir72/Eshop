import { registerSW } from "virtual:pwa-register";

export function registerPwaServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error("[PWA] Service worker registration failed:", error);
    },
  });
}

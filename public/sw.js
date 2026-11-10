/* Норма — service worker: офлайн-доступ + условие установки PWA на Android.
 * Стратегии:
 *  - навигация — сеть в приоритете, при офлайне отдаём оболочку из кеша;
 *  - остальные запросы — из кеша сразу + фоновое обновление (stale-while-revalidate).
 */
const CACHE_NAME = "norma-pwa-v2";

/* Пути относительны папки, из которой отдаётся приложение, поэтому
 * сборка работает и в корне домена, и в подпапке (например, GitHub Pages). */
const SCOPE = self.registration.scope;
const resolve = (path) => new URL(path, SCOPE).toString();

const SHELL = resolve("./");
const SHELL_INDEX = resolve("./index.html");
const CORE_ASSETS = [
  SHELL,
  SHELL_INDEX,
  resolve("./manifest.webmanifest"),
  resolve("./icons/icon-192.png"),
  resolve("./icons/icon-512.png"),
  resolve("./icons/icon-maskable-512.png"),
  resolve("./icons/apple-touch-icon.png"),
  resolve("./icons/favicon.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      /* Каждый файл кешируем отдельно: отсутствие одного ресурса больше не
       * ломает предзагрузку целиком (раньше cache.addAll падал и офлайн
       * не работал вовсе). */
      await Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

const isCacheable = (response) =>
  Boolean(response) && response.ok && response.type !== "opaque";

async function putInCache(request, response) {
  if (!isCacheable(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function handleNavigation(request) {
  try {
    const response = await fetch(request);
    if (isCacheable(response)) {
      const cache = await caches.open(CACHE_NAME);
      /* Оболочку храним под обоими адресами, чтобы офлайн-запуск работал
       * и по «/», и по «/index.html». */
      await cache.put(SHELL, response.clone());
      await cache.put(SHELL_INDEX, response.clone());
    }
    return response;
  } catch {
    const cached =
      (await caches.match(SHELL)) || (await caches.match(SHELL_INDEX));
    if (cached) return cached;
    return new Response(
      "<!doctype html><meta charset=\"utf-8\"><title>Норма</title>" +
        "<body style=\"font-family:system-ui;padding:24px;text-align:center\">" +
        "<h1>Нет подключения</h1><p>Откройте приложение ещё раз, когда появится сеть.</p>",
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request);
  if (cached) {
    /* Фоновое обновление не должно влиять на отдачу. */
    fetch(request)
      .then((response) => putInCache(request, response))
      .catch(() => undefined);
    return cached;
  }

  try {
    const response = await fetch(request);
    await putInCache(request, response);
    return response;
  } catch (error) {
    if (request.destination === "document") {
      const fallback = await caches.match(SHELL);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    request.mode === "navigate" ? handleNavigation(request) : handleAsset(request),
  );
});

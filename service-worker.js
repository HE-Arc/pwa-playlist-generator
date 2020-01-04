
'use strict';

// Update cache names any time any of the cached files change.
const STATIC_CACHE_NAME = 'static-cache-v1.0';
const AUDIO_CACHE_NAME = 'audio-cache-v1.0';

// Add list of files to cache here.
const FILES_TO_CACHE = [
    'index.html',
    'pwa.js',
    'service-worker.js',
    'js/common.js',
    'js/jszip.js',
    'js/pwa-audio.js',
];

// Files to cache
self.addEventListener('install', (evt) =>
{
    console.log('[ServiceWorker] Install');

    evt.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) =>
        {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// Cleans up any old data in the cache
self.addEventListener('activate', (evt) =>
{
    console.log('[ServiceWorker] Activate');

    evt.waitUntil(
        caches.keys().then((keyList) =>
        {
            return Promise.all(keyList.map((key) =>
            {
                if (key !== STATIC_CACHE_NAME && key !== AUDIO_CACHE_NAME)
                {
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

// « Cache falling back to the network » approach
self.addEventListener('fetch', (evt) =>
{
    console.log('[ServiceWorker] Fetch', evt.request.url);

    evt.respondWith(
        caches.match(evt.request)
            // From cache if present ; fetch otherwise
            .then((response) =>
            {
                return response || fetch(evt.request);
            })
            // Error
            .catch(() =>
            {
                console.log('Could not fetch request', evt.request.url);
            })
    );
});

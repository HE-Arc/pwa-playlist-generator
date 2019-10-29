/*
'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1.5';
const DATA_CACHE_NAME = 'data-cache-v1';

// Add list of files to cache here.
const FILES_TO_CACHE = [
    'index.html',
];

// Files to cache
self.addEventListener('install', (evt) =>
{
    console.log('[ServiceWorker] Install');
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
        {
            console.log('[ServiceWorker] Pre-caching offline page');
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
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME)
                {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );

    self.clients.claim();
});

// Fetches data from the cache (in case of Internet connection problem)
self.addEventListener('fetch', (evt) =>
{
    console.log('[ServiceWorker] Fetch', evt.request.url);
    if (evt.request.mode !== 'navigate')
    {
        // Not a page navigation, bail.
        return;
    }
    evt.respondWith(fetch(evt.request).catch(() =>
    {
        return caches.open(CACHE_NAME).then((cache) =>
        {
            return cache.match('index.html');
        });
    }));
});
*/

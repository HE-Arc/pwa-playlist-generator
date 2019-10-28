
function template_html(data)
{
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <link rel="manifest" href="manifest.json">
            <link rel="stylesheet" href="css/app.css">
        </head>
        <body>
            <div class="container">
                <h1 class="main-title">${data.title}</h1>
                <ul id="listing">${data.audioTree}</ul>
                <audio id="audio-player" controls>
                    <source src="">
                    Your browser does not support the audio element.
                </audio>
            </div>

            <script src="js/app.js"></script>
            <script src="service-worker.js"></script>
            <script src="pwa.js"></script>

        </body>
    </html>
    `;
}

function template_css()
{
    return `
body {
    color: #f5f5f5;
    background: #333;
}
a,
a:visited {
    color: #ad0000;
}
#listing a {
    display: inline-block;
}
#listing a.cache-audio {
    margin-left: 10px;
}
    `;
}

function template_app_js()
{
    return `
'use strict';

const $_audioPlayer = document.querySelector('#audio-player');

// Click on a sound link --> plays it
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('audio-src'))
    {
        evt.preventDefault();

        let audioFile = evt.target.getAttribute('href');

        if (audioFile)
        {
            $_audioPlayer.setAttribute('src', audioFile);
            $_audioPlayer.play();
        }
        else
        {
            alert('No source file for this audio file.');
        }
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-audio'))
    {
        evt.preventDefault();

        let audioFile = evt.target.getAttribute('href');

        if (audioFile)
        {
            caches.open('audio-cache').then((cache) =>
            {
                fetch(audioFile).then((response) =>
                {
                    return response;
                }).then((file) =>
                {
                    cache.add(file.url);
                });
            });
        }
        else
        {
            alert('No sorce file for this audio file.');
        }
    }
});
    `;
}

function template_pwa_js()
{
    return `
'use strict';

if ('serviceWorker' in navigator)
{
    window.addEventListener('load', () =>
    {
        navigator.serviceWorker.register('service-worker.js').then((registration) =>
        {
            console.log('Service worker registered:', registration);
        },
        (error) =>
        {
            console.log('Service worker registration failed:', error);
        });
    });
}
else
{
    console.log('Service workers are not supported.');
}

/*
// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) =>
{
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    deferredPrompt.prompt()
    .then(res => console.log(res))
    .catch(error => console.log(error.message));
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) =>
    {
        if (choiceResult.outcome === 'accepted')
        {
            console.log('User accepted the A2HS prompt');
        }
        else
        {
            console.log('User dismissed the A2HS prompt');
        }

        deferredPrompt = null;
    });
});
*/
    `;
}

function template_manifest(data)
{
    return `
{
  "name": "${data.name}",
  "short_name": "${data.shortname}",
  "icons": [{
      "src": "${data.icon}",
      "sizes": "144x144",
      "type": "image/png"
    }],
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#3E4EB8",
  "theme_color": "#2F3BA2"
}
    `;
}

function template_service_worker()
{
    return `
'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1.6';
const DATA_CACHE_NAME = 'data-cache-v1';

// Add list of files to cache here.
const FILES_TO_CACHE = [
    'index.html',
    // Can add audio files here
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
    `;
}

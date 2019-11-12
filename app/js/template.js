
function template_html(data)
{
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="manifest" href="manifest.json">
            <link rel="stylesheet" href="css/app.css">
        </head>
        <body>
            <div class="container">
                <h1 class="main-title">${data.title}</h1>
                <div id="audio-tree">${data.audioTree}</div>
                <audio id="audio-player" controls>
                    <source src="">
                    Your browser does not support the audio element.
                </audio>
                <button id="audio-previous">Previous</button>
                <button id="audio-next">Next</button>
                <label for="audio-repeat">Repeat</label>
                <input id="audio-repeat" type="checkbox" name="audio-repeat">
                <button id="audio-random">Random</button>
                <p id="current-audio-file"></p>
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
#audio-tree a {
    display: inline-block;
}
#audio-tree a.cache-audio {
    margin-left: 10px;
}
    `;
}

function template_app_js()
{
    return `
'use strict';

const $$ = {
    audioPlayer: document.querySelector('#audio-player'),
    audioTree: document.querySelector('#audio-tree'),
    audioFileRepeat: document.querySelector('#audio-repeat'),
};

// Audio player actions enum
const AudioPlayerActions = Object.freeze(
    {
        'NEXT': 0,
        'PREVIOUS': 1,
        'RANDOM_NEXT': 2,
        'RANDOM_PREVIOUS': 3,
    }
);

const PLAYER_REWIND_TIME = 3;

const TOTAL_AUDIO_FILES = $$.audioTree.getElementsByClassName('audio-src').length;
let isRandom = false;
let randomQueue = [];
let randomHistory = [];

let currentAudioFile = '';
let currentAudioFileRepeated = false;

// Returns the current audio file data-id
function getCurrentAudioFileId()
{
    return parseInt(currentAudioFile.getAttribute('data-id'));
}

// Sets the current audio file corresponding to the given id
function setNextAudioFileById(id)
{
    let nextAudioFile = $$.audioTree.querySelector('.audio-src[data-id="' + id + '"]');

    // There is a next audio file to play
    if (nextAudioFile !== null)
    {
        currentAudioFile = nextAudioFile;

        return true;
    }

    // No next audio file
    return false;
}

function displayCurrentAudioFile()
{
    let title = currentAudioFile.innerHTML;
    document.querySelector('#current-audio-file').innerHTML = title;
}

// Plays the next audio file based on the given audio player action
function playNextAudioFile(action)
{
    let canPlayNext = false;

    switch (action)
    {
        case AudioPlayerActions.NEXT:
            canPlayNext = setNextAudioFileById(getCurrentAudioFileId() + 1);
            break;
        case AudioPlayerActions.PREVIOUS:
            canPlayNext = setNextAudioFileById(getCurrentAudioFileId() - 1);
            break;
        case AudioPlayerActions.RANDOM_NEXT:
            canPlayNext = setNextAudioFileById(nextRandomId());
            break;
        case AudioPlayerActions.RANDOM_PREVIOUS:
            canPlayNext = setNextAudioFileById(previousRandomId());
            break;
        default:
            console.log('Not a valid action:', action);
            break;
    }

    // Plays the audio file
    if (canPlayNext)
    {
        playCurrentAudioFile();
    }
}

// Plays the current audio file
function playCurrentAudioFile()
{
    if (currentAudioFile)
    {
        displayCurrentAudioFile();

        $$.audioPlayer.setAttribute('src', currentAudioFile.getAttribute('href'));
        //FIXME: there could be download erros ; maybe use a promise to handle the case
        $$.audioPlayer.play();
    }
    //FIXME: no need for this block if using a promise
    else
    {
        alert('No source file for this audio file.');
    }
}

// Click on an audio file
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('audio-src'))
    {
        evt.preventDefault();

        // Plays the audio file
        currentAudioFile = evt.target;
        playCurrentAudioFile();
    }
});

// Click on next audio file
document.querySelector('#audio-next').addEventListener('click', (evt) =>
{
    if (isRandom)
    {
        playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
    }
    else
    {
        playNextAudioFile(AudioPlayerActions.NEXT);
    }
});

// Click on previous audio file
document.querySelector('#audio-previous').addEventListener('click', (evt) =>
{
    // Rewinds audio file
    if ($$.audioPlayer.currentTime > PLAYER_REWIND_TIME)
    {
        $$.audioPlayer.currentTime = 0;
    }
    // Plays previous audio file
    else
    {
        if (isRandom)
        {
            playNextAudioFile(AudioPlayerActions.RANDOM_PREVIOUS);
        }
        else
        {
            playNextAudioFile(AudioPlayerActions.PREVIOUS);
        }
    }
});

function initRandomQueue()
{
    isRandom = true;
    randomQueue = [];
    randomHistory = [];

    for (let i = 1; i <= TOTAL_AUDIO_FILES; i++)
    {
        randomQueue.push(i);
    }
}

function nextRandomId()
{
    if (randomQueue.length > 0)
    {
        // Interval: [0, randomQueue.length[
        let randomIndex = Math.floor(Math.random() * randomQueue.length);
        // Removes this ID from the randomQueue array
        // splice returns an array
        let randomId = randomQueue.splice(randomIndex, 1)[0];

        randomHistory.push(randomId);

        return randomId;
    }

    return false;
}

function previousRandomId()
{
    if (randomHistory.length > 0)
    {
        return randomHistory.pop();
    }

    return false;
}

document.querySelector('#audio-random').addEventListener('click', (evt) =>
{
    initRandomQueue();
    playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
});

// On ended audio player
$$.audioPlayer.addEventListener('ended', (evt) =>
{
    // Repeats the current audio file
    if ($$.audioFileRepeat.checked && !currentAudioFileRepeated)
    {
        currentAudioFileRepeated = true;
        $$.audioPlayer.currentTime = 0;
        $$.audioPlayer.play();
    }
    else
    {
        currentAudioFileRepeated = false;

        if (isRandom)
        {
            playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
        }
        else
        {
            playNextAudioFile(AudioPlayerActions.NEXT);
        }
    }
});

// Click on download audio file
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-audio'))
    {
        evt.preventDefault();

        let audioFile = evt.target.getAttribute('href');

        // Caches the audio file for offline listening
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
            alert('No source file for this audio file.');
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

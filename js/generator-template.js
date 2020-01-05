
// Template for the index.html
function template_html(data)
{
    return `
    <!DOCTYPE html>
    <html lang="${data.lang}">
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
            <meta name="description" content="${data.description}">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="manifest" href="manifest.json">
            <meta name="theme-color" content="${data.theme_color}">
            <!-- MUST BE 192px SQUARE (OR 180px) -->
            <link rel="apple-touch-icon" href="images/icons/icon-192x192.png">
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

            <script src="service-worker.js"></script>
            <script src="pwa.js"></script>
            <script src="js/pwa-audio.js"></script>
            <script src="js/jszip.js"></script>
            <script src="js/common.js"></script>

        </body>
    </html>
    `;
}

// Template for the PWA Manifest
function template_manifest(data)
{
    return `
{
    "name": "${data.name}",
    "short_name": "${data.shortname}",
    "icons": [
        {
            "src": "images/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "images/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "start_url": "index.html",
    "display": "standalone",
    "background_color": "${data.background_color}",
    "theme_color": "${data.theme_color}"
}
    `;
}

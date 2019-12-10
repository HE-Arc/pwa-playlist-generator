
// Template for the index.html
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
            <!--link rel="stylesheet" href="css/app.css"-->
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
            <script src="js/audio.js"></script>
            <script src="js/jszip.js"></script>

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

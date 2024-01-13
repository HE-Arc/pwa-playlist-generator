
// Template for the index.html
function theme_none(data)
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

function theme_none_tree_folder(name, folderTitle, folderContent, titleLevel)
{
    let htmlFolder = titleLevel === 1 ?
        '' : '<li class="folder-subfolder">';

    htmlFolder += `
<ul data-name="${name}">
    <li class="audio-folder">${folderTitle}
        <a href="#" class="cache-folder">Cache</a>
        <a href="#" class="download-folder">Download</a>
    </li>
    ${folderContent}
</ul>
    `
    if (titleLevel > 1)
    {
        htmlFolder += '</li>';
    }

    return htmlFolder;
}

function theme_none_tree_file(name, title, webkitRelativePath, audioFileID)
{
    const encUri=encodeURI(webkitRelativePath);
    return `
<li class="audio-file">
    <a href="${encUri}" class="audio-src" data-id="${audioFileID}" data-title="${title}">${title}</a>
    <a href="#" class="cache-audio">Cache</a>
    <a href="#" class="download-audio">Download</a>
</li>
    `;
}

function theme_materialize_light(data)
{
    return `
<!DOCTYPE html>
<html lang="fr" prefix="og: https://ogp.me/ns#">
<head prefix="og: http://ogp.me/ns#">
    <meta charset="utf-8">
	<title>${data.title}</title>
	<meta name="description" content="${data.description}">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="language" content="fr_FR">
	<meta name="theme-color" content="${data.theme_color}">
	
	<meta property="og:url" content="00URL00">
	<meta property="og:type" content="website">
	<meta property="og:title" content="${data.title}">
	<meta property="og:description" content="${data.description}">
	<meta property="og:image" content="00Card_Img_1200x630URL00">
	<meta property="og:image:secure_url" content="00Card_Img_1200x630URL00">
	<meta property="og:image:type" content="image/jpeg">
	
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:domain" content="00DOMAIN00">
	<meta name="twitter:url" content="00URL00">
	<meta name="twitter:title" content="${data.title}">
	<meta name="twitter:description" content="${data.description}">
	<meta name="twitter:image" content="00Card_Img_1200x630URL00g">
	
	<link rel="icon" type="image/jpeg" href="images/index.jpg">
	<link rel="manifest" href="manifest.json">
	<link rel="apple-touch-icon" href="images/icons/icon-192x192.png">
	<link rel="stylesheet" href="css/theme_materialize_light.css">
	<link rel="stylesheet" href="css/materialize.min.css">
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Cardo"> 

	<style>
		body {	
			font-family:'Cardo', sans-serif;
			background-color: #101010;
			background-image: url(images/index.jpg);   
			background-size: 100%;	
			}
	</style>
</head>
    
    <body class="black-text">
        <main class="main">
            <div class="container">
                <h1 class="main-title">${data.title}</h1>
                <div id="audio-tree">
                    ${data.audioTree}
                </div>
            </div>
        <p><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr"><img src="https://licensebuttons.net/l/by-nc-sa/3.0/88x31.png" alt="Licence: CC BY-NC-SA 4.0 DEED"></a><br>
        Download <a href="">all</a><br>
        <a href="mailto:mulhouse@protonmail.com?subject=LeGID">Ecrire</a>Contact!<br></p>
        </main>


    <div id="player-container" class="grey darken-3 white-text center">
        <div>
            <button id="audio-previous" class="btn-small waves-effect waves-light black"><i class="material-icons">skip_previous</i></button>	            
            <span id="current-audio-file">No sound</span>
            <input id="audio-repeat" type="checkbox" name="audio-repeat">
            <label for="audio-repeat"></label>
            <button id="audio-next" class="btn-small waves-effect waves-light black"><i class="material-icons">skip_next</i></button>
            <button id="audio-random" class="btn-small waves-effect waves-light black"><i class="material-icons">shuffle</i></button>
        </div>
        <audio id="audio-player" controls>
                Your browser does not support the audio element.
        </audio>
    </div>
    <p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>

        <script src="service-worker.js"></script>
        <script src="pwa.js"></script>
        <script src="js/pwa-audio.js"></script>
        <script src="js/jszip.js"></script>
        <script src="js/common.js"></script>
        <script src="js/materialize.min.js"></script>

    </body>
</html>
    `;
}

function theme_materialize_light_tree_folder(name, folderTitle, folderContent, titleLevel)
{
    let htmlFolder = titleLevel === 1 ?
        '' : '<li class="folder-subfolder">';

    htmlFolder += `
<ul data-name="${name}">
    <li class="audio-folder">${folderTitle}
        <a href="#" class="cache-folder"><i class="material-icons">cached</i></a>
        <a href="#" class="download-folder"><i class="material-icons">file_download</i></a>
    </li>
    ${folderContent}
</ul>
    `
    if (titleLevel > 1)
    {
        htmlFolder += '</li>';
    }

    return htmlFolder;
}

function theme_materialize_light_tree_file(name, title, webkitRelativePath, audioFileID)
{
    const encUri=encodeURI(webkitRelativePath);
    return `
<li class="audio-file">
    <a href="${encUri}" class="audio-src" data-id="${audioFileID}" data-title="${title}">${title}</a>
    <a href="#" class="cache-audio"><i class="material-icons">cached</i></a>
    <a href="#" class="download-audio"><i class="material-icons">file_download</i></a>
</li>
    `;
}

function theme_materialize_dark(data)
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
        <link rel="stylesheet" href="css/theme_materialize_dark.css">
        <link rel="stylesheet" href="css/materialize.min.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    </head>
    <body class="grey darken-4 white-text">

        <header class="header red"></header>

        <main class="main">
            <div class="container">
                <h1 class="main-title">${data.title}</h1>
                <div id="audio-tree">
                    ${data.audioTree}
                </div>
            </div>
        </main>

        <footer class="page-footer white-text">
            <div class="container center">
                <div class="row">
                    <div class="col s12">
                        <p>Generated PWA example from :</p>
                    </div>
                    <div class="col s12">
                        <p><a href="https://github.com/HE-Arc/pwa-playlist-generator" target="_blank" rel="noopener">PWA Playlist Generator</a></p>
                    </div>
                </div>
            </div>
        </footer>

        <div id="player-container" class="grey darken-3 white-text center">
            <audio id="audio-player" controls>
                <source src="">
                Your browser does not support the audio element.
            </audio>

            <ul id="player-actions">
                <li class="player-action">
                    <button id="audio-previous" class="btn-floating waves-effect waves-light red"><i class="material-icons">skip_previous</i></button>
                </li>
                <li class="player-action">
                    <button id="audio-next" class="btn-floating waves-effect waves-light red"><i class="material-icons">skip_next</i></button>
                </li>
                <li class="player-action">
                    <button id="audio-repeat" class="btn-floating waves-effect waves-light red"><i class="material-icons">repeat</i></button>
                </li>
                <li class="player-action">
                    <button id="audio-random" class="btn-floating waves-effect waves-light red"><i class="material-icons">shuffle</i></button>
                </li>
            </ul>

            <p id="current-audio-file">No sound</p>

        </div>

        <script src="service-worker.js"></script>
        <script src="pwa.js"></script>
        <script src="js/pwa-audio.js"></script>
        <script src="js/jszip.js"></script>
        <script src="js/common.js"></script>
        <script src="js/materialize.min.js"></script>

    </body>
</html>
    `;
}

function theme_materialize_dark_tree_folder(name, folderTitle, folderContent, titleLevel)
{
    let htmlFolder = titleLevel === 1 ?
        '' : '<li class="folder-subfolder">';

    htmlFolder += `
<ul data-name="${name}">
    <li class="audio-folder">${folderTitle}
        <a href="#" class="cache-folder"><i class="material-icons">cached</i></a>
        <a href="#" class="download-folder"><i class="material-icons">file_download</i></a>
    </li>
    ${folderContent}
</ul>
    `
    if (titleLevel > 1)
    {
        htmlFolder += '</li>';
    }

    return htmlFolder;
}

function theme_materialize_dark_tree_file(name, title, webkitRelativePath, audioFileID)
{
    const encUri=encodeURI(webkitRelativePath);
    return `
<li class="audio-file">
    <a href="${encUri}" class="audio-src" data-id="${audioFileID}" data-title="${title}">${title}</a>
    <a href="#" class="cache-audio"><i class="material-icons">cached</i></a>
    <a href="#" class="download-audio"><i class="material-icons">file_download</i></a>
</li>
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

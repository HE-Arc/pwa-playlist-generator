
'use strict';

let title = 'PWA Playlist Generator';
let audioTree = '';
let iconImg = '';

let zipBuilder = new JSZip();

// Title input on input event
document.querySelector('input#input-pwa-title').addEventListener('input', (evt) =>
{
    title = evt.target.value;
});

// Root folder input on change event
document.querySelector('input#input-pwa-root-folder').addEventListener('change', (evt) =>
{
    let files = evt.target.files;
    // Builds a tree structure with the uploaded files
    let filesTree = buildFilesTree(files);

    // Builds the HTML tree based on the tree structure
    audioTree = folderRecursiveBuild(filesTree);

    // Displays the HTML tree structure
    document.querySelector('#audio-tree').innerHTML = audioTree;
});

// Icon input on change event
document.querySelector('input#input-pwa-icon').addEventListener('change', (evt) =>
{
    iconImg = evt.target.files[0];

    // Displays the uploaded icon
    let uploadedIcon = document.querySelector('#uploaded-icon');
    uploadedIcon.src = URL.createObjectURL(evt.target.files[0]);
});

// Click on the Generate HTML button
document.querySelector('#btn-pwa-generate').addEventListener('click', (evt) =>
{
    evt.preventDefault();

    const dataHtml = {
        title: title,
        audioTree: audioTree,
    };

    const dataManifest = {
        name: title,
        shortname: title,
        icon: 'icon.png',   //FIXME
    };

    generateZip(dataHtml, dataManifest);
});

// Builds a tree structure with the uploaded files
function buildFilesTree(filesList)
{
    let filesTree = new Map();

    // Iterates over each uploaded file
    for (let i = 0; i < filesList.length; i++)
    {
        let file = filesList[i];

        // Filters the audio files
        if (file.type.includes('audio'))
        {
            let filename = file.name;
            let relativePath = file.webkitRelativePath;
            // This file parent folders (array)
            let fileParents = relativePath.split('/').slice(0, -1);
            let currentFolder = filesTree;

            // Iterates over each parent folder of the current file
            for (let f = 0; f < fileParents.length; f++)
            {
                // This folder is not in the files tree yet
                if (!currentFolder.has(fileParents[f]))
                {
                    currentFolder.set(fileParents[f], new Map());
                }

                currentFolder = currentFolder.get(fileParents[f]);
            }

            // Adds this file to its first parent folder
            currentFolder.set(filename, file);
        }
    }

    return filesTree;
}

//
function folderRecursiveBuild(currentFolder, parentFolder=zipBuilder)
{
   let htmlTree = '';

    for (let [k, v] of currentFolder)
    {
        // Audio file
        //FIXME: to improve ; cannot have a folder with a .
        if (k.includes('.'))
        {
            parentFolder.file(v.name, v);

            htmlTree += '<li><a href="' + v.webkitRelativePath + '" class="audio-src">' + v.name + '</a><a href="' + v.webkitRelativePath + '" class="cache-audio">Download</a></li>';
        }
        // Folder
        else
        {
            htmlTree += '<ul><li>' + k + '</li>';
            htmlTree += folderRecursiveBuild(v, parentFolder.folder(k));
            htmlTree += '</ul>';
        }
    }

    return htmlTree;
}

// Generates the PWA in a zip file
function generateZip(dataHtml, dataManifest)
{
    let html = template_html(dataHtml);
    let appCss = template_css();
    let appJs = template_app_js();
    let pwaJs = template_pwa_js();
    let serviceWorkerJs = template_service_worker();
    let manifest = template_manifest(dataManifest);

    // index
    zipBuilder.file('index.html', html);

    // css folder
    let css = zipBuilder.folder('css');
    css.file('app.css', appCss);

    // js folder
    let js = zipBuilder.folder('js');
    js.file('app.js', appJs);

    // PWA files
    zipBuilder.file('manifest.json', manifest);
    zipBuilder.file('icon.png', iconImg, {base64: true});
    //FIXME: Keep it that way ? Or in js dir with relative path ?
    zipBuilder.file('service-worker.js', serviceWorkerJs);
    zipBuilder.file('pwa.js', pwaJs);

    // Generates the zip file
    zipBuilder.generateAsync({
        type: 'blob'
    })
    .then((content) =>
    {
        let blobUrl = window.URL.createObjectURL(content);

        let dl = document.querySelector('#dl');
        dl.setAttribute('href', blobUrl);
        dl.setAttribute('download', title);

        // Triggers the save modal
        dl.click();
        window.URL.revokeObjectURL(blobUrl);
    });
}

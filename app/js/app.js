
'use strict';

let title = 'PWA Playlist Generator';
let audioTree = '';
let iconImg = '';

let zipBuilder = new JSZip();

// On DOM Content Loaded
document.addEventListener('DOMContentLoaded', () =>
{
    // Materialize Select
    M.FormSelect.init(document.querySelector('select'), { /* options */ });
});

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

    // Default application title is the root folder name
    title = filesTree.keys().next().value;;
    document.querySelector('#input-pwa-title').value = title;
    // Triggers the input animation (materialize)
    document.querySelector('label[for="input-pwa-title"]').classList += 'active';

    return filesTree;
}

// Value incremented for each audio file
let audioFileID = 1;

//
function folderRecursiveBuild(currentFolder, zipParentFolder = zipBuilder, titleLevel = 1)
{
   let htmlTree = '';

    for (let [name, value] of currentFolder)
    {
        // Audio file
        //FIXME: to improve ; a folder with a dot in its name will cause trouble
        if (name.includes('.'))
        {
            zipParentFolder.file(name, value);

            // File name without extension
            let title = name.split('.').slice(0, -1).join('.');

            htmlTree += '<li href="' + value.webkitRelativePath + '"><a href="' + value.webkitRelativePath + '" class="audio-src" data-id="' + audioFileID + '" data-title="' + title + '">' + value.name + '</a><a href="#" class="cache-audio">Cache</a><a href="#" class="download-audio">Download</a></li>';

            ++audioFileID;
        }
        // Folder
        else
        {
            let folderTitle = titleLevel === 1 ? ''
                : '<h' + titleLevel + '>' + name + '</h' + titleLevel + '>';
            htmlTree += '<ul>' + folderTitle;
            htmlTree += '<a href="#" class="cache-folder">Cache</a><a href="#" class="download-folder">Download</a>';
            htmlTree += folderRecursiveBuild(value, zipParentFolder.folder(name), titleLevel + 1);
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

function getAudioHref(element)
{
    return element.parentElement.getAttribute('href');
}

function cacheAudioFile(href)
{
    // Caches the audio file for offline listening
    if (href)
    {
        caches.open('audio-cache').then((cache) =>
        {
            fetch(href)
                .then((response) =>
                {
                    return response;
                })
                .then((file) =>
                {
                    cache.add(file.url);
                    console.log('File cached !');
                })
                .catch(() =>
                {
                    alert('Error while caching file: ' + href);
                });
        });
    }
    else
    {
        sourceError(href);
    }
}

function downloadAudioFile(href)
{
    if (href)
    {
        fetch(href)
            .then((resp) =>
            {
                return resp.blob();
            })
            .then((blob) =>
            {
                triggerDownload(blob, href);
                console.log('File downloaded !');
            })
            .catch(() =>
            {
                alert('Error while downloading file: ' + href);
            });
    }
    else
    {
        sourceError(href);
    }
}

function recursiveFiles(parent)
{
    for (let child of parent.children)
    {
        let tagName = child.tagName;

        if (tagName === 'UL')
        {
            recursiveFiles(child);
        }
        else if (tagName === 'LI')
        {
            console.log(child);
        }
    }
}

function triggerDownload(file, href)
{
    const url = window.URL.createObjectURL(file);
    const a = document.createElement('a');

    a.classList += 'tmp-download';
    a.style.display = 'none';
    a.href = url;
    a.download = href.split('/').pop();
    document.body.appendChild(a);

    a.click();
    window.URL.revokeObjectURL(url);

    document.body.removeChild(a);
}

function sourceError(href)
{
    alert('No source for this audio file: ' + href);
}

// Click on download audio file
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-audio'))
    {
        evt.preventDefault();

        let href = getAudioHref(evt.target);

        cacheAudioFile(href);
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('download-audio'))
    {
        evt.preventDefault();

        let href = getAudioHref(evt.target);

        downloadAudioFile(href);
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-folder'))
    {
        evt.preventDefault();

        recursiveFiles(evt.target.parentElement);
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('download-folder'))
    {
        evt.preventDefault();

        console.log(evt.target);
    }
});

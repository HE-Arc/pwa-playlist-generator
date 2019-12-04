
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

            // Filename without extension
            //let title = name.split('.').slice(0, -1).join('.');
            let title = filenameWithoutPath(name, false);

            htmlTree += '<li href="' + value.webkitRelativePath + '"><a href="' + value.webkitRelativePath + '" class="audio-src" data-id="' + audioFileID + '" data-title="' + title + '">' + value.name + '</a><a href="#" class="cache-audio">Cache</a><a href="#" class="download-audio">Download</a></li>';

            ++audioFileID;
        }
        // Folder
        else
        {
            let folderTitle = titleLevel === 1 ? ''
                : '<h' + titleLevel + '>' + name + '</h' + titleLevel + '>';
            htmlTree += '<ul data-name="' + name + '">' + folderTitle;
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
        type: 'blob',
    })
    .then((blob) =>
    {
        triggerDownload(title, blob);
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
                    console.log('File cached: ' + href);
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

function downloadAudioFile(href, callback)
{
    if (href)
    {
        return fetch(href)
            .then((resp) =>
            {
                return resp.blob();
            })
            .then((blob) =>
            {
                console.log('File downloaded: ' + href);
                callback(blob);
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

function recursiveCache(parentUL)
{
    for (let child of parentUL.children)
    {
        let tagName = child.tagName;

        if (tagName === 'UL')
        {
            recursiveCache(child);
        }
        else if (tagName === 'LI')
        {
            let href = child.getAttribute('href');
            cacheAudioFile(href);
        }
    }
}

function recursiveDownload(parentUL, parentZip, promises)
{
    let name = parentUL.getAttribute('data-name');
    console.log(name);
    let folderZip = parentZip.folder(name);

    for (let child of parentUL.children)
    {
        let tagName = child.tagName;

        if (tagName === 'UL')
        {
            recursiveDownload(child, folderZip, promises);
        }
        else if (tagName === 'LI')
        {
            let href = child.getAttribute('href');

            let promise = downloadAudioFile(href, (blob) =>
            {
                let filename = filenameWithoutPath(href, true);
                console.log('filename', filename);

                //parentZip.file(href, blob);
                folderZip.file(href, blob);
            });

            promises.push(promise);
        }
    }
}

// Triggers a download dialog for the given file
function triggerDownload(filename, fileData)
{
    const url = window.URL.createObjectURL(fileData);
    const a = document.createElement('a');

    a.classList += 'tmp-download';
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    a.click();
    window.URL.revokeObjectURL(url);

    document.body.removeChild(a);
}

// Alert if the file is not found
function sourceError(href)
{
    alert('No source for this audio file: ' + href);
}

// Returns the filename without its path (with/out the extension)
function filenameWithoutPath(filename, ext = false)
{
    let withoutPath = filename.split('/').pop();

    if (ext)
    {
        return withoutPath;
    }

    return withoutPath.split('.').slice(0, -1).join('.');
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

        downloadAudioFile(href, (blob) =>
        {
            let filename = filenameWithoutPath(href, true);

            triggerDownload(filename, blob);
        });
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-folder'))
    {
        evt.preventDefault();

        recursiveCache(evt.target.parentElement);
    }
});

document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('download-folder'))
    {
        evt.preventDefault();

        let parentUL = evt.target.parentElement;
        let downloadZip = new JSZip();
        let promises = [];

        recursiveDownload(parentUL, downloadZip, promises);

        Promise.all(promises)
            .then(() =>
            {
                console.log(downloadZip);

                downloadZip.generateAsync({
                    type: 'blob',
                })
                .then((blob) =>
                {
                    console.log('trigger dl');
                    triggerDownload('Widdles', blob);
                });
            })
            .catch((error) =>
            {
                console.log(error);
            });
    }
});

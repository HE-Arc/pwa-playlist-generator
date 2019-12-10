
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
    audioFileID = 1;
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

    generatePWAZip(dataHtml, dataManifest);
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
let audioFileID;

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

function downloadFileAndZip(href, zipFolder, promises)
{
    let promise = downloadFile(href, (blob) =>
    {
        let filename = filenameWithoutPath(href, true);
        zipFolder.file(filename, blob);
    });

    promises.push(promise);
}

function downloadFromArrayAndZip(files, zipFolder, promises)
{
    for (let href of files)
    {
        downloadFileAndZip(href, zipFolder, promises);
    }
}

// Generates the PWA in a zip file
function generatePWAZip(dataHtml, dataManifest)
{
    // Application folders
    let cssFolder = zipBuilder.folder('css');
    let jsFolder = zipBuilder.folder('js');

    // Files from templates
    let html = template_html(dataHtml);
    let manifest = template_manifest(dataManifest);

    // Files to download
    let promises = [];

    let cssFilesToDownload = [
        //'css/app.css',
    ];

    let jsFilesToDownload = [
        //'js/service-worker.js',
        //'js/pwa.js',
        'js/audio.js',
        'js/jszip.js',
    ];

    // Files into root folder
    zipBuilder.file('index.html', html);
    zipBuilder.file('manifest.json', manifest);
    zipBuilder.file('icon.png', iconImg, {base64: true});

    // FIXME: issue #17
    downloadFileAndZip('service-worker.js', zipBuilder, promises);
    downloadFileAndZip('pwa.js', zipBuilder, promises);

    downloadFromArrayAndZip(cssFilesToDownload, cssFolder, promises);
    downloadFromArrayAndZip(jsFilesToDownload, jsFolder, promises);

    // Waits for each audio file to download
    Promise.all(promises)
        .then(() =>
        {
            // Generates the zip file
            zipBuilder.generateAsync({
                type: 'blob',
            })
            .then((blob) =>
            {
                // Triggers the download
                triggerDownload(title, blob);
            });
        })
        .catch((error) =>
        {
            alert('[Recursive Download Error]', error);
        });
}

// Returns the filename without its path and with/out the extension
function filenameWithoutPath(filename, ext = false)
{
    // Filename without path and with extension
    let withoutPath = filename.split('/').pop();

    if (ext)
    {
        return withoutPath;
    }

    // Filename without path and without extension
    return withoutPath.split('.').slice(0, -1).join('.');
}

// Returns the element URL
function getAudioHref(element)
{
    return element.parentElement.getAttribute('href');
}

// Fetches the audio file associated to the URL and then caches it
function cacheAudioFile(href)
{
    // Caches the audio file for offline listening
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

// Downloads the audio file corresponding to the URL and then calls the callback
// Returns a Promise (so that it is possible to wait for the download to complete)
function downloadFile(href, callback)
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

// Recursively fetches and caches the parentUL content
function recursiveCache(parentUL)
{
    // Iterates over the folder content
    for (let child of parentUL.children)
    {
        let tagName = child.tagName;

        // UL: recursive call
        if (tagName === 'UL')
        {
            recursiveCache(child);
        }
        // LI: fetches and then caches the associated audio file
        else if (tagName === 'LI')
        {
            // Audio file URL
            let href = child.getAttribute('href');
            cacheAudioFile(href);
        }
    }
}

// Recursively downloads the parentUL content and adds it to the zip
function recursiveDownload(parentUL, parentZip, promises)
{
    // Current zip folder
    let name = parentUL.getAttribute('data-name');
    let folderZip = parentZip.folder(name);

    // Iterates over the folder content
    for (let child of parentUL.children)
    {
        let tagName = child.tagName;

        // UL: recursive call
        if (tagName === 'UL')
        {
            recursiveDownload(child, folderZip, promises);
        }
        // LI: downloads the associated audio file
        else if (tagName === 'LI')
        {
            // Audio file URL
            let href = child.getAttribute('href');

            // Fetches the audio file
            let promise = downloadFile(href, (blob) =>
            {
                // Adds the audio file to the zip (current folder)
                let filename = filenameWithoutPath(href, true);
                folderZip.file(filename, blob);
            });

            // Used to wait for each download to complete
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

    // Triggers the download
    a.click();
    window.URL.revokeObjectURL(url);

    // Removes the a tag from the DOM
    document.body.removeChild(a);
}

// Click on cache-audio
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-audio'))
    {
        evt.preventDefault();

        // The audio file URL
        let href = getAudioHref(evt.target);

        // Fetches and then caches the audio file
        cacheAudioFile(href);
    }
});

// Click on download-audio
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('download-audio'))
    {
        evt.preventDefault();

        // The audio file URL
        let href = getAudioHref(evt.target);

        // Fetches the audio file
        downloadFile(href, (blob) =>
        {
            // Triggers the download
            let filename = filenameWithoutPath(href, true);
            triggerDownload(filename, blob);
        });
    }
});

// Click on cache-folder
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-folder'))
    {
        evt.preventDefault();

        // Recursively caches the folder audio files
        recursiveCache(evt.target.parentElement);
    }
});

// Click on folder-download
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('download-folder'))
    {
        evt.preventDefault();

        let parentUL = evt.target.parentElement;
        let downloadZip = new JSZip();
        let promises = [];

        // Recursively downloads the folder audio files and builds a zip file
        recursiveDownload(parentUL, downloadZip, promises);

        // Waits for each audio file to download
        Promise.all(promises)
            .then(() =>
            {
                // Generates the zip file
                downloadZip.generateAsync({
                    type: 'blob',
                })
                .then((blob) =>
                {
                    // Triggers the download
                    let zipName = parentUL.getAttribute('data-name');
                    triggerDownload(zipName, blob);
                });
            })
            .catch((error) =>
            {
                alert('[Recursive Download Error]', error);
            });
    }
});


'use strict';

let title = 'PWA Playlist Generator';
let shortname = 'Generator';
let description = 'Powered by PWA Playlist Generator';
let audioTree = '';
//let iconImg = '';
let icon192 = '';
let icon512 = '';

let theme = 'theme_none';
const THEME_ASSETS = {
    theme_none: {
        css: [
            // No CSS
        ],
        js: [
            'js/pwa-audio.js',
            'js/jszip.js',
            'js/common.js',
        ],
    },
    theme_materialize_light: {
        css: [
            'css/materialize.min.css',
            'css/theme_materialize_light.css',
        ],
        js: [
            'js/pwa-audio.js',
            'js/jszip.js',
            'js/common.js',
            'js/materialize.min.js',
        ],
    },
    theme_materialize_dark: {
        css: [
            'css/materialize.min.css',
            'css/theme_materialize_dark.css',
        ],
        js: [
            'js/pwa-audio.js',
            'js/jszip.js',
            'js/common.js',
            'js/materialize.min.js',
        ],
    },
};

let zipBuilder = new JSZip();

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
                if (! currentFolder.has(fileParents[f]))
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
            let title = filenameWithoutPath(name, false);
            let webkitRelativePath = value.webkitRelativePath;

            htmlTree += theme_none_tree_file(name, title, webkitRelativePath, audioFileID);

            ++audioFileID;
        }
        // Folder
        else
        {
            let folderTitle = `<h${titleLevel} class="audio-folder-title">${name}</h${titleLevel}>`;
            let folderContent = folderRecursiveBuild(value, zipParentFolder.folder(name), titleLevel + 1);

            htmlTree += theme_none_tree_folder(name, folderTitle, folderContent, titleLevel);
        }
    }

    return htmlTree;
}

// Fetches a file and then adds it to the zip folder
function downloadFileAndZip(href, zipFolder, promises)
{
    let promise = downloadFile(href, (blob) =>
    {
        let filename = filenameWithoutPath(href, true);
        zipFolder.file(filename, blob);
    });

    // Waits for the download to complete (in later step)
    promises.push(promise);
}

// Fetches all the files from the array and adds them to the zip folder
function downloadFromArrayAndZip(files, zipFolder, promises)
{
    // Iterates over the files URLs to fetch
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
    let imgFolder = zipBuilder.folder('images');
    let iconFolder = imgFolder.folder('icons');

    // Files from templates
    let html = window[theme](dataHtml);
    let manifest = template_manifest(dataManifest);

    // Files to download
    let promises = [];

    // Files into root folder
    zipBuilder.file('index.html', html);
    zipBuilder.file('manifest.json', manifest);

    //FIXME: CORRECT PATH
    //zipBuilder.file('icon.png', iconImg, {base64: true});
    iconFolder.file('icon-192x192.png', icon192, { base64: true });
    iconFolder.file('icon-512x512.png', icon512, { base64: true });

    downloadFileAndZip('service-worker.js', zipBuilder, promises);
    downloadFileAndZip('pwa.js', zipBuilder, promises);

    downloadFromArrayAndZip(THEME_ASSETS[theme]['css'], cssFolder, promises);
    downloadFromArrayAndZip(THEME_ASSETS[theme]['js'], jsFolder, promises);

    // Waits for each file to download
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

// On DOM Content Loaded
document.addEventListener('DOMContentLoaded', () =>
{
    // Materialize Select
    const selectTheme = M.FormSelect.init(document.querySelector('select'), { /* options */ });

    // Theme select on change event
    selectTheme.el.addEventListener('change', (evt) =>
    {
        theme = evt.target.value;
    });
});

// Title input on change event
document.querySelector('#input-pwa-title').addEventListener('change', (evt) =>
{
    title = evt.target.value;
});

// Shortname input on change event
document.querySelector('#input-pwa-shortname').addEventListener('change', (evt) =>
{
    shortname = evt.target.value;
});

// Description input on change event
document.querySelector('#input-pwa-description').addEventListener('change', (evt) =>
{
    description = evt.target.value;
});

// Root folder input on change event
document.querySelector('#input-pwa-root-folder').addEventListener('change', (evt) =>
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

// Icon192 input on change event
document.querySelector('#input-icon192').addEventListener('change', (evt) =>
{
    icon192 = evt.target.files[0];
});

// Icon512 input on change event
document.querySelector('#input-icon512').addEventListener('change', (evt) =>
{
    icon512 = evt.target.files[0];
});

// Click on the Generate HTML button
document.querySelector('#btn-pwa-generate').addEventListener('click', (evt) =>
{
    evt.preventDefault();

    const dataHtml = {
        lang: 'en',     //FIXME
        description: description,
        title: title,
        audioTree: audioTree,
        theme_color: '#2F3BA2',         //FIXME
    };

    const dataManifest = {
        name: title,
        shortname: shortname,
        background_color: '#3E4EB8',    //FIXME
        theme_color: '#2F3BA2',         //FIXME
    };

    generatePWAZip(dataHtml, dataManifest);
});

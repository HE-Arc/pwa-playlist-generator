
'use strict';

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
    caches.open(AUDIO_CACHE_NAME).then((cache) =>
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

// Returns the first UL tag found from the element parents
function findParentUL(element)
{
	while (element.tagName !== 'UL')
	{
		element = element.parentElement;
	}

	return element;
}

// Recursively fetches and caches the parentUL content
function recursiveCache(parentUL)
{
    // Iterates over the folder content
    for (let child of parentUL.children)
    {
        // Folder: recursive call
        if (child.classList.contains('folder-subfolder'))
        {
            recursiveCache(child.children[0]);
        }
        // File: fetches and then caches the associated audio file
        else if (child.classList.contains('audio-file'))
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
        // Folder: recursive call
        if (child.classList.contains('folder-subfolder'))
        {
            recursiveDownload(child.children[0], folderZip, promises);
        }
        // File: downloads the associated audio file
        else if (child.classList.contains('audio-file'))
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
document.querySelectorAll('.cache-audio').forEach(el =>
{
	el.addEventListener('click', (evt) =>
	{
	    evt.preventDefault();

	    // The audio file URL
	    let href = getAudioHref(evt.currentTarget);

	    // Fetches and then caches the audio file
	    cacheAudioFile(href);
	});
});

// Click on download-audio
document.querySelectorAll('.download-audio').forEach(el =>
{
    el.addEventListener('click', (evt) =>
    {
        evt.preventDefault();

        // The audio file URL
        let href = getAudioHref(evt.currentTarget);

        // Fetches the audio file
        downloadFile(href, (blob) =>
        {
            // Triggers the download
            let filename = filenameWithoutPath(href, true);
            triggerDownload(filename, blob);
        });
    });
});

// Click on cache-folder
document.querySelectorAll('.cache-folder').forEach(el =>
{
    el.addEventListener('click', (evt) =>
    {
        evt.preventDefault();

        //Recursively caches the folder audio files
        recursiveCache(findParentUL(evt.currentTarget));
    });
});

// Click on folder-download
document.querySelectorAll('.download-folder').forEach(el =>
{
    el.addEventListener('click', (evt) =>
    {
        evt.preventDefault();

        let parentUL = findParentUL(evt.currentTarget)
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
    });
});

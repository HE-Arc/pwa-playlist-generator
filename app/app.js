
let title = 'Undefined Title';
let audioFiles = [];
let audioTree = '';
let iconImg = '';

// Title input
document.querySelector('input#input-title').addEventListener('input', (evt) =>
{
    title = evt.target.value;
});

// Directory input
document.querySelector('input#input-dir').addEventListener('change', (evt) =>
{
    let files = evt.target.files;

    // Iterates over each uploaded file
    for (let i = 0; i < files.length; i++)
    {
        // Filters the audio files
        if (files[i].type.includes('audio'))
        {
            let filename = files[i].name;
            let filepath = files[i].webkitRelativePath;
            let filedir = filepath.split('/').slice(0, -1).join('/');

            audioFiles.push(files[i]);

            audioTree += '<li><a href="audio/' + filepath + '" class="audio-src">' + filename + '</a><a href="audio/' + filepath + '" class="cache-audio">Download</a></li>';
        }
    }

    document.querySelector('#audio-files').innerHTML = audioTree;
});

// Icon input
document.querySelector('input#input-icon').addEventListener('change', (evt) =>
{
    iconImg = evt.target.files[0];
    let img = document.querySelector('#uploaded-icon');
    img.src = URL.createObjectURL(evt.target.files[0]);
});

// Click on the Generate HTML button
document.querySelector('#btn-generate-html').addEventListener('click', (evt) =>
{
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

function generateZip(dataHtml, dataManifest)
{
    let html = template_html(dataHtml);
    let appCss = template_css();
    let appJs = template_app_js();
    let pwaJs = template_pwa_js();
    let serviceWorkerJs = template_service_worker();
    let manifest = template_manifest(dataManifest);

    // zip file (root)
    let zip = new JSZip();
    zip.file('index.html', html);

    // css folder
    let css = zip.folder('css');
    css.file('app.css', appCss);

    // js folder
    let js = zip.folder('js');
    js.file('app.js', appJs);

    // PWA files
    zip.file('manifest.json', manifest);
    zip.file('icon.png', iconImg, {base64: true});
    //FIXME: Keep it that way ? Or in js dir with relative path ?
    zip.file('service-worker.js', serviceWorkerJs);
    zip.file('pwa.js', pwaJs);

    // Audio folder
    let audio = zip.folder('audio');
    // Audio files
    for (let i = 0; i < audioFiles.length; i++)
    {
        audio.file(audioFiles[i].name, audioFiles[i]);
    }

    // Generates the zip file
    zip.generateAsync({
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

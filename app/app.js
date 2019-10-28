
let title = 'Undefined Title';
let audioFiles = [];
let audioData = '';
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

    for (let i = 0; i < files.length; i++)
    {
        if (files[i].type.includes('audio'))
        {
            audioFiles.push(files[i]);
        }

        /*
        let filename = files[i].name;

        if (filename.split('.').pop() === 'wav')
        {
            let reader = new FileReader();
            reader.onload = (evt) =>
            {
                audioData += '<li><a href="#" class="audio-src" data-name="' + filename + '" data-audio="' + evt.target.result + '">' + filename + '</a></li>';
            }
            reader.readAsDataURL(files[i]);
        }
        */
    }
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
        //audioData: audioData
        audioData: {},  //FIXME
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
    let manifest = template_manifest(dataManifest);
    let serviceWorker = template_service_worker();

    var zip = new JSZip();
    zip.file('index.html', html);
    zip.file('manifest.json', manifest);
    zip.file('service-worker.js', serviceWorker);
    zip.file('icon.png', iconImg, {base64: true});

    // Audio files
    let audio = zip.folder('audio');
    for (let i = 0; i < audioFiles.length; i++)
    {
        audio.file(audioFiles[i].name, audioFiles[i]);
    }

    zip.generateAsync({
        type: 'blob'
    })
    .then((content) =>
    {
        let blobUrl = window.URL.createObjectURL(content);

        let dl = document.querySelector('#dl');
        dl.setAttribute('href', blobUrl);
        dl.setAttribute('download', title);

        dl.click();
        window.URL.revokeObjectURL(blobUrl);
    });
}

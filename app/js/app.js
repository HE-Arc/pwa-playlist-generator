
window.onload = () =>
{
    let title = 'Undefined Title';
    let audioData = '';

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
            let filename = files[i].name;

            if (filename.split('.').pop() === 'wav')
            {
                let reader = new FileReader();
                reader.onload = function(evt)
                {
                    audioData += '<li><a href="#" class="audio-src" data-name="' + filename + '" data-audio="' + evt.target.result + '">' + filename + '</a></li>';
                }
                reader.readAsDataURL(files[i]);
            }
        }
    });

    // Click on the Generate HTML button
    document.querySelector('#btn-generate-html').addEventListener('click', (evt) =>
    {
        const data = {
            title: title,
            audioData: audioData
        };

        generateHtml(data);
    });

    function generateHtml(data)
    {
        let html = template(data);

        let blob = new Blob([html], { type: 'text/html' });
        let blobUrl = window.URL.createObjectURL(blob);

        let dl = document.querySelector('#dl');
        dl.setAttribute('href', blobUrl);
        dl.setAttribute('download', title);

        dl.click();
        window.URL.revokeObjectURL(blobUrl);
    }
}

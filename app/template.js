
function template(data)
{
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <title>${data.title}</title>
        </head>
        <body>
            <div class="container">
                <h1 class="main-title">${data.title}</h1>
                <ul id="listing">${data.audioData}</ul>
                <audio id="audio-player" controls>
                    <source src="" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
            </div>

            <script>

            const $_audio = document.querySelector('#audio-player');

            // Click on a sound link --> plays it
            document.addEventListener('click', (event) =>
            {
                if (event.target && event.target.classList.contains('audio-src'))
                {
                    let filename = event.target.getAttribute('data-name');
                    let data = event.target.getAttribute('data-audio');

                    if (data)
                    {
                        $_audio.setAttribute('src', data);
                        $_audio.play();
                    }
                    else
                    {
                        alert('No data for this audio file : ' + filename);
                    }
                }
            });

            </script>

            <script>

            if ('serviceWorker' in navigator)
            {
                window.addEventListener('load', () =>
                {
                    navigator.serviceWorker.register('service-worker.js').then((registration) =>
                    {
                        console.log('Service worker registered:', registration);
                    },
                    (error) =>
                    {
                        console.log('Service worker registration failed:', error);
                    });
                });
            }
            else
            {
                console.log('Service workers are not supported.');
            }

            </script>

        </body>
    </html>
    `;
}

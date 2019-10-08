
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
                <ul id="listing">${data.audioList}</ul>
                <audio id="audio-player" controls>
                    <source src="" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
            </div>

            <script>

            console.log('WORKIIIING');

            const $_audio = document.querySelector('#audio-player');
            //const audioData = ${data.audioData};

            // Click on a sound link --> plays it
            document.addEventListener('click', (event) =>
            {
                if (event.target && event.target.classList.contains('audio-src'))
                {
                    let filename = event.target.getAttribute('data-audio');
                    //let data = audioData[filename];

                    console.log(filename);
                    //console.log(data);
                    /*
                    if (data)
                    {
                        $_audio.setAttribute('src', data);                    
                        $_audio.play();
                    }
                    else
                    {
                        alert('No data for this audio file : ' + filename);
                    }
                    */
                }
            });

            </script>

        </body>
    </html>
    `;
}

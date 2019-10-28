
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

// Install prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) =>
{
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    deferredPrompt.prompt()
    .then(res => console.log(res))
    .catch(error => console.log(error.message));
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) =>
    {
        if (choiceResult.outcome === 'accepted')
        {
            console.log('User accepted the A2HS prompt');
        }
        else
        {
            console.log('User dismissed the A2HS prompt');
        }

        deferredPrompt = null;
    });
});

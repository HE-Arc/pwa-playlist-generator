'use strict';

const $$ = {
    audioPlayer: document.querySelector('#audio-player'),
    audioTree: document.querySelector('#audio-tree'),
    audioFileRepeat: document.querySelector('#audio-repeat'),
};

// Audio player actions enum
const AudioPlayerActions = Object.freeze(
    {
        'NEXT': 0,
        'PREVIOUS': 1,
        'RANDOM_NEXT': 2,
        'RANDOM_PREVIOUS': 3,
    }
);

const PLAYER_REWIND_TIME = 3;

const TOTAL_AUDIO_FILES = $$.audioTree.getElementsByClassName('audio-src').length;
let isRandom = false;
let randomQueue = [];
let randomHistory = [];

let currentAudioFile = '';
let currentAudioFileRepeated = false;

// Returns the current audio file data-id
function getCurrentAudioFileId()
{
    return parseInt(currentAudioFile.getAttribute('data-id'));
}

// Sets the current audio file corresponding to the given id
function setNextAudioFileById(id)
{
    let nextAudioFile = $$.audioTree.querySelector('.audio-src[data-id="' + id + '"]');

    // There is a next audio file to play
    if (nextAudioFile !== null)
    {
        currentAudioFile = nextAudioFile;

        return true;
    }

    // No next audio file
    return false;
}

function displayCurrentAudioFile()
{
    let title = currentAudioFile.getAttribute('data-title');
    document.querySelector('#current-audio-file').innerHTML = title;
}

// Plays the next audio file based on the given audio player action
function playNextAudioFile(action)
{
    let canPlayNext = false;

    switch (action)
    {
        case AudioPlayerActions.NEXT:
            canPlayNext = setNextAudioFileById(getCurrentAudioFileId() + 1);
            break;
        case AudioPlayerActions.PREVIOUS:
            canPlayNext = setNextAudioFileById(getCurrentAudioFileId() - 1);
            break;
        case AudioPlayerActions.RANDOM_NEXT:
            canPlayNext = setNextAudioFileById(nextRandomId());
            break;
        case AudioPlayerActions.RANDOM_PREVIOUS:
            canPlayNext = setNextAudioFileById(previousRandomId());
            break;
        default:
            console.log('Not a valid action:', action);
            break;
    }

    // Plays the audio file
    if (canPlayNext)
    {
        playCurrentAudioFile();
    }
}

// Plays the current audio file
function playCurrentAudioFile()
{
    if (currentAudioFile)
    {
        displayCurrentAudioFile();

        $$.audioPlayer.setAttribute('src', currentAudioFile.getAttribute('href'));
        //FIXME: there could be download erros ; maybe use a promise to handle the case
        $$.audioPlayer.play();
    }
    //FIXME: no need for this block if using a promise
    else
    {
        alert('No source file for this audio file.');
    }
}

// Click on an audio file
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('audio-src'))
    {
        evt.preventDefault();

        // Plays the audio file
        currentAudioFile = evt.target;
        playCurrentAudioFile();
    }
});

// Click on next audio file
document.querySelector('#audio-next').addEventListener('click', (evt) =>
{
    if (isRandom)
    {
        playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
    }
    else
    {
        playNextAudioFile(AudioPlayerActions.NEXT);
    }
});

// Click on previous audio file
document.querySelector('#audio-previous').addEventListener('click', (evt) =>
{
    // Rewinds audio file
    if ($$.audioPlayer.currentTime > PLAYER_REWIND_TIME)
    {
        $$.audioPlayer.currentTime = 0;
    }
    // Plays previous audio file
    else
    {
        if (isRandom)
        {
            playNextAudioFile(AudioPlayerActions.RANDOM_PREVIOUS);
        }
        else
        {
            playNextAudioFile(AudioPlayerActions.PREVIOUS);
        }
    }
});

function initRandomQueue()
{
    isRandom = true;
    randomQueue = [];
    randomHistory = [];

    for (let i = 1; i <= TOTAL_AUDIO_FILES; i++)
    {
        randomQueue.push(i);
    }
}

function nextRandomId()
{
    if (randomQueue.length > 0)
    {
        // Interval: [0, randomQueue.length[
        let randomIndex = Math.floor(Math.random() * randomQueue.length);
        // Removes this ID from the randomQueue array
        // splice returns an array
        let randomId = randomQueue.splice(randomIndex, 1)[0];

        randomHistory.push(randomId);

        return randomId;
    }

    return false;
}

function previousRandomId()
{
    if (randomHistory.length > 0)
    {
        return randomHistory.pop();
    }

    return false;
}

document.querySelector('#audio-random').addEventListener('click', (evt) =>
{
    initRandomQueue();
    playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
});

// On ended audio player
$$.audioPlayer.addEventListener('ended', (evt) =>
{
    // Repeats the current audio file
    if ($$.audioFileRepeat.checked && !currentAudioFileRepeated)
    {
        currentAudioFileRepeated = true;
        $$.audioPlayer.currentTime = 0;
        $$.audioPlayer.play();
    }
    else
    {
        currentAudioFileRepeated = false;

        if (isRandom)
        {
            playNextAudioFile(AudioPlayerActions.RANDOM_NEXT);
        }
        else
        {
            playNextAudioFile(AudioPlayerActions.NEXT);
        }
    }
});

// Click on download audio file
document.addEventListener('click', (evt) =>
{
    if (evt.target && evt.target.classList.contains('cache-audio'))
    {
        evt.preventDefault();

        let audioFile = evt.target.getAttribute('href');

        // Caches the audio file for offline listening
        if (audioFile)
        {
            caches.open('audio-cache').then((cache) =>
            {
                fetch(audioFile).then((response) =>
                {
                    return response;
                }).then((file) =>
                {
                    cache.add(file.url);
                });
            });
        }
        else
        {
            alert('No source file for this audio file.');
        }
    }
});

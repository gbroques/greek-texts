import vttParser from './vttParser.js';

export default function loadText(path, root) {
    const configPromise = fetch(`${path}/config.json`)
        .then(r => r.json());

    const cuesPromise = configPromise
        .then(config => fetch(path + '/' + config.vtt))
        .then(r => r.text())
        .then(vttParser)
        .then(r => r.entries);
    
    return Promise.all([configPromise, cuesPromise]).then(([config, cues]) => {
        const {audio: audioSrc, img: image, markup, vocabulary} = config;
        const audio = createAudio(path + '/' + audioSrc);
        const highlightIdPrefix = 'highlight-';
        const cueById = groupCueById(cues);
        function render(parent, children) {
            children.forEach(child => {
                if (typeof child === 'string') {
                    const cue = cueById[child];
                    const span = createSpan(cue, highlightIdPrefix, audio);
                    parent.appendChild(span);
                    parent.appendChild(document.createTextNode(' '));
                } else {
                    const nextParent = document.createElement(child.type);
                    render(nextParent, child.children);
                    parent.appendChild(nextParent);
                }
            });
        };
        const img = document.createElement('img');
        img.src = path + '/' + image.src;
        img.alt = image.alt;
        root.appendChild(img);

        render(root, markup);

        const hr = document.createElement('hr');
        root.appendChild(hr);

        const vocabularyHeading = document.createElement('h1');
        vocabularyHeading.innerText = 'Λεξιλόγιο';
        root.appendChild(vocabularyHeading);
        const ul = document.createElement('ul');
        vocabulary.forEach(word => {
            const li = document.createElement('li');
            li.innerText = word.greek + ' - ' + word.english;
            ul.appendChild(li);
        });
        root.appendChild(ul);

        root.append(audio);
        let previouslyHighlightedElement = null;
        const addHighlight = element => element.classList.add('highlight');
        const removeHighlight = element => element.classList.remove('highlight');
        audio.addEventListener('timeupdate', () => {
            let didHighlightElement = false;
            cues.forEach(cue => {
                const currentTimeInMs = audio.currentTime * 1000;
                if (currentTimeInMs >= cue.from && currentTimeInMs <= cue.to) {
                    const nextHighlightedElement = document.getElementById(highlightIdPrefix + cue.id);
                    if (previouslyHighlightedElement && previouslyHighlightedElement !== nextHighlightedElement) {
                        removeHighlight(previouslyHighlightedElement);
                    }
                    addHighlight(nextHighlightedElement);
                    previouslyHighlightedElement = nextHighlightedElement;
                    didHighlightElement = true;
                }
            });
            if (!didHighlightElement && previouslyHighlightedElement) {
                removeHighlight(previouslyHighlightedElement);
            }
            didHighlightElement = false;
        });
    });
}

function groupCueById(cues) {
    return cues.reduce((acc, cue) => ({[cue.id]: cue, ...acc}), {});
}

function createAudio(src) {
    const audio = document.createElement('audio');
    audio.src = src;
    audio.innerHTML = 'Your browser does not support the <code>audio</code> element.';
    audio.controls = true;
    return audio;
}

function createSpan(cue, idPrefix, audio) {
    const span = document.createElement('span');
    span.innerText = cue.text;
    span.id = idPrefix + cue.id;
    span.onclick = () => {
        audio.currentTime = cue.from / 1000;
    };
    return span;
}

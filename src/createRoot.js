import vttParser from './vttParser.js';

export default function createRoot(root) {
    const audio = createAudio();
    const highlightIdPrefix = 'highlight-';
    const article = document.createElement('article');
    const hr = document.createElement('hr');
    const vocabularyHeading = document.createElement('h1');
    vocabularyHeading.innerText = 'Λεξιλόγιο';
    const ul = document.createElement('ul');
    let handleTimeupdate = null;
    const appendToRoot = () => {
        const nodes = [article, hr, vocabularyHeading, ul, audio];
        nodes.forEach(child => {
            if (!root.contains(child)) {
                root.appendChild(child);
            }
        });
    };

    return {
        renderText: (path) => {
            const configPromise = fetchConfig(path);
            const cuesPromise = fetchCues(configPromise, path);
            return Promise.all([configPromise, cuesPromise]).then(([config, cues]) => {
                const {audio: audioSrc, img: image, markup, vocabulary} = config;
                article.innerHTML = '';
                audio.src = path + '/' + audioSrc;
                const img = document.createElement('img');
                img.src = path + '/' + image.src;
                img.alt = image.alt;
                article.appendChild(img);

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
                render(article, markup);

                createVocabularlyList(vocabulary, ul);

                let previouslyHighlightedElement = null;
                const addHighlight = element => element.classList.add('highlight');
                const removeHighlight = element => element.classList.remove('highlight');
                if (handleTimeupdate) {
                    audio.removeEventListener('timeupdate', handleTimeupdate);
                }
                handleTimeupdate = () => {
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
                };
                audio.addEventListener('timeupdate', handleTimeupdate);
            }).then(appendToRoot);
        }
    };
}

function fetchConfig(path) {
    return fetch(`${path}/config.json`)
        .then(r => r.json());
}

function fetchCues(configPromise, path) {
    return configPromise
        .then(config => fetch(path + '/' + config.vtt))
        .then(r => r.text())
        .then(vttParser)
        .then(r => r.entries);
}

function groupCueById(cues) {
    return cues.reduce((acc, cue) => ({[cue.id]: cue, ...acc}), {});
}

function createAudio() {
    const audio = document.createElement('audio');
    audio.innerHTML = 'Your browser does not support the <code>audio</code> element.';
    audio.controls = true;
    return audio;
}

function createVocabularlyList(vocabulary, ul) {
    ul.innerHTML = '';
    vocabulary.forEach(word => {
        const li = document.createElement('li');
        li.innerText = word.greek + ' - ' + word.english;
        ul.appendChild(li);
    });
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

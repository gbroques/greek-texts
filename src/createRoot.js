import vttParser from './vttParser.js';

const fetchConfigWithCaching = withCaching(fetchConfig);
const fetchCuesWithCaching = withCaching(fetchCues);

export default function createRoot(root) {
    const audio = createAudio();
    const highlightIdPrefix = 'highlight-';
    const article = document.createElement('section');
    const hr = document.createElement('hr');
    const vocabularySection = document.createElement('section');
    const vocabularyHeading = document.createElement('h1');
    vocabularyHeading.innerText = 'Λεξιλόγιο';
    vocabularySection.appendChild(vocabularyHeading);
    const ul = document.createElement('ul');
    vocabularySection.appendChild(ul);
    let handleTimeupdate = null;
    const appendToRoot = () => {
        const nodes = [article, hr, vocabularySection, audio];
        nodes.forEach(child => {
            if (!root.contains(child)) {
                root.appendChild(child);
            }
        });
    };

    return {
        renderText: (path) => {
            const configPromise = fetchConfigWithCaching(path);
            const cuesPromise = configPromise
                .then(config => fetchCuesWithCaching(path + '/' + config.vtt));
            return Promise.all([configPromise, cuesPromise]).then(([config, cues]) => {
                const {title, titleCueId, audio: audioSrc, img: image, markup, vocabulary} = config;
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
                            parent.innerText += child;
                        } else {
                            if (child.type === 'cue') {
                                const cue = cueById[child.id];
                                const span = createSpan(cue, highlightIdPrefix, audio);
                                parent.appendChild(span);
                                parent.appendChild(document.createTextNode(' '));
                            } else {
                                const nextParent = document.createElement(child.type);
                                render(nextParent, child.children);
                                parent.appendChild(nextParent);
                            }

                        }
                    });
                };
                const titleNode = createTitleNode(config);
                const markupWithTitle = [titleNode, ...markup];
                render(article, markupWithTitle);

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

function createTitleNode(config) {
    const type = 'h1';
    if (!config.titleCueId) {
        return {
            type,
            children: [
                config.title
            ]
        }
    } else {
        return {
            type,
            children: [
                {
                    type: "cue",
                    id: config.titleCueId
                }
            ]
        }
    };
}

function withCaching(fn) {
    const cache = {};
    return (key) => {
        if (cache[key]) {
            return Promise.resolve(cache[key]);
        } else {
            return fn(key).then(result => {
                cache[key] = result;
                return result;
            });
        }
    };
}

function fetchConfig(path) {
    return fetch(`${path}/config.json`)
        .then(r => r.json());
}

function fetchCues(vttPath) {
    return fetch(vttPath)
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

import vttParser from './vttParser.js';

const fetchConfigWithCaching = withCaching(fetchConfig);
const fetchCuesWithCaching = withCaching(fetchCues);

export default function createRoot(root) {
    const audio = createAudio();
    const highlightIdPrefix = 'highlight-';
    const article = document.createElement('section');
    const hr1 = document.createElement('hr');
    const vocabularySection = document.createElement('section');
    const vocabularyHeading = document.createElement('h1');
    vocabularyHeading.innerText = 'Λεξιλόγιο';
    vocabularySection.appendChild(vocabularyHeading);
    let handleTimeupdate = null;
    const hr2 = document.createElement('hr');
    const attributionSection = document.createElement('section');
    const attributionParagraph = document.createElement('p');
    attributionParagraph.className = 'space-between';
    attributionSection.appendChild(attributionParagraph);
    const appendToRoot = () => {
        const nodes = [article, hr1, vocabularySection, hr2, attributionSection, audio];
        nodes.forEach(child => {
            if (!root.contains(child)) {
                root.appendChild(child);
            }
        });
    };

    return {
        renderText: (path) => {
            const configPromise = fetchConfigWithCaching(path);
            const cuesPromise = fetchCuesWithCaching(path + '/transcript.vtt');
            return Promise.all([configPromise, cuesPromise]).then(([config, cues]) => {
                const {speaker, source} = config;
                const vocabulary = config.vocabulary ?? [];
                const image = config.img ?? {};
                const markup = config.markup ?? [];
                article.innerHTML = '';
                audio.src = path + '/audio.mp3';
                const cueById = groupCueById(cues);
                function render(parent, children) {
                    children.forEach(child => {
                        if (typeof child === 'string') {
                            parent.innerText += child;
                        } else {
                            const createCue = id => {
                                const cue = cueById[id];
                                if (cue) {
                                    const span = createSpan(cue, highlightIdPrefix, audio);
                                    parent.appendChild(span);
                                    parent.appendChild(document.createTextNode(' '));
                                }
                            };
                            if (child.type === 'cue') {
                                createCue(child.id);
                            } else if (child.type === 'cueRange') {
                                const {start, end} = child;
                                let i = parseInt(start);
                                while (i <= end) {
                                    createCue(i);
                                    i++;
                                }
                            } else {
                                const nextParent = document.createElement(child.type);
                                if (child.props) {
                                    Object.entries(child.props).forEach(([prop, value]) => {
                                        nextParent[prop] = value;
                                    });
                                }
                                render(nextParent, child.children);
                                parent.appendChild(nextParent);
                            }

                        }
                    });
                };
                const titleNode = createTitleNode(config);
                const imageNode = createImageNode(path + '/image.' + image.ext, image.alt);
                render(article, [titleNode, imageNode, ...markup]);

                createVocabularlyList(vocabulary, vocabularySection);

                const speakerSpan = document.createElement('span');
                speakerSpan.innerText = `Narrated by ${speaker}`;
                const sourceLink = document.createElement('a');
                sourceLink.href = source;
                sourceLink.target = '_blank';
                sourceLink.innerText = 'View on Τράπεζα Κειμένων';
                const attributionNodes = [speakerSpan, sourceLink];
                attributionParagraph.innerHTML = '';
                attributionNodes.forEach(node => {
                    attributionParagraph.appendChild(node);
                });

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
    const levelNode = {
        type: 'span',
        children: [
            config.level
        ],
        props: {
            className: config.level
        }
    };
    const type = 'h1';
    const props = {
        className: 'space-between',
    };
    if (!config.titleCueId) {
        return {
            type,
            props,
            children: [
                {
                    type: "span",
                    children: [
                        config.title
                    ]
                },
                levelNode
            ]
        }
    } else {
        return {
            type,
            props,
            children: [
                {
                    type: 'cue',
                    id: config.titleCueId
                },
                levelNode
            ]
        }
    };
}

function createImageNode(src, alt) {
    return {
        type: 'img',
        props: {
            src,
            alt
        },
        children: []
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

function createVocabularlyList(vocabulary, vocabularySection) {
    if (vocabularySection.children.length > 1) {
        vocabularySection.removeChild(vocabularySection.lastChild);
    }
    if (vocabulary.length) {
        const ul = document.createElement('ul');
        vocabulary.forEach(word => {
            const li = document.createElement('li');
            li.innerText = word.greek + ' - ' + word.english;
            ul.appendChild(li);
        });
        vocabularySection.appendChild(ul);
    } else {
        const p = document.createElement('p');
        p.innerHTML = 'No vocabularly for this text listed. Contribute some on <a target="_blank" href="https://github.com/gbroques/greek-texts">GitHub</a>.'
        vocabularySection.appendChild(p);
    }
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

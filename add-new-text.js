#!/usr/bin/env node
/**
 * Convenience script for adding a new text.
 *
 * This creates a directory in the root of the repository
 * matching the title of the text, and a minimal config.json
 * file in that directory based on the optional prompts.
 *
 * Requires Node.js to be installed.
 */
import { mkdir, writeFile } from 'node:fs'
import path from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

let title = '';
while (!title) {
  title = await rl.question('Title (required): ');
}
const source = await rl.question('Τράπεζα κειμένων URL (optional): ')
const imgExtension = await rl.question('Image Extension (optional): ')
const imgAttribution = await rl.question('Image URL (optional): ')
const level = await rl.question('Level (optional): ');
const speaker = await rl.question('Speaker (optional): ');

const numberOfVocabularyWordsAnswer = await rl.question('Number of vocabulary words (optional): ');
let numberOfVocabularyWords = parseInt(numberOfVocabularyWordsAnswer);
if (!numberOfVocabularyWords) {
    numberOfVocabularyWords = 1;
}

const handleError = err => { if (err) throw err };

mkdir(title, { recursive: true }, handleError);

const config = JSON.stringify({
  "title": title,
  "titleCueId": null,
  "speaker": speaker,
  "level": level,
  "source": source,
  "img": {
    "ext": imgExtension,
    "alt": title,
    "attribution": imgAttribution
  },
  "vocabulary": [...Array(numberOfVocabularyWords)].map(() => (
      {
        "source": "",
        "translation": ""
      }
  )),
  "markup": [
    {
      "type": "p",
      "children": [
        {
            "type": "cueRange",
            "start": "",
            "end": ""
        }
      ]
    }
  ]
}, null, 2);

writeFile(path.join(title, 'config.json'), config, 'utf8', handleError); 

console.log(`\nCreated ${title}/ directory with config.json\n`);
console.log('Next steps are to add an image, the audio.mp3, and transcript.vtt files to this directory.\n')
console.log('Lastly, add the text to the select element in index.html.\n')

rl.close();

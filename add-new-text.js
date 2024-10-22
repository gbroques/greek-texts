#!/usr/bin/env node
/**
 * Convenience script for adding a new text.
 *
 * This creates a directory in the root of the repository
 * matching the title of the text and, a minimal config.json
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
  "vtt": `${title}.vtt`,
  "audio": `${title}.mp3`,
  "speaker": speaker,
  "level": level,
  "source": source,
  "img": {
    "src": `${title}.jpg`,
    "alt": title,
    "attribution": ""
  },
  "vocabulary": [...Array(numberOfVocabularyWords)].map(() => (
      {
        "greek": "",
        "english": ""
      }
  )),
  "markup": [
    {
      "type": "p",
      "children": [
        {
            "type": "cue",
            "id": ""
        }
      ]
    }
  ]
}, null, 2);

writeFile(path.join(title, 'config.json'), config, 'utf8', handleError); 

console.log(`\nCreated ${title}/ directory with config.json\n`);
console.log('Next steps are to add an image, the mp3, and vtt files.\n')

rl.close();

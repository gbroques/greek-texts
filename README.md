# greek-texts

Collection of texts from [Tράπεζα κειμένων] with synced audio for learning Modern Greek.

Audio is from various contributors from the [Learning Greek Discord server](https://discord.gg/greek).

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/).

2. Install dependencies:

       npm install

## How to Run

1. Start web server:

       npm start

2. Navigate to the URL outputted by step #1 in your web browser of choice.

## How to Add a New Text

1. Decide on a text to add from the [Τράπεζα κειμένων Google Drive folder].
2. Find the text on [Tράπεζα κειμένων] (the URL may be used in step #3).
3. Run [`./add-new-text.js`](./add-new-text.js) and answer the prompts.
   This will create a directory for the new text in the root of this repository with a beginning `config.json` file.
4. Find a suitable image for the text by following instructions under [How to Add an Image](#how-to-add-an-image).
5. Create a `transcript.vtt` file by following instructions under [How to Make WebVTT From Audio](#how-to-make-webvtt-from-audio).


### How to Add an Image

To add an image for a text:

1. Search for an image with a creative commons license. For example, using [Google image search](https://www.google.com/search?q=dolphin&udm=2&tbs=sur:cl).
3. Include the extension of the image in `img.ext` within `config.json`.
2. Copy the link of the image and include it in `img.attribution` within `config.json`.
3. If the image is large, then consider shrinking it using a free online service such as [Image Resizer](https://imageresizer.com/).
4. Compress the image using a free online service such as [TinyJPG](https://tinyjpg.com/).
5. Save the image in the directory for the text with the name "image" and whatever extension is appropriate.

### How to Make [WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) from Audio

1. Download the audio for a text from the [Τράπεζα κειμένων Google Drive folder].
2. Download and install [Audacity](https://www.audacityteam.org/).
3. Open audio file in Audacity, and select [Label Sounds](https://manual.audacityteam.org/man/label_sounds.html) from the menu bar (Analyze -> Label Sounds...).
4. Experiment with settings to achieve a good result.
   * Set "Minimum silence duration" to 100 ms.
   * Experiment with Maximum leading silence and Minimum trailing silence. (For example, 200 ms maximum leading silence and 100 ms minimum trailing silence)
5. Update labels with corresponding text by copying text chunks from the page on [Tράπεζα κειμένων]. Adjust labels if desired or needed.
6. When happy with the result, export the labels as text (File > Export > Export Labels....).
7. Convert the exported labels to VTT by running:

       ./audacity-labels-to-vtt.js path/to/audacity/labels.txt > ./path/to/transcript.vtt

   For example:

       ./audacity-labels.to-vtt ./Τσιντιλά-audacity-labels.txt > ./Τσιντιλά/transcript.vtt

[Tράπεζα κειμένων]: https://www.greek-language.gr/certification/dbs/teachers/index.html
[Τράπεζα κειμένων Google Drive folder]: https://drive.google.com/drive/folders/1gxJgzlEunNgol6r6nW2M5GJiXV_RhB4n

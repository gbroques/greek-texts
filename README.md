# greek-texts

Collection of texts from [Tράπεζα κειμένων](https://www.greek-language.gr/certification/dbs/teachers/index.html) with synced audio for learning Modern Greek.

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

Run [./add-new-text.js](./add-new-text.js) and answer the prompts.

This will create a directory for the new text in the root of this repository with a beginning `config.json` file.

## How to Add an Image

To add an image for a text, follow the below steps:

1. Search for an image with a creative commons license. For example, using [Google image search](https://www.google.com/search?q=dolphin&udm=2&tbs=sur:cl).
2. Copy the link of the image and include it in `img.attribution` within `config.json`.
3. Compress the image using a free online service such as [TinyJPG](https://tinyjpg.com/).

## How to Make [WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API) from Audio

1. Download the audio for a text from the [Τράπεζα κειμένων Google Drive folder](https://drive.google.com/drive/folders/1gxJgzlEunNgol6r6nW2M5GJiXV_RhB4n).
2. Download and install [Audacity](https://www.audacityteam.org/).
3. Open audio file in Audacity, and select [Label Sounds](https://manual.audacityteam.org/man/label_sounds.html) from the menu bar (Analyze -> Label Sounds...).
4. Experiment with settings to achieve a good result.
   * Set "Minimum silence duration" to 100 ms.
   * Experiment with Maximum leading silence and Minimum trailing silence. (For example, 200 ms maximum leading silence and 100 ms minimum trailing silence)
5. Update labels with corresponding text. Adjust labels if desired or needed.
6. When happy with the result, export the labels as text (File > Export > Export Labels....).
7. Convert the exported labels to VTT by running:

       ./audacity-labels-to-vtt.js path/to/audacity/labels/txt/file > ./path/to/vtt/file

   For example:

       ./audacity-labels.to-vtt ./Τσιντιλά.txt > ./Τσιντιλά/Τσιντιλά.vtt

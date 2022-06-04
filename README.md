# greek-texts

Collection of texts from [Tράπεζα κειμένων](https://www.greek-language.gr/certification/dbs/teachers/index.html) with synced audio for learning Modern Greek.

## Prerequisites

1. Install [Node.js](https://nodejs.org/en/).

2. Install dependencies:

       npm install

## How to Run

1. Start web server:

       npm start

2. Navigate to the URL outputted by step #1 in your web browser of choice.

## How to Make VTT from Audio

1. Download the audio for a text from [here](https://drive.google.com/drive/folders/1gxJgzlEunNgol6r6nW2M5GJiXV_RhB4n).
2. Download and install [Audacity](https://www.audacityteam.org/).
3. Open audio file in Audacity, and select [Label Sounds](https://manual.audacityteam.org/man/label_sounds.html) from the menu bar (Analyze -> Label Sounds...).
4. Experiment with settings to achieve a good result.
   * Set "Minimum silence duration" to 100 ms.
   * Experiment with Maximum and Minimum leading silence. 
5. When happy with the result, export the labels as text (File > Export > Export Labels....).
6. Convert the exported labels to SRT [here](http://magcius.github.io/audaciter/).
7. Convert SRT to VTT [here](https://www.happyscribe.com/subtitle-tools/convert-srt-to-vtt).
8. Manually edit the VTT file to replace labels with text. This can be performed in an earlier step, such as before exporting the labels from Audacity if you want.

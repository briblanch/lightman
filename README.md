Lightman
## Installation

```bash
$ npm install lightman --save
```
## Overview
Lightman is a nodejs library that allows you perform any action when a certain note sequences are played in a song using a midi compatible keyboard. Often the actions are controlling lights, but it can do anything you can put your mind too.

## Usage
```js
let Lightman = require('lightman');

let songDir = __dirname + '/songs';

var app = Lightman.createApp(songDir);
app.start();
```

## Explanation
First off, there are three different parts to a song that Lightman needs to know about:

1. The overall song.
2. The different `elements` in a song, such as an intro, verse, chorus, bridge, etc.
3. The different `sequences` in an element, or the notes or chords that are played.

Sometimes is is just better to explain things by example, so for the sake of demonstration I am going to use the song `The Scientist` by Coldplay (one of my favorites to play) to demostrate how to take different elements and sequences in a song and build them using `Lightman`.

The Scientist consists of three different `elements`:

1. The `verse` (can group the intro into the verse because the chord progression is the same) which consists of the chords `Dm7`, `Bb`, `F`, and `Fsus2`. The `intro/verse` is repeated twice in the song, the chord `sequences` repeat 6 times within the `verse`, and the `chorus` is played after everytime the after `verse` finishes.
2. The `chorus` which consists of the chords `Bb`, `F`, and `Fsus2` and then on the second time through the `chorus`, the chord progression is the same but `C` is played after the `Fsus2`. The `chorus` is played twice in the song, the chord `sequences` are repeated twice within the `chorus`, and the `verse` is played again after the first time through the `chorus` and then the `bridge` is played after the second time through the `chorus`.
3. The `bridge` consists of the chords `Dm7` `Bb` and `F`. The `brigde` is played once throughout the song, the chord `sequences` are repeated 5 times withing the bridge, and nothing comes after the `bridge`.

A song object for `The Scientist` might look something like this:

```js
let notes = require('lightman').notes;

let theScientist = {
  name: 'The Scientist', // Name of the song
  hook: [notes.f4, notes.b4b, notes.c5], // The song hook. This is how lightman knows what song to play.
  startingElement: 'verse', // The starting element of the song, defaults to 'intro'
  backingTrack: __dirname + '/../backing_tracks/thescientist.mp3', // Absolute path to the backing track
  onCancel() { //
    // Perform some action if the song is cancelled
  },
  elements: { // Object of elements
    verse: {
      repeats: 6, // Number of times this element repeats. Either an int or an array of ints.
      nextElement: 'chorus', // The element after this one. Either a string or an array of strings.
      sequences: [
        {
          notes: [notes.c4, notes.f4, notes.a4], // Notes to recognize this sequence. Array of 'notes'.
          repeats: 1, // The number of times 'notes' has to be played before 'action' is called
          action(seqTimesPlayed, elTimesPlayed) { // Called when 'notes' are played 'repeat' number of times
            // seqTimesPlayed: How many times this sequence has been repeated within the element
            // elTimesPlayed: How many times this sequence has been played through
          },
        },
        {
          notes: [notes.c4, notes.f4, notes.g4]
        }
      ]
    },
    chorus: {
      repeats: 2, // The 'chorus` repeats twice.
      nextElement: ['verse', 'bridge'],
      sequences: [
        {
          notes: [notes.d4, notes.f4, notes.b4b],
          actionRepeats: 1,
          action(seqTimesPlayed, elTimesPlayed) {}
        },
        {
          notes: [[notes.c4, notes.f4, notes.g4], [notes.c4, notes.e4, notes.g4]],
          repeats: [1, 5],
          action(seqTimesPlayed, elTimesPlayed) {}
        }
      ],
      onEnd(timesPlayed) {
        // Called when the element is repeated 'repeats` times.
      }
    },
    bridge: {
      repeats: 3,
      nextElement: 'chorus',
      sequences: [
        {
          notes: [notes.c4, notes.f4, notes.a4],
          actionRepeats: 1, //
          action(seqTimesRepeated, elTimesRepeated) {}
        },
        {
          notes: [notes.d4, notes.f4, notes.b4b]
        },
        {
          notes: [[notes.c4, notes.f4, notes.a4], [notes.c4, notes.f4, notes.a4], [notes.c5]]
        }
      ],
      onEnd() {}
    }
  }
}

module.exports = theScientist;

```




## People

Developed and tested by Brian Blanchard

## License

  [MIT](LICENSE)

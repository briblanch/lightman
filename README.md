![logo](https://raw.githubusercontent.com/briblanch/lightman/master/lightman-logo.png)

## Installation

```bash
$ npm install @briblanch/lightman --save
```
## Overview
Lightman is a node js library that allows you perform any action when certain note sequences are played in a song using
a midi compatible device (keyboard, guitar, etc). Lightman is often used to control lights, but it can do anything you can put your mind to.

## Usage
```js
let Lightman = require('@briblanch/lightman');

let songDir = __dirname + '/songs';

var app = Lightman.createApp(songDir);
app.start();
```

## Explanation
First off, there are three different parts to a song that Lightman needs to know about:

1. The overall `Song`.
2. The different `Element`s in a song, such as an intro, verse, chorus, bridge, etc.
3. The different `Sequence`s in an element, or the notes or chords that are played.

Sometimes is is just better to explain things by example, so for the sake of demonstration I am going to use the song `The Scientist` by Coldplay (one of my favorites to play) to demonstrate how to take different elements and sequences in a song and build them using `Lightman`.

`The Scientist` consists of three different `elements`:

1. The `verse` (can group the intro into the verse because the chord progression is the same)
    - Consists of the chords `Dm7`, `Bb`, `F`, and `Fsus2`
    - Played twice throughout song
    - Chord `Sequence`s repeat 6 times within the `verse`
    - The `chorus` is played after the `verse`
2. The `chorus`
    - Consists of the chords `Bb`, `F`, and `Fsus2`. On the second time through the `chorus`the chord progression is the same but `C` is played after the `Fsus2`
    - Played twice in the song
    - Chord `sequences` are repeated twice within the `chorus`
    - The `verse` is played after the first time through the `chorus`, the `bridge` is played after the second time.
3. The `bridge`
    - Consists of the chords `Dm7`, `Bb`, and `F`
    - Played once throughout the song
    - Chord `sequences` are repeated 5 times withing the bridge
    - Nothing comes after the `bridge`

A song object for `The Scientist` might look something like this:

```js
let notes = require('@briblanch/lightman').notes;

let theScientist = {
  name: 'The Scientist', // Name of the song
  hook: [notes.f4, notes.b4b, notes.c5], // The song hook. This is how Lightman knows what song to play.
  startingElement: 'verse', // The starting element of the song, defaults to 'intro'
  backingTrack: __dirname + '/../backing_tracks/thescientist.mp3', // Absolute path to the backing track
  onCancel() { //
    // Perform some action if the song is cancelled
  },
  elements: { // Object of elements
    verse: {
      repeats: 6, // Number of times this element repeats. Either an int or an array of ints.
      nextElement: 'chorus', // The element after this one. Either a string or an array of strings.
      sequences: [ // Array of sequences in the order the chords are played
        {
          notes: [notes.c4, notes.f4, notes.a4], // Notes to recognize this sequence. Array of 'notes'.
          action(seqTimesPlayed, elTimesPlayed) { // Called when 'notes' are played 'repeat' number of times
            // seqTimesPlayed: How many times this sequence has been repeated within this played of the element
            // elTimesPlayed: How many times the element has been played through the whole song
            // This is where the magic happens. You can do anything you want when 'action' is called.
          },
        },
        {
          notes: [notes.c4, notes.f4, notes.g4] // Since this is the last sequence, repeat the element
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
          actionRepeats: 1, // Only call the 'action' function this many times
          action(seqTimesRepeated, elTimesRepeated) {}
        },
        {
          notes: [notes.d4, notes.f4, notes.b4b]
        },
        {
          notes: [[notes.c4, notes.f4, notes.a4], [notes.c4, notes.f4, notes.a4], [notes.c5]] //
        }
      ],
      onEnd() {}
    }
  }
}

module.exports = theScientist;

```

## Example
To see Lightman working in a complete application, checkout my other project [Lightshow](https://github.com/briblanch/lightshow)!

## Docs
### Lightman
#### `Modes`
- `CONFIG` - Lightman is waiting to be told what song to listen for. Listens for a three note riff corresponding to a `Song`s `hook` property.
   After 3 notes are hit and a song is not recognized, the `configNote` must be hit again to do attempt another recognition attempt.
- `SONG` - Lightman is currently tracking progress through a song.

**Note**: Lightman is launched in `CONFIG` mode

#### `notes`
```js
let notes = Lightman.notes;

...

{
    notes: [notes.c3, notes.f4s, notes.b4b]
}

...
```

Notes module to be used when building songs.
- Notes that end in `s` are sharp notes
- Notes that end in `b` are flat notes

#### `Lightman.createApp()`
```js
let app = Lightman.createApp(songsOrDir[, options]);
```
Creates an instance of Lightman
- `songsOrDir:<Array|String>` - Either an array of `Song` objects or the directory where all the song objects are.
- `Options:<Object>` - An object of options.
    - `configNote:<note>` - The note that puts Lightman in `CONFIG` mode. *Default*: `notes.c8`
    - `onConfig()` - The function that is called when the app is put into `CONFIG` mode.
    - `midiPort:<Int>`: The midi port to open. *Default*: `0`.
    - `testing<Boolean>`: When true, Lightman will open a virtual port instead of a hardware port. *Default*: `false`

#### `start()`
```js
app.start()
```
When called, Lightman will open the midi input port and listen for midi signals.

### Song
The overarching song object.
#### Properties
- `name:<String>` - The name of the song.
- `hook:<Array>` - The three note riff that identifies a song. Must be unique.
- `startingElement:<String>` - The starting element of a song. *Default*: `'intro'`.
- `backingTrack:<String>` - The absolute path to a backing track. Supports only `.mp3` files currently.
- `elements:<Object<Element>>`: An object of `Element`s.
- `onCancel()` - A function called when Lightman is put in `CONFIG` mode before a song completes. This is useful to stop any light intervals that are running, etc.


### Element
#### Properties
- `repeats:<Int|Array<Int>>` - An integer or array of integers that tells Lightman how many times to repeat the element. If it is an integer, Lightman will repeat the element that many times every time the element is played. If it is an array, Lightman will repeat the number of each index in the array in order. For example, `repeats: [2, 3]` would repeat 2 times the the first time the element is played and 3 times the second time the element is played.
- `nextElement:<String:Array<String>>` - The key or keys of element(s) to play after the current element is finished. If it is a String, Lightman will play the element specified every time after the current element finishes. If it is an array, Lightman will play the specified next elements in order every time the element is played. If the number of times the element has been played exceeds the length of the array, the song is over.
- `sequences:<Array<Sequence>>` - An array of `Sequence`s in order they are played throughout the parent element.
- `onEnd(timesPlayed)` - A function that is called when the element has finished playing.
    - `timesPlayed:<Int>` -  The number of times that element has been played. This is zero based so after the first time an         element has been played, `timesPlayed` will be `0`.

### Sequence
#### Properties
- `notes:<Array<Note>>` -  An array of notes that Lightman listens.
- `repeats:<Int|Array<Int>>` - An integer or array of integers that tells Lightman how many times `notes` must be repeated before the sequence is recognized. If it is an integer, Lightman will wait to recognized the sequence that many times every time the sequence is played. If it is an array, Lightman will wait to recognized the sequence until the value in the array, in order. For example, `repeats: [2, 3]` would wait to recognized the sequence till it has been played 2 times the first time the sequence is played and 3 times the second time the sequence is played.
- `action(seqTimesPlayed, elTimesPlayed)` - The function that is called when `notes` is recognized `repeats` times.
    - `seqTimesPlayed:<Int>` - The number of times the sequence has been repeated in the current playing of the parent element.
    - `elTimesPlayed:<Int>` - The number of times the parent element has been played throughout the whole song.
- `actionRepeats:<Int>` - The number of times `action` will be called. Useful if you only want `action` called the first time    a sequence is recognized.


## Contact

Developed and tested by Brian Blanchard
- Email: <briblanch@gmail.com>
- Twitter: [@briblanch](https://twitter.com/briblanch)
- GitHub: [briblanch](https://github.com/briblanch)

## License

  [MIT](LICENSE)

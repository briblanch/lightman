let notes = require('../../index').notes;

let theScientist = {
  name: 'The Scientist', // Name of the song
  hook: [notes.f4, notes.b4b, notes.c5], // The song hook. This is how lightman knows what song to play.
  startingElement: 'verse', // The starting element of the song, defaults to 'intro'
  elements: { // Object of elements
    verse: {
      repeats: [6, 4], // Number of times this element repeats. Either an int or an array of ints.
      nextElement: 'chorus', // The element after this one. Either a string or an array of strings.
      sequences: [
        {
          notes: [notes.c4, notes.f4, notes.a4], // Notes to recognize this sequence. Array of 'notes'.
          repeats: 1, // The number of times 'notes' has to be placed before 'action' is called
          action(seqTimesPlayed, elTimesPlayed) { // Called when 'notes' are played 'repeat' number of times
            switch (elTimesPlayed) {              // seqTimesPlayed: How many times this sequence has been repeated within the element
              case 1:                             // elTimesPlayed: How many times this sequence has been played through
                switch(seqTimesPlayed) {
                  case 1:
                    console.log('Black lights on');
                    break;
                  case 3:
                    console.log('Spot light on');
                    break;
                }
                break;
              case 2:
                switch(seqTimesPlayed) {
                  case 1:
                    console.log('All lights on');
                    break;
                }
                break;
            }
          },
        },
        {
          notes: [notes.c4, notes.f4, notes.g4]
        }
      ],
    },
    chorus: {
      repeats: 2,
      nextElement: ['verse', 'bridge'],
      sequences: [
        {
          notes: [notes.d4, notes.f4, notes.b4b],
          actionRepeats: 1,
          action(seqTimesPlayed, elTimesPlayed) {
            switch (elTimesPlayed) {
              case 1:
                console.log('Turning spot light blue and bed lights on to blue');
                break;
              case 3:
                console.log('All lights go off expect spotlight');
                break;
            }
          }
        },
        {
          notes: [[notes.c4, notes.f4, notes.g4], [notes.c4, notes.e4, notes.g4]],
          repeats: [1, 5],
          action(seqTimesPlayed, elTimesPlayed) {
            switch(elTimesPlayed) {
              case 2:
                console.log('turn all lights to white');
                break;
            }
          }
        }
      ]
    },
    bridge: {
      repeats: 2,
      nextElement: 'chorus',
      sequences: [
        {
          notes: [notes.f4]
        },
        {
          notes: [notes.b4b]
        },
        {
          notes: [[notes.c4], [notes.c5]]
        }
      ]
    }
  }
}

module.exports = theScientist;

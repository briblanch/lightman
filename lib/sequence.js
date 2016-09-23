'use strict';

let _        = require('lodash');
let log      = require('./log');
let stateful = require('./stateful');

const proto = {
  initialState: {
    recognized: false,
    noteBuffer: [],
    playCount: 0,
    recognizedCount: 0,
    fireAction: false
  },
  notes: [],
  noteThreshold: 150,
  actionRepeats: null,
  onNote(note, timestamp, timesRepeated, timesPlayed) {
    let self = this;
    let state = Object.assign({}, self.state);
		let noteBuffer = state.noteBuffer;
    let deleteIndex = 0;

		noteBuffer = [...noteBuffer, { note, timestamp }];

		for (let i = 0; i < noteBuffer.length; i++) {
			if ((timestamp - noteBuffer[i].timestamp) > this.noteThreshold) {
				deleteIndex++;
			}
		}

		noteBuffer.splice(0, deleteIndex);

    let notes;

    if (self.notes.length > 0 && Array.isArray(self.notes[0])) {
      notes = self.notes[timesRepeated];
    } else {
      notes = self.notes;
    }

    let justNotes = self.justNotes(noteBuffer);
		log.debug("Recieved", JSON.stringify(justNotes));

		let notesFound = self.contains(notes, justNotes);

		if (notesFound) {
			state.playCount++;

      noteBuffer = [];

      let repeats;

      if (Array.isArray(self.repeats) && self.repeats.length > 0) {
        repeats = self.repeats[timesRepeated];
      } else {
        repeats = self.repeats;
      }

			if (!repeats || state.playCount == repeats) {
				log.debug('Sequence recognized');

				if (typeof self.action === 'function') {
					if (!self.actionRepeats || self.actionRepeats > timesRepeated) {
						log.debug('Firing action')
						self.action(timesRepeated, timesPlayed);
					}
				}

				state.recognized = true;
			}
		}

    self.state = Object.assign({}, state, { noteBuffer });
  },
  justNotes(array) {
    let justNotes = [];
		for (var i = 0; i < array.length; i++) {
			justNotes.push(array[i].note);
		}

		return justNotes.sort();
  },
  contains(specifiedNotes, recievedNotes) {
    return _.isEqual(_.intersection(specifiedNotes.sort(), recievedNotes.sort()), specifiedNotes.sort());
  }
}

let sequence = function(config) {
  return Object.assign({}, stateful(proto), config);
};

module.exports = sequence;

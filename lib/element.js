'use strict';

let log      = require('./log');
let stateful = require('./stateful');

const proto = {
  timesPlayed: 0,
  initialState: {
    timesRepeated: 0,
    sequenceIndex: 0,
    complete: false
  },
  onNote(note, timestamp) {
    let self = this;
		let elementState = Object.assign({}, self.state);
		let currentSequence = self.sequences[elementState.sequenceIndex];

    let repeats;

    if (Array.isArray(self.repeats)) {
      repeats = self.repeats[self.timesPlayed];
    } else {
      repeats = self.repeats
    }

		currentSequence.onNote(note, timestamp, elementState.timesRepeated, self.timesPlayed);

		if (currentSequence.state.recognized) {
			currentSequence.resetState();

			if (elementState.sequenceIndex < self.sequences.length - 1) {
				elementState.sequenceIndex++;
			} else {
				log.debug('Repeating element');
				elementState.sequenceIndex = 0;
				elementState.timesRepeated++;
			}

			if (elementState.timesRepeated == repeats) {
				elementState.complete = true;

				if (self.onEnd) {
					self.onEnd(self.timesPlayed);
				}

				log.debug('Element complete');
			}
		} else {
      if (self.catchAll && elementState.sequenceIndex > 0) {
  			self.catchAll(currentSequence);
  		}
    }

    self.state = Object.assign({}, elementState)
  }
}

let element = function(config) {
  return Object.assign({}, stateful(proto), config);
};

module.exports = element;

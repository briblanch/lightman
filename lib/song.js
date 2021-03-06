'use strict';

let os       = require('os');
let exec     = require('child_process').exec;
let kill     = require('tree-kill');

let log      = require('./log');
let element  = require('./element');
let sequence = require('./sequence');
let stateful = require('./stateful');

const proto = {
  name: 'No Name',
  elements: {},
  startingElement: 'intro',
  backingTrackProcess: null,
  backingTrack: null,
  initialState: {
    complete: false,
    currentElement: null
  },
  startBackingTrack() {
    if (this.backingTrack) {
      log.debug('Starting backing track for', this.name);
      this.backingTrackProcess = exec('mpg123 ' + this.backingTrack, () => {});
    }
  },
  stopBackingTrack() {
    if (this.backingTrackProcess) {
      log.debug('Stopping backing track for', this.name);
      kill(this.backingTrackProcess.pid);
    }
  },
  onNote(note, timestamp) {
    let self = this;
		let songState = Object.assign({}, self.state);
    let currentElement = songState.currentElement;

		if (!currentElement) {
			currentElement = self.elements[self.startingElement];
		}

		if (currentElement) {
			currentElement.onNote(note, timestamp);
		} else {
      log.error('Could not find element. Make sure elements object matches nextElement definitions.');
      songState.complete = true;
      return;
    }

		if (currentElement.state.complete) {
      currentElement.resetState();

			let nextElementTitle;

			if (Array.isArray(currentElement.nextElement) && currentElement.timesPlayed < currentElement.nextElement.length) {
				nextElementTitle = currentElement.nextElement[currentElement.timesPlayed];
			} else {
				nextElementTitle = currentElement.nextElement;
			}

      currentElement.timesPlayed++;

			currentElement = self.elements[nextElementTitle];

      if (currentElement == null) {
        songState.complete = true;
        log.debug('Song complete');
      } else {
        log.debug('Now playing:', nextElementTitle);
      }
		}

    self.state = Object.assign({}, songState, { currentElement });
  }
}

let buildSong = function(song) {
  let elementsCopy = Object.assign({}, song.elements);

	for (let key in elementsCopy) {
		elementsCopy[key] = element(elementsCopy[key]);

    let sequencesCopy = [...elementsCopy[key].sequences]
    for (let i = 0; i < elementsCopy[key].sequences.length; i++) {
			 sequencesCopy[i] = sequence(sequencesCopy[i]);
		}

    elementsCopy[key].sequences = sequencesCopy;
	}

  song.elements = elementsCopy;
};

let song = function(config) {
  let newSong = Object.assign({}, stateful(proto), config);
  buildSong(newSong);

	return newSong;
}

module.exports = song;

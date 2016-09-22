'use strict';

let os       = require('os');
let exec     = require('child_process').exec;

let log      = require('./log');
let element  = require('./element');
let sequence = require('./sequence');
let stateful = require('./stateful');

const proto = {
  name: 'No Name',
  elements: {},
  startingElement: 'intro',
  backingTrack: null,  // Absolute path to backing track
  initialState: {
    complete: false,
    currentElement: null
  },
  startBackingTrack() {
    if (this.backingTrack) {
      let command;

      if (os.platform() == 'darwin') {
        command = 'afplay ' + this.backingTrack;
      } else if (os.platform() == 'linux') {
        command = 'mpg123 ' + this.backingTrack;
      }

      if (command) {
        log.debug('Starting backing track for', this.name);
        return exec(command, () => {});
      }
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

			if (currentElement.nextElement instanceof Array && currentElement.timesPlayed < currentElement.nextElement.length) {
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

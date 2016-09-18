'use strict';

let os       = require('os');
let exect    = require('shelljs').exec

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

      if (os.platform == 'darwin') {
        log.debug('Starting backing track for', this.name);
        command = 'afplay ' + this.backingTrack;
        return exec(command, {async: true});
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
        return;
      } else {
        log.debug('Now playing:', nextElementTitle);
      }
		}

    self.state = Object.assign({}, songState, { currentElement })
  }
}

let buildSong = function(song) {
  let songElements = song.elements;

	for (let key in songElements) {
		let currentElement = songElements[key];
		currentElement = element(currentElement);

		for (let i = 0; i < currentElement.sequences.length; i++) {
			 currentElement.sequences[i] = sequence(currentElement.sequences[i]);
		}

    song.elements[key] = currentElement;
	}
};

let song = function(config) {
  let song = Object.assign({}, stateful(proto), config);
  buildSong(song);

	return song
}

module.exports = song;

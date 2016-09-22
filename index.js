'use strict';

let _           = require('lodash');
let midi        = require('midi');
let process     = require('process');

let log         = require('./lib/log');
let notes       = require('./lib/notes');
let stateful    = require('./lib/stateful');
let songBuilder = require('./lib/song');


const HOOK_LENGTH = 3;
const MODE = {
  CONFIG: "CONFIG",
  SONG: "SONG",
};

let lightmanProto = {
  options: {
    midiPort: 0,
    configNote: notes.c8,
    testing: false,
    onConfig() {},
  },
  initialState: {
    currentSong: null,
    currentBackingTrack: null,
    noteBuffer: [],
    mode: MODE.CONFIG
  },
  input: null,
  output: null,
  songs: [],
  midiPollInterval: null,
  start() {
    let options = this.options;

    this.input = new midi.input();

    if (options.testing) {
      log.debug('Opening virtual port');
      this.input.openVirtualPort('Lightman virtual port');
      this.startListening();
    } else {
      this.pollForMidi();
    }
  },
  pollForMidi() {
    if (this.input.getPortCount()) {
      log.debug('Opening port', this.options.midiPort);
      this.input.openPort(this.options.midiPort);
      this.startListening();

      clearInterval(this.midiPollInterval);
    } else {
      log.debug('Waiting for midi connection');

      if (this.midiPollInterval == null) {
        this.midiPollInterval = setInterval(this.pollForMidi.bind(this), 5000);
      }
    }
  },
  startListening() {
    log.debug('Listening for midi messages')

    this.input.on('message', (deltaTime, message) => {
      if (message[0] == 144 && message[2] > 0) {
        var note = message[1];
        this.handleNote(note);
      }
    });
  },
  handleNote(note) {
    let state = this.state;
    let options = this.options;

    if (note == options.configNote) {
      log.debug('Entering config mode');

      if (options.onConfig) {
        options.onConfig();
      }

      if (state.currentBackingTrack) {
        state.currentBackingTrack.kill();
      }

      this.resetState();
      return;
    }

    if (state.mode == MODE.CONFIG) {
      state.noteBuffer = [...state.noteBuffer, note];

      if (state.noteBuffer.length == HOOK_LENGTH) {
        log.debug('recognizing hook');
        this.recognizedHook();

        if (state.currentSong != null) {
          state.mode = MODE.SONG;
          state.currentBackingTrack = state.currentSong.startBackingTrack();
        }
      }
    } else if (state.mode == MODE.SONG) {
      let currentSong = state.currentSong;

      if (currentSong && !currentSong.state.complete) {
        currentSong.onNote(note, Date.now());
      }
    }
  },
  recognizedHook() {
    let noteBuffer = this.state.noteBuffer;

    for (let song of this.songs) {
      if (_.isEqual(song.hook, noteBuffer)) {
        log.debug('Song recognized:', song.name);
        this.state.currentSong = songBuilder(song);
        return;
      }
    }

    log.debug('Song not recognized');
    return null;
  },
  loadSongsForDir(dir) {
    let songs = [];
    require('fs').readdirSync(dir).forEach((file) => {
      songs.push(require(dir + '/' + file));
    });

    return songs;
  }
}

let createApp = function(songsOrDir, options) {
  let app = Object.assign({}, stateful(lightmanProto));
  app.options = Object.assign({}, app.options, options);
  app.songs = songsOrDir instanceof Array ? songsOrDir : app.loadSongsForDir(songsOrDir);

  return app;
};

module.exports = {
  createApp,
  notes
};

'use strict';

let lightman = require('../index');
let notes    = lightman.notes;

let songsDir = __dirname + '/songs';

const options = {
  configNote: notes.c2,
  testing: true
};

let app = lightman.createApp(songsDir, options);

app.start();

'use strict';

let Lightman = require('../index');
let notes    = Lightman.notes;

let songsDir = __dirname + '/songs';

const options = {
  configNote: notes.c2,
  testing: true
};

let app = Lightman.createApp(songsDir, options);

app.start();

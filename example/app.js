'use strict';

let lightman = require('../index');
let notes    = lightman.notes;

let options = {
  testing: true,
  configNote: notes.c2
};

let songsDir = __dirname + '/songs';

let app = lightman.createApp(songsDir, options);
app.start();

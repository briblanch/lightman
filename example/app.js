'use strict';

let lightman = require('../index');
let notes    = lightman.notes;

let songsDir = __dirname + '/songs';

let app = lightman.createApp(songsDir);

app.start();

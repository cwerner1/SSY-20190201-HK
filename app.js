const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('./src/config');

// Load routes into variables
const index = require('./routes/index');
const alarm = require('./routes/alarm');
const histogram = require('./routes/histogram');
const log = require('./routes/log');
const broker = require('./routes/broker');
const routerForStreamLog = require('./routes/partition');

const app = express();

// Generic application setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Configure routes in Express webserver
app.use('/', index);
app.use('/alarm', alarm);
app.use('/histogram', histogram);
app.use('/log', log);
app.use('/broker', broker);

// Erzeugt Routen der Art: /instance/2/partition/3
for (let instance = 1; instance <= config.num_instances; instance++) {
    for (let partition = 1; partition <= config.num_partitions; partition++) {
        app.use('/instance/' + instance + '/partition/' + partition, routerForStreamLog(instance, partition));
    }
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404);
    res.send('Not found');
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.stack);
    res.send(err.stack);
});

module.exports = app;

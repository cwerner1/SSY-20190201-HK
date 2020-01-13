let express = require('express');
let Request = require('request');
let db = require('../src/database');
let config = require('../src/config');
let router = express.Router();

// Routen

router.get('/:nr', function (req, res, next) {
    let sensor = db.brokerCollection.findOne({nr: req.params.nr});
    res.json(sensor);
});

// Worker

// Falls Sie "globale" Variable für die Worker brauchen, dann müssen diese vor der Schleife definiert werden.
// Also hier...


let lastid = [];
let stats = {};


// Für jede Partition wird ein eigener Worker gestartet
for (let i = 1; i <= config.num_partitions; i++) {
    lastid[i] = 1;
    worker(i);

}

function worker(partition) {
    // Schreiben Sie Ihre Funktionalität für den Worker innerhalb dieser Funktion
    // Wiederkehrenden Aufruf müssen Sie selbst programmieren.

    let url = "http://127.0.0.1:3000/instance/1/partition/";
    let currentUrl = url + partition + "/" + lastid[partition] + '?worker';
    Request.get({
            url: currentUrl,
            json: true
        },

        function (cerror, cresponse, cbody) {
            if (cresponse.statusCode === 204) {
                setTimeout(function () {
                    worker(partition);
                }, 1000);
                return;
            }
            lastid[partition]++;

            let sensor = cresponse.body;
            let stats = db.brokerCollection.findOne({nr: sensor.nr});
            let newStats = false;
            if (stats === null) {
                newStats = true;
                stats = {nr: sensor.nr, count: 0, temp: null, avgTemp: null};
            }
            stats.count++;
            stats.temp += sensor.temperature;
            stats.avgTemp = stats.temp / stats.count;

            if (newStats) {
                db.brokerCollection.insert(stats);
            } else {
                db.brokerCollection.update(stats);
            }
            /* for (let i = 0; i < sensors.length; i++) {
                 let sensor = sensors[i];
                 db.brokerCollection.insert(sensor);
             }*/


            checkAlarm(sensor);
            checkSampling(stats.count, sensor);

            setTimeout(function () {
                worker(partition);
            }, 100);
        }
    )
    ;


}

function checkAlarm(sensor) {
    let alarmurl = "http://127.0.0.1:3000/alarm/" + sensor.nr;
    if (sensor.temperature > config.alarm_temperature) {
        let my_data = sensor;
        delete my_data.$loki;
        delete my_data.meta;
        Request.post({url: alarmurl, json: my_data});
    }
}

function checkSampling(count, sensor) {
    let histogramurl = "http://127.0.0.1:3000/histogram/" + sensor.nr;
    if ((count - 1) % config.histogram_sample_rate === 0) {
        let my_data = sensor;
        delete my_data.$loki;
        delete my_data.meta;
        Request.post({url: histogramurl, json: my_data});
    }
}

module.exports = router;

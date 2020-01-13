let express = require('express');
let db = require('../src/database');
let router = express.Router();

// Sehen Sie sich die Tests test2a_1() bis test2c() für das geforderte Datenformat an.

// Tipp: für Aufgabe 2b gibt es eine passende Datenbank-Funktion (kein "if" notwendig)

// Tipp: mit Math.floor() erhalten Sie eine passende Integer-Zahl als Index für das
// Histogramm-Array und können so die Anzahl der if-Abfragen auf 2 begrenzen.

router.post("/:nr", function (req, res, next) {

    let sensor = db.histogramCollection.findOne({nr: req.params.nr});
    let newEntry= false;
    if (sensor === null) {
        newEntry=true;
        sensor = {nr: req.params.nr, histogram: []};
        for (let i = 0; i < 12; i++) {
            sensor.histogram.push(0);
        }

    }

    let entry = Math.floor(req.body.temperature);
    if (entry < 0) {
        entry = 0
    }
    if (entry > 11) {
        entry = 11
    }

    sensor.histogram[entry]++;

    if (newEntry) {
        db.histogramCollection.insert(sensor);
    } else {
        db.histogramCollection.update(sensor);
    }

    res.json(sensor);
});

router.get("/:nr", function (req, res, next) {

    let sensor = db.histogramCollection.findOne({nr: req.params.nr});
    res.json(sensor);
});

router.get('/', function (req, res) {
    let sensors = db.histogramCollection.find();
    let result = [];
    for (let i = 0; i < sensors.length; i++) {
        let sensor = sensors[i];

        result.push({nr: sensor.nr, histogram: sensor.histogram})
    }
    res.json(result);
});



module.exports = router;

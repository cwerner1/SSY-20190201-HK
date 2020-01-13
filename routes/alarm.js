let express = require('express');
let db = require('../src/database');
let router = express.Router();

// Sehen Sie sich die Tests test1a() bis test1c() für das geforderte Datenformat an.
// Tipp: für Aufgabe 1b gibt es eine passende Datenbank-Funktion (kein "if" notwendig)

router.post('/:nr', function (req, res, next) {
    let sensor = db.alarmCollection.findOne({nr: req.params.nr});
    if (sensor == null) {
        sensor = {"nr": req.params.nr, "count": 0, "maxTemp": req.body.temperature}
    }
    sensor.count++;
    sensor.lastTemp = req.body.temperature;
    if (sensor.lastTemp > sensor.maxTemp) {
        sensor.maxTemp = sensor.lastTemp;
    }
    if (sensor.count == 1) {
        db.alarmCollection.insert(sensor);
    } else {
        db.alarmCollection.update(sensor);
    }

    res.json(true);
});

router.get('/:nr', function (req, res, next) {
    let sensor = db.alarmCollection.findOne({nr: req.params.nr});
    res.json(sensor);
});

router.get('/', function (req, res) {
    let sensors = db.alarmCollection.find();
    let result = [];
    for (let i = 0; i < sensors.length; i++) {
        let sensor = sensors[i];

        result.push({nr: sensor.nr, count: sensor.count, maxTemp: sensor.maxTemp, lastTemp: sensor.lastTemp})
    }
    res.json(result);
});


module.exports = router;

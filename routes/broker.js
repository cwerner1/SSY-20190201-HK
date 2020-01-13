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


// Für jede Partition wird ein eigener Worker gestartet
for (let i = 1; i <= config.num_partitions; i++) {
    worker(i);
}

function worker(partition) {
    // Schreiben Sie Ihre Funktionalität für den Worker innerhalb dieser Funktion
    // Wiederkehrenden Aufruf müssen Sie selbst programmieren.

    let url = "http://127.0.0.1:3000/instance/1/partition/";
    let currentUrl = url + partition;
    Request.get({
            url: currentUrl,
            timeout: 250,
        },
        function (cerror, cresponse, cbody) {
        if(cresponse.statusCode===204||cresponse.statusCode===404){
            return;
        }
            let sensors = JSON.parse(cresponse.body);
            for (let i = 0; i < sensors.length; i++) {
                let sensor = sensors[i];
                db.brokerCollection.insert(sensor);
            }

        });


    setTimeout(function () {
        worker(partition);
    }, 100);
}

module.exports = router;

let express = require('express');
let Request = require('request');
let db = require('../src/database');
let config = require('../src/config');

function routerForStreamLog(instance, partition) {
    let router = express.Router();

    // Schreiben Sie Ihre Funktionen innerhalb von routerForStreamLog(), also ab hier...

    router.post("/", function (req, res, next) {

        db.getPartitionCollection(instance, partition).insert(req.body);
        if (instance !== 1) {
            // Erste Instance gibt direkt das Ergebnis retour
            res.json(true);
        } else {
            // Alle Anderen Instance warten auf eine mindest anzahl an Commits
            let numResponses = 0;
            let responseSend = false;
            for (let i = 2; i <= config.num_instances; i++) {
                let currentUrl = "http://127.0.0.1:3000/instance/" + i + "/partition/" + partition + "/";
                let my_data = req.body;
                delete my_data.$loki;
                delete my_data.meta;
                Request.post({
                        url: currentUrl + "?replica",
                        json: my_data
                    },
                    function (cerror, cresponse, cbody) {
                        numResponses++;
                        if (!responseSend && numResponses >= config.num_replica_commits) {
                            res.json(true).end();
                            responseSend = true;
                        }
                    });
            }
        }

    });

    router.get("/:id", function (req, res, next) {
        let entry = db.getPartitionCollection(instance, partition).get(req.params.id);
        if (entry === null) {
            return res.status(204).end();
        }
        res.json(entry);
    });


    // ... bis hier

    return router;
}

/*
Hinweis für Aufgabe 6:
Falls Sie einen Fehler erhalten, der sagt, das Objekt sei bereits eingefügt und Sie sollen update() verwenden,
dann geben Sie unabsichtlich Datenbank-Metadaten an die nachfolgenden Instanzen weiter. In dem Fall fügen Sie
        delete my_data.$loki;
        delete my_data.meta;
vor den Request-Aufrufen ein (my_data ist jene Variable, die den weiterzuleitenden Inhalt enthält).
*/


module.exports = routerForStreamLog;

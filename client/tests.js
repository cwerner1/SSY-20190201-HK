/**
 * Damit die Tests funktionieren, müssen Sie genau das Request-Format einhalten.
 *
 * ACHTUNG:
 * Tests funktionieren nur nach Neustart der Applikation einwandfrei!
 */

const Request = require('request');
const config = require('../src/config');

let score = 0;
test1a();

///// Alarm-Service ////////////////////////////////////////////////////

function test1a() {
    Request.post({
        url: 'http://127.0.0.1:3000/alarm/a101',
        json: {
            "temperature": 8.25
        },
        timeout: 250
    }, testResponse("1a", 3, test1b_1,
        true    // JSON-Body
    ));
}

function test1b_1() {
    Request.get({
        url: 'http://127.0.0.1:3000/alarm/a101',
        json: true,
        timeout: 250
    }, testResponse("1b_1", 2, test1b_2,
        {
            "nr": "a101",
            "count": 1,
            "maxTemp": 8.25,
            "lastTemp": 8.25
        }
    ));
}

function test1b_2() {
    Request.get({
        url: 'http://127.0.0.1:3000/alarm/a112',
        json: true,
        timeout: 250
    }, testResponse("1b_2", 2, test1b_3,
        null    // JSON-Body
    ));
}

function test1b_3() {
    // zwei weitere Requests absetzen, um Logik zu prüfen
    Request.post({
        url: 'http://127.0.0.1:3000/alarm/a113',
        json: {"temperature": 10},
        timeout: 250
    }, () =>
    Request.post({
        url: 'http://127.0.0.1:3000/alarm/a113',
        json: {"temperature": 8},
        timeout: 250
    }, () =>
    // Test
    Request.get({
        url: 'http://127.0.0.1:3000/alarm/a113',
        json: true,
        timeout: 250
    }, testResponse("1b_3", 5, test1c,
        {
            "nr": "a113",
            "count": 2,
            "maxTemp": 10,
            "lastTemp": 8
        }
    ))));
}

function test1c() {
    Request.get({
        url: 'http://127.0.0.1:3000/alarm/',
        json: true,
        timeout: 250
    }, testResponse("1c", 3, test2a_1,
        [
            {
                "nr": "a113",
                "count": 2,
                "maxTemp": 10,
                "lastTemp": 8
            },
            {
                "nr": "a101",
                "count": 1,
                "maxTemp": 8.25,
                "lastTemp": 8.25
            }
        ]
    ));
}


///// Histogramm-Service ///////////////////////////////////////////////

function test2a_1() {
    Request.post({
        url: 'http://127.0.0.1:3000/histogram/h201',
        json: {
            "temperature": 8.25
        },
        timeout: 250
    }, testResponse("2a_1", 3, test2a_2,
        {
            "nr": "h201",
            "histogram": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
        }
    ));
}

function test2a_2() {
    Request.post({
        url: 'http://127.0.0.1:3000/histogram/h201',
        json: {
            "temperature": -2.5
        },
        timeout: 250
    }, testResponse("2a_2", 4, test2a_3,
        {
            "nr": "h201",
            "histogram": [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
        }
    ));
}

function test2a_3() {
    Request.post({
        url: 'http://127.0.0.1:3000/histogram/h203',
        json: {
            "temperature": 12.5
        },
        timeout: 250
    }, testResponse("2a_3", 4, test2b,
        {
            "nr": "h203",
            "histogram": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
        }
    ));
}

function test2b() {
    Request.get({
        url: 'http://127.0.0.1:3000/histogram/h201',
        json: true,
        timeout: 250
    }, testResponse("2b", 2, test2c,
        {
            "nr": "h201",
            "histogram": [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
        }
    ));
}

function test2c() {
    Request.get({
        url: 'http://127.0.0.1:3000/histogram/',
        json: true,
        timeout: 250
    }, testResponse("2c", 2, test3a_1,
        [
            {
                "nr": "h201",
                "histogram": [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]
            },
            {
                "nr": "h203",
                "histogram": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
            }
        ]
    ));
}

///// Stream-Log-Service ///////////////////////////////////////////////

function test3a_1() {
    Request.post({
        url: 'http://127.0.0.1:3000/instance/1/partition/1',
        json: {
            "nr": "sensor-301",
            "temperature": 5
        },
        timeout: 250
    }, testResponse("3a_1", 3, test3a_2,
        true    // JSON-Body
    ));
}

function test3a_2() {
    Request.post({
        url: 'http://127.0.0.1:3000/instance/1/partition/3',
        json: {
            "nr": "sensor-302",
            "temperature": 10
        },
        timeout: 250
    }, () =>
    Request.post({
        url: 'http://127.0.0.1:3000/instance/1/partition/3',
        json: {
            "nr": "sensor-302",
            "temperature": 9
        },
        timeout: 250
    }, testResponse("3a_2", 2, test3b_1,
        true    // JSON-Body
    )));
}

function test3b_1() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/1/1',
        json: true,
        timeout: 250
    }, testResponse("3b_1", 2, test3b_2,
        {
            "nr": "sensor-301",
            "temperature": 5
        }
    ));
}

function test3b_2() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/2/1',
        json: true,
        timeout: 250
    }, testResponse("3b_2", 2, test3b_3,
        undefined,  // leerer Body
        204         // erwarteter HTTP-Statuscode
    ));
}

function test3b_3() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/3/2',
        json: true,
        timeout: 250
    }, testResponse("3b_3", 3, test3b_4,
        {
            "nr": "sensor-302",
            "temperature": 9
        }
    ));
}

function test3b_4() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/1/2',
        json: true,
        timeout: 250
    }, testResponse("3b_4", 3, test4_1,
        undefined,  // leerer Body
        204         // erwarteter HTTP-Statuscode
    ));
}


///// Loadbalancer-Service /////////////////////////////////////////////

function test4_1() {
    Request.post({
        url: 'http://127.0.0.1:3000/log',
        json: {
            "nr": "sensor-401",
            "temperature": 5
        },
        timeout: 250
    }, testResponse("4_1", 3, test4_2,
        true    // JSON-Body
    ));
}

function test4_2() {
    // prüft, ob Nachricht in richtige Partition (=1) geschrieben wurde.
    // Nachricht ist zweite Nachricht in dieser Partition, wegen test3a_1
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/1/2',
        json: true,
        timeout: 250
    }, testResponse("4_2", 3, test4_3,
        {
            "nr": "sensor-401",
            "temperature": 5
        }
    ));
}

function test4_3() {
    // nächste Nachricht muss auf nächster Parition (=2) landen.
    Request.post({
        url: 'http://127.0.0.1:3000/log',
        json: {
            "nr": "sensor-401",
            "temperature": 8.5
        },
        timeout: 250
    }, () =>
    // Test
    Request.get({
        url: 'http://127.0.0.1:3000/instance/1/partition/2/1',
        json: true,
        timeout: 250
    }, testResponse("4_3", 3, test4_4,
        {
            "nr": "sensor-401",
            "temperature": 8.5
        }
    )));
}

function test4_4() {
    // num_partitions weitere Nachrichten erzeugen:
    let responses = config.num_partitions;
    for (let i=1; i <= config.num_partitions; i++) {
        Request.post({
            url: 'http://127.0.0.1:3000/log',
            json: {"nr": "sensor-441", "temperature": i + 0.25},
            timeout: 250
        }, () => --responses || test4_4_get());
    }

    // nun sollte auf Partiton 2 eine neue Nachricht sein
    function test4_4_get() {
        Request.get({
            url: 'http://127.0.0.1:3000/instance/1/partition/2/2',
            json: true,
            timeout: 250
        }, testResponse("4_4", 6, test5a,
            {
                "nr": "sensor-441",
                "temperature": config.num_partitions + 0.25
            }
        ));
    }
}


///// Broker-Service ///////////////////////////////////////////////////

function test5a() {
    setTimeout(test5a_get, 1500);   // 1.5 sec warten, damit sich Status konsolidiert
    function test5a_get() {
        Request.get({
            url: 'http://127.0.0.1:3000/broker/sensor-301',
            json: true,
            timeout: 250
        }, testResponse("5a", 5, test5b,
            {
                "count": 1,
                "avgTemp": 5
            }
        ));
    }
}

function test5b() {
    Request.get({
        url: 'http://127.0.0.1:3000/broker/sensor-441',
        json: true,
        timeout: 250
    }, testResponse("5b", 10, test5c,
        {
            "count": 5,
            "avgTemp": 3.25
        }
    ));
}

function test5c() {
    Request.get({
        url: 'http://127.0.0.1:3000/alarm/sensor-302',
        json: true,
        timeout: 250
    }, testResponse("5c", 5, test5d,
        {
            "count": 2,
            "lastTemp": 9,
            "maxTemp": 10
        }
    ));
}

function test5d() {
    Request.get({
        url: 'http://127.0.0.1:3000/histogram/sensor-441',
        json: true,
        timeout: 250
    }, testResponse("5d", 5, test6a_1,
        // Histogramm soll 2 Nachrichten mit unterschiedlichen Temperaturen enthalten
        function(result, statusCode) {
            if (statusCode !== 200)
                return false;
            if (!Array.isArray(result.histogram))
                return false;
            if (result.histogram.filter((x) => x === 1).length !== 2)
                return false;
            if (result.histogram.filter((x) => x === 0).length !== 10)
                return false;
            return result.histogram.length === 12;
        }
    ));
}


///// Stream-Log-Service: Replication //////////////////////////////////

function test6a_1() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/2/partition/3/2',
        json: true,
        timeout: 250
    }, testResponse("6a_1", 2, test6a_2,
        {
            "nr": "sensor-302",
            "temperature": 9
        }
    ));
}

function test6a_2() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/3/partition/3/2',
        json: true,
        timeout: 250
    }, testResponse("6a_2", 2, test6a_3,
        {
            "nr": "sensor-302",
            "temperature": 9
        }
    ));
}

function test6a_3() {
    Request.get({
        url: 'http://127.0.0.1:3000/instance/4/partition/3/2',
        json: true,
        timeout: 250
    }, testResponse("6a_3", 1, test6b,
        {
            "nr": "sensor-302",
            "temperature": 9
        }
    ));
}

function test6b() {
    let responses = 0;
    let score_before = score;
    for (let i=0; i < 5; i++) {
        Request.post({
            url: 'http://127.0.0.1:3000/instance/1/partition/5',
            json: {
                "nr": "sensor-602",
                "temperature": 3.5 + i
            },
            timeout: 250
        }, () =>
            Request.get({
                url: 'http://127.0.0.1:3000/instance/4/partition/5/'+(i+2),
                json: true,
                timeout: 250
            }, testResponse("6b", 2, correctResult,
                {
                    "nr": "sensor-602",
                    "temperature": 3.5 + i
                }
            )));
    }

    function correctResult() {
        responses++;
        if (responses === 5) {
            if (score - score_before !== 10) {
                score = score_before;
                console.log('Test 6b funktioniert nicht (Summe: 0 Punkte)');
            } else {
                console.log('Test 6b funktioniert (Summe: 10 Punkte)');
            }
            endResult();
        }
    }
}




///// Hilfsfunktionen //////////////////////////////////////////////////

function endResult() {
    console.log("Punktezahl: " + score + " von 100");
}

function testResponse(nr, add_score, next_function, expected, expectedStatus = 200) {
    function test_function(actual, statusCode) {
        if (typeof expected === 'function') {
            return expected(actual, statusCode)
        }
        return compareObjects(actual, expected);
    }

    function success() {
        if (add_score > 0) {
            console.log("Test " + nr + " funktioniert (" + add_score + " Punkte)");
            score += add_score;
        }
    }

    function test(error, response, body) {
        try {
            if (typeof response === "undefined" || response.statusCode === 404)
                console.log("Test " + nr + ": Funktion nicht implementiert.");
            else if (error !== null || response.statusCode != expectedStatus) {
                console.log("Test " + nr + " lieferte falschen Status " + response.statusCode + " (soll: " + expectedStatus +
                    ") bzw. hatte Fehler: " + JSON.stringify(error));
            } else if (test_function(body, response.statusCode)) {
                success()
            } else
                console.log("Test " + nr + " liefert falsches Ergebnis: " + JSON.stringify(body));
        } catch (e) {
            console.log("Test " + nr + " schlägt fehl: " + e);
        }

        if (next_function) {
            let statusCode = typeof response === "undefined" ? 500 : response.statusCode;
            next_function(body, statusCode);
        }
    }

    return test;
}

function compareObjects(actual, expected, ordered = false, path = '', log = true) {
    if (type(actual) !== type(expected)) {
        if (log)
            console.log('Unterschiedliche Typen für ' + path + ': ' + type(actual) + ' !== ' + type(expected));
        return false;
    }

    if (type(expected) === 'array') {
        if (actual.length !== expected.length) {
            if (log)
                console.log('Unterschiedlich viele Einträge in Array ' + path + ': ' + actual.length + ' !== ' + expected.length);
            return false;
        }

        if (ordered) {
            for (let j = 0; j < expected.length; j++) {
                if (!compareObjects(actual[j], expected[j], ordered, path + '[' + j + '].', log)) {
                    return false;
                }
            }
        } else { // unordered
            let found = false;
            for (let j = 0; j < expected.length; j++) {
                for (let k = 0; k < actual.length; k++) {
                    if (compareObjects(actual[k], expected[j], ordered, path + '[' + j + '].', false)) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    if (log)
                        console.log('Eintrag im Array ' + path + '[' + j + '] nicht gefunden (oder fehlerhaft): ' +
                            JSON.stringify(expected[j]));
                    return false;
                }
            }
        }
        return true;
    }

    if (type(expected) === 'object') {
        let ekeys = Object.keys(expected);
        for (let i = 0; i < ekeys.length; i++) {
            let key = ekeys[i];
            let diff = compareObjects(actual[key], expected[key], ordered, path + key + ".", log);
            if (!diff) {
                return false;
            }
        }
        return true;
    }

    // simple types & null
    if (actual !== expected && log)
        console.log("Unterschiedliche Werte für " + path + ': ' + actual + ' !== ' + expected);
    return actual === expected;
}


function type(variable) {
    if (variable === null) {
        return "null";
    } else if (Array.isArray(variable)) {
        return "array";
    }
    return (typeof variable)
}
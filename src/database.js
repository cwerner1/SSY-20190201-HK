const Loki = require("lokijs");
const config = require('./config');

const db = new Loki('temperature.json');

let alarm = db.addCollection('alarm');
let histogram = db.addCollection('histogram');
let broker = db.addCollection('broker');

for (let i = 1; i <= config.num_instances; i++) {
    for (let p = 1; p <= config.num_partitions; p++) {
        db.addCollection('temperature-' + i + '-' + p);
    }
}

function partitionCollection(instance, partition) {
    return db.getCollection('temperature-' + instance + '-' + partition);
}

module.exports = {
    brokerCollection: broker,
    alarmCollection: alarm,
    histogramCollection: histogram,
    // Beispiel: Collection für Instanz #2 und Partition #3: db.getPartitionCollection(2, 3).find(...)
    getPartitionCollection: partitionCollection
};
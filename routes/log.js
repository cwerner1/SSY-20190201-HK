let express = require('express');
let Request = require('request');
let config = require('../src/config');
let router = express.Router();

let url = "http://127.0.0.1:3000/instance/1/partition/";
let currentPartition = 1;
let maxPartition = config.num_partitions;

router.post("/", function (req, res, next) {
    let currentUrl = url + currentPartition;

    Request.post({
            url: currentUrl,
            json: req.body,
            timeout: 250,
        },
        function (cerror, cresponse, cbody) {
            res.json(JSON.parse(cresponse.body));
        });


    currentPartition = ((currentPartition++) % maxPartition) + 1;
});


module.exports = router;

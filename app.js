const readTable = require('./routes/readTable'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
        extended: true
    }),
    bodyParser.json(),
);

app.use('/', readTable);

app.use('/:reqTable/:reqId', function (req, res, next) {
    next();
}, function (req, res) {
    var reqTable = req.params.reqTable,
        reqId = req.params.reqId,
        method = req.method;
    res.send(`Route /${reqTable}/${reqId} for method ${method} not found`)
});

app.use('/:reqTable', function (req, res, next) {
    next();
}, function (req, res) {
    var reqTable = req.params.reqTable,
        method = req.method;
    res.send(`Route /${reqTable} for method ${method} not found`)
});

app.listen(3000, function () {
    console.log("Listening at Port " + 3000);
});

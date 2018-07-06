const express = require('express'),
    router = express.Router(),

    pg = require('pg'),
    conString = "postgres://postgres:920552@localhost:5432/Bia", //данные для подключения к БД

    client = new pg.Client(conString);
client.connect();

router.get('/:reqTable', function (req, res) {

    var reqTable = req.params.reqTable;

    var tq = `SELECT * FROM ${reqTable}`;

    let queryArr = tq;
    client.query(queryArr)
        .then(r => {
            var outArr = new Array(r.rows.length);
            for (let i = 0; i < r.rows.length; i++) {
                console.log(r.rows[i]);
                outArr[i] = r.rows[i];
            }
            res.send(outArr);
        })
        .catch(e => console.error(e.stack))
});

router.get('/:reqTable/:reqId', function (req, res) {

    var reqTable = req.params.reqTable;
    var reqId = req.params.reqId;

    var tq;

    if (reqTable == "player") {
        tq=`select pl.firstname, pl.lastname, pl.age, pl.id, tm.id, tm.name,tm.color,tm.trainer_id  from player pl inner join player_teams pl_tm on pl.id=pl_tm.player_id inner join team tm on pl_tm.team_id = tm.id where pl.id=${reqId}`
    } else if (reqTable == "trainer") {
        tq=`select tr.id, tr.firstname, tr.lastname, tr.age, tm.id, tm.name, tm.color from trainer tr inner join team tm on tm.trainer_id=tr.id where tr.id=${reqId}`
    } else{
        tq=`SELECT * FROM ${reqTable} WHERE id=${reqId}`
    }

    var query = tq;

    client.query(query)
        .then(r => {
            console.log(r.rows[0]);
            let queryOut = r.rows[0];
            res.send(queryOut);
        })
        .catch(e => console.error(e.stack))
});

router.post('/:reqTable', function (req, res) {

    var reqTable = req.params.reqTable;
    var tableInfo = `SELECT column_name
                     FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE table_name = '${reqTable}';
                     `;
    client.query(tableInfo)
        .then(r => {
            var column = new Array(r.rows.length);
            var columnText = new Array(r.rows.length);
            var columns = "";
            var data = "";
            var errorCheck = "";
            for (let i = 0; i < r.rows.length; i++) {
                console.log(r.rows[i].column_name);
                column[i] = r.rows[i].column_name;
                columnText[i] = req.query[column[i]];
                columns += `${r.rows[i].column_name}, `;
                data += `'${columnText[i]}', `;
                console.log(data);
                if (columnText[i] == null) {
                    errorCheck += `${r.rows[i].column_name}, `
                }
            }
            columns = columns.slice(0, -2);
            data = data.slice(0, -2);

            if (errorCheck == "") {
                var tq = `INSERT INTO ${reqTable}(${columns}) values(${data})`;
                client.query(tq);

                res.send(`Данные "${data}" добавлеы в ${reqTable}`);
            } else {
                errorCheck = "fields '" + errorCheck.slice(0, -2) + "' not found";
                res.status(400).json({
                    message: errorCheck
                })
            }
        })
        .catch(e => console.error(e.stack))
});

router.put('/:reqTable/:reqId', function (req, res) {

    var reqId = req.params.reqId;
    var reqTable = req.params.reqTable;
    var tableInfo = `SELECT column_name
                     FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE table_name = '${reqTable}';
                     `;
    client.query(tableInfo)
        .then(r => {
            var column = new Array(r.rows.length);
            var columnText = new Array(r.rows.length);
            var data = "";
            var errorCheck = "";
            for (let i = 0; i < r.rows.length; i++) {
                console.log(r.rows[i].column_name);
                column[i] = r.rows[i].column_name;
                columnText[i] = req.query[column[i]];
                data += `${r.rows[i].column_name}='${columnText[i]}', `
                console.log(data);
                if (columnText[i] == null) {
                    errorCheck += `${r.rows[i].column_name}, `
                }
            }
            data = data.slice(0, -2);

            if (errorCheck == "") {
                var tq = `UPDATE ${reqTable} SET ${data} WHERE id=${reqId}`;
                client.query(tq);

                res.send(`Строка с id=${reqId} в таблице ${reqTable} изменена (${data})`);
            } else {
                errorCheck = "fields '" + errorCheck.slice(0, -2) + "' not found";
                res.status(400).json({
                    message: errorCheck
                })
            }
        })
        .catch(e => console.error(e.stack))
});

router.delete('/:reqTable/:reqId', function (req, res) {

    var reqTable = req.params.reqTable;
    var reqId = req.params.reqId;

    var tq = `DELETE FROM ${reqTable} WHERE id=${reqId}`;
    client.query(tq);

    res.send(`Строка с id=${reqId} в таблице ${reqTable} удалена`);
});


module.exports = router;

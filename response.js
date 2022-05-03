/* Export to excel and response it */
var express = require('express');//npm install express
var app = express();
var Excel = require('exceljs'); //npm install exceljs
var sql = require("mssql"); //npm install mssql
var dboperations = require('./export.js')

var workbook = new Excel.Workbook();

app.get('/', function (req, res) {
    try {
        dboperations.exportne().then(r => {
            arr = r[0]
            try {
                var workbook = new Excel.Workbook();
                var worksheet = workbook.addWorksheet('My Sheet');

                worksheet.columns = [
                    { header: 'id', key: 'PersonId', width: 10 },
                    { header: 'lastname', key: 'LastName', width: 32 },
                    { header: 'firstname', key: 'FirstName', width: 32 },
                    { header: 'age', key: 'Age', width: 10 },
                ];

                for (var i = 0; i < arr.length; i++) {
                    worksheet.addRow(arr[i])
                    console.log(arr[i])
                }

                var tempFilePath = `/home/wanki/Workspace/BMW/Project/file_excel/${Math.floor(Math.random() * 1014444444)}test.xlsx`;
                var temp = `${Math.floor(Math.random() * 1014444444)}test.xlsx`
                workbook.xlsx.writeFile(tempFilePath).then(function () {
                    console.log('file is written');

                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.setHeader("Content-Disposition", "attachment; filename=" + temp);
                    res.sendFile(tempFilePath, function (err) {
                        console.log('---------- no error ' + err);
                    });
                });
            } catch (error) {
                console.log(error)
            }
        })
        // dboperations1.exportne()
        // res.send('Hello World!')

    } catch (err) {
        console.log('OOOOOOO this is the error: ' + err);
    }
});

var server = app.listen(8080, function () {
    console.log('Server is running..');
});
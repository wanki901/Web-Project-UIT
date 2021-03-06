/* Export to excel and response it */
var express = require('express');//npm install express
var app = express();
var Excel = require('exceljs'); //npm install exceljs
var sql = require("mssql"); //npm install mssql
var dboperations = require('./export.js')
const fs = require('fs'); //npm install fs
var workbook = new Excel.Workbook();
const https = require('https');
const res = require('express/lib/response');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

app.get('/', function (req, res) {
    try {
        dboperations.exportne(req.query.Code).then(r => {
            //console.log(r);
            arr = r[0];
            //console.log(arr);
            try 
            {
                var workbook = new Excel.Workbook();
                var worksheet = workbook.addWorksheet('My Sheet');

                worksheet.columns = [
                    { header: 'Id', key: 'Id', width: 10 },
                    { header: 'Title', key: 'Title', width: 32 },
                    { header: 'Content', key: 'Content', width: 32 },
                    { header: 'Point', key: 'Point', width: 10 },
                ];

                for (var i = 0; i < arr.length; i++) 
                {
                    worksheet.addRow(arr[i])
                    console.log(arr[i])
                }

                var tempFilePath = process.cwd() + `/file_excel/${Math.floor(Math.random() * 1014444444)}test.xlsx`;
                var temp = `${Math.floor(Math.random() * 1014444444)}test.xlsx`;
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

    } catch (err) {
        console.log('OOOOOOO this is the error: ' + err);
    }
});

https.createServer(options, app).listen(8001);
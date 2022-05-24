const express = require('express')
const app = express()
const bodyparser = require('body-parser') //npm install body-parser
const fs = require('fs'); //npm install fs
var cors = require('cors')
//for excel
const readXlsxFile = require('read-excel-file/node'); //npm install read-excel-file

const mysql = require('mssql')
//for upload file
const multer = require('multer') //npm install multer

const path = require('path') //npm install path
//for csv
const csvtojson = require('csvtojson'); //npm install csvtojson

var getRecords = require('./export.js')
const http = require('http');
const https = require('https')

var jwt = require('jsonwebtoken');

var import_ne = require('/home/wanki/Workspace/BMW/Project/saveToDB.js')
var show_ne = require('./displayResult.js');
var getNOR = require('./getNumOfRecord.js');
const { Console } = require('console');
const { type } = require('express/lib/response');
var CookieParser = require('cookie-parser');
var Excel = require('exceljs');
var workbook = new Excel.Workbook();

// body-parser middleware use
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(cors({
    origin: '*'
}));
app.use(CookieParser());

//key for https
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// Database connection
// Multer Upload Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.cwd() + '/file_uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fieldNameSize: 50, // TODO: Check if this size is enough
        fileSize: 100000, // 100KB
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    // Allowed kind of file
    const filetypes = /xlsx|csv|sheet|ms-excel/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: xlsx and csv Only!');
        //console.log(file.mimetype); Co the doi thanh luu lai file attacker tan cong
    }
}

app.get('/', (req, res) => {
    // show_ne.showne().then(r=>{
    //     a=r[0]
    //     res.send(a)
    // })
    //console.log(req.cookies, Object.values(req.cookies));
    let cookies = req.cookies;
    token = cookies.jwtToken;
    const checkToken = jwt.verify(token, "scrumpokersecretkey") 
    console.log(checkToken)
    res.send("ok");
});

//create cookie
app.get('/cookie', function (req, res) {
    res.cookie('jwtToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIzIiwidW5pcXVlX25hbWUiOiJ3YW5raTkwMSIsImVtYWlsIjoid2Fua2lAZ21haWwuY29tIiwibmJmIjoxNjUzMjE0MDEzLCJleHAiOjE2NTMyMTU4MTMsImlhdCI6MTY1MzIxNDAxM30.gRBue_CJNLZ6V9JbymyTDylUgBQrIHVR0Ua5E3MXpK8');
    res.send("get cookie");
})

//route export
app.get('/api/export', function (req, res) {
    try 
    {
        getRecords.exportne(req.query.RoomCode).then(r => {
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
                    { header: 'isJiraStory', key: 'IsJiraStory', width: 10 },
                    { header: 'JiraIssueId', key: 'JiraIssueId', width: 10 },
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

// -> Express Upload RestAPIs
app.post('/api/import', upload.single("uploadfile"), (req, res) => {
    const csvTypes = /csv/;
    let before = [];
    let after = [];
    getNOR.getNumOfStories(req.query.RoomCode).then(async r => {
        console.log(req.query.RoomCode)
        if (r >= 20)
            res.send("Too much Stories, could not import anymore");
        else {
            getRecords.exportne(req.query.RoomCode).then(r => {
                before = r[0];
            })

            if (csvTypes.test(req.file.filename)) {
                importCsvData2MySQL(process.cwd() + '/file_uploads/' + req.file.filename, res, r, req.query.RoomCode);
                await new Promise(resolve => setTimeout(resolve, 2000));
                show_ne.showne(req.query.RoomCode).then(r => {
                    after = r[0];
                })
            }
            else {
                importExcelData2MySQL(process.cwd() + '/file_uploads/' + req.file.filename, res, r, req.query.RoomCode);
                await new Promise(resolve => setTimeout(resolve, 5000));
                show_ne.showne(req.query.RoomCode).then( r => {
                    after = r[0];
                })
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(before)
            console.log("before")
            console.log(after)
            console.log("after")
            let arrayIndex = [];
            for (var i = 0; i < after.length; i++)
            {
                for (var j = 0; j < before.length; j++)
                {
                    if (JSON.stringify(after[i]) === JSON.stringify(before[j]))
                    {
                        arrayIndex.push(i);
                        break;
                    }
                }
            }
            // console.log(arrayIndex);
            for (var i = 0; i < arrayIndex.length; i++)
            {
                after.splice(arrayIndex[i] - i, 1);
            }
            // console.log(after);
            let arrayId = [];
            for (var i = 0; i < after.length; i++)
            {
                arrayId.push(after[i].Id);
            }
            // console.log(arrayId);
            res.send(arrayId);
        }
    })
});

//Set Format DB for compare
var formatDB = ['Id', 'Title', 'Content', 'Point'];
const format = JSON.stringify(formatDB);

//Import CSV data to Database
function importCsvData2MySQL(filePath, res, currentStories, RoomCode) {
    csvtojson({
        noheader: true, //get header in csv file
        output: "csv"
    })
        .fromFile(filePath)
        .then((csvRow) => {
            const rowString = JSON.stringify(csvRow[0]);
            var length = csvRow.length - 1;
            // console.log(currentStories);   
            // console.log('current stories'); 
            if (format == rowString) {
                try {
                    if ((20 - currentStories) < length)
                        length = 20 - currentStories;
                    console.log(length);
                    for (var i = 1; i <= length; i++)
                        import_ne.importne(csvRow[i][1], csvRow[i][2], csvRow[i][3], RoomCode);
                    //res.send("success");
                }
                catch (error) {
                    console.log(error)
                }
            }
            else
                res.send("Please right format!");
        })
}

// -> Import Excel Data to MySQL database 
function importExcelData2MySQL(filePath, res, currentStories, RoomCode) {
    readXlsxFile(filePath).then((rows) => {

        var length = rows.length - 1;
        // console.log(currentStories);   
        // console.log('current stories'); 
        const rowString = JSON.stringify(rows[0]);
        if (format == rowString) {
            try {
                if ((20 - currentStories) < length)
                    length = 20 - currentStories;
                for (var i = 1; i <= length; i++) {
                    import_ne.importne(rows[i][1], rows[i][2], rows[i][3], RoomCode)
                }
            } catch (error) {
                console.log(error)
            }
            //res.send('success');
        }
        else
            res.send('plz right format');
    })

}

// Create a Server
// let server = app.listen(8080, function () {
//     let host = server.address().address
//     let port = server.address().port
//     console.log("App listening at http://%s:%s", host, port)
// })

https.createServer(options, app).listen(8000);
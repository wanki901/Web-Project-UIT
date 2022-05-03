const express = require('express')
const app = express()
const bodyparser = require('body-parser') //npm install body-parser
const fs = require('fs'); //npm install fs
//for excel
const readXlsxFile = require('read-excel-file/node'); //npm install read-excel-file

const mysql = require('mssql')
//for upload file
const multer = require('multer') //npm install multer

const path = require('path') //npm install path
//for csv
const csvtojson = require('csvtojson'); //npm install csvtojson

var import_ne = require('/home/wanki/Workspace/BMW/Project/saveToDB.js')
var show_ne = require('./displayResult.js');
const { Console } = require('console');

// body-parser middleware use
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))

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

function checkFileType(file, cb){
  // Allowed kind of file
  const filetypes = /xlsx|csv|sheet|ms-excel/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(extname && mimetype){
    return cb(null,true);
  } else {
    cb('Error: xlsx and csv Only!');
    //console.log(file.mimetype); Co the doi thanh luu lai file attacker tan cong
  }
}

//tao route de xem ============================================
//import_ne.importne().then(r=>{
//     console.log(r)
// })
 
app.get('/', (req, res) => {
    show_ne.showne().then(r=>{
        a=r[0]
        res.send(a)
    })
});

// -> Express Upload RestAPIs
app.post('/uploadfile', upload.single("uploadfile"), (req, res) => {
    const csvTypes = /csv/;
    if (csvTypes.test(req.file.filename))
        importCsvData2MySQL(process.cwd()+ '/file_uploads/' + req.file.filename, res)
    else
        importExcelData2MySQL(process.cwd()+ '/file_uploads/' + req.file.filename, res);
});

//Set Format DB for compare
var formatDB = [ 'id', 'FirstName', 'LastName', 'Age' ];
const format = JSON.stringify(formatDB);

//Import CSV data to Database
function importCsvData2MySQL(filePath, res)
{
    csvtojson({
        noheader:true, //get header in csv file
        output: "csv"
    })
    .fromFile(filePath)
    .then((csvRow) => {
        const rowString = JSON.stringify(csvRow[0]);     
        if (format == rowString)
        {
            res.send("ok");
            try 
            {
                for(var i=1;i<csvRow.length;i++)
                    import_ne.importne(csvRow[i][1], csvRow[i][2], csvRow[i][3]);
            } 
            catch (error) 
            {
                console.log(error)
            }
        }
        else
            res.send("nope");
    })
}

// -> Import Excel Data to MySQL database 
function importExcelData2MySQL(filePath, res) {
    readXlsxFile(filePath).then((rows) => {
        //console.log(rows[0]);
        const rowString = JSON.stringify(rows[0]);     
        if (format == rowString)
        {
            try {
                for(var i=1;i<rows.length;i++){
                    import_ne.importne(rows[i][1],rows[i][2],rows[i][3])
                }
            } catch (error) {
                console.log(error)
            }
            res.send('success');        
        }
        else 
            res.send('plz right format');
    })
}

// Create a Server
let server = app.listen(8080, function () {
    let host = server.address().address
    let port = server.address().port
    console.log("App listening at http://%s:%s", host, port)
})
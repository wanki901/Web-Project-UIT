/* Module export */
//Connect to DB 
var config = {
    user: 'SA',
    password: 'Sher@lockIan123',
    server: 'localhost',
    database: 'hoangne',
    trustServerCertificate: true,
    synchronize: true,
    };

const sql = require('mssql');

async function exportne() {
    try {
        let pool = await sql.connect(config);
        //get all record
        let products1 = await pool.request().query("select * from Persons");
        return products1.recordsets;
    }
    catch (error) {
        console.log(error)
    }
}
//Pack into procedure
module.exports = {
    exportne: exportne
}
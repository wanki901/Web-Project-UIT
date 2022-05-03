/* Show DB on <IP_Server>:8080*/
//Connecto to DB 
var config = {
    user: 'SA',
    password: 'Sher@lockIan123',
    server: 'localhost',
    database: 'hoangne',
    trustServerCertificate: true,
    synchronize: true,
};

const sql = require('mssql');

async function showne(a1, a2, a3, a4) {
    try {
        let pool = await sql.connect(config);

        let products1 = await pool.request().query("select * from Persons");
        return products1.recordsets;
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    showne: showne
}
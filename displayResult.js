/* Show DB on <IP_Server>:8080*/
//Connecto to DB 
var config = {
    user: 'SA',
    password: 'Sher@lockIan123',
    server: 'localhost',
    database: 'TestDB',
    trustServerCertificate: true,
    synchronize: true,
};

const sql = require('mssql');

async function showne() {
    try {
        let pool = await sql.connect(config);
        let products1 = await pool.request().query("select * from Stories");
        return products1.recordsets[0].length;
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    showne: showne
}

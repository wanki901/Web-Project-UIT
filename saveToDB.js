var config = {
    user: 'SA',
    password: 'Sher@lockIan123',
    server: 'localhost',
    database: 'hoangne',
    trustServerCertificate: true,
    synchronize: true,
    };
    
    const sql = require('mssql');
    
    async function importne(a2,a3,a4) {
    try {
    let pool = await sql.connect(config);
    console.log(`insert into Persons (LastName,FirstName,Age) values ('${a2}','${a3}',${a4})`)
    let products = await pool.request().query(`insert into Persons (LastName,FirstName,Age) values ('${a2}','${a3}',${a4})`);
    return products.recordsets;
    }
    catch (error) {
    console.log(error)
    }
}

module.exports = {
    importne:importne
}
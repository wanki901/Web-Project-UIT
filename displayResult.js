/* Show DB on <IP_Server>:8080*/
//Connecto to DB 
var config = {
    user: 'sa',
    password: 'Hoangne@123',
    server: '0.tcp.ap.ngrok.io',
    database: 'ScrumPoker',
    port: 10720,
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
    },
};

const sql = require('mssql');

async function showne(RoomCode) {
    let regex = /^[0-9]+$/;
    if (regex.test(RoomCode)) 
    {
        try {
            let pool = await sql.connect(config);
            let products1 = await pool.request().query(`SELECT Stories.Id, Stories.Title, Stories.Content, Stories.Point FROM Stories INNER JOIN Rooms ON Rooms.Id = Stories.RoomId WHERE Rooms.Code = ${RoomCode}`);
            return products1.recordsets;
        }
        catch (error) {
            console.log(error)
        }
    }
    else return "Hack detected";
}

module.exports = {
    showne: showne
}

/* Show DB on <IP_Server>:8080*/
//Connecto to DB 
var config = {
    user: 'SA',
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

async function getNumOfStories(RoomCode) {
    let pool = await sql.connect(config);
    let res;
    try 
    {
        const ps = new sql.PreparedStatement(pool)
        ps.input('code', sql.Int, '-- commented')
        await ps.prepare('SELECT Stories.Id, Stories.Title, Stories.Content, Stories.Point FROM Stories INNER JOIN Rooms ON Rooms.Id = Stories.RoomId WHERE Rooms.Code = @code', async (err) => {
            // ... error checks
            await ps.execute({ code: RoomCode }, (err, result) => {
                // ... error checks
                //console.log(result.recordsets);
                res = result.recordsets[0].length;
                // release the connection after queries are executed
                ps.unprepare(err => {
                    // ... error checks
                    //console.log(err);
                })
            })
        })
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(res);
        console.log("getNumOfRecord.js");
        return res;
    } catch (err)
    {
        console.log(err)
    }
}

module.exports = {
    getNumOfStories: getNumOfStories
}

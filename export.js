/* Module export */
//Connect to DB 
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

async function exportne(Code) {
    let pool = await sql.connect(config);
    let res;
    try 
    {
        const ps = new sql.PreparedStatement(pool)
        //ps.prepare('SELECT * from Stories where RoomId = @roomid')
        ps.input('code', sql.Int, '-- commented')
        await ps.prepare('SELECT Stories.Id, Stories.Title, Stories.Content, Stories.Point, Stories.IsJiraStory, Stories.JiraIssueId FROM Stories INNER JOIN Rooms ON Rooms.Id = Stories.RoomId WHERE Rooms.Code = @code', async (err) => {
            // ... error checks
            //console.log(err);
            await ps.execute({ code: Code }, (err, result) => {
                // ... error checks
                //console.log(result.recordsets);
                res = result.recordsets;
                // release the connection after queries are executed
                ps.unprepare(err => {
                    // ... error checks
                    //console.log(err);
                })
            })
        })
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res;
    } catch (err)
    {
        console.log(err)
    }
}
//Pack into procedure
module.exports = {
    exportne: exportne
}
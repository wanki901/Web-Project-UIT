var config = 
{
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
    
async function importne(Title, Content, Point, Code) 
{
    let pool = await sql.connect(config);
    try 
    {
        const ps = new sql.PreparedStatement(pool)
        //console.log(`insert into Stories (Title, Content, Point, RoomId) values (${title}, ${content}, ${point}, ${roomid})`)
        //let products = await pool.request().query(`insert into Stories (Title, Content, Point, RoomId) values ('${title}', '${content}', ${point}, ${roomid})`);
        ps.input('title', sql.VarChar(50), '-- commented')
        ps.input('content', sql.VarChar(200), '-- commented')
        ps.input('point', sql.Int, '-- commented')
        ps.input('code', sql.Int, '-- commented')
        value = []
        await ps.prepare("insert into Stories (Title, Content, Point, IsJiraStory, RoomId) values (@title, @content, @point, 0, (SELECT Id FROM Rooms WHERE Code = @code))", async (err) => {
            // ... error checks
            //console.log(err);
            await ps.execute({
                title: Title, 
                content: Content,
                point: Point, 
                code: Code}, (err, result) => {
                // release the connection after queries are executed
                ps.unprepare(err => {
                    // ... error checks
                    //console.log(err);
                })
            })
        })
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    catch (error) 
    {
        console.log(error)
    }
}

module.exports = {
    importne:importne
}
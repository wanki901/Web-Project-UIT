var config = {
    user: 'SA',
    password: 'Sher@lockIan123',
    server: 'localhost',
    database: 'TestDB',
    trustServerCertificate: true,
    synchronize: true,
    };
    
    const sql = require('mssql');
    
    async function importne(title, content, point, roomid) {
    try 
    {
        let pool = await sql.connect(config);
        console.log(`insert into Stories (Title, Content, Point, RoomId) values (${title}, ${content}, ${point}, ${roomid})`)
        let products = await pool.request().query(`insert into Stories (Title, Content, Point, RoomId) values ('${title}', '${content}', ${point}, ${roomid})`);
        return products.recordsets;
    }
    catch (error) 
    {
        console.log(error)
    }
}

module.exports = {
    importne:importne
}
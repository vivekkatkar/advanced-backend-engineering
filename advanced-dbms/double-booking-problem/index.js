import express from "express"
import {Client} from "pg"

const client = new Client({
    host : "localhost",
    user : "postgres", 
    password : "vivek",
    database : "bus",
    port : 5432,
});

await client.connect();
const port = 3000;
const app = express();

app.get("/book/:seatNo/:name", async (req, res) => {
    const seatNo = req.params.seatNo;
    const name = req.params.name;

    // seats 1 -- 20
    if(seatNo < 1 || seatNo > 20){
        return res.status(401).json({
            "status" : "bad",
            "msg" : "wrong seat number"
        });
    }

    try{
        await client.query("BEGIN");
        const result = await client.query("select * from booking where seatNo = $1;", [seatNo]);

        if(result.rowCount > 0){
            await client.query("ROLLBACK");
            return res.status(401).json({
                "status" : "bad",
                "msg" : "Already Booked"
            });
        }

        await client.query("insert into booking(seatNo, name) values($1, $2);", [seatNo, name]);
        await client.query("COMMIT");
        return res.status(200).json({
            "status" : "ok",
            "msg" : "booked"
        });
    }catch(err){
        return res.status(401).json({
            "status" : "bad",
            "err" : err
        });
    }

    return;
});

app.get("/flush", async (req, res) => {
    try{
        await client.query("truncate booking;");
    }catch(err){
        return res.send({
            "status" : "bad",
            "msg" : err
        });
    }

    return res.send({
        "status" : "ok"
    });
});

app.listen(port, () => {
    console.log("App is running on : ", port);
});
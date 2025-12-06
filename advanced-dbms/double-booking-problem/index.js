import express from "express"
import pkg from "pg";
const { Pool, Client } = pkg;

const client = new Client({
    host : "localhost",
    user : "postgres", 
    password : "vivek",
    database : "bus",
    port : 5432,
});

await client.connect();

const pool = new Pool({
    host : "localhost",
    user : "postgres", 
    password : "vivek",
    database : "bus",
    port : 5432,
});

const port = 3000;
const app = express();

app.get("/book/:seatNo/:name", async (req, res) => {
    const seatNo = req.params.seatNo;
    const name = req.params.name;

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
});

app.get("/safebook/:seatNo/:name", async (req, res) => {
    const seatNo = +req.params.seatNo;
    const name = req.params.name;

    if (seatNo < 1 || seatNo > 20) {
        return res.status(400).json({
            status: "bad",
            msg: "wrong seat number"
        });
    }

    const db = await pool.connect();

    try {
        await db.query("BEGIN");

        // Lock the row (or future row) for this seat
        const check = await db.query(
            "SELECT * FROM booking WHERE seatNo = $1 FOR UPDATE",
            [seatNo]
        );

        if (check.rowCount > 0) {
            await db.query("ROLLBACK");
            return res.json({
                status: "bad",
                msg: "Already Booked"
            });
        }

        await db.query(
            "INSERT INTO booking(seatNo, name) VALUES($1, $2)",
            [seatNo, name]
        );

        await db.query("COMMIT");

        return res.json({
            status: "ok",
            msg: "booked"
        });

    } catch (err) {
        await db.query("ROLLBACK");

        // handle PK duplicate cleanly
        if (err.code === "23505") {
            return res.json({
                status: "bad",
                msg: "Already Booked"
            });
        }

        return res.json({
            status: "bad",
            err
        });

    } finally {
        db.release();
    }
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

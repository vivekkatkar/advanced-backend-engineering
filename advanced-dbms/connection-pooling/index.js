import express from "express"
import dotenv from "dotenv"
dotenv.config();

import { client } from "./db.js";


const port = 3000
const app = express();

app.get("/all", async (req, res) => {
    const query = "SELECT * FROM student";

    const result = await client.query(query);
    console.log(result);

    return res.json({
        "status" : "ok"
    });
});

app.listen(port, () => {
    console.log(`App is running on ${port}`);
});

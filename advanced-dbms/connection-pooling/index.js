import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { client, pool } from "./db.js";
import { prepareRow } from "./utils.js";

const port = 3000;
const app = express();

app.get("/setup", async (req, res) => {
    try {
        const query = "CREATE TABLE IF NOT EXISTS student (employyed BIGINT, first TEXT, last TEXT, ss TEXT);";
        const result = await client.query(query);
        
        return res.json({ result });
    } catch (err) {
        return res.status(500).json({ err });
    }
});

app.get("/seed", async (req, res) => {
    const n = Number(req.query.n);
    if (!n) return res.status(400).send("n must be a number");

    // 1. Single client test
    let startTime = performance.now();
    for (let i = 0; i < n; i++) {
        const query = prepareRow();
        try {
            await client.query(query);
        } catch (err) {
            return res.status(400).json({
                from: "client",
                err
            });
        }
    }
    let clientTime = performance.now() - startTime;

    // 2. Pool test
    startTime = performance.now();
    for (let i = 0; i < n; i++) {
        const query = prepareRow();
        try {
            await pool.query(query);
        } catch (err) {
            return res.status(400).json({
                from: "pool",
                err
            });
        }
    }
    let poolTime = performance.now() - startTime;

    console.info("Seed time (client):", clientTime);
    console.info("Seed time (pool)  :", poolTime);

    return res.status(200).json({
        status: "ok",
        client_time: clientTime,
        pool_time: poolTime
    });
});

app.get("/all", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM student");

        return res.json({
            status: "ok",
            rows: result.rows
        });
    } catch (err) {
        return res.status(500).json({ err });
    }
});

app.get("/fetch", async (req, res) => {
    const QUERY = "SELECT * FROM student LIMIT 10";

    const TOTAL_CLIENTS = Number(req.query.n) || 100;

    console.log("Testing single client");
    let startTime = performance.now();
    const promises = [];

    for (let i = 0; i < TOTAL_CLIENTS; i++) {
        promises.push(client.query(QUERY));
    }

    await Promise.all(promises);
    let endTime = performance.now();

    let singleTime = endTime - startTime;


    console.log("Testing pool client");
    startTime = performance.now();
    const promises1 = [];

    for (let i = 0; i < TOTAL_CLIENTS; i++) {
        promises1.push(pool.query(QUERY));
    }

    await Promise.all(promises1);
    endTime = performance.now();

    let poolTime = endTime - startTime;

    console.log("Single client time:", singleTime);
    console.log("Pool client time  :", poolTime);

    res.json({
        single_time: singleTime,
        pool_time: poolTime,
        clients: TOTAL_CLIENTS
    });
});

app.listen(port, () => {
    console.log(`App is running on ${port}`);
});

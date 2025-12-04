import {Client, Pool} from "pg"
import dotenv from "dotenv"
dotenv.config();

console.log(process.env.DBPASS);

export const client = new Client({
    host : process.env.HOST,
    port : 5432,
    user : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DB 
});

export const pool = new Pool({
    host : process.env.HOST,
    port : 5432,
    user : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DB, 
    max : 70,
    connectionTimeoutMillis : 0, 
    idleTimeoutMillis : 10, 
})

await client.connect();
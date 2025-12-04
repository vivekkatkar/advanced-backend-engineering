import {Client} from "pg"
import dotenv from "dotenv"
dotenv.config();

console.log(process.env.DBPASS);

export const client = new Client({
    host : "localhost",
    port : 5432,
    user : process.env.DBUSER,
    password : process.env.DBPASS,
    database : process.env.DB  
});

await client.connect();
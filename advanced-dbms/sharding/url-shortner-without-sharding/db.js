import {Client} from "pg"

export const client = new Client({
    host : "localhost",
    port : 5432,
    user : "postgres",
    password : "vivek",
    database : "urlshortner" 
});

export async function execute(query, c=client){
    try{
        const result =  await c.query(query);
        return result;
    }catch(err){
        console.log("Query Err : ", err);
    }
}

await client.connect();
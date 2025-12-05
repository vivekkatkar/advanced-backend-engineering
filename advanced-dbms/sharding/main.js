import {client, execute} from "./db.js";
import crypto from "crypto"

const TARGET_URL = "https://bit.ly/";

async function createTable(){
    const query = "CREATE TABLE IF NOT EXISTS urltable(id serial, url text, urlId text);"
    await execute(query);
}

function hash(url, length=5){
    return crypto.createHash("sha256").update(url).digest("base64url").slice(0, length);
}

export async function shorten(url){
    const id = hash(url);
    const newUrl = TARGET_URL + id;

    const query = `INSERT INTO urltable(url, urlId) values('${url}', '${id}')`;
    const res = await execute(query);
    return {
        "service" : "shorten",
        "newUrl" : newUrl
    };
}

export async function getUrl(url){
    const baseUrl = url.slice(0, 15);

    if(baseUrl != TARGET_URL){
        return {
            "status" : "bad",
            "message" : "base url miss match"
        }
    }

    const id = url.slice(15);

    const query = `select url from urltable where urlId = '${id}'`;
    const res = await execute(query);
    
    if(res.rowCount == 0){
        return {
            "status" : "bad",
            "message" : "url not found in db"
        }
    }

    const originalUrl = res.rows[0].url;
    return {
        status : {
            "service" : "get-url",
            "url" : originalUrl
        }
    }
}

await createTable();
// const res = await shorten("https://google.com");
// const newUrl = res.newUrl;
// console.log(await getUrl(newUrl));
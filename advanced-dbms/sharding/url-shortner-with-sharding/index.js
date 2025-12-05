import express from "express"
import {Client} from "pg"
import ConsistentHash from "consistent-hash";
import crypto from "crypto"

const port = 3000;
const app = express();

const hashring = new ConsistentHash();
hashring.add("5432");
hashring.add("5433");
hashring.add("5434");

const clients = {
    "5432" : new Client({
        host : "localhost",
        user : "postgres",
        password : "vivek",
        database : "postgres",
        port : 5432
    }),

    "5433" : new Client({
        host : "localhost",
        user : "postgres",
        password : "vivek",
        database : "postgres",
        port : 5433
    }),

    "5434" : new Client({
        host : "localhost",
        user : "postgres",
        password : "vivek",
        database : "postgres",
        port : 5434
    }),
}

async function connect() {
    try{
        clients["5432"].connect();
        clients["5433"].connect();
        clients["5434"].connect();
    }catch(er){
        console.log(er);
    }
}
connect();

app.get("/:urlId", async (req, res) => {
    const urlId = req.params.urlId;
    
    const server = hashring.get(urlId);

    try{
        const query = `select url from URL_TABLE where URL_ID='${urlId}'`;
        
        const result = await clients[server].query(query);
        if(result.rows.length == 0){
             return res.send({
                "urlId" : urlId,
                "url" : "Not present in db",
                "server" : server
            });
        }else{
             return res.send({
                "urlId" : urlId,
                "url" : result.rows[0].url,
                "server" : server
            });
        }
    }catch(err){
        console.log("Database may be down !!");
        console.log("Err : ", err);
    }
    return;
});

app.post("/", async (req, res) => {
    const url = req.query.url;
    const hash = crypto.createHash("sha256").update(url).digest("base64");

    const urlId = hash.slice(0, 5);
    const server = hashring.get(urlId);

    try{
        const query = `INSERT INTO URL_TABLE (URL, URL_ID) VALUES ('${url}', '${urlId}');`;
        // console.log(query);
        await clients[server].query(query);
    }catch(err){
        console.log("Database may be down !!");
        console.log("Err : ", err);
    }

    return res.send({
        "urlId" : urlId,
        "url" : url,
        "server" : server
    });
});

app.listen(port, (req, res) => {
    console.log("App is running in port ", port);
});
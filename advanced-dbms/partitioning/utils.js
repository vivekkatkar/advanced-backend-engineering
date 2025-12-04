import {Client} from "pg";

export const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "vivek",
    database: "bank"
});

await client.connect();

export async function execute(query) {
    try {
        const res = await client.query(query);
        return res;
    } catch (err) {
        console.error("Query error:", err);
    }
}

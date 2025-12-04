// index.js
import { execute } from "./utils.js";

async function createTable() {
    const query1 = `
        DROP TABLE IF EXISTS transactions;
        CREATE TABLE transactions(
            id BIGINT,
            user_id BIGINT,
            amount DECIMAL,
            status TEXT,
            created_at TIMESTAMP
        );
    `;

    const query2 = `
        DROP TABLE IF EXISTS transactions_with_partitions;
        CREATE TABLE transactions_with_partitions(
            id BIGINT,
            user_id BIGINT,
            amount DECIMAL,
            status TEXT,
            created_at TIMESTAMP NOT NULL
        ) PARTITION BY RANGE (created_at);
    `;

    await execute(query1);
    console.log("transactions table created");

    await execute(query2);
    console.log("transactions_with_partitions table created");

    // Create 2025 Jan partition
    const p1 = `
        CREATE TABLE IF NOT EXISTS transactions_2025_01
        PARTITION OF transactions_with_partitions
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
    `;
    await execute(p1);
    console.log("Partition created: 2025 Jan");
}

async function performanceTest(fn) {
    const start = performance.now();
    await fn();
    const end = performance.now();

    console.log("Time taken:", (end - start).toFixed(3), "ms");
}

function randomDateJan2025() {
    const start = new Date("2025-01-01").getTime();
    const end = new Date("2025-01-31").getTime();
    return new Date(start + Math.random() * (end - start));
}

async function seed() {
    console.log("Seeding 200k rows…");

    for (let i = 0; i < 200000; i++) {
        const date = randomDateJan2025().toISOString();

        const q1 = `
            INSERT INTO transactions VALUES (
                ${i}, ${i % 10000}, ${Math.random() * 500}, 'success', '${date}'
            );
        `;
        await execute(q1);

        const q2 = `
            INSERT INTO transactions_with_partitions VALUES (
                ${i}, ${i % 10000}, ${Math.random() * 500}, 'success', '${date}'
            );
        `;
        await execute(q2);
    }

    console.log("Seeding done");
}

async function test() {
    console.log("\n===== Without Partition =====");
    const q1 =
        "SELECT SUM(amount) FROM transactions WHERE created_at BETWEEN '2025-01-01' AND '2025-01-31';";
    await performanceTest(() => execute(q1));

    console.log("\n===== With Partition =====");
    const q2 =
        "SELECT SUM(amount) FROM transactions_with_partitions WHERE created_at BETWEEN '2025-01-01' AND '2025-01-31';";
    await performanceTest(() => execute(q2));
}

async function main() {
    await createTable();
    await seed();
    await test();
}

main();

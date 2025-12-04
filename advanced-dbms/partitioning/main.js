// index.js
import { execute } from "./utils.js";

async function createTables() {
    console.log("Dropping + Creating Tables...");

    const baseTable = `
        DROP TABLE IF EXISTS transactions CASCADE;
        CREATE TABLE transactions (
            id BIGINT,
            user_id BIGINT,
            amount DECIMAL,
            status TEXT,
            created_at TIMESTAMP
        );
    `;

    const partitionTable = `
        DROP TABLE IF EXISTS transactions_with_partitions CASCADE;
        CREATE TABLE transactions_with_partitions (
            id BIGINT,
            user_id BIGINT,
            amount DECIMAL,
            status TEXT,
            created_at TIMESTAMP NOT NULL
        ) PARTITION BY RANGE (created_at);
    `;

    await execute(baseTable);
    console.log("Base table created");

    await execute(partitionTable);
    console.log("Partitioned table created");

    // 3 partitions
    const partitions = [
        ["transactions_2025_01", "2025-01-01", "2025-02-01"],
        ["transactions_2025_02", "2025-02-01", "2025-03-01"],
        ["transactions_2025_03", "2025-03-01", "2025-04-01"],
    ];

    for (const [name, from, to] of partitions) {
        const q = `
            CREATE TABLE IF NOT EXISTS ${name}
            PARTITION OF transactions_with_partitions
            FOR VALUES FROM ('${from}') TO ('${to}');
        `;
        await execute(q);
        console.log(`Partition created: ${name}`);
    }
}

function randomDate(start, end) {
    return new Date(start + Math.random() * (end - start));
}

async function seed() {
    console.log("Seeding 60k rows…");

    const ranges = [
        ["2025-01-01", "2025-01-31"],
        ["2025-02-01", "2025-02-28"],
        ["2025-03-01", "2025-03-31"],
    ];

    let id = 1;

    for (let r of ranges) {
        let start = new Date(r[0]).getTime();
        let end = new Date(r[1]).getTime();

        for (let i = 0; i < 20000; i++) {
            const date = randomDate(start, end).toISOString();

            const q1 = `
                INSERT INTO transactions VALUES (
                    ${id}, ${id % 1000}, ${Math.random() * 500}, 'success', '${date}'
                );
            `;
            await execute(q1);

            const q2 = `
                INSERT INTO transactions_with_partitions VALUES (
                    ${id}, ${id % 1000}, ${Math.random() * 500}, 'success', '${date}'
                );
            `;
            await execute(q2);

            id++;
        }
    }
    console.log("Seeding finished");
}

async function createIndexes() {
    console.log("Creating indexes...");

    const idx1 = `
        CREATE INDEX IF NOT EXISTS idx_transactions_created
        ON transactions (created_at);
    `;
    await execute(idx1);

    const idx2 = `
        CREATE INDEX IF NOT EXISTS idx_transactions_part_created
        ON transactions_with_partitions (created_at);
    `;
    await execute(idx2);

    console.log("Indexes created");
}

async function performanceTest(label, fn) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(3)} ms`);
}

async function runTests() {
    const start = "2025-02-01";
    const end = "2025-03-01";

    const qBase = `
        SELECT SUM(amount)
        FROM transactions
        WHERE created_at BETWEEN '${start}' AND '${end}';
    `;

    const qPartition = `
        SELECT SUM(amount)
        FROM transactions_with_partitions
        WHERE created_at BETWEEN '${start}' AND '${end}';
    `;

    console.log("\n===== PERFORMANCE TESTS =====");

    // 1 — No partitions, no index
    await performanceTest("1️⃣  Without index & without partitions", () => execute(qBase));

    // 2 — With index (normal table)
    await performanceTest("2️⃣  With index (no partitions)", () => execute(qBase));

    // 3 — With partitions (no index)
    await performanceTest("3️⃣  With partitions (no index)", () => execute(qPartition));

    // 4 — With partitions + indexes
    await performanceTest("4️⃣  With partitions + index", () => execute(qPartition));
}

async function main() {
    await createTables();
    await seed();
    await createIndexes();   // add indexes AFTER seeding
    await runTests();
}

main();

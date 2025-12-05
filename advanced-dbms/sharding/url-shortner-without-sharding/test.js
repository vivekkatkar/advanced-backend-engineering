import generateUrls from "./data.js";
import { shorten, getUrl } from "./main.js";


async function performance_test(fn, msg) {
    console.log(" -------------------------------");
    console.log("Testing:", msg);

    const startTime = performance.now();
    await fn();                                
    const endTime = performance.now();

    const totalTime = (endTime - startTime).toFixed(2);
    console.log("Time (ms):", totalTime);
}


async function test_1(urls) {
    const shortUrls = [];

    for (const url of urls) {                 
        const res = await shorten(url);
        shortUrls.push(res.newUrl);
    }

    return shortUrls;
}


async function test_2(urlList) {

    for (const shortUrl of urlList) {
        const res = await getUrl(shortUrl);

        if (res.status === "bad") {
            console.error("Error fetching:", shortUrl);
        }
    }
}


const urls = generateUrls(10000);

await performance_test(() => test_1(urls), "Shorten Function");


const createdShortUrls = await test_1(urls); 
await performance_test(() => test_2(createdShortUrls), "Get-URL Function");


console.log("Performance testing completed. ");

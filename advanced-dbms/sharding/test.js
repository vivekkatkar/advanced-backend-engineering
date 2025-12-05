import generateUrls from "./data.js";
import {shorten} from "./main.js"

async function test_1(){
    const urls = generateUrls(10000);

    const shortUrls = [];

    const startTime = performance.now();
    for(let url in urls){
        // console.log(url);
        const res = await shorten(url);
        const newUrl = res.newUrl;

        // console.log(newUrl);
        if(url == undefined){
            console.error("error");
        }
    }
    const endTime = performance.now();

    const totalTime = endTime - startTime;
    console.log("Time (ms): " ,totalTime.toFixed(2));
    return shortUrls;
}

test_1();
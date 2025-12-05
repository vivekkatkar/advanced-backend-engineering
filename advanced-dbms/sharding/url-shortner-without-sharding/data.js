import crypto from "crypto"

// const N = 100;

function generate(len=10){
    const protocols = ["http://", "https://"]
    const domain = crypto.randomBytes(8).toString("hex").slice(0, len/2);
    const subDomain = crypto.randomBytes(8).toString("hex").slice(0, len/2);
    const path = crypto.randomBytes(8).toString("hex").slice(0, len/4);

    const url = protocols[Math.random().toFixed()%2] + subDomain + "." + domain + "/" + path;
    return url;
}

function generateUrls(N=100){
    const urls = []

    for(let i=0;i<N;i++){
        const url = generate();
        urls.push(url);
    }

    return urls;
}

export default generateUrls;
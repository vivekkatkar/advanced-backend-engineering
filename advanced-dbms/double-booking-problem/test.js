const N = 100; // number of requests
const SEAT = 10; // force all on same seat
const names = ["a", "b", "c", "d", "e", "f"];

let bookedCount = 0;
let alreadyBookedCount = 0;
let errorCount = 0;

let bookedBy = [];        
let rejectedUsers = [];    
let errors = [];            

async function runTest() {
    console.log("Starting concurrency test...");

    const requests = [];

    for (let i = 0; i < N; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const url = `http://localhost:3000/book/${SEAT}/${name}`;

        requests.push(
            fetch(url)
                .then(res => res.json())
                .then(data => {
                    if (data.msg === "booked") {
                        bookedCount++;
                        bookedBy.push(name);
                    } else if (data.msg === "Already Booked") {
                        alreadyBookedCount++;
                        rejectedUsers.push(name);
                    } else {
                        errorCount++;
                        errors.push({ name, error: data });
                    }
                })
                .catch(err => {
                    errorCount++;
                    errors.push({ name, error: err });
                })
        );
    }

    await Promise.allSettled(requests);

    console.log("\n---------- RESULTS ----------");
    console.log("Booked seat successfully:", bookedCount);
    console.log("Already Booked responses:", alreadyBookedCount);
    console.log("Errors:", errorCount);

    console.log("\n---------- WHO BOOKED THE SEAT ----------");
    console.log(bookedBy);

    console.log("\n---------- REJECTED USERS ----------");
    console.log(rejectedUsers);

    console.log("\n---------- ERROR USERS ----------");
    console.log(errors);
}

runTest();

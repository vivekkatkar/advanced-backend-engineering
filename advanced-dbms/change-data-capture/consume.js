
import { Kafka } from "kafkajs";

async function start(){
    const kafka = new Kafka({
        clientId: "cdc-client",
        brokers : ["localhost:9092"]
    });

    const consumer = kafka.consumer({ groupId : "cdc-group"});
    await consumer.connect();

    await consumer.subscribe({
        topic : "pgserver1.public.users",
        fromBeginning : true
    })

    console.log("Listening CDC Events");

    await consumer.run({
        eachMessage : async ({topic, message}) => {
            console.log("CDC Event");
            console.log(JSON.parse(message.value.toString()));
        },
    });
}

start().catch(console.error);
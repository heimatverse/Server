const express = require("express");
// const client = require("./redis.js");
const RoomDB = require("./Schema/Room");
const DeviceDB = require("./Schema/Device");
const HomeDB = require("./Schema/Home")
const app = express();
const bcrypt = require("bcrypt")
const DataBase = require("./Schema/model")
const mongoose = require("mongoose");
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const httpServer = require('http').createServer();
const ws = require('websocket-stream');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Heimatverse/",require("./Routes/routes"))


MQTT_Port = 1884
const wsPort = 8884
server.listen(MQTT_Port, function () {
    console.log('Aedes MQTT server started and listening on port', MQTT_Port)
}),
    ws.createServer({ server: httpServer }, aedes.handle)
httpServer.listen(wsPort, function () {
    console.log('websocket server listening on port ', wsPort)
})

aedes.authenticate = async (client, Email, password, callback) => {
    const Password = Buffer.from(password, 'base64').toString();
    try {
        const user = await DataBase.findOne({ Email: Email }).exec(); 
        if (user) {
            const passwordMatch = await bcrypt.compare(Password, user.Password);
            if (passwordMatch) {
                if(Email == Email && password == password)
                client.Email = Email;
                return callback(null, true);
            } else {
                const error = new Error("Password not correct");
                console.log("Password not correct");
                return callback(error, false);
            }
        } else {
            const error = new Error("User not found");
            console.log("User not found");
            return callback(error, false);
        }
    } catch (error) {
        console.error(error);
        return callback(error, false);
    }
}

aedes.authorizePublish = async (client, packet, callback) => {
    const packet_topic = packet.topic;
    const Email = client.Email;

    try {
        const user = await DataBase.findOne({ Email });
        if (!user) {
            // User not found, you can't send HTTP responses here
            console.log("User not found");
            return callback(new Error("User not found"));
        }

        const Home = user.Home_Id;
        const homeData = await HomeDB.findById(Home);
        if (!homeData) {
            // Home data not found
            console.log("Home data not found");
            return callback(new Error("Home data not found"));
        }

        // Check if the packet topic matches the home topic
        if (homeData.Topic === packet_topic) {
            // Authorized to publish
            return callback(null);
        } else {
            // Not authorized
            console.log("Unauthorized");
            return callback(new Error("Unauthorized"));
        }
    } catch (error) {
        console.log('Error occurred while authorizing publish:', error);
        return callback(error);
    }
};


// emitted when a client connects to the broker
aedes.on('client', function (client) {
    console.log(`CLIENT_CONNECTED : MQTT Client ${(client ? client.id : client)}connected to aedes broker ${aedes.id}`)
})
// emitted when a client disconnects from the broker
aedes.on('clientDisconnect', function (client) {
    console.log(`CLIENT_DISCONNECTED : MQTT Client ${(client ? client.id : client)} disconnected from the aedes broker ${aedes.id}`)
})
// emitted when a client subscribes to a message topic
// aedes.on('subscribe', function (subscriptions, client) {
//     const user = DataBase.findOne({Email:client.Email});
//     const subscription_list = user.Subscription;
//     subscription_list.forEach((element)=>{
//     if(element == subscriptions.topic ){
//         console.log("Client subscribed to:", subscriptions.topic);
//     })
//     else{
//         console.log("user is not authorized");
//         client.conn.destroy();
//     }
// }
//     // console.log(`TOPIC_SUBSCRIBED : MQTT Client ${(client ? client.id : client)} subscribed to topic: ${subscriptions.map(s => s.topic).join(',')} on aedes broker ${aedes.id}`)
// })

// aedes.on('subscribe', function (subscriptions, client) {
//     const user = DataBase.findOne({ Email: client.Email });
//     const subscription_list = user.Subscription;
//     let authorized = true;
//     const find = subscription_list.indexOf(subscriptions.topic);
//     if(find == -1){
//         authorized = false
//     }
//     if (authorized) {
//         console.log("Client subscribed to:", subscriptions[0].topic);
//     } else {
//         console.log("User is not authorized");
//         client.conn.destroy();
//     }
// });
aedes.on('subscribe', function (subscriptions, client) {
    console.log(`[TOPIC_SUBSCRIBED] Client ${(client ? client.id : client)} subscribed to topics: ${subscriptions.map(s => s.topic).join(',')} on broker ${aedes.id}`)
})

// emitted when a client unsubscribes from a message topic
aedes.on('unsubscribe', function (subscriptions, client) {
    console.log(`TOPIC_UNSUBSCRIBED : MQTT Client ${(client ? client.id : client)} unsubscribed to topic: ${subscriptions.join(',')} from aedes broker ${aedes.id}`)
})
// emitted when a client publishes a message packet on the topic
aedes.on('publish', function (packet, client) {
    // const data = packet.payload;
    // const Device = data.
    if (client) {
        console.log(`MESSAGE_PUBLISHED : MQTT Client ${(client ? client.id : 'AEDES BROKER_' + aedes.id)} has published message "${packet.payload}" on ${packet.topic} to aedes broker ${aedes.id}`)
    }
})



const dbURI =  "mongodb+srv://guddu:guddu@cluster1.ved7bni.mongodb.net/yes?retryWrites=true&w=majority";
mongoose.connect(dbURI ,{useNewUrlParser : true , useUnifiedTopology: true})
.then((result)=>{const PORT = process.env.PORT || 8888;
    app.listen(PORT, ()=>{
        console.log("server is created")
    })})
.catch((err)=>console.log(err))      
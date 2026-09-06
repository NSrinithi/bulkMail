const express = require('express');
const app = express();
app.use(express.json());
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL).then(response => {
    console.log("DB connected");
})

const cors = require('cors');
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3000;

const credentials = [{
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
    }];


const emailSchema = new mongoose.Schema({
    emails: [String],
    subject: String,
    content: String,
    status: String,
    sentAt: {
        type: Date,
        default: Date.now
    }
})
const EmailHistory = mongoose.model("EmailHistory", emailSchema);


app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get("/login", (req, res) => {
    console.log("Received the login");
    console.log("Received login request with params:", req.query);
    if (req.query.username === credentials[0].username && req.query.password === credentials[0].password) {
        res.send("Login successful");
    }
    else {
        res.send("Login failed");
    }
});


app.post("/sendEmail", async (req, res) => {

    console.log("========== SEND EMAIL ==========");

    const emailList = req.body.emailList;
    const subject = req.body.subject;
    const content = req.body.content;

    console.log("Email list:", emailList);
    console.log("Subject:", subject);
    console.log("Content:", content);

    try {

        for (let i = 0; i < emailList.length; i++) {

            console.log("Sending to:", emailList[i]);

            const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
                body: JSON.stringify({
                    sender: { email: process.env.EMAIL_USER },
                    to: [{ email: emailList[i] }],
                    subject: subject,
                    textContent: content,
                }),
            });

            const brevoData = await brevoResponse.json();

            if (!brevoResponse.ok) {
                // Brevo returns error details in the JSON body even on failure
                console.error("Brevo error for", emailList[i], ":", brevoData);
                throw new Error(brevoData.message || "Brevo send failed");
            }

            console.log("Successfully sent to:", emailList[i], "messageId:", brevoData.messageId);
        }

        await EmailHistory.create({
            emails: emailList,
            subject: subject,
            content: content,
            status: "sent"
        });

        console.log("History saved");

        res.send("Send successfully");

    } catch (error) {

        console.error("========== EMAIL ERROR ==========");
        console.error(error);
        console.error("Message:", error.message);

        res.status(500).send("Failed to send");

    }
});

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get("/emailHistory", async (req, res) => {
    try {
        const response = await EmailHistory.find().sort({
            sentAt: -1
        })
        console.log(response);
        res.send(response);
    }
    catch (error) {
        res.send(error);
    }
})
app.delete("/deleteHistory/:id", async (req, res) => {

    try {

        await EmailHistory.findByIdAndDelete(req.params.id);

        res.send("History deleted successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete history");
    }
});
const express = require('express');
const app = express();
app.use(express.json());
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL).then(response => {
    console.log("DB connected");
})

const nodemailer = require("nodemailer");

const cors = require('cors');
app.use(cors());

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

app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});


app.get("/login", (req, res) => {
    console.log("Received login request with params:", req.query);
    if (req.query.username === credentials[0].username && req.query.password === credentials[0].password) {
        res.send("Login successful");
    }
    else {
        res.send("Login failed");
    }
});


app.post("/sendEmail", async (req, res) => {

    console.log("1. Send email request received");

    const emailList = req.body.emailList;
    const subject = req.body.subject;
    const content = req.body.content;

    console.log("2. Email list:", emailList);
    console.log("3. EMAIL_USER configured:", !!process.env.EMAIL_USER);
    console.log("4. EMAIL_PASSWORD configured:", !!process.env.EMAIL_PASSWORD);

    try {

        console.log("5. Creating transporter");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log("6. Transporter created");

        console.log("7. Verifying Gmail connection");

        await transporter.verify();

        console.log("8. Gmail SMTP connection successful");

        for (let i = 0; i < emailList.length; i++) {

            console.log("9. Starting send to:", emailList[i]);

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: emailList[i],
                subject: subject,
                text: content
            });

            console.log("10. Successfully sent to:", emailList[i]);
        }

        console.log("11. All emails sent");

        await EmailHistory.create({
            emails: emailList,
            subject: subject,
            content: content,
            status: "sent"
        });

        console.log("12. History saved");

        res.send("Send successfully");

    } catch (error) {

        console.error("❌ EMAIL ERROR:");
        console.error(error);

        res.status(500).send("Failed to send email");
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
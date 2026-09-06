const express = require('express');
const { google } = require("googleapis");
const app = express();
app.use(express.json());
require("dotenv").config();
const mongoose = require("mongoose");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

mongoose.connect(process.env.MONGO_URL).then(response => {
    console.log("DB connected");
})

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
];

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
app.get("/authorize", (req, res) => {

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GMAIL_SCOPES,
        prompt: "consent"
    });

    res.redirect(authorizationUrl);
});
app.get("/oauth2callback", async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {
            return res.status(400).send("Authorization code missing");
        }

        const { tokens } = await oauth2Client.getToken(code);

        console.log("Google authorization successful");

        res.send(`
            <h2>Google authorization successful!</h2>
            <p>Copy the refresh token below and add it to Render as GOOGLE_REFRESH_TOKEN.</p>
            <p><b>Do not share this token with anyone.</b></p>
            <textarea style="width:100%;height:150px;">${tokens.refresh_token || "No refresh token returned"}</textarea>
        `);

    } catch (error) {

        console.error("OAuth error:", error);

        res.status(500).send("Google authorization failed");
    }
});
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
    console.log("Send email request received");

    const emailList = req.body.emailList;
    const subject = req.body.subject;
    const content = req.body.content;

    console.log("Number of recipients:", emailList.length);

    try {
        for (let i = 0; i < emailList.length; i++) {

            console.log("Sending to:", emailList[i]);

            const { data, error } = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: [emailList[i]],
                subject: subject,
                text: content
            });

            if (error) {
                console.error("Resend error:", error);
                throw new Error(error.message);
            }

            console.log("Successfully sent:", data.id);
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

        console.error("EMAIL ERROR:", error);

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
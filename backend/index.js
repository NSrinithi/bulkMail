const express = require("express");
const { google } = require("googleapis");
const app = express();

require("dotenv").config();

const mongoose = require("mongoose");
const cors = require("cors");

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// =========================
// MongoDB
// =========================

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB connected");
    })
    .catch((error) => {
        console.error("DB connection failed:", error);
    });


// =========================
// Google OAuth
// =========================

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
];

// Use refresh token after we generate it
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });
}

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});


// =========================
// Admin credentials
// =========================

const credentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};


// =========================
// Email History Schema
// =========================

const emailSchema = new mongoose.Schema({
    emails: [String],
    subject: String,
    content: String,
    status: String,
    sentAt: {
        type: Date,
        default: Date.now
    }
});

const EmailHistory = mongoose.model(
    "EmailHistory",
    emailSchema
);


// =========================
// Google Authorization
// =========================

app.get("/authorize", (req, res) => {

    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: GMAIL_SCOPES,
        prompt: "consent"
    });

    res.redirect(authorizationUrl);
});


// =========================
// Google OAuth Callback
// =========================

app.get("/oauth2callback", async (req, res) => {

    try {

        const { code } = req.query;

        if (!code) {
            return res
                .status(400)
                .send("Authorization code missing");
        }

        const { tokens } = await oauth2Client.getToken(code);

        console.log(
            "Google authorization successful"
        );

        console.log(
            "Refresh token received:",
            !!tokens.refresh_token
        );

        res.send(`
            <h2>Google authorization successful ✅</h2>
            <p>You can close this page.</p>
            <p>Check your Render logs to confirm that the refresh token was received.</p>
        `);

    } catch (error) {

        console.error("OAuth error:", error);

        res
            .status(500)
            .send("Google authorization failed");
    }
});


// =========================
// Login
// =========================

app.get("/login", (req, res) => {

    console.log("Login request received");

    if (
        req.query.username === credentials.username &&
        req.query.password === credentials.password
    ) {
        res.send("Login successful");
    } else {
        res.send("Login failed");
    }
});


// =========================
// SEND EMAIL
// =========================

app.post("/sendEmail", async (req, res) => {

    console.log("Send email request received");

    const emailList = req.body.emailList;
    const subject = req.body.subject;
    const content = req.body.content;

    // Validate email list
    if (
        !Array.isArray(emailList) ||
        emailList.length === 0
    ) {
        return res
            .status(400)
            .send("Email list is empty");
    }

    console.log(
        "Number of recipients:",
        emailList.length
    );

    try {

        // Check whether Gmail OAuth is configured
        if (!process.env.GOOGLE_REFRESH_TOKEN) {

            return res
                .status(500)
                .send(
                    "Google authorization is not completed"
                );
        }


        // Send email to each recipient
        for (let i = 0; i < emailList.length; i++) {

            const recipient = emailList[i];

            console.log(
                "Sending to:",
                recipient
            );


            // Gmail message
            const email = [
                `From: ${process.env.EMAIL_USER}`,
                `To: ${recipient}`,
                `Subject: ${subject}`,
                "Content-Type: text/plain; charset=utf-8",
                "",
                content
            ].join("\r\n");


            // Convert email to Base64URL
            const encodedMessage = Buffer
                .from(email)
                .toString("base64url");


            // Send through Gmail API
            const response =
                await gmail.users.messages.send({
                    userId: "me",
                    requestBody: {
                        raw: encodedMessage
                    }
                });


            console.log(
                "Successfully sent to:",
                recipient
            );

            console.log(
                "Gmail message ID:",
                response.data.id
            );
        }


        // Save history after all emails are sent
        await EmailHistory.create({
            emails: emailList,
            subject: subject,
            content: content,
            status: "sent"
        });


        console.log("History saved");


        res.send("Send successfully");

    } catch (error) {

        console.error(
            "GMAIL EMAIL ERROR:",
            error
        );

        res
            .status(500)
            .send("Failed to send email");
    }
});


// =========================
// Home
// =========================

app.get("/", (req, res) => {
    res.send("Bulk Mailer Backend is running");
});


// =========================
// Get Email History
// =========================

app.get("/emailHistory", async (req, res) => {

    try {

        const response = await EmailHistory
            .find()
            .sort({
                sentAt: -1
            });

        res.send(response);

    } catch (error) {

        console.error(
            "History fetch error:",
            error
        );

        res
            .status(500)
            .send("Failed to fetch email history");
    }
});


// =========================
// Delete Email History
// =========================

app.delete("/deleteHistory/:id", async (req, res) => {

    try {

        await EmailHistory.findByIdAndDelete(
            req.params.id
        );

        res.send(
            "History deleted successfully"
        );

    } catch (error) {

        console.error(
            "Delete history error:",
            error
        );

        res
            .status(500)
            .send("Failed to delete history");
    }
});


// =========================
// Start Server
// =========================

app.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    }
);
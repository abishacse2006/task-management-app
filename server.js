require("dotenv").config();
const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const mongoUrl = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

let db;

app.listen(PORT, () => {
    console.log(`Task Management App running on port ${PORT}`);
});

async function connectDB() {
    try {
        const mongoUrl = process.env.MONGODB_URI;

        if (!mongoUrl) {
            console.log("MONGODB_URI is not configured");
            return;
        }

        const client = new MongoClient(mongoUrl);
        await client.connect();

        db = client.db("taskManagementDB");

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.log("MongoDB connection error:", error.message);
    }
}

app.get("/api/projects", async (req, res) => {
    if (!db) {
        return res.json([]);
    }

    const projects = await db.collection("projects").find().toArray();
    res.json(projects);
});

app.post("/api/contact", async (req, res) => {
    if (!db) {
        return res.status(503).json({
            success: false,
            message: "Database not connected"
        });
    }

    await db.collection("contacts").insertOne(req.body);

    res.json({
        success: true,
        message: "Message saved successfully!"
    });
});

connectDB();

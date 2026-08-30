const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(__dirname));

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let tasksCollection;
let usersCollection;

async function connectDB() {
    try {
        await client.connect();

        const database = client.db("taskManagementDB");
        tasksCollection = database.collection("tasks");
        usersCollection = database.collection("users");
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}
// REGISTER USER
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: "Username and password are required"
            });
        }

        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                error: "Username already exists"
            });
        }

        await usersCollection.insertOne({
            username,
            password
        });

        res.json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            error: "Registration failed"
        });
    }
});

// CREATE TASK
app.post("/api/tasks", async (req, res) => {
    try {
       const task = {
    title: req.body.title,
    priority: req.body.priority || "Medium",
    completed: false,
    createdAt: new Date()
};

        const result = await tasksCollection.insertOne(task);

        res.json({
            message: "Task created successfully",
            task: {
                _id: result.insertedId,
                ...task
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});

// GET TASKS
app.get("/api/tasks", async (req, res) => {
    try {
        const tasks = await tasksCollection
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
});
// UPDATE TASK
app.put("/api/tasks/:id", async (req, res) => {
    try {
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title: req.body.title } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task updated successfully" });

    } catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
});
// DELETE TASK
app.delete("/api/tasks/:id", async (req, res) => {
    try {
        await tasksCollection.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        res.json({ message: "Task deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

connectDB();
// LOGIN USER
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await usersCollection.findOne({
            username,
            password
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid username or password"
            });
        }

        res.json({
            message: "Login successful",
            username: user.username
        });

    } catch (error) {
        res.status(500).json({
            error: "Login failed"
        });
    }
});
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/", (req, res) => {
    res.send("Backend Running Successfully");
});

app.get("/products", async (req, res) => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// POST /signup
app.post("/signup", async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required." });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    });

    if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
            return res.status(400).json({ error: "An account with this email already exists." });
        }
        return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
        user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || fullName
        },
        token: data.session?.access_token || null,
        requiresConfirmation: !data.session
    });
});

// POST /login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
            return res.status(401).json({ error: "Invalid email or password." });
        }
        if (error.message.toLowerCase().includes("email not confirmed")) {
            return res.status(401).json({ error: "Please confirm your email before logging in." });
        }
        return res.status(401).json({ error: error.message });
    }

    res.json({
        user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || ""
        },
        token: data.session.access_token
    });
});

// POST /logout
app.post("/logout", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token required." });
    }

    const { error } = await supabase.auth.signOut();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: "Logged out successfully." });
});

// GET /me
app.get("/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization token required." });
    }

    const token = authHeader.split(" ")[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: "Invalid or expired token." });
    }

    res.json({
        user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || ""
        }
    });
});

app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 5000");
});

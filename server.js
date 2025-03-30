require("dotenv").config();
const express = require("express");
const cors = require("cors");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");

const app = express();

// Middleware Setup
app.use(express.json());
app.use(cookieParser());  // For CSRF protection (requires cookies)
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); // Allow frontend requests from localhost

// CSRF Protection Setup
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Route to Get CSRF Token
app.get("/api/csrf-token", (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Auth and Data Routes
app.use("/api/auth", authRoutes); // Authentication routes (login, logout)
app.use("/api/data", dataRoutes); // Data fetching routes (grades, CGPA, finance, etc.)

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const jwt = require("jsonwebtoken");
const { encryptSession } = require("../utils/encrypt");

puppeteer.use(StealthPlugin());

const sessionStore = {};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.goto("https://portal.aiub.edu", { waitUntil: "domcontentloaded" });
        await page.type("#username", username);
        await page.type("#password", password);
        await Promise.all([page.click("#login-button"), page.waitForNavigation()]);

        const cookies = await page.cookies();
        sessionStore[username] = encryptSession(cookies);
        await browser.close();

        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
        res.json({ message: "Login successful" });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logout successful" });
};

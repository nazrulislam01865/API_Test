const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
    }

    const browser = await puppeteer.launch({ headless: false }); // Open browser for debugging
    const page = await browser.newPage();

    try {
        await page.goto("https://portal.aiub.edu", { waitUntil: "networkidle2" });

        // ✅ Wait for input fields to be available
        await page.waitForSelector("input[type='text']", { timeout: 5000 });
        await page.waitForSelector("input[type='password']", { timeout: 5000 });

        // ✅ Fill in username and password
        await page.type("input[type='text']", username, { delay: 100 });
        await page.type("input[type='password']", password, { delay: 100 });

        // ✅ Find and click the login button
        const loginButton = await page.$("button.btn-primary");
        if (!loginButton) throw new Error("Login button not found!");

        await Promise.all([
            loginButton.click(),
            page.waitForNavigation({ waitUntil: "networkidle2" }) // Wait for login response
        ]);

        // ✅ Navigate to profile page after login
        await page.goto("https://portal.aiub.edu/Student/Home/Profile", { waitUntil: "networkidle2" });

        // ✅ Extract data
        const data = await page.evaluate(() => {
            const getText = (xpath) => {
                const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                return el ? el.innerText.trim() : null;
            };
        
            return {
                name: getText("//legend"), // Profile name
                studentId: getText("//td[contains(text(), 'Student ID :')]/following-sibling::td"),
                cgpa: getText("//td[contains(text(), 'CGPA :')]/following-sibling::td"),
                program: getText("//td[contains(text(), 'Program :')]/following-sibling::td"),
                department: getText("//td[contains(text(), 'Department :')]/following-sibling::td"),
                photoUrl: document.querySelector("img[src*='ProfileImage']")?.src || null
            };

        });

        await browser.close();
        res.json(data);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

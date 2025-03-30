const puppeteer = require("puppeteer-extra");
const { decryptSession } = require("../utils/encrypt");

async function scrapeData(url, selector) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const data = await page.evaluate((selector) => document.querySelector(selector)?.innerText, selector);
    await browser.close();
    return data;
}

exports.getGrades = async (req, res) => {
    const username = req.user.username;
    const cookies = decryptSession(sessionStore[username]);

    const grades = await scrapeData("https://portal.aiub.edu/Student/GradeReport/ByCurriculum?q=mxPlMMGCoVQ%3D", ".grade-list");
    res.json({ grades });
};

exports.getCGPA = async (req, res) => {
    const username = req.user.username;
    const cookies = decryptSession(sessionStore[username]);

    const cgpa = await scrapeData("https://portal.aiub.edu/Student/GradeReport/BySemester?q=mxPlMMGCoVQ%3D", ".cgpa-value");
    res.json({ cgpa });
};

exports.getFinance = async (req, res) => {
    const username = req.user.username;
    const cookies = decryptSession(sessionStore[username]);

    const balance = await scrapeData("https://portal.aiub.edu/Student/Accounts?q=6Pzj5wBh8sg%3D", ".balance-amount");
    res.json({ balance });
};

exports.getSchedule = async (req, res) => {
    const username = req.user.username;
    const cookies = decryptSession(sessionStore[username]);

    const schedule = await scrapeData("https://portal.aiub.edu/schedule", ".schedule-table");
    res.json({ schedule });
};

// exports.getNotices = async (req, res) => {
//     const username = req.user.username;
//     const cookies = decryptSession(sessionStore[username]);

//     const notices = await scrapeData("https://portal.aiub.edu/notices", ".notice-list");
//     res.json({ notices });
// };

exports.getProfile = async (req, res) => {
    const username = req.user.username;
    const cookies = decryptSession(sessionStore[username]);

    const profile = await scrapeData("https://portal.aiub.edu/Student/Home/Profile", ".profile-details");
    res.json({ profile });
};

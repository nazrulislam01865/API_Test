// controllers/gradesController.js

exports.getGrades = (req, res) => {
    res.json({
        grades: [
            { course: "CSE101", grade: "A", semester: "Spring 2024" },
            { course: "CSE201", grade: "A-", semester: "Fall 2023" }
        ]
    });
};

exports.getCGPA = (req, res) => {
    res.json({ cgpa: "3.75" });
};

exports.getFinance = (req, res) => {
    res.json({ balance: "Due: 5000 BDT" });
};

exports.getSchedule = (req, res) => {
    res.json({
        schedule: [
            { course: "CSE101", time: "10:00 AM", day: "Monday" },
            { course: "CSE201", time: "2:00 PM", day: "Wednesday" }
        ]
    });
};

exports.getNotices = (req, res) => {
    res.json({
        notices: [
            { title: "Midterm Exam Notice", date: "2025-04-01" }
        ]
    });
};

exports.getProfile = (req, res) => {
    res.json({ name: "John Doe", id: "20-12345-1", department: "CSE" });
};

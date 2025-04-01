const { login, getStudentData, getCurriculumData, getCompletedCourses, getSemesterRoutine } = require('../services/aiubService');

const loginHandler = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { username, password } = req.query;
  if (!username || !password) {
    res.write(`data: ${JSON.stringify({ status: 'error', message: 'Username and password required' })}\n\n`);
    return res.end();
  }

  try {
    res.write(`data: ${JSON.stringify({ status: 'running', message: 'Processing request...' })}\n\n`);
    const session = await login(username, password);
    res.write(`data: ${JSON.stringify({ status: 'running', message: 'Logged in to portal' })}\n\n`);

    const { user, currentSemester, semesterOptions } = await getStudentData(session);
    res.write(`data: ${JSON.stringify({ status: 'running', message: 'Getting curriculum data...' })}\n\n`);
    const courseMap = await getCurriculumData(session);
    res.write(`data: ${JSON.stringify({ status: 'running', message: 'Completed getting curriculum data' })}\n\n`);

    const [completedCourses, currentSemesterCourses, preRegisteredCourses] = await getCompletedCourses(session, currentSemester);
    const semesterClassRoutine = await getSemesterRoutine(session, semesterOptions);

    const unlockedCourses = {};
    for (const [code, course] of Object.entries(completedCourses)) {
      if (course.grade === 'D') {
        unlockedCourses[code] = { courseName: course.courseName, credit: courseMap[code].credit, prerequisites: courseMap[code].prerequisites, retake: true };
      }
    }

    for (const [code, course] of Object.entries(courseMap)) {
      if (code in completedCourses || /[#*]/.test(code) || course.courseName === 'INTERNSHIP' || code in unlockedCourses || (code in currentSemesterCourses && !['W', 'I'].includes(currentSemesterCourses[code].grade))) continue;
      if (code in preRegisteredCourses) {
        unlockedCourses[code] = { courseName: course.courseName, credit: course.credit, prerequisites: course.prerequisites, retake: false };
        continue;
      }
      if (!course.prerequisites.length || course.prerequisites.every(prereq => prereq in completedCourses || prereq in currentSemesterCourses)) {
        unlockedCourses[code] = { courseName: course.courseName, credit: course.credit, prerequisites: course.prerequisites, retake: false };
      }
    }

    const result = {
      semesterClassRoutine: Object.fromEntries(Object.entries(semesterClassRoutine).sort()),
      unlockedCourses,
      completedCourses,
      preRegisteredCourses,
      currentSemester,
      user,
      curriculumCourses: courseMap,
    };

    res.write(`data: ${JSON.stringify({ status: 'complete', result })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ status: 'error', message: err.message })}\n\n`);
    res.end();
  }
};

module.exports = { loginHandler };
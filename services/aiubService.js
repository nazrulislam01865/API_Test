const axios = require('axios');
const cheerio = require('cheerio');
const { parseTime } = require('../utils/parseTime');
const { getCourseDetails } = require('../utils/courseDetails');

const login = async (username, password) => {
  const session = axios.create({ withCredentials: true });
  const response = await session.post(process.env.AIUB_PORTAL_URL, { UserName: username, Password: password });
  const $ = cheerio.load(response.data);

  if (!response.request.res.responseUrl.includes('https://portal.aiub.edu/Student')) {
    if ($('#captcha').css('display') !== 'none') throw new Error('Captcha required');
    throw new Error('Invalid username or password');
  }
  if (response.request.res.responseUrl.includes('Student/Tpe/Start')) throw new Error('TPE Evaluation pending');
  return session;
};

const getStudentData = async (session) => {
  const response = await session.get('https://portal.aiub.edu/Student');
  const $ = cheerio.load(response.data);
  let user = $('.navbar-link').text().trim();
  if (user.includes(',')) {
    const [last, first] = user.split(',');
    user = `${first.trim()} ${last.trim()}`.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
  const currentSemester = $('#SemesterDropDown > option[selected="selected"]').text();
  const semesterOptions = $('#SemesterDropDown > option').map((_, el) => $(el).attr('value')).get();
  return { user, currentSemester, semesterOptions };
};

const getCurriculumData = async (session) => {
  const response = await session.get('https://portal.aiub.edu/Student/Curriculum');
  const $ = cheerio.load(response.data);
  const curriculumIds = $('[curriculumid]').map((_, el) => $(el).attr('curriculumid')).get();
  const courseMap = {};

  for (const id of curriculumIds) {
    const res = await session.get(`https://portal.aiub.edu/Common/Curriculum?ID=${id}`);
    const $c = cheerio.load(res.data);
    $c('.table-bordered tr:not(:first-child)').each((_, row) => {
      const courseCode = $c('td:nth-child(1)', row).text().trim();
      const courseName = $c('td:nth-child(2)', row).text().trim();
      const credit = Math.max(...$c('td:nth-child(3)', row).text().trim().split(' ').map(Number));
      const prerequisites = $c('td:nth-child(4) li', row).map((_, li) => $c(li).text().trim()).get();
      courseMap[courseCode] = { courseName, credit, prerequisites };
    });
  }
  return courseMap;
};

const getCompletedCourses = async (session, currentSemester) => {
  const response = await session.get('https://portal.aiub.edu/Student/GradeReport/ByCurriculum');
  const $ = cheerio.load(response.data);
  const completedCourses = {};
  const currentSemesterCourses = {};
  const preRegisteredCourses = {};

  $('table:not(:first-child) tr:not(:first-child):has(td:nth-child(3):not(:empty))').each((_, row) => {
    const courseCode = $('td:nth-child(1)', row).text().trim();
    const courseName = $('td:nth-child(2)', row).text().trim();
    const results = $('td:nth-child(3)', row).text().trim();
    const matches = results.match(/\(([^)]+)\)\s*\[([^\]]+)\]/g) || [];
    if (!matches.length) return;

    const [semester, grade] = matches[matches.length - 1].match(/\(([^)]+)\)\s*\[([^\]]+)\]/).slice(1);
    if (['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'].includes(grade)) {
      completedCourses[courseCode] = { courseName, grade };
    } else if (grade === '-') {
      if (semester === currentSemester) currentSemesterCourses[courseCode] = { courseName, grade };
      else preRegisteredCourses[courseCode] = { courseName, grade };
    }
  });
  return [completedCourses, currentSemesterCourses, preRegisteredCourses];
};

const getSemesterRoutine = async (session, semesterOptions) => {
  const semesterClassRoutine = {};
  for (const value of semesterOptions) {
    const match = value.match(/q=(.*)/);
    if (!match) continue;
    const url = `https://portal.aiub.edu/Student/Registration?q=${match[1]}`;
    const response = await session.get(url);
    const $ = cheerio.load(response.data);
    const coursesObj = {};
    $('table').eq(1).find('td:first-child').each((_, course) => {
      if (!$(course).text()) return;
      const courseName = $('a', course).text();
      const parsedCourse = getCourseDetails(courseName);
      const credit = Math.max(...$(course).next('td').text().trim().split('-').map(c => parseInt(c.trim())));
      $('div > span', course).each((_, time) => {
        if (!time.text.includes('Time')) return;
        const parsedTime = parseTime(time.text);
        coursesObj[parsedTime.day] = coursesObj[parsedTime.day] || {};
        coursesObj[parsedTime.day][parsedTime.time] = {
          courseName: parsedCourse.courseName,
          classId: parsedCourse.classId,
          credit,
          section: parsedCourse.section,
          type: parsedTime.type,
          room: parsedTime.room,
        };
      });
    });
    semesterClassRoutine[$('option[value="' + value + '"]').text()] = coursesObj;
  }
  return semesterClassRoutine;
};

module.exports = { login, getStudentData, getCurriculumData, getCompletedCourses, getSemesterRoutine };
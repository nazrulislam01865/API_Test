const getCourseDetails = (course) => {
    const match = course.match(/^(\d+)-(.+?)\s+\[([A-Z0-9]+)\](?:\s+\[([A-Z0-9]+)\])?$/);
    if (!match) return { classId: '', courseName: '', section: '' };
    const [, classId, courseName, section1, section2] = match;
    return {
      classId,
      courseName: courseName.charAt(0).toUpperCase() + courseName.slice(1).toLowerCase(),
      section: section2 || section1,
    };
  };
  
  module.exports = { getCourseDetails };
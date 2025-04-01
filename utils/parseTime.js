const parseTime = (timeString) => {
    const matches = timeString.match(/\d{1,2}:\d{1,2}(?:\s?[ap]m|\s?[AP]M)?/gi);
    if (!matches || matches.length < 2) throw new Error('Time not found');
    
    const dayMap = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
    const classType = timeString.match(/\((.*?)\)/)[1];
    const day = dayMap[timeString.match(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/)[0]];
    const room = timeString.match(/Room: (.*)/)[1];
    const [startTime, endTime] = matches;
  
    const formatTime = (time) => {
      const is12Hour = /[ap]m/i.test(time);
      const date = new Date(`1970-01-01 ${time}`);
      return date.toLocaleTimeString('en-US', { hour12: is12Hour, hour: 'numeric', minute: '2-digit' });
    };
  
    return {
      type: classType,
      time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      day,
      room,
    };
  };
  
  module.exports = { parseTime };
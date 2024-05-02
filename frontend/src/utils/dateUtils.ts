const parseDate = (dateStr: string) => {
  const dateTime = new Date(dateStr);
  return {
    date: dateTime,
    year: dateTime.getUTCFullYear(),
    month: dateTime.getMonth() + 1,
    day: dateTime.getUTCDate(),
    hours: dateTime.getHours(),
    minutes: dateTime.getMinutes(),
    seconds: dateTime.getSeconds(),
    ms: dateTime.getUTCMilliseconds(),
  };
};

export default parseDate;

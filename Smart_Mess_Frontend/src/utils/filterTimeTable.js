import dayjs from "dayjs";

export const filterTimeTable = (timetable) => {
  console.log({ timetable });
  const currDay = dayjs().format('dddd');
  const currDayTimeTable = timetable.filter((ele) => {
    if (ele.Day === currDay) {
      return true;
    }
    return false;
  });
  // console.log({currDayTimeTable});
  return currDayTimeTable;
};

export const allItems = (timeTable) => {
  const items = [];
  timeTable.forEach((ele) => {
    ele.Items.forEach((item) => {
      items.push(item);
    });
  });
  return items;
};

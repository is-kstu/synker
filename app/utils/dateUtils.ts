export const getWeekRange = (weekOffset: number = 0) => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday,
    end: sunday,
    startFormatted: `${monday.getDate().toString().padStart(2, "0")} ${getMonthName(monday.getMonth())}`,
    endFormatted: `${sunday.getDate().toString().padStart(2, "0")} ${getMonthName(sunday.getMonth())}`,
    dateRange: `${monday.getFullYear()}-${(monday.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${monday
      .getDate()
      .toString()
      .padStart(2, "0")} - ${sunday.getFullYear()}-${(
      sunday.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${sunday.getDate().toString().padStart(2, "0")}`,
  };
};

export const getMonthName = (month: number) => {
  const months = [
    "янв.",
    "фев.",
    "мар.",
    "апр.",
    "май",
    "июн.",
    "июл.",
    "авг.",
    "сен.",
    "окт.",
    "ноя.",
    "дек.",
  ];
  return months[month];
};

export const getDayName = (date: Date) => {
  const days = [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота",
  ];
  return days[date.getDay()];
};

export const formatDate = (date: Date) => {
  return `${getDayName(date)}, ${date.getDate()} ${getMonthName(
    date.getMonth()
  ).replace(".", "")}`;
};

export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateInput = (text: string) => {
  let formattedText = text.replace(/[^0-9]/g, '');
  if (formattedText.length > 4) {
    formattedText = formattedText.slice(0, 4) + '-' + formattedText.slice(4);
  }
  if (formattedText.length > 7) {
    formattedText = formattedText.slice(0, 7) + '-' + formattedText.slice(7, 9);
  }
  return formattedText.slice(0, 10);
};

export const formatTimeInput = (text: string) => {
  let formattedText = text.replace(/[^0-9]/g, '');
  if (formattedText.length > 2) {
    formattedText = formattedText.slice(0, 2) + ':' + formattedText.slice(2);
  }
  return formattedText.slice(0, 5);
}; 
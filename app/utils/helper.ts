import { ParsedDateTime } from "../types/helper";

export function parseTimestamp(
  input: string | number | Date
): ParsedDateTime {
  const date = new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid timestamp provided");
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return {
    timestamp: date.getTime(),
    isoString: date.toISOString(),

    // Date parts
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    monthName: date.toLocaleString("en-US", { month: "long" }),
    day: date.getDate(),
    dayName: date.toLocaleString("en-US", { weekday: "long" }),

    // Time parts
    hour,
    minute,
    second,

    // Formatted
    time24: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
    time12: `${pad(hour % 12 || 12)}:${pad(minute)}:${pad(second)} ${
      hour >= 12 ? "PM" : "AM"
    }`,
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}`,
    dateTime: `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())} ${pad(hour)}:${pad(minute)}:${pad(second)}`
  };
}

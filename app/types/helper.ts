export type ParsedDateTime = {
  timestamp: number;
  isoString: string;

  // Date parts
  year: number;
  month: number;
  monthName: string;
  day: number;
  dayName: string;

  // Time parts
  hour: number;
  minute: number;
  second: number;

  // Formatted helpers
  time24: string;
  time12: string;
  date: string;
  dateTime: string;
};

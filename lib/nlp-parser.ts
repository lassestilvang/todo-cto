import { Priority } from "./types";
import { addDays, addWeeks, addMonths, setHours, setMinutes, isValid } from "date-fns";

export interface ParsedTask {
  title: string;
  scheduleDate?: Date;
  deadline?: Date;
  priority?: Priority;
  estimatedMinutes?: number;
  labels?: string[];
}

const priorityKeywords = {
  high: ["urgent", "important", "critical", "asap", "!!!", "high priority"],
  medium: ["medium", "normal", "!!", "moderate"],
  low: ["low", "minor", "!", "someday"],
};

const timeKeywords = {
  today: () => new Date(),
  tomorrow: () => addDays(new Date(), 1),
  "next week": () => addWeeks(new Date(), 1),
  "next month": () => addMonths(new Date(), 1),
  monday: () => getNextWeekday(1),
  tuesday: () => getNextWeekday(2),
  wednesday: () => getNextWeekday(3),
  thursday: () => getNextWeekday(4),
  friday: () => getNextWeekday(5),
  saturday: () => getNextWeekday(6),
  sunday: () => getNextWeekday(0),
};

function getNextWeekday(targetDay: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
  return addDays(today, daysUntilTarget);
}

export function parseNaturalLanguageTask(input: string): ParsedTask {
  let remainingText = input.trim();
  const result: ParsedTask = {
    title: input,
  };

  // Extract priority
  for (const [priority, keywords] of Object.entries(priorityKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      if (regex.test(remainingText)) {
        result.priority = priority as Priority;
        remainingText = remainingText.replace(regex, "").trim();
        break;
      }
    }
    if (result.priority) break;
  }

  // Extract time estimates (e.g., "30min", "2h", "1.5 hours")
  const timeEstimateRegex = /(\d+(?:\.\d+)?)\s*(min|mins|minutes?|h|hrs?|hours?)\b/gi;
  const timeMatch = timeEstimateRegex.exec(remainingText);
  if (timeMatch) {
    const value = parseFloat(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith("h")) {
      result.estimatedMinutes = Math.round(value * 60);
    } else {
      result.estimatedMinutes = Math.round(value);
    }
    remainingText = remainingText.replace(timeMatch[0], "").trim();
  }

  // Extract dates and times
  // Check for "at HH:MM" pattern
  const timePattern = /\bat\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/gi;
  let timeMatch2;
  let hours: number | undefined;
  let minutes: number | undefined;
  
  while ((timeMatch2 = timePattern.exec(remainingText)) !== null) {
    hours = parseInt(timeMatch2[1]);
    minutes = timeMatch2[2] ? parseInt(timeMatch2[2]) : 0;
    const meridiem = timeMatch2[3]?.toLowerCase();
    
    if (meridiem === "pm" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "am" && hours === 12) {
      hours = 0;
    }
    
    remainingText = remainingText.replace(timeMatch2[0], "").trim();
  }

  // Check for relative date keywords
  for (const [keyword, getDate] of Object.entries(timeKeywords)) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    if (regex.test(remainingText)) {
      let date = getDate();
      if (hours !== undefined) {
        date = setHours(date, hours);
        date = setMinutes(date, minutes || 0);
      }
      
      // Check if it's for a deadline or schedule
      const beforeKeyword = remainingText.substring(0, remainingText.search(regex)).trim();
      if (/\b(by|due|deadline|before)\s*$/i.test(beforeKeyword)) {
        result.deadline = date;
      } else {
        result.scheduleDate = date;
      }
      
      remainingText = remainingText.replace(regex, "").replace(/\b(by|due|deadline|before|on|at)\b/gi, "").trim();
      break;
    }
  }

  // Try to parse specific dates (e.g., "Dec 25", "12/25", "2024-12-25")
  const datePatterns = [
    /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
    /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:,?\s+(\d{4}))?\b/i,
  ];

  for (const pattern of datePatterns) {
    const match = pattern.exec(remainingText);
    if (match) {
      let date: Date | null = null;
      
      if (pattern === datePatterns[0]) {
        // MM/DD or MM/DD/YYYY
        const month = parseInt(match[1]) - 1;
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        date = new Date(year, month, day);
      } else if (pattern === datePatterns[1]) {
        // YYYY-MM-DD
        date = new Date(match[0]);
      } else if (pattern === datePatterns[2]) {
        // "Dec 25" or "Dec 25, 2024"
        const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const month = monthNames.indexOf(match[1].toLowerCase().substring(0, 3));
        const day = parseInt(match[2]);
        const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
        date = new Date(year, month, day);
      }

      if (date && isValid(date)) {
        if (hours !== undefined) {
          date = setHours(date, hours);
          date = setMinutes(date, minutes || 0);
        }
        
        const beforeMatch = remainingText.substring(0, match.index).trim();
        if (/\b(by|due|deadline|before)\s*$/i.test(beforeMatch)) {
          result.deadline = date;
        } else {
          result.scheduleDate = date;
        }
        
        remainingText = remainingText.replace(match[0], "").replace(/\b(by|due|deadline|before|on|at)\b/gi, "").trim();
        break;
      }
    }
  }

  // Extract labels (hashtags)
  const labelRegex = /#(\w+)/g;
  const labels: string[] = [];
  let labelMatch;
  while ((labelMatch = labelRegex.exec(remainingText)) !== null) {
    labels.push(labelMatch[1]);
  }
  if (labels.length > 0) {
    result.labels = labels;
    remainingText = remainingText.replace(labelRegex, "").trim();
  }

  // Clean up remaining text for title
  result.title = remainingText
    .replace(/\s+/g, " ")
    .replace(/[,;]\s*$/, "")
    .trim();

  return result;
}

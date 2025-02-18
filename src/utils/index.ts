import * as chrono from 'chrono-node';

export interface ParsedEvent {
  title: string;
  date: string;
  time: string;
}

export function parseEventCommand(command: string): ParsedEvent {
  // Regex to capture the event title (inside quotes) and the remainder as the date/time string.
  // It allows extra spaces between parts.

  const regex = /\/event\s*"([^"]+)"\s*(.+)/i;
  const match = command.match(regex);
  if (!match) {
    throw new Error(
      'Invalid command format. Use: /event "Event Title" [date/time]'
    );
  }
  const title = match[1].trim();
  const dateTimeText = match[2].trim();

  // Use chrono-node to parse the natural language date/time
  const parsedDate = chrono.parseDate(dateTimeText);
  if (!parsedDate) {
    throw new Error(
      'Could not parse the date/time. Please try a different format.'
    );
  }

  const date = parsedDate.toISOString().split('T')[0];
  const time = parsedDate.toISOString().split('T')[1].split('.')[0];
  return { title, date, time };
}

import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { generateWelcomeEmail, generateEventCreatedEmail, generateEventReminderEmail } from '../src/lib/email';

mkdirSync('./.preview', { recursive: true });

// Welcome
const welcome = generateWelcomeEmail('Samuel', 'you@example.com', 'Yakel');
writeFileSync('./.preview/welcome.html', welcome.html);

// Event Created
const created = generateEventCreatedEmail({
  eventName: 'All-Hands Parking',
  eventDescription: 'Company-wide meeting day.',
  startDate: '2025-09-01',
  endDate: '2025-09-01',
  userEmails: ['you@example.com','colleague@example.com'],
  pooledSpacesCount: 12,
  companyName: 'Yakel'
});
writeFileSync('./.preview/event-created.html', created.html);

// Event Reminder
const reminder = generateEventReminderEmail({
  eventName: 'All-Hands Parking',
  startDate: '2025-09-01',
  endDate: '2025-09-01',
  userEmail: 'you@example.com',
  userName: 'Samuel',
  userPooledSpaces: [{ spaceCode: 'A12', block: 'A', number: '12' }, { spaceCode: 'B07', block: 'B', number: '07' }],
  companyName: 'Yakel'
});
writeFileSync('./.preview/event-reminder.html', reminder.html);

console.log('Wrote ./.preview/*.html. Open them in your browser.');
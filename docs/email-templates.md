# Email Templates Documentation

This document outlines all email templates used in the ParkSpace parking management system.

## Overview

All email templates are defined in `src/lib/email.ts` and use the Resend email service. Templates are generated as inline HTML (no React components) with both HTML and text versions.

## Email Functions

| Function | Subject | From | Template Source | Inputs/Props | Notes |
|----------|---------|------|-----------------|--------------|-------|
| `sendEventCreatedNotification` | `🎉 New Event Created: ${eventName}` | `FROM_EMAIL` or `ParkSpace <onboarding@resend.dev>` | Inline HTML | `EventNotificationData`: eventName, eventDescription?, startDate, endDate, userEmails[], pooledSpacesCount, companyName | Sent to multiple users when a new parking event is created |
| `sendEventReminder` | `⏰ Event Reminder: ${eventName} starts tomorrow!` | `FROM_EMAIL` or `ParkSpace <onboarding@resend.dev>` | Inline HTML | `EventReminderData`: eventName, startDate, endDate, userEmail, userName, userPooledSpaces[], companyName | 24-hour reminder sent to individual users |
| `sendWelcomeEmail` | `Welcome to ParkSpace! 🎉` | `FROM_EMAIL` or `ParkSpace <onboarding@resend.dev>` | Inline HTML | `userName: string`, `userEmail: string`, `companyName?: string` | Sent to new users when they join the system |

## Environment Variables

| Variable | Purpose | Default/Fallback |
|----------|---------|------------------|
| `RESEND_API_KEY` | Resend service authentication | Required - no fallback |
| `FROM_EMAIL` | Sender email address | `ParkSpace <onboarding@resend.dev>` |
| `NEXT_PUBLIC_APP_URL` | App URL for CTA buttons | `http://localhost:3000` |

## Template Details

### Event Created Notification
- **Recipients**: Multiple users (array of emails)
- **Styling**: Blue gradient header, event card with meta information
- **Content**: Event details, pooled spaces count, participant count
- **CTA**: "View Event Details" button linking to app

### Event Reminder  
- **Recipients**: Single user
- **Styling**: Yellow gradient header, red reminder banner
- **Content**: Event details, user's specific parking spaces, reminders checklist
- **CTA**: "Open ParkSpace" button linking to app

### Welcome Email
- **Recipients**: Single user  
- **Styling**: Green gradient header, simple welcome layout
- **Content**: Welcome message, feature list, company assignment (if applicable)
- **CTA**: "Get Started" button linking to app

## Technical Implementation

- All templates generate both HTML and text versions
- HTML templates use inline CSS for maximum email client compatibility
- Templates use template literals for dynamic content injection
- Error handling includes console logging and proper error propagation
- Email sending is handled by a common `sendEmail` function that interfaces with Resend
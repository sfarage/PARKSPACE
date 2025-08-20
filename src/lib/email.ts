// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const IS_DRY_RUN = process.env.EMAIL_DRY_RUN === 'true';

export interface EmailTemplate {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

export interface EventNotificationData {
  eventName: string;
  eventDescription?: string;
  startDate: string;
  endDate: string;
  userEmails: string[];
  pooledSpacesCount: number;
  companyName: string;
}

export interface EventReminderData {
  eventName: string;
  startDate: string;
  endDate: string;
  userEmail: string;
  userName: string;
  userPooledSpaces: Array<{
    spaceCode: string;
    block: string;
    number: string;
  }>;
  companyName: string;
}

// Email Templates
export const generateEventCreatedEmail = (data: EventNotificationData): EmailTemplate => {
  const subject = `🎉 New Event Created: ${data.eventName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .event-card { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; border-left: 4px solid #007bff; }
            .event-title { font-size: 24px; font-weight: bold; color: #2c3e50; margin: 0 0 15px 0; }
            .event-meta { display: flex; flex-wrap: wrap; gap: 20px; margin: 15px 0; }
            .meta-item { display: flex; align-items: center; gap: 8px; color: #6c757d; font-size: 14px; }
            .meta-icon { font-size: 16px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 25px 0; }
            .stat-card { background-color: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 28px; font-weight: bold; color: #1976d2; margin: 0; }
            .stat-label { font-size: 12px; color: #6c757d; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .cta { text-align: center; margin: 30px 0; }
            .cta-button { display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
            .footer a { color: #007bff; text-decoration: none; }
        </style>
    </head>
    <body>
        <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">
          A new ParkSpace event has been created for your company.
        </span>
        <div class="container">
            <div class="header">
                <h1>🅿️ ParkSpace</h1>
                <p>New Event Notification</p>
            </div>
            
            <div class="content">
                <h2>A new parking event has been created!</h2>
                
                <div class="event-card">
                    <div class="event-title">${data.eventName}</div>
                    ${data.eventDescription ? `<p style="color: #6c757d; margin: 0 0 15px 0;">${data.eventDescription}</p>` : ''}
                    
                    <div class="event-meta">
                        <div class="meta-item">
                            <span class="meta-icon">📅</span>
                            <span><strong>Dates:</strong> ${data.startDate} to ${data.endDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">🏢</span>
                            <span><strong>Your Company:</strong> ${data.companyName}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">${data.pooledSpacesCount}</div>
                        <div class="stat-label">Spaces Available</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${data.userEmails.length}</div>
                        <div class="stat-label">Company Participants</div>
                    </div>
                </div>
                
                <p><strong>What's next?</strong></p>
                <ul style="color: #6c757d; line-height: 1.6;">
                    <li>Log into ParkSpace to view event details</li>
                    <li>Check available parking spaces for the event</li>
                    <li>You'll receive a reminder 24 hours before the event starts</li>
                </ul>
                
                <div class="cta">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="cta-button">
                        View Event Details
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The ParkSpace Team</p>
                <p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Open ParkSpace</a> • 
                    <a href="mailto:support@parkspace.com">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
🎉 New Event Created: ${data.eventName}

${data.eventDescription || ''}

📅 Dates: ${data.startDate} to ${data.endDate}
🏢 Your Company: ${data.companyName}
🅿️ Available Spaces: ${data.pooledSpacesCount}
👥 Company Participants: ${data.userEmails.length}

Log into ParkSpace to view event details and check available parking spaces.
You'll receive a reminder 24 hours before the event starts.

View Event: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

Best regards,
The ParkSpace Team
  `;

  return {
    to: data.userEmails,
    subject,
    html,
    text
  };
};

export const generateEventReminderEmail = (data: EventReminderData): EmailTemplate => {
  const subject = `⏰ Event Reminder: ${data.eventName} starts tomorrow!`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ffc107, #e0a800); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .reminder-banner { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
            .reminder-banner h2 { margin: 0; font-size: 20px; }
            .event-details { background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0; }
            .spaces-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin: 20px 0; }
            .space-badge { background-color: #e3f2fd; color: #1976d2; padding: 10px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 14px; }
            .cta { text-align: center; margin: 30px 0; }
            .cta-button { display: inline-block; background-color: #ffc107; color: #212529; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">
          Your ParkSpace event starts tomorrow—check your spaces.
        </span>
        <div class="container">
            <div class="header">
                <h1>🅿️ ParkSpace</h1>
                <p>Event Reminder</p>
            </div>
            
            <div class="content">
                <div class="reminder-banner">
                    <h2>⏰ Event starts tomorrow!</h2>
                </div>
                
                <h2>Don't forget: ${data.eventName}</h2>
                
                <div class="event-details">
                    <p><strong>📅 Dates:</strong> ${data.startDate} to ${data.endDate}</p>
                    <p><strong>🏢 Company:</strong> ${data.companyName}</p>
                    
                    ${data.userPooledSpaces.length > 0 ? `
                        <p><strong>🅿️ Your Available Parking Spaces:</strong></p>
                        <div class="spaces-grid">
                            ${data.userPooledSpaces.map(space => 
                                `<div class="space-badge">${space.spaceCode}</div>`
                            ).join('')}
                        </div>
                    ` : '<p><strong>🅿️ Parking:</strong> Check the app for available spaces</p>'}
                </div>
                
                <p><strong>Reminders for tomorrow:</strong></p>
                <ul style="color: #6c757d; line-height: 1.6;">
                    <li>Check your parking space assignment in the app</li>
                    <li>Plan your arrival time accordingly</li>
                    <li>Contact your team if you have any questions</li>
                </ul>
                
                <div class="cta">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="cta-button">
                        Open ParkSpace
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p>See you tomorrow!</p>
                <p>The ParkSpace Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
⏰ Event Reminder: ${data.eventName} starts tomorrow!

📅 Dates: ${data.startDate} to ${data.endDate}
🏢 Company: ${data.companyName}

${data.userPooledSpaces.length > 0 ? 
  `🅿️ Your Available Parking Spaces: ${data.userPooledSpaces.map(s => s.spaceCode).join(', ')}` : 
  '🅿️ Parking: Check the app for available spaces'
}

Reminders for tomorrow:
- Check your parking space assignment in the app
- Plan your arrival time accordingly  
- Contact your team if you have any questions

Open ParkSpace: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

See you tomorrow!
The ParkSpace Team
  `;

  return {
    to: [data.userEmail],
    subject,
    html,
    text
  };
};

export const generateWelcomeEmail = (userName: string, userEmail: string, companyName?: string): EmailTemplate => {
  const subject = `Welcome to ParkSpace! 🎉`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 40px 30px; }
            .cta-button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; color: #6c757d; font-size: 14px; }
        </style>
    </head>
    <body>
        <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">
          Your ParkSpace account is ready—get started now.
        </span>
        <div class="container">
            <div class="header">
                <h1>🅿️ Welcome to ParkSpace!</h1>
                <p>Your parking management solution</p>
            </div>
            
            <div class="content">
                <h2>Hi ${userName}! 👋</h2>
                
                <p>Welcome to ParkSpace - your company's new parking management system!</p>
                
                ${companyName ? `<p>You've been added to <strong>${companyName}</strong> and can now:</p>` : '<p>You can now:</p>'}
                
                <ul>
                    <li>🚗 Manage your vehicles</li>
                    <li>🅿️ View available parking spaces</li>
                    <li>📅 Get notified about parking events</li>
                    <li>🏢 Collaborate with your team</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="cta-button">
                        Get Started
                    </a>
                </div>
                
                <p>If you have any questions, don't hesitate to reach out!</p>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The ParkSpace Team</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = [
    `Welcome to ParkSpace, ${userName}!`,
    companyName ? `You've been added to ${companyName}.` : undefined,
    `Manage vehicles, view spaces, and get event notifications.`,
    `Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`
  ].filter(Boolean).join('\n');

  return {
    to: [userEmail],
    subject,
    html,
    text
  };
};

// Main email sending functions
export async function sendEmail(template: EmailTemplate) {
  try {
    if (IS_DRY_RUN) {
      console.log('🧪 DRY RUN — would send:', {
        from: process.env.FROM_EMAIL || 'ParkSpace <onboarding@resend.dev>',
        to: template.to,
        subject: template.subject,
        hasHtml: !!template.html,
        hasText: !!template.text
      });
      return { data: null };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'ParkSpace <cbv.parking@yakel.co.uk>',
      replyTo: process.env.SUPPORT_EMAIL || 'cbv.parking@yakel.co.uk',
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) throw new Error(error.message);
    console.log('Email sent:', data);
    return data;
  } catch (e) {
    console.error('Email service error:', e);
    throw e;
  }
}

export async function sendEventCreatedNotification(eventData: EventNotificationData) {
  const template = generateEventCreatedEmail(eventData);
  return await sendEmail(template);
}

export async function sendEventReminder(reminderData: EventReminderData) {
  const template = generateEventReminderEmail(reminderData);
  return await sendEmail(template);
}

export async function sendWelcomeEmail(userName: string, userEmail: string, companyName?: string) {
  const template = generateWelcomeEmail(userName, userEmail, companyName);
  return await sendEmail(template);
}
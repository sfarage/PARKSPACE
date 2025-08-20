// lib/notifications.ts
import { supabase, (adminSupabase ?? supabase) } from './supabase'
import { sendEventCreatedNotification, sendEventReminder, sendWelcomeEmail } from './email'

const isBrowser = typeof window !== 'undefined';

// Schedule email notifications for an event
export async function scheduleEventNotifications(eventId: number) {
  if (isBrowser) {
    console.warn('Email/privileged ops are server-only; skipping in browser.');
    return;
  }
  
  try {
    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found')
    }

    // Get all companies with pooled spaces for this event
    const { data: eventPools, error: poolsError } = await supabase
      .from('event_pools')
      .select(`
        *,
        spaces (
          id,
          code,
          block,
          number,
          company_id
        ),
        companies (
          id,
          name
        )
      `)
      .eq('event_id', eventId)

    if (poolsError) {
      throw new Error('Failed to get event pools')
    }

    // Group by company
    const companiesMap = new Map()
    eventPools?.forEach(pool => {
      const companyId = pool.company_id
      if (!companiesMap.has(companyId)) {
        companiesMap.set(companyId, {
          company: pool.companies,
          spaces: [],
          users: []
        })
      }
      companiesMap.get(companyId).spaces.push(pool.spaces)
    })

    // For each company, get users and schedule notifications
    for (const [companyId, companyData] of Array.from(companiesMap)) {
      // Get company users
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .eq('company_id', companyId)
        .eq('status', 'active')

      if (usersError || !users) continue

      companyData.users = users

      // Send immediate event creation notification
      try {
        await sendEventCreatedNotification({
          eventName: event.name as string,
          eventDescription: (event.description as string) || undefined,
          startDate: event.start_date as string,
          endDate: event.end_date as string,
          userEmails: users.map(u => u.email as string),
          pooledSpacesCount: companyData.spaces.length,
          companyName: companyData.company.name
        })

        console.log(`Sent event creation notification to ${companyData.company.name}`)
      } catch (emailError) {
        console.error(`Failed to send event creation email to ${companyData.company.name}:`, emailError)
      }

      // Schedule reminder emails for each user (24 hours before event)
      const reminderDate = new Date(event.start_date as string)
      reminderDate.setDate(reminderDate.getDate() - 1) // 24 hours before

      for (const user of users) {
        try {
          await (adminSupabase ?? supabase)
            ?.from('email_notifications')
            .insert({
              event_id: eventId,
              user_id: user.id,
              notification_type: 'event_reminder',
              scheduled_for: reminderDate.toISOString(),
              email_content: {
                eventName: event.name,
                startDate: event.start_date,
                endDate: event.end_date,
                companyName: companyData.company.name,
                userPooledSpaces: companyData.spaces.map((space: any) => ({
                  spaceCode: space.code,
                  block: space.block,
                  number: space.number
                }))
              }
            })

          console.log(`Scheduled reminder for user ${user.name}`)
        } catch (scheduleError) {
          console.error(`Failed to schedule reminder for user ${user.name}:`, scheduleError)
        }
      }
    }

    return { success: true, message: 'Notifications scheduled successfully' }
  } catch (error) {
    console.error('Failed to schedule event notifications:', error)
    throw error
  }
}

// Process pending email notifications (run this periodically)
export async function processPendingNotifications() {
  if (isBrowser) {
    console.warn('Email/privileged ops are server-only; skipping in browser.');
    return { processed: 0 };
  }
  
  try {
    const now = new Date().toISOString()

    // Get all unsent notifications that are due
    const { data: notifications, error } = await (adminSupabase ?? supabase)
      .from('email_notifications')
      .select(`
        *,
        user_profiles (
          id,
          name,
          email
        )
      `)
      .is('sent_at', null)
      .lte('scheduled_for', now)

    if (error) {
      throw new Error('Failed to get pending notifications')
    }

    if (!notifications || notifications.length === 0) {
      console.log('No pending notifications to process')
      return { processed: 0 }
    }

    let processed = 0

    for (const notification of notifications) {
      try {
        const user = notification.user_profiles
        if (!user) continue

        switch (notification.notification_type) {
          case 'event_reminder':
            await sendEventReminder({
              eventName: notification.email_content.eventName,
              startDate: notification.email_content.startDate,
              endDate: notification.email_content.endDate,
              userEmail: notification.recipient_email,
              userName: notification.email_content.userName || 'User',
              companyName: notification.email_content.companyName,
              userPooledSpaces: notification.email_content.userPooledSpaces || []
            })
            break

          default:
            console.log(`Unknown notification type: ${notification.notification_type}`)
            continue
        }

        // Mark as sent
        await (adminSupabase ?? supabase)
          .from('email_notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notification.id)

        processed++
        console.log(`Sent ${notification.notification_type} to ${user.name}`)

      } catch (emailError) {
        console.error(`Failed to send notification ${notification.id}:`, emailError)
      }
    }

    return { processed }
  } catch (error) {
    console.error('Failed to process pending notifications:', error)
    throw error
  }
}

// Send welcome email to new user
export async function sendUserWelcomeEmail(userId: string) {
  if (isBrowser) {
    console.warn('Email/privileged ops are server-only; skipping in browser.');
    return { success: false };
  }
  
  try {
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    // Get company name if user has a company
    let companyName = null;
    if (user.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', user.company_id)
        .single();
      
      companyName = company?.name;
    }

    // Get email from auth.users
    const { data: authUser, error: authError } = await (adminSupabase ?? supabase).auth.admin.getUserById(userId)
    
    if (authError || !authUser.user?.email) {
      throw new Error('User email not found')
    }

    await sendWelcomeEmail(
      String(user?.name ?? ''),
      typeof companyName === 'string' && companyName.trim().length > 0
        ? companyName
        : 'No Company'
    )

    console.log(`Sent welcome email to ${user.name}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    throw error
  }
}

// Cancel event notifications
export async function cancelEventNotifications(eventId: number) {
  if (isBrowser) {
    console.warn('Email/privileged ops are server-only; skipping in browser.');
    return { success: false };
  }
  
  try {
    // Delete all unsent notifications for this event
    const { error } = await (adminSupabase ?? supabase)
      .from('email_notifications')
      .delete()
      .eq('event_id', eventId)
      .is('sent_at', null)

    if (error) {
      throw new Error('Failed to cancel notifications')
    }

    console.log(`Cancelled notifications for event ${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to cancel event notifications:', error)
    throw error
  }
}

// API endpoint helper for processing notifications
export async function createNotificationProcessor() {
  return {
    async process() {
      try {
        const result = await processPendingNotifications()
        return {
          success: true,
          processed: result.processed,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}
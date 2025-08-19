// src/pages/api/notifications/process.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { createNotificationProcessor } from '../../../lib/notifications'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests' 
    })
  }

  // Basic security check - verify the request is authorized
  const authHeader = req.headers.authorization
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (authHeader !== expectedAuth) {
    console.log('Unauthorized notification processing attempt')
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid authorization token' 
    })
  }

  try {
    console.log('Processing scheduled email notifications...')
    
    // Create and run the notification processor
    const processor = await createNotificationProcessor()
    const result = await processor.process()
    
    console.log(`Notification processing complete: ${result.processed} emails sent`)
    
    // Return success response
    res.status(200).json({
      success: true,
      processed: result.processed,
      timestamp: new Date().toISOString(),
      message: `Successfully processed ${result.processed} notifications`
    })
    
  } catch (error) {
    console.error('Failed to process notifications:', error)
    
    // Return error response
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      processed: 0
    })
  }
}

// Optional: Add some helpful comments for the API
/*
This API endpoint processes scheduled email notifications for ParkSpace.

Usage:
POST /api/notifications/process
Authorization: Bearer your-cron-secret

This endpoint:
1. Checks for scheduled email notifications that are due to be sent
2. Sends the emails using Resend
3. Marks them as sent in the database
4. Returns a summary of what was processed

It's designed to be called by:
- Vercel Cron Jobs (recommended for production)
- GitHub Actions
- External cron services
- Manual testing during development

Security:
- Requires a Bearer token matching CRON_SECRET environment variable
- Only accepts POST requests
- Logs unauthorized attempts

Example response:
{
  "success": true,
  "processed": 5,
  "timestamp": "2024-01-20T10:30:00.000Z",
  "message": "Successfully processed 5 notifications"
}
*/
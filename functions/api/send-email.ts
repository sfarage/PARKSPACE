// functions/api/send-email.ts
import { Resend } from 'resend'

// Types shared with your app:
type EmailTemplate = {
  to: string[]
  subject: string
  html: string
  text?: string
}

export const onRequestPost: PagesFunction<{
  RESEND_API_KEY: string
  FROM_EMAIL: string
  SUPPORT_EMAIL: string
}> = async (ctx) => {
  try {
    const { request, env } = ctx
    const body = (await request.json()) as EmailTemplate

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), {
        status: 500,
        headers: cors(),
      })
    }

    const resend = new Resend(env.RESEND_API_KEY)
    const from = env.FROM_EMAIL || 'ParkSpace <onboarding@resend.dev>'
    const replyTo = env.SUPPORT_EMAIL || undefined

    const { data, error } = await resend.emails.send({
      from,
      ...(replyTo ? { replyTo } : {}),
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: cors(),
      })
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: cors(),
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: cors(),
    })
  }
}

function cors() {
  return {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  }
}

// Optional: handle OPTIONS preflight
export const onRequestOptions: PagesFunction = async () =>
  new Response(null, { status: 204, headers: cors() })
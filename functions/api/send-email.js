// /functions/api/send-email.js
function cors() {
  return {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: cors() });

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json(); // { to: string[], subject: string, html: string, text?: string }

    // DRY-RUN in environments without the secret (e.g., Preview)
    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: true, dryRun: true, body }), {
        status: 200,
        headers: cors(),
      });
    }

    const from = env.FROM_EMAIL || 'ParkSpace <onboarding@resend.dev>';
    const replyTo = env.SUPPORT_EMAIL || undefined;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: body.to,
        subject: body.subject,
        html: body.html,
        text: body.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return new Response(
        JSON.stringify({ error: json?.message || resp.statusText }),
        { status: 500, headers: cors() }
      );
    }

    return new Response(JSON.stringify({ ok: true, data: json }), {
      status: 200,
      headers: cors(),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: cors(),
    });
  }
};
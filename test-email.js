const { Resend } = require('resend');

const resend = new Resend('re_4Jdfe7sN_Mem1H1oYaPqXfKgwd7qZznfg');

async function sendTestEmail() {
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'samuel@yakel.co.uk',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });
    
    console.log('Email sent successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendTestEmail();
import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;
  const subjectText = "Verify your email for AI Travel Planner";
  const fromName = "AI Travel Planner";
  
  // Custom or fallback from email (must align with verified sending domains in production)
  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@vagabond.ai";
  const smtpFromFormatted = `${fromName} <${fromEmail}>`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #0ea5e9; margin: 0; font-size: 24px; font-weight: 800;">Vagabond.AI</h2>
      </div>
      <h1 style="font-size: 20px; font-weight: 700; color: #1e293b; margin-top: 0;">Verify your email</h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">Click the button below to verify your email and start planning trips with Vagabond AI.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${verifyLink}" style="display: inline-block; background-color: #0ea5e9; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);">Verify Email</a>
      </div>
      <p style="font-size: 12px; color: #64748b; line-height: 1.5;">If the button above does not work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; color: #0ea5e9; word-break: break-all;">${verifyLink}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This link will expire in 24 hours. If you did not request this email, you can safely ignore it.</p>
    </div>
  `;

  console.log("=================================================");
  console.log(`VERIFICATION DISPATCH INITIATED`);
  console.log(`RECIPIENT: ${email}`);
  console.log(`LINK: ${verifyLink}`);
  console.log("=================================================");

  // 1. Try Resend API integration (extremely common for Next.js/Vercel)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      console.log("Attempting dispatch via Resend REST API...");
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: smtpFromFormatted,
          to: email,
          subject: subjectText,
          html: htmlContent,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(`Successfully dispatched via Resend. Message ID: ${data.id || "unknown"}`);
        return true;
      } else {
        console.error("Resend API responded with an error:", data);
      }
    } catch (err) {
      console.error("Failed to send email via Resend API:", err);
    }
  }

  // 2. Try SendGrid API integration
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (sendgridApiKey) {
    try {
      console.log("Attempting dispatch via SendGrid REST API...");
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: fromEmail, name: fromName },
          subject: subjectText,
          content: [{ type: "text/html", value: htmlContent }],
        }),
      });

      if (res.ok) {
        console.log("Successfully dispatched via SendGrid API.");
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("SendGrid API responded with an error:", errData);
      }
    } catch (err) {
      console.error("Failed to send email via SendGrid API:", err);
    }
  }

  // 3. Try standard SMTP connection (Nodemailer)
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    try {
      console.log(`Attempting dispatch via SMTP (${smtpHost}:${smtpPort})...`);
      const isSecure = parseInt(smtpPort) === 465;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFromFormatted,
        to: email,
        subject: subjectText,
        html: htmlContent,
      });

      console.log(`Successfully dispatched via SMTP. Message ID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error("Failed to send email via SMTP transporter:", err);
    }
  }

  console.warn("No active email dispatch channel (Resend, SendGrid, or SMTP) is configured in environment variables. Local testing link logged above.");
  return false;
}

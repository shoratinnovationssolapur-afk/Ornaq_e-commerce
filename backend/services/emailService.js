import nodemailer from "nodemailer";

let transporter;

const fallbackFromEmail = "onboarding@resend.dev";

const cleanEnvValue = (value = "") => String(value).trim().replace(/^['"]|['"]$/g, "").trim();

const extractEmailAddress = (value = "") => {
  const cleaned = cleanEnvValue(value);
  const angleMatch = cleaned.match(/<([^>]+)>/);
  if (angleMatch) return angleMatch[1].trim();

  const emailMatch = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch?.[0]?.trim() || "";
};

const getFromAddress = () => {
  const configuredFrom = cleanEnvValue(process.env.EMAIL_FROM);
  const email = extractEmailAddress(configuredFrom);

  if (!email) {
    return process.env.RESEND_API_KEY ? `ORNAQ <${fallbackFromEmail}>` : "ornac@local.test";
  }

  if (configuredFrom.includes("<") && configuredFrom.includes(">")) {
    return configuredFrom.replace(/<[^>]+>/, `<${email}>`);
  }

  return process.env.EMAIL_FROM_NAME ? `${process.env.EMAIL_FROM_NAME} <${email}>` : email;
};

const stripSenderName = (value) => {
  return extractEmailAddress(value);
};

const getSenderDomain = () => extractEmailAddress(getFromAddress()).split("@")[1] || "";

const getEmailProvider = () => cleanEnvValue(process.env.EMAIL_PROVIDER).toLowerCase();

const sendWithResend = async ({ to, subject, text, html }) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [to],
      subject,
      text,
      html
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || data.error?.message || "Resend email delivery failed.";
    const senderDomain = getSenderDomain();
    throw new Error(
      `${message}${senderDomain ? ` Check that ${senderDomain} is verified in the same Resend workspace as RESEND_API_KEY.` : ""}`
    );
  }

  return data;
};

const sendWithBrevo = async ({ to, subject, text, html }) => {
  const from = getFromAddress();
  const content = html ? { htmlContent: html } : { textContent: text || "" };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        email: stripSenderName(from),
        name: process.env.EMAIL_FROM_NAME || "ORNAQ"
      },
      to: [{ email: to }],
      subject,
      ...content
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Brevo email delivery failed.");
  }

  return data;
};

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        : undefined
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return;

  const provider = getEmailProvider();

  if (provider === "resend") {
    return sendWithResend({ to, subject, text, html });
  }

  if (provider === "brevo") {
    return sendWithBrevo({ to, subject, text, html });
  }

  if (provider && provider !== "smtp") {
    throw new Error("EMAIL_PROVIDER must be one of resend, brevo, or smtp.");
  }

  if (process.env.RESEND_API_KEY) {
    try {
      return await sendWithResend({ to, subject, text, html });
    } catch (error) {
      if (!process.env.BREVO_API_KEY) throw error;
      console.warn(`Resend email failed, trying Brevo fallback: ${error.message}`);
    }
  }

  if (process.env.BREVO_API_KEY) {
    return sendWithBrevo({ to, subject, text, html });
  }

  const mailer = await getTransporter();
  const info = await mailer.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html
  });

  if (!process.env.SMTP_HOST) {
    console.log("Email preview:", info.message?.toString?.() || info.messageId);
  }

  return info;
};

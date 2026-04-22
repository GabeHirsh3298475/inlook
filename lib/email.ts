import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

const BRAND = {
  bg: "#0a0a0b",
  cardBg: "#0f0f11",
  border: "#1a1a1f",
  text: "#f6f4ef",
  muted: "#9b9ba3",
  accent: "#d4ff3a",
  accentDark: "#b8e020",
};

function layout(inner: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${BRAND.cardBg};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden">
        <tr><td style="padding:32px 36px 24px">
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRAND.accent};letter-spacing:0.02em">Inlook</p>
        </td></tr>
        <tr><td style="padding:0 36px 36px">
          ${inner}
        </td></tr>
        <tr><td style="padding:20px 36px;border-top:1px solid ${BRAND.border}">
          <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.5">
            Inlook · Brand-creator marketplace<br>
            <a href="https://inlookdeals.com" style="color:${BRAND.muted};text-decoration:underline">inlookdeals.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendApplicationConfirmation(to: string, name: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping confirmation email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(name)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      We're thrilled to have you be a part of the Inlook community.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Approvals typically take under 24 hours. Once approved, you'll receive
      a separate email with a link to set up your creator profile and go live
      on the network.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      In the meantime, if you have any questions reply to this email.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: "Thanks for applying to Inlook",
    html,
  });
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  signInUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping welcome email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(name)},
    </p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:600;line-height:1.3;color:${BRAND.text}">
      You've been approved.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Click the button below to create your account and set up your
      Inlook creator profile.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(signInUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Set up my account
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Once you're in, you'll complete your profile and publish yourself to
      brands looking for creators like you.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      To your future success,<br><br>
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: "Welcome to Inlook!",
    html,
  });
}

export async function sendBrandWelcomeEmail(
  to: string,
  businessName: string,
  signInUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping brand welcome email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(businessName)},
    </p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:600;line-height:1.3;color:${BRAND.text}">
      You&rsquo;re verified.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Click the button below to create your brand account on Inlook.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(signInUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Set up my account
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Once you&rsquo;re in, you&rsquo;ll be able to browse verified creator
      profiles and start deals.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: "Welcome to Inlook!",
    html,
  });
}

export async function sendBrandApplicationConfirmation(
  to: string,
  businessName: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping brand confirmation email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(businessName)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      To verify ownership, our team will contact you shortly, using your
      brand&rsquo;s public contact channel (such as the support email listed
      on your website).
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Outreach typically takes under 24 hours. Once verified, you&rsquo;ll
      receive a separate email with a link to set up your brand profile.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: "Your Inlook application has been received",
    html,
  });
}

export async function sendBrandApplicationNotification(data: {
  businessName: string;
  email: string;
  productUrl: string;
  socialUrl: string | null;
}) {
  const transporter = getTransporter();
  if (!transporter) return;

  const html = `
    <h2>New Brand Application</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Business Name</td><td>${esc(data.businessName)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Business Email</td><td>${esc(data.email)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Product Link</td><td>${esc(data.productUrl)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Social Media URL</td><td>${esc(data.socialUrl ?? "N/A")}</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to: "support@inlookdeals.com",
    subject: "New Brand Application",
    html,
  });
}

export async function sendAdminNotification(
  name: string,
  email: string,
  platform: string,
  url: string,
  niche: string,
  followers: string,
  youtubeName: string | null,
  youtubeEmail: string | null
) {
  const transporter = getTransporter();
  if (!transporter) return;

  const html = `
    <h2>New Creator Application</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Creator Name</td><td>${esc(name)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Email</td><td>${esc(email)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Platform</td><td>${esc(platform)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Channel URL</td><td>${esc(url)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Niche</td><td>${esc(niche)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">Followers</td><td>${esc(followers)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:600">YouTube Account</td><td>${esc(youtubeName ?? "N/A")} (${esc(youtubeEmail ?? "N/A")})</td></tr>
    </table>
  `;

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to: "support@inlookdeals.com",
    subject: `New Creator Application – ${name}`,
    html,
  });
}

export async function sendCreatorNewMessageEmail(
  to: string,
  creatorName: string,
  brandName: string,
  messagesUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping new message email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(creatorName)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      ${esc(brandName)} just reached out to you on Inlook.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(messagesUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Open your messages
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: "A new brand messaged you",
    html,
  });
}

export async function sendBrandMessageReplyEmail(
  to: string,
  brandName: string,
  creatorName: string,
  messagesUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping reply email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(brandName)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      ${esc(creatorName)} replied to your message on Inlook.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(messagesUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Open your messages
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: `${creatorName} replied to your message`,
    html,
  });
}

export async function sendCreatorAgreementEmail(
  to: string,
  creatorName: string,
  brandName: string,
  format: "long" | "short",
  messagesUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping agreement email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(creatorName)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      ${esc(brandName)} agreed to create a ${format} video.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(messagesUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Open your messages
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: `${brandName} agreed to create a ${format}`,
    html,
  });
}

export async function sendBrandAgreementEmail(
  to: string,
  brandName: string,
  creatorName: string,
  format: "long" | "short",
  messagesUrl: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping agreement email.");
    return;
  }

  const html = layout(`
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Hi ${esc(brandName)},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BRAND.text}">
      ${esc(creatorName)} agreed to create a ${format} video.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
      <tr><td style="background:${BRAND.accent};border-radius:999px;padding:14px 32px">
        <a href="${esc(messagesUrl)}" style="color:#0a0a0b;font-size:15px;font-weight:600;text-decoration:none;display:inline-block">
          Open your messages
        </a>
      </td></tr>
    </table>
    <p style="margin:0;font-size:15px;line-height:1.7;color:${BRAND.text}">
      Gabe and Z,<br>
      <span style="color:${BRAND.muted}">Founders of Inlook</span>
    </p>
  `);

  await transporter.sendMail({
    from: `"Inlook" <support@inlookdeals.com>`,
    to,
    subject: `${creatorName} agreed to create a ${format}`,
    html,
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

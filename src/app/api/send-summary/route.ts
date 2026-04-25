import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  const { email, summary } = await request.json();

  if (!email || !summary) {
    return NextResponse.json({ error: "Missing email or summary" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Demo mode: pretend it worked
    return NextResponse.json({ success: true, demo: true });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "Resonance <onboarding@resend.dev>",
    to: email,
    subject: "Your Resonance session reflection",
    html: buildEmailHtml(summary),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

function buildEmailHtml(summary: {
  themes: string[];
  personalTakeaway: string;
  groupSummary: string;
  nextStep: string;
  nextSession: string;
}) {
  const themeList = summary.themes
    .map((t) => `<li style="margin:4px 0;">${t}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:#7c5c3e;padding:32px;text-align:center;">
      <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.05em;text-transform:uppercase;">Resonance</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#fff;">Your Session Reflection</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">

      <!-- Themes -->
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#9a7e68;text-transform:uppercase;letter-spacing:0.06em;">Key themes</h2>
        <ul style="margin:0;padding-left:20px;color:#2d2417;font-size:15px;line-height:1.6;">
          ${themeList}
        </ul>
      </div>

      <hr style="border:none;border-top:1px solid #e8d9cc;margin:24px 0;">

      <!-- Personal takeaway -->
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 10px;font-size:13px;font-weight:600;color:#9a7e68;text-transform:uppercase;letter-spacing:0.06em;">For you personally</h2>
        <p style="margin:0;color:#2d2417;font-size:15px;line-height:1.7;">${summary.personalTakeaway}</p>
      </div>

      <hr style="border:none;border-top:1px solid #e8d9cc;margin:24px 0;">

      <!-- Group summary -->
      <div style="margin-bottom:24px;">
        <h2 style="margin:0 0 10px;font-size:13px;font-weight:600;color:#9a7e68;text-transform:uppercase;letter-spacing:0.06em;">Group reflection</h2>
        <p style="margin:0;color:#2d2417;font-size:15px;line-height:1.7;">${summary.groupSummary}</p>
      </div>

      <hr style="border:none;border-top:1px solid #e8d9cc;margin:24px 0;">

      <!-- Next step -->
      <div style="background:#fdf4ec;border-left:3px solid #7c5c3e;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
        <h2 style="margin:0 0 8px;font-size:13px;font-weight:600;color:#7c5c3e;text-transform:uppercase;letter-spacing:0.06em;">Suggested next step</h2>
        <p style="margin:0;color:#2d2417;font-size:15px;line-height:1.7;font-weight:500;">${summary.nextStep}</p>
      </div>

      <!-- Next session -->
      <div style="background:#f5ede4;border-radius:10px;padding:14px 18px;display:flex;align-items:center;">
        <p style="margin:0;color:#7c5c3e;font-size:14px;">
          <strong>Next pod meeting:</strong> ${summary.nextSession}
        </p>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#fdf8f4;text-align:center;border-top:1px solid #e8d9cc;">
      <p style="margin:0;font-size:12px;color:#9a7e68;">Resonance &mdash; A safe space for peer support</p>
    </div>

  </div>
</body>
</html>`;
}

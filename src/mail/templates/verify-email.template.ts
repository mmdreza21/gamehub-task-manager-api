// ../mail/templates/verify-email.template.ts

export const verifyEmailTemplate = (verifyUrl: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        background-color: #f6f9fc;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, #4f46e5, #3b82f6);
        color: #ffffff;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 32px 24px;
        text-align: center;
      }
      .content h2 {
        color: #111827;
        font-size: 22px;
        margin-bottom: 12px;
      }
      .content p {
        font-size: 16px;
        color: #4b5563;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .verify-button {
        display: inline-block;
        background-color: #3b82f6;
        color: #fff;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        transition: background-color 0.3s ease;
      }
        .btn-text{
         color: #fff;
        }
      .verify-button:hover {
        background-color: #2563eb;
      }
      .link {
        display: block;
        margin-top: 16px;
        word-break: break-all;
        color: #3b82f6;
        text-decoration: none;
      }
      .footer {
        background-color: #f9fafb;
        text-align: center;
        padding: 16px;
        font-size: 14px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Verify Your Account</h1>
      </div>
      <div class="content">
        <h2>Hello 👋</h2>
        <p>
          Thank you for registering! To activate your account, please click the
          button below to verify your email address.
        </p>

        <a href="${verifyUrl}" target="_blank" class="verify-button">
       <span class="btn-text">
       Verify Email
       </span>
        </a>

        <a href="${verifyUrl}" target="_blank" class="link">${verifyUrl}</a>

        <p style="margin-top: 24px; color: #6b7280;">
          This verification link will expire in <strong>1 hour</strong>.
        </p>
      </div>
      <div class="footer">
        If you didn’t create this account, please ignore this email.
      </div>
    </div>
  </body>
</html>
`;

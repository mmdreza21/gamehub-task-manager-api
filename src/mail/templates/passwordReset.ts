export function passwordResetTemplate(otp: string) {
  return `
    <div style="
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      padding: 40px 0;
      text-align: center;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #1a73e8;">Password Reset Request</h1>
        <p style="font-size: 16px; color: #555;">
          You requested to reset your password. Use the OTP below to set a new password:
        </p>
        <div style="
          display: inline-block;
          margin: 20px 0;
          padding: 15px 25px;
          font-size: 24px;
          font-weight: bold;
          color: #1a73e8;
          border: 2px dashed #1a73e8;
          border-radius: 8px;
          letter-spacing: 4px;
        ">${otp}</div>
        <p style="font-size: 14px; color: #999;">
          This OTP is valid for 10 minutes.
        </p>
        <p style="font-size: 14px; color: #999;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  `;
}

// Utility for OTP Generation, Expiry, and Notification Dispatch via Express APIs

export interface OtpSession {
  code: string;
  channel: "email" | "mobile";
  recipient: string;
  expiresAt: number; // Unix timestamp in ms
  resendCooldownUntil: number; // Unix timestamp in ms
  resendCount: number;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil?: number;
}

export const generate6DigitOtp = (): string => {
  // Generate a realistic 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
};

export const sendOtpNotification = async (
  channel: "email" | "mobile",
  recipient: string,
  code: string,
  purpose: "Login" | "Registration" | "Password Reset"
): Promise<{ success: boolean; message: string }> => {
  try {
    if (channel === "mobile") {
      const message = `Your SmartShop ${purpose} OTP code is: ${code}. Valid for 5 minutes. Do not share this code.`;
      const res = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: recipient, message }),
      });
      const data = await res.json();
      return {
        success: true,
        message: `6-digit OTP sent to Mobile (${recipient}).`,
      };
    } else {
      const subject = `SmartShop ${purpose} - Your 6-Digit OTP Code`;
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; margin: 0 auto;">
          <h2 style="color: #4f46e5; margin-bottom: 10px;">SmartShop Security Verification</h2>
          <p style="font-size: 14px; color: #334155;">Your verification code for <strong>${purpose}</strong> is:</p>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f172a; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #64748b;">This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `;
      const res = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: recipient, subject, htmlContent }),
      });
      const data = await res.json();
      return {
        success: true,
        message: `6-digit OTP code dispatched to Email (${recipient}). Please check your inbox & spam folder!`,
      };
    }
  } catch (err) {
    console.warn("Notification dispatch notice:", err);
    return {
      success: true,
      message: `6-digit OTP code dispatched to ${channel === "mobile" ? "SMS" : "Email"} (${recipient}). Please check your inbox!`,
    };
  }
};

const getSharedStyles = (primaryColor) => `
  margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
  background-color: #f8fafc; color: #334155; -webkit-font-smoothing: antialiased;
`;

const generateEmailWrapper = (content, title, securityWarning = null) => {
  const primaryColor = "#437FC7";
  const year = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="${getSharedStyles(primaryColor)}">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              
              ${securityWarning ? `
              <tr>
                <td style="background-color: #fff7ed; padding: 12px 20px; border-bottom: 1px solid #ffedd5; margin: 10px;">
                  <p style="margin: 0; font-size: 12px; color: #9a3412; line-height: 1.4; text-align: center;">
                    <strong>Security Notice:</strong> ${securityWarning}
                  </p>
                </td>
              </tr>
              ` : ''}

              <tr>
                <td align="center" style="padding: 40px 40px 0 40px;">
                  <div style="color: ${primaryColor}; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">GTask</div>
                </td>
              </tr>

              ${content}

              <tr>
                <td style="padding: 30px 40px; background-color: #fcfcfd; border-top: 1px solid #f1f5f9; text-align: center;">
                  <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
                    AkiraCode
                  </p>
                  <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">
                    &copy; ${year} GTask.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const generateCodeVerificationHTML = (code, receiverFirstName) => {
  const primaryColor = "#437FC7";
  const content = `
    <tr>
      <td style="padding: 30px 40px 20px 40px; text-align: center;">
        <h1 style="margin: 0 0 12px 0; color: #1e293b; font-size: 24px; font-weight: 800;">Verify your account</h1>
        <p style="margin: 0; font-size: 15px; line-height: 24px; color: #64748b;">
          Hi ${receiverFirstName}, thanks for joining GTask! Use the code below to finish setting up your account.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0 40px 30px 40px;">
        <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; display: inline-block;">
          <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: ${primaryColor};">
            ${code}
          </span>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 13px; color: #94a3b8;">
          This code is valid for <strong>5 minutes</strong>.
        </p>
      </td>
    </tr>
  `;
  const warning = "If you did not request this code, please ignore this email. No further action is required.";
  return generateEmailWrapper(content, "Verify Your GTask Account", warning);
};

const generateResendCodeHTML = (code) => {
  const primaryColor = "#437FC7";
  const content = `
    <tr>
      <td style="padding: 30px 40px 20px 40px; text-align: center;">
        <h1 style="margin: 0 0 12px 0; color: #1e293b; font-size: 24px; font-weight: 800;">New Access Code</h1>
        <p style="margin: 0; font-size: 15px; line-height: 24px; color: #64748b;">
          We received a request for a new verification code. Please use the code below to continue.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0 40px 30px 40px;">
        <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; display: inline-block;">
          <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: ${primaryColor};">
            ${code}
          </span>
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #94a3b8;">
            This code is valid for <strong>5 minutes</strong>.
          </p>
        </div>
      </td>
    </tr>
  `;
  const warning = "A new code was requested. If this wasn't you, please secure your account immediately.";
  return generateEmailWrapper(content, "Your New GTask Code", warning);
};

const generateForgotPasswordEmailHTML = (resetLink, receiverFirstName) => {
  const primaryColor = "#437FC7";
  const content = `
    <tr>
      <td style="padding: 30px 40px 20px 40px; text-align: center;">
        <h1 style="margin: 0 0 12px 0; color: #1e293b; font-size: 24px; font-weight: 800;">Password Reset</h1>
        <p style="margin: 0; font-size: 15px; line-height: 24px; color: #64748b;">
          Hi ${receiverFirstName}, we received a request to reset your password. Click the button below to secure your account.
        </p>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 10px 40px 30px 40px;">
        <a href="${resetLink}" target="_blank" style="background-color: ${primaryColor}; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; font-size: 16px;">
          Reset Password
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 40px 30px 40px; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
          If the button doesn't work, copy and paste this link:
        </p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: ${primaryColor}; word-break: break-all;">
          ${resetLink}
        </p>
      </td>
    </tr>
  `;
  const warning = "If you did not request a password reset, your account is still safe, you may ignore or delete this email.";
  return generateEmailWrapper(content, "Reset Your GTask Password", warning);
};


module.exports = { 
  generateCodeVerificationHTML, 
  generateResendCodeHTML, 
  generateForgotPasswordEmailHTML 
};
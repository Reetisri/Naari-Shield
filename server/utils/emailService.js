const nodemailer = require('nodemailer');

// Setup SMTP transporter or mock/fallback console logger
let transporter;
const useSMTP = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

if (useSMTP) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Nodemailer SMTP Transporter initialized successfully.');
} else {
  console.warn('⚠️ SMTP credentials not fully configured. Email service will run in Console/Log fallback mode.');
}

/**
 * Sends an urgent emergency SOS email to a guardian
 * @param {string} guardianEmail 
 * @param {string} guardianName 
 * @param {string} userName 
 * @param {number} latitude 
 * @param {number} longitude 
 */
const sendEmergencyEmail = async (guardianEmail, guardianName, userName, latitude, longitude) => {
  const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const subject = `🚨 URGENT: Naari Shield SOS Emergency Alert from ${userName}`;
  
  const textContent = `URGENT ALERT: ${userName} has triggered a critical SOS alert!
Coordinates: Latitude ${latitude}, Longitude ${longitude}
Track live location immediately on Google Maps: ${mapsLink}
This email was generated automatically by Naari Shield AI because you are listed as their Emergency Guardian.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background-color: #fafafa;">
      <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">🚨 URGENT SOS ALERT 🚨</h1>
      </div>
      <div style="padding: 24px; color: #1e293b;">
        <p style="font-size: 16px; margin-top: 0;">Dear <strong>${guardianName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Your linked contact, <strong style="font-size: 18px; color: #ef4444;">${userName}</strong>, has triggered a critical SOS alert from the Naari Shield safety application.
        </p>
        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <strong style="display: block; font-size: 14px; text-transform: uppercase; color: #991b1b; margin-bottom: 4px;">Current Beacon Coordinates:</strong>
          <span style="font-family: monospace; font-size: 14px; color: #7f1d1d;">Latitude: ${latitude.toFixed(6)}°, Longitude: ${longitude.toFixed(6)}°</span>
        </div>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${mapsLink}" target="_blank" style="background-color: #6366f1; color: white; padding: 14px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 15px; box-shadow: 0 4px 6px rgba(99,102,241,0.2);">
            📍 Track Live on Google Maps
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 0;">
          This is an automated safety alert dispatched by the Naari Shield AI real-time safety network. You received this because you were linked as a trusted emergency guardian by ${userName}. Please take immediate action.
        </p>
      </div>
      <div style="background-color: #f1f5f9; padding: 12px 20px; text-align: center; font-size: 12px; color: #64748b;">
        &copy; ${new Date().getFullYear()} Naari Shield AI. All rights reserved.
      </div>
    </div>
  `;

  if (useSMTP) {
    try {
      const info = await transporter.sendMail({
        from: `"Naari Shield AI" <${process.env.SMTP_USER}>`,
        to: guardianEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[Email Dispatch] Successfully sent SOS email to ${guardianEmail}. MsgID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`[Email Dispatch Error] Failed to send email to ${guardianEmail}:`, err.message);
      throw err;
    }
  } else {
    // Print fallback log simulation
    console.log(`
============================================================
📱 [SIMULATED EMAIL ALERTS GATEWAY]
TO: ${guardianName} (${guardianEmail})
SUBJECT: ${subject}
BODY:
${textContent}
============================================================
    `);
    return { simulated: true };
  }
};

module.exports = {
  sendEmergencyEmail,
};

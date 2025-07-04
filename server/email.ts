import nodemailer from 'nodemailer';

const GMAIL_USER = "almeerahlosper@gmail.com";
const FROM_NAME = "Govtec Events Team";

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD || '' // Will need Gmail App Password
  }
});

interface EmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    console.log(`📧 Sending email to: ${params.to}`);
    console.log(`📋 Subject: ${params.subject}`);
    console.log(`👤 From: ${GMAIL_USER}`);
    
    const mailOptions = {
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    };
    
    console.log('🚀 Sending via Gmail SMTP...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Gmail Response - Message ID: ${info.messageId}`);
    console.log(`📨 Response: ${info.response}`);
    console.log('🎉 Email successfully sent via Gmail SMTP');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ Gmail SMTP error:', error);
    if (error.code) {
      console.error(`📝 Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`📝 Error response: ${error.response}`);
    }
    return false;
  }
}

export function generateConfirmationEmail(
  firstName: string,
  lastName: string,
  registrationId: string
): { subject: string; text: string; html: string } {
  const subject = `🎉 Registration Confirmed - Govtec Competition`;
  
  const text = `
Hello ${firstName} ${lastName},

Congratulations! Your registration for the Govtec Competition has been successfully confirmed.

Registration Details:
• Registration ID: ${registrationId}
• Name: ${firstName} ${lastName}
• Event: Govtec Competition

Please save this email as confirmation. Your Registration ID may be required at the event.

We're excited to see you at the competition!

Best regards,
The Govtec Events Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #4169e1 100%); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 Registration Confirmed!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Govtec Competition</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #4169e1; margin-top: 0; font-size: 24px;">Hello ${firstName}!</h2>
      
      <p style="font-size: 16px; margin-bottom: 25px;">Congratulations! Your registration for the <strong>Govtec Competition</strong> has been successfully confirmed.</p>
      
      <!-- Registration Details Card -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #f97316; padding: 20px; margin: 25px 0; border-radius: 5px;">
        <h3 style="margin: 0 0 15px 0; color: #4169e1; font-size: 18px;">📋 Registration Details</h3>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Registration ID:</strong> <span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${registrationId}</span></p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Event:</strong> Govtec Competition</p>
      </div>
      
      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 25px 0;">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>📌 Important:</strong> Please save this email as confirmation. Your Registration ID may be required at the event.
        </p>
      </div>
      
      <p style="font-size: 16px; margin-top: 30px;">We're excited to see you at the competition!</p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; font-size: 16px; color: #4169e1; font-weight: bold;">Best regards,</p>
      <p style="margin: 5px 0 15px 0; font-size: 16px; color: #4169e1; font-weight: bold;">The Govtec Events Team</p>
      <p style="margin: 0; font-size: 12px; color: #6c757d;">
        This is an automated confirmation email from Govtec Events.<br>
        Please do not reply to this email.
      </p>
    </div>
    
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
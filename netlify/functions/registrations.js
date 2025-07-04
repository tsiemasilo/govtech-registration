const { GoogleSpreadsheet } = require('google-spreadsheet');

// Simple in-memory storage for demo
let registrations = [];
let currentId = 1;

// Valid registration codes
const validCodes = ['GOVTEC2025', 'COMP001', 'REG123', 'EVENT2025'];

// Google Sheets integration
async function addToGoogleSheets(registrationData) {
  try {
    // Parse the service account credentials from environment variables
    const serviceAccountAuth = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
    await doc.useServiceAccountAuth(serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0]; // First sheet
    
    await sheet.addRow({
      'Registration ID': registrationData.formattedId,
      'First Name': registrationData.firstName,
      'Last Name': registrationData.lastName,
      'Email': registrationData.email,
      'Phone': registrationData.phone,
      'Company': registrationData.company || '',
      'Job Title': registrationData.jobTitle || '',
      'Data Consent': registrationData.dataConsent ? 'Yes' : 'No',
      'Marketing Consent': registrationData.marketingConsent ? 'Yes' : 'No',
      'Registration Date': new Date().toISOString()
    });
    
    console.log('Successfully added registration to Google Sheets');
    return true;
  } catch (error) {
    console.error('Error adding to Google Sheets:', error);
    return false;
  }
}

// Email sending function
async function sendEmail(registrationData) {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Registration Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f8f9fa; }
          .details { background: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <p>Govtec Competition</p>
          </div>
          
          <div class="content">
            <h2>Hello ${registrationData.firstName}!</h2>
            <p>Thank you for registering for the <strong>Govtec Competition!</strong> Your registration has been successfully confirmed.</p>
            
            <div class="details">
              <h3>Registration Details</h3>
              <p><strong>Registration ID:</strong> ${registrationData.formattedId}</p>
              <p><strong>Name:</strong> ${registrationData.firstName} ${registrationData.lastName}</p>
              <p><strong>Email:</strong> ${registrationData.email}</p>
              <p><strong>Phone:</strong> ${registrationData.phone}</p>
              ${registrationData.company ? `<p><strong>Company:</strong> ${registrationData.company}</p>` : ''}
              ${registrationData.jobTitle ? `<p><strong>Job Title:</strong> ${registrationData.jobTitle}</p>` : ''}
            </div>
            
            <p>Please keep this email for your records. You may need your Registration ID for the event.</p>
            <p><strong>We look forward to seeing you at the competition!</strong></p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br><strong>The Govtec Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"GovTec Conference Events Team" <${process.env.GMAIL_USER}>`,
      to: registrationData.email,
      subject: '🎉 Registration Confirmed - Govtec Competition',
      html: htmlContent
    });

    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      
      // Validate required fields
      if (!data.firstName || !data.lastName || !data.email) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      // Create registration
      const registration = {
        id: currentId++,
        formattedId: `GOV-${String(currentId - 1).padStart(6, '0')}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        dataConsent: data.dataConsent,
        marketingConsent: data.marketingConsent,
        communicationMethod: data.communicationMethod || 'email',
        createdAt: new Date().toISOString()
      };

      registrations.push(registration);

      // Add to Google Sheets (don't block on failure)
      const sheetsSuccess = await addToGoogleSheets(registration);
      if (!sheetsSuccess) {
        console.warn('Failed to add registration to Google Sheets');
      }

      // Send email (don't block on failure)
      const emailSuccess = await sendEmail(registration);
      if (!emailSuccess) {
        console.warn('Failed to send confirmation email');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(registration)
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Internal server error' })
      };
    }
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(registrations)
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
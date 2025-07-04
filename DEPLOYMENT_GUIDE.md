# Complete Netlify Deployment Guide with Google Sheets Integration

## Part 1: Prepare Your Application for Netlify

### Step 1: Create Netlify Configuration Files

1. Create a `netlify.toml` file in your project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Create a build script by updating your `package.json`:
```json
{
  "scripts": {
    "build": "cp client/index.html dist/index.html && mkdir -p dist && cp -r client/* dist/",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

### Step 2: Create Netlify Functions Directory Structure

1. Create the directory: `mkdir -p netlify/functions`

2. Convert your server endpoints to Netlify functions (we'll do this in the next steps)

## Part 2: Set Up Google Sheets Integration

### Step 1: Create Google Cloud Project and Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name your project (e.g., "Govtec Registration")
4. Click "Create"

5. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

6. Enable Google Drive API (required for Sheets access):
   - Search for "Google Drive API" 
   - Click on it and press "Enable"

### Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter service account details:
   - Name: `govtec-sheets-access`
   - Description: `Service account for Govtec registration data`
4. Click "Create and Continue"
5. For roles, select "Editor" (or create custom role with Sheets access)
6. Click "Continue" then "Done"

### Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Click "Create" - this downloads a JSON file
6. **IMPORTANT**: Keep this file secure and never commit it to version control

### Step 4: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Govtec Registration Data"
4. Set up headers in row 1:
   - A1: Registration ID
   - B1: First Name  
   - C1: Last Name
   - D1: Email
   - E1: Phone
   - F1: Company
   - G1: Job Title
   - H1: Data Consent
   - I1: Marketing Consent
   - J1: Registration Date

5. Copy the spreadsheet ID from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Save the SPREADSHEET_ID for later

6. Share the sheet with your service account:
   - Click "Share" button
   - Enter the service account email (from the JSON file, it's the "client_email" field)
   - Give "Editor" permissions
   - Uncheck "Notify people"
   - Click "Share"

## Part 3: Update Your Application Code

### Step 1: Install Required Dependencies

Run these commands in your project:
```bash
npm install googleapis
npm install @netlify/functions
```

### Step 2: Create Google Sheets Service

Create `netlify/functions/utils/sheets.js`:
```javascript
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Parse the service account key from environment variable
const serviceAccountAuth = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

async function addRegistrationToSheet(registrationData) {
  try {
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
    
    return true;
  } catch (error) {
    console.error('Error adding to Google Sheets:', error);
    return false;
  }
}

module.exports = { addRegistrationToSheet };
```

### Step 3: Create Netlify Functions

Create `netlify/functions/registrations.js`:
```javascript
const { addRegistrationToSheet } = require('./utils/sheets');

// Simple in-memory storage for demo (replace with actual database in production)
let registrations = [];
let currentId = 1;

const validCodes = ['GOVTEC2025', 'COMP001', 'REG123', 'EVENT2025'];

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
        createdAt: new Date().toISOString()
      };

      registrations.push(registration);

      // Add to Google Sheets
      const sheetsSuccess = await addRegistrationToSheet(registration);
      if (!sheetsSuccess) {
        console.warn('Failed to add registration to Google Sheets');
      }

      // Send email (using existing email service)
      // ... email sending code ...

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(registration)
      };
    } catch (error) {
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
```

Create `netlify/functions/verify-code.js`:
```javascript
const validCodes = ['GOVTEC2025', 'COMP001', 'REG123', 'EVENT2025'];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { code } = JSON.parse(event.body);
      const isValid = validCodes.includes(code.toUpperCase());
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid: isValid })
      };
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
```

## Part 4: Deploy to Netlify

### Step 1: Prepare Your Repository

1. Create a GitHub repository
2. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Netlify

1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose GitHub and authorize Netlify
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Step 3: Configure Environment Variables

1. In your Netlify dashboard, go to your site
2. Click "Site settings" > "Environment variables"
3. Add these variables:

**From your Google service account JSON file:**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: The "client_email" value
- `GOOGLE_PRIVATE_KEY`: The "private_key" value (keep the \n characters)
- `GOOGLE_SPREADSHEET_ID`: Your Google Sheet ID

**Email configuration:**
- `GMAIL_APP_PASSWORD`: Your Gmail app password
- `GMAIL_USER`: Your Gmail address

4. Click "Save"

### Step 4: Update Your HTML

Update the API calls in your `client/index.html` to work with Netlify:

Change:
```javascript
const response = await fetch('/api/registrations', {
```

To:
```javascript
const response = await fetch('/.netlify/functions/registrations', {
```

And:
```javascript
const response = await fetch('/api/verify-code', {
```

To:
```javascript
const response = await fetch('/.netlify/functions/verify-code', {
```

### Step 5: Test Your Deployment

1. Wait for deployment to complete
2. Visit your Netlify site URL
3. Test the registration flow
4. Check your Google Sheet to see if data appears

## Part 5: Custom Domain (Optional)

### Step 1: Purchase Domain
1. Buy a domain from any registrar (Namecheap, GoDaddy, etc.)

### Step 2: Configure DNS
1. In Netlify: Site settings > Domain management > Add custom domain
2. Add your domain (e.g., govtec-registration.com)
3. Update your domain's DNS records to point to Netlify:
   - Add these DNS records at your registrar:
   - Type: CNAME, Name: www, Value: your-site-name.netlify.app
   - Type: A, Name: @, Value: 75.2.60.5

### Step 3: Enable HTTPS
1. Netlify automatically provides free SSL certificates
2. Wait for certificate to be issued (usually takes a few minutes)

## Part 6: Monitoring and Maintenance

### View Registrations
1. Check your Google Sheet for new registrations
2. Use Netlify Functions logs to debug issues
3. Monitor site analytics in Netlify dashboard

### Backup Data
1. Regularly download your Google Sheet as backup
2. Consider setting up automated backups

## Troubleshooting

### Common Issues:

1. **Functions not working**: Check environment variables are set correctly
2. **Google Sheets errors**: Verify service account has access to the sheet
3. **Email not sending**: Check Gmail app password and credentials
4. **CORS errors**: Ensure proper headers in function responses

### Debug Steps:
1. Check Netlify function logs: Site settings > Functions > View logs
2. Test functions individually using Netlify's function testing
3. Verify environment variables are set correctly
4. Check Google Sheets permissions

Your application is now ready for deployment with full Google Sheets integration!
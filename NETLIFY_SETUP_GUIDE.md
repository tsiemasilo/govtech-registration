# Complete Netlify Deployment Guide with Google Sheets Integration

## STEP 1: Set Up Google Cloud Project and Service Account

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" 
3. Enter project name: "Govtec Registration"
4. Click "Create"

### 1.2 Enable Required APIs
1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API" and click "Enable"
3. Search for "Google Drive API" and click "Enable"

### 1.3 Create Service Account
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Enter details:
   - Name: `govtec-sheets-service`
   - Description: `Service account for registration data`
4. Click "Create and Continue"
5. For roles, select "Editor"
6. Click "Continue" > "Done"

### 1.4 Generate Service Account Key
1. Click on the service account you created
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Click "Create" - this downloads a JSON file
6. **IMPORTANT**: Keep this file secure!

## STEP 2: Set Up Google Sheet

### 2.1 Create the Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Govtec Registration Data"

### 2.2 Set Up Headers
In row 1, add these headers:
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

### 2.3 Share with Service Account
1. Click "Share" button in your Google Sheet
2. Enter the service account email (from the JSON file - it's the "client_email" field)
3. Give "Editor" permissions
4. Uncheck "Notify people"
5. Click "Share"

### 2.4 Get Spreadsheet ID
Copy the spreadsheet ID from the URL:
- URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- Save this ID for later

## STEP 3: Prepare Your Code for Deployment

Your code is already prepared! I've created:
- ✅ `netlify.toml` - Netlify configuration
- ✅ `netlify/functions/registrations.js` - Main registration function with Google Sheets integration
- ✅ `netlify/functions/verify-code.js` - Code verification function
- ✅ `build.sh` - Build script
- ✅ Updated client code to use Netlify functions

## STEP 4: Deploy to Netlify

### 4.1 Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it "govtec-registration"
3. Make it public or private (your choice)

### 4.2 Push Your Code to GitHub
Run these commands in your project:
```bash
git init
git add .
git commit -m "Initial deployment setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/govtec-registration.git
git push -u origin main
```
(Replace YOUR_USERNAME with your GitHub username)

### 4.3 Deploy on Netlify
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Choose "GitHub" and authorize Netlify to access your repositories
4. Select your "govtec-registration" repository
5. Configure build settings:
   - Build command: `chmod +x build.sh && ./build.sh`
   - Publish directory: `dist`
6. Click "Deploy site"

## STEP 5: Configure Environment Variables

### 5.1 Get Your Service Account Information
Open the JSON file you downloaded from Google Cloud and find these values:
- `client_email` - this is your service account email
- `private_key` - this is your private key (long text starting with -----BEGIN PRIVATE KEY-----)

### 5.2 Set Up Environment Variables in Netlify
1. In your Netlify dashboard, go to your deployed site
2. Click "Site settings" > "Environment variables"
3. Add these variables (click "Add a variable" for each):

**Google Sheets Integration:**
- Key: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Value: The `client_email` from your JSON file

- Key: `GOOGLE_PRIVATE_KEY` 
- Value: The `private_key` from your JSON file (copy the entire value including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)

- Key: `GOOGLE_SPREADSHEET_ID`
- Value: The spreadsheet ID you copied earlier

**Email Configuration:**
- Key: `GMAIL_USER`
- Value: Your Gmail address (e.g., almeerahlosper@gmail.com)

- Key: `GMAIL_APP_PASSWORD`
- Value: Your Gmail app password

4. Click "Save" after adding all variables

### 5.3 Redeploy Your Site
1. Go to "Deploys" tab in your Netlify dashboard
2. Click "Trigger deploy" > "Deploy site"
3. Wait for deployment to complete

## STEP 6: Update QR Code URL

### 6.1 Get Your Netlify URL
1. In your Netlify dashboard, you'll see your site URL (e.g., `https://amazing-app-123456.netlify.app`)
2. Copy this URL

### 6.2 Update the QR Code
1. Go back to your project code
2. In `client/index.html`, find this line:
```javascript
const netlifyURL = 'https://your-app-name.netlify.app';
```
3. Replace it with your actual Netlify URL:
```javascript
const netlifyURL = 'https://amazing-app-123456.netlify.app';
```
4. Find the copyURL function and update it too:
```javascript
function copyURL() {
    const netlifyURL = 'https://amazing-app-123456.netlify.app';
    // ...
}
```

### 6.3 Commit and Push Changes
```bash
git add client/index.html
git commit -m "Update QR code URL"
git push
```

Netlify will automatically redeploy with the updated URL.

## STEP 7: Test Your Deployment

### 7.1 Test the Application
1. Visit your Netlify URL
2. Scan the QR code or enter a manual code (GOVTEC2025, COMP001, REG123, or EVENT2025)
3. Fill out the registration form
4. Complete the registration

### 7.2 Verify Data is Saved
1. Check your Google Sheet - you should see the registration data appear
2. Check the email inbox - you should receive a confirmation email

## STEP 8: Custom Domain (Optional)

### 8.1 Purchase a Domain
Buy a domain from any registrar (Namecheap, GoDaddy, etc.)

### 8.2 Configure DNS in Netlify
1. In Netlify: Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., govtec-registration.com)
4. Follow the DNS configuration instructions

### 8.3 Enable HTTPS
Netlify automatically provides free SSL certificates. Wait a few minutes for it to be activated.

## STEP 9: Monitor Your Application

### 9.1 View Function Logs
- Go to Functions tab in Netlify dashboard to see execution logs
- Check for any errors in the Google Sheets or email integration

### 9.2 Monitor Registrations
- Check your Google Sheet regularly for new registrations
- Download backups of your data periodically

## Troubleshooting

### Common Issues:

**Functions not working:**
- Check that all environment variables are set correctly
- Verify Google service account has access to the sheet

**Google Sheets errors:**
- Make sure the service account email has editor access to your sheet
- Verify the spreadsheet ID is correct
- Check that the column headers match exactly

**Email not sending:**
- Verify Gmail app password is correct
- Ensure Gmail user is set correctly

**QR code not working:**
- Make sure the QR code URL points to your actual Netlify deployment
- Test the URL manually in a browser

### Debug Steps:
1. Check Netlify function logs: Site settings > Functions
2. Test functions individually using the function endpoints
3. Verify all environment variables are set correctly

## Your Deployment is Complete!

Your application is now live on Netlify with:
- ✅ Automatic Google Sheets data storage
- ✅ Email confirmations
- ✅ QR code registration system
- ✅ Professional design and confetti animations
- ✅ Mobile-responsive interface

All registration data will automatically be saved to your Google Sheet and users will receive confirmation emails!
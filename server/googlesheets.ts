import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import type { Registration } from '../shared/schema';

interface GoogleSheetsConfig {
  serviceAccountEmail: string;
  privateKey: string;
  spreadsheetId: string;
}

export async function addToGoogleSheets(registrationData: Registration): Promise<boolean> {
  try {
    console.log('🔗 Starting Google Sheets integration...');
    
    // Check if environment variables are set
    const config: GoogleSheetsConfig = {
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      privateKey: process.env.GOOGLE_PRIVATE_KEY || '',
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || ''
    };

    if (!config.serviceAccountEmail) {
      console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
      return false;
    }
    if (!config.privateKey) {
      console.error('❌ GOOGLE_PRIVATE_KEY is not set');
      return false;
    }
    if (!config.spreadsheetId) {
      console.error('❌ GOOGLE_SPREADSHEET_ID is not set');
      return false;
    }
    
    console.log('✅ Environment variables are set, proceeding with authentication...');
    console.log('📧 Service account email:', config.serviceAccountEmail);
    console.log('🔑 Private key starts with:', config.privateKey.substring(0, 50));
    
    // Create JWT authentication
    const privateKey = config.privateKey.replace(/\\n/g, '\n');
    console.log('🔐 Creating JWT authentication...');
    
    const serviceAccountAuth = new JWT({
      email: config.serviceAccountEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    
    // Initialize Google Sheets document with JWT auth
    const doc = new GoogleSpreadsheet(config.spreadsheetId, serviceAccountAuth);
    
    console.log('📊 Loading spreadsheet info...');
    await doc.loadInfo();
    console.log('📋 Spreadsheet title:', doc.title);
    
    const sheet = doc.sheetsByIndex[0]; // First sheet
    console.log('📝 Sheet title:', sheet.title);
    
    console.log('➕ Adding row to sheet...');
    const formattedId = `GOV-${String(registrationData.id).padStart(6, '0')}`;
    await sheet.addRow({
      'Registration ID': formattedId,
      'First Name': registrationData.firstName,
      'Last Name': registrationData.lastName,
      'Email': registrationData.email,
      'Phone': registrationData.phone || '',
      'Company': registrationData.company || '',
      'Job Title': registrationData.jobTitle || '',
      'Data Consent': registrationData.dataConsent ? 'Yes' : 'No',
      'Marketing Consent': registrationData.marketingConsent ? 'Yes' : 'No',
      'Communication Method': registrationData.communicationMethod || 'email',
      'Registration Date': new Date(registrationData.createdAt).toISOString()
    });
    
    console.log('✅ Successfully added registration to Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Error adding to Google Sheets:', error);
    console.error('❌ Error details:', (error as Error).message);
    if ((error as any).response) {
      console.error('❌ Error response:', (error as any).response.data);
    }
    return false;
  }
}
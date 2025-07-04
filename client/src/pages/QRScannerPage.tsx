import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, Type } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRScannerPage() {
  const [, setLocation] = useLocation();
  const [manualCode, setManualCode] = useState('');
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Generate QR code for demo purposes
  useState(() => {
    QRCode.toDataURL('GOVTEC2025', { width: 200, margin: 2 })
      .then(url => setQrCodeDataURL(url))
      .catch(err => console.error('QR Code generation error:', err));
  }, []);

  const handleCodeSubmit = (code: string) => {
    // Store code in session storage and redirect to registration
    sessionStorage.setItem('registrationCode', code);
    setLocation('/register');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleCodeSubmit(manualCode.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-govtec-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main QR Code Card */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-govtec-gradient rounded-full flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-govtec-blue">
              Govtec Competition
            </CardTitle>
            <CardDescription className="text-lg">
              Scan the QR code below to register
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* QR Code Display */}
            <div className="flex justify-center">
              {qrCodeDataURL ? (
                <div className="bg-white p-4 rounded-lg shadow-inner">
                  <img 
                    src={qrCodeDataURL} 
                    alt="Registration QR Code" 
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <Camera className="w-4 h-4" />
                <span>Point your camera at the QR code to scan</span>
              </div>
              <p>or use the manual entry option below</p>
            </div>

            {/* Manual Entry Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="w-full"
            >
              <Type className="w-4 h-4 mr-2" />
              Enter Code Manually
            </Button>

            {/* Manual Entry Form */}
            {showManualEntry && (
              <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter registration code"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="text-center text-lg tracking-wider uppercase"
                    maxLength={20}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-govtec-gradient hover:opacity-90"
                  disabled={!manualCode.trim()}
                >
                  Continue with Code
                </Button>
              </form>
            )}

            {/* Quick access demo codes */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">Demo codes for testing:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['GOVTEC2025', 'COMP001', 'REG123'].map((code) => (
                  <Button
                    key={code}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCodeSubmit(code)}
                    className="text-xs font-mono"
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">🎉 Join the Govtec Competition!</p>
              <p>Complete your registration to participate in this exciting event.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
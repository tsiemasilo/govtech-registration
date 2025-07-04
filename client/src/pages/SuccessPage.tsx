import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Mail, ArrowLeft, Download } from 'lucide-react';

interface RegistrationResult {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  formattedId: string;
  createdAt: string;
}

export default function SuccessPage() {
  const [, setLocation] = useLocation();
  const [registrationData, setRegistrationData] = useState<RegistrationResult | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('registrationResult');
    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
    } else {
      // If no registration data, redirect to home
      setLocation('/');
    }
  }, [setLocation]);

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-govtec-gradient flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-govtec-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success Card */}
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-lg">
              Welcome to the Govtec Competition
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Registration Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-govtec-blue">Registration Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-mono font-bold text-govtec-orange">
                    {registrationData.formattedId}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {registrationData.firstName} {registrationData.lastName}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{registrationData.email}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Registered:</span>
                  <span className="font-medium">
                    {new Date(registrationData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Confirmation Notice */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Confirmation Email Sent
                </p>
                <p className="text-blue-700">
                  A confirmation email has been sent to <strong>{registrationData.email}</strong>. 
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">📌 Important Notice</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Save your Registration ID: <strong>{registrationData.formattedId}</strong></li>
                <li>• You may need this ID at the event</li>
                <li>• Keep your confirmation email as proof of registration</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Print Confirmation
              </Button>
              
              <Button
                onClick={() => {
                  sessionStorage.clear();
                  setLocation('/');
                }}
                className="w-full bg-govtec-gradient hover:opacity-90"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Register Another Person
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">🎉 Thank you for registering!</p>
              <p>We look forward to seeing you at the Govtec Competition.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
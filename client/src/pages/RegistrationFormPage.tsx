import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Mail, Phone, Building, Briefcase } from 'lucide-react';

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  dataConsent: boolean;
  marketingConsent: boolean;
  communicationMethod: string;
}

export default function RegistrationFormPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    dataConsent: false,
    marketingConsent: false,
    communicationMethod: 'email'
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      sessionStorage.setItem('registrationResult', JSON.stringify(result));
      setLocation('/success');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dataConsent) {
      registrationMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-govtec-gradient p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Registration Form</h1>
            <p className="text-white/80">Complete your registration for Govtec Competition</p>
          </div>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-govtec-blue">Personal Information</CardTitle>
            <CardDescription>Please fill in your details to complete registration</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name *
                  </label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name *
                  </label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Professional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title
                  </label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Your job title"
                  />
                </div>
              </div>

              {/* Communication Preference */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Communication Method</label>
                <select
                  value={formData.communicationMethod}
                  onChange={(e) => handleInputChange('communicationMethod', e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="dataConsent"
                    required
                    checked={formData.dataConsent}
                    onChange={(e) => handleInputChange('dataConsent', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="dataConsent" className="text-sm">
                    <span className="font-medium">Data Processing Consent *</span>
                    <br />
                    I consent to the processing of my personal data for this event registration and related communications.
                  </label>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="marketingConsent" className="text-sm">
                    <span className="font-medium">Marketing Communications</span>
                    <br />
                    I would like to receive updates about future Govtec events and opportunities.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-govtec-gradient hover:opacity-90 text-lg py-6"
                disabled={!formData.dataConsent || registrationMutation.isPending}
              >
                {registrationMutation.isPending ? 'Registering...' : 'Complete Registration'}
              </Button>

              {registrationMutation.error && (
                <div className="text-red-600 text-sm text-center">
                  Registration failed. Please try again.
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
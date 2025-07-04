import { Route, Router } from 'wouter';
import QRScannerPage from './pages/QRScannerPage';
import RegistrationFormPage from './pages/RegistrationFormPage';
import SuccessPage from './pages/SuccessPage';

export default function App() {
  return (
    <Router>
      <Route path="/" component={QRScannerPage} />
      <Route path="/register" component={RegistrationFormPage} />
      <Route path="/success" component={SuccessPage} />
    </Router>
  );
}
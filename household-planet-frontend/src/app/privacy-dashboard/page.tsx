import { Metadata } from 'next';
import PrivacyDashboard from '@/components/gdpr/PrivacyDashboard';

export const metadata: Metadata = {
  title: 'Privacy Dashboard - Household Planet Kenya',
  description: 'Manage your privacy settings and data preferences.',
};

export default function PrivacyDashboardPage() {
  return <PrivacyDashboard />;
}
import { redirect } from 'next/navigation';

/**
 * Root redirect — Direct Customer Portal
 * Spec Section 4.3: portal root for Direct Customer is /app
 */
export default function RootPage() {
  redirect('/app/overview');
}

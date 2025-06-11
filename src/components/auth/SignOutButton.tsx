"use client";

import { useRouter } from 'next/navigation';
import { signOut } from '@/auth';
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Sign out and redirect to sign-in page
      await signOut({ 
        redirectTo: '/auth/signin',
        redirect: true 
      });
    } catch (error) {
      console.error('Failed to sign out:', error);
      // Fallback to manual redirect if signOut fails
      router.push('/auth/signin');
      window.location.reload();
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
    >
      Sign Out
    </Button>
  );
}

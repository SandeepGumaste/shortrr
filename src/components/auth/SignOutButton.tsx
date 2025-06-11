"use client";

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // First try the client-side signOut
      await signOut({ 
        callbackUrl: '/auth/signin',
        redirect: false 
      });
      
      // Then manually redirect
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Failed to sign out:', error);
      toast.error('Failed to sign out. Please try again.');
      
      // Fallback to manual redirect
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

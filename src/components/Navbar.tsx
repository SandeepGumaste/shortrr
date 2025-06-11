'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Navbar() {
  const { data: session, status } = useSession();

  // Don't render anything if not authenticated
  if (status !== 'authenticated' || !session) {
    return null;
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex justify-center items-center">
          <Link2 className="h-10 w-10 text-primary mr-2" />
          <span className="font-bold text-4xl hidden md:block">shortrr</span>
        </Link>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2"
                  asChild
                >
                  <Link href="/profile">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || 'Profile picture'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-medium hidden md:block">{session.user?.name}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}

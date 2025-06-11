import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInButton } from '@/components/auth/SignInButton';

export function SignInCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to create and manage short URLs
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <SignInButton />
      </CardContent>
    </Card>
  );
}

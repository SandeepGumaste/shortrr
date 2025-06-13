import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BlockedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Account Blocked</CardTitle>
          <CardDescription>
            Your account has been blocked. Please contact support for assistance.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@shortrr.com">Contact Support</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
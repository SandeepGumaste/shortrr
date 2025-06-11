import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db/mongoose';
import { Url } from '@/lib/db/models/url';
import { getShortUrlFromId } from '@/lib/url-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteUrlButton } from '@/components/url/DeleteUrlButton';
import { CopyButton } from '@/components/url/CopyButton';
import { QRCodeButton } from '@/components/url/QRCodeButton';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  await connectDB();
  const userUrls = await Url.find({ createdBy: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view your shortened URLs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-muted-foreground">{session.user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your URLs</CardTitle>
          <CardDescription>Links you&apos;ve shortened</CardDescription>
        </CardHeader>
        <CardContent>
          {userUrls.length === 0 ? (
            <p className="text-muted-foreground">You haven&apos;t created any shortened URLs yet.</p>
          ) : (
            <div className="space-y-4">
              {userUrls.map((url) => (
                <div key={url.shortId} className="flex flex-col space-y-2 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{getShortUrlFromId(url.shortId)}</p>
                      <p className="text-sm text-muted-foreground">{url.redirectUrl}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <CopyButton text={getShortUrlFromId(url.shortId)} />
                        <DeleteUrlButton shortId={url.shortId} />
                        <QRCodeButton url={`${process.env.NEXT_PUBLIC_APP_URL}/${url.shortId}`} />
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Visits: {url.visitHistory.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
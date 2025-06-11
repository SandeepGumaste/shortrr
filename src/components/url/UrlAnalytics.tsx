import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface VisitHistory {
  ipAddress: string;
  date: string;
}

interface UrlAnalytics {
  shortId: string;
  redirectUrl: string;
  visitHistory: VisitHistory[];
}

export function UrlAnalytics({ shortId }: { shortId: string }) {
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/url/analytics/${shortId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics');
        }

        setAnalytics(data);
      } catch (error) {
        setError('Failed to load analytics');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [shortId]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>URL Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Original URL</h3>
            <p className="text-sm text-muted-foreground break-all">
              {analytics.redirectUrl}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Total Visits</h3>
            <p className="text-2xl font-bold">
              {analytics.visitHistory.length}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Recent Visits</h3>
            <div className="mt-2 space-y-2">
              {analytics.visitHistory.slice(0, 5).map((visit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm p-2 bg-muted rounded"
                >
                  <span>{visit.ipAddress}</span>
                  <span className="text-muted-foreground">
                    {new Date(visit.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

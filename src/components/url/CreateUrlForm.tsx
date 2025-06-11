'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { QRCodeButton } from './QRCodeButton';

const createUrlSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
});

type CreateUrlFormData = z.infer<typeof createUrlSchema>;

export function CreateUrlForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [generateQR, setGenerateQR] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
  });

  const onSubmit = async (data: CreateUrlFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: data.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to create short URL');
      }

      const result = await response.json();
      const fullShortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${result.shortId}`;
      setShortUrl(fullShortUrl);
      toast.success('URL shortened successfully!');

      if (generateQR) {
        // Trigger QR code download after a short delay
        setTimeout(() => {
          const qrButton = document.createElement('button');
          qrButton.style.display = 'none';
          document.body.appendChild(qrButton);
          qrButton.click();
          document.body.removeChild(qrButton);
        }, 1000);
      }

      reset();
    } catch (error) {
      console.error('Error creating short URL:', error);
      toast.error('Failed to create short URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Enter URL to shorten</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://example.com"
          {...register('url')}
          disabled={isLoading}
        />
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="generateQR"
          checked={generateQR}
          onCheckedChange={(checked) => {
            setGenerateQR(checked === true);
          }}
          disabled={isLoading}
        />
        <Label htmlFor="generateQR" className="text-sm">
          Generate QR code
        </Label>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Shortening...' : 'Shorten URL'}
      </Button>

      {shortUrl && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Your shortened URL:</p>
          <div className="flex items-center gap-2">
            <Input value={shortUrl} readOnly />
            <QRCodeButton url={shortUrl} />
          </div>
        </div>
      )}
    </form>
  );
} 
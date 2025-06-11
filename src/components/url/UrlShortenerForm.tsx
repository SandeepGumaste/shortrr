"use client";
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';
import Image from 'next/image';

const urlFormSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
});

type UrlFormValues = z.infer<typeof urlFormSchema>;

export function UrlShortenerForm() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generateQR, setGenerateQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${shortUrl?.split('/').pop()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  };

  async function onSubmit(data: UrlFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ redirectUrl: data.url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create short URL');
      }

      const fullShortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${result.shortId}`;
      setShortUrl(fullShortUrl);
      toast.success('URL shortened successfully!');

      if (generateQR) {
        await generateQRCode(fullShortUrl);
      }

      form.reset();
    } catch (error) {
      toast.error('Failed to create short URL');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generateQR"
              checked={generateQR}
              onCheckedChange={(checked) => {
                setGenerateQR(checked === true);
                if (!checked) {
                  setQrCodeDataUrl(null);
                } else if (shortUrl) {
                  generateQRCode(shortUrl);
                }
              }}
              disabled={isLoading}
            />
            <FormLabel htmlFor="generateQR" className="text-sm">
              Generate QR code
            </FormLabel>
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Shorten URL'}
            </Button>
            {shortUrl && (
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <p className="font-medium">Your shortened URL:</p>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={shortUrl}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(shortUrl);
                      toast.success('Copied to clipboard!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => generateQRCode(shortUrl)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>

                {qrCodeDataUrl && (
                  <div className="flex flex-col items-center gap-2 pt-4 border-t">
                    <Image
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      width={192}
                      height={192}
                      className="bg-white p-2 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </Form>
    </Card>
  );
}

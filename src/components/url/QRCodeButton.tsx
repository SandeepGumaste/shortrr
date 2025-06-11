'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import Image from 'next/image';

interface QRCodeButtonProps {
  url: string;
}

export function QRCodeButton({ url }: QRCodeButtonProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `qrcode-${url.split('/').pop()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully!');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={generateQRCode}
        disabled={isLoading}
      >
        <QrCode className="h-4 w-4" />
      </Button>

      {qrCodeDataUrl && (
        <div className="flex flex-col items-center gap-2">
          <Image
            src={qrCodeDataUrl}
            alt="QR Code"
            width={192}
            height={192}
            className="bg-white p-2 rounded-lg"
          />
          <Button
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
  );
} 
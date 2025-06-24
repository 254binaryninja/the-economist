'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  name?: string;
  contentType?: string;
  url?: string;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  const renderAttachment = (attachment: Attachment, index: number) => {
    const { name, contentType, url } = attachment;
    
    if (!url || !contentType) return null;

    // Image attachments
    if (contentType.startsWith('image/')) {
      return (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative group">
              <Image
                src={url}
                alt={name || `Image ${index + 1}`}
                width={400}
                height={300}
                className="w-full h-auto object-cover rounded-lg"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
            {name && (
              <div className="p-2">
                <p className="text-xs text-muted-foreground truncate">{name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // PDF attachments
    if (contentType === 'application/pdf') {
      return (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{name || 'PDF Document'}</p>
                <Badge variant="secondary" className="text-xs">
                  PDF
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Other file types
    const getFileIcon = (type: string) => {
      if (type.includes('text') || type.includes('document')) {
        return <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      }
      return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    };

    const getFileColor = (type: string) => {
      if (type.includes('text') || type.includes('document')) {
        return 'bg-blue-100 dark:bg-blue-900/20';
      }
      return 'bg-gray-100 dark:bg-gray-900/20';
    };

    return (
      <Card key={index}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded', getFileColor(contentType))}>
              {getFileIcon(contentType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{name || 'File'}</p>
              <Badge variant="secondary" className="text-xs">
                {contentType.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {attachments.map(renderAttachment)}
    </div>
  );
}
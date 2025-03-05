'use client'
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Card } from './ui/card';
import { Image as ImageIcon } from 'lucide-react';

interface MediaFile {
  id: number;
  url: string;
}

interface MediaDisplayProps {
  recordId: number;
  images: MediaFile[];
  videos: MediaFile[];
}

export function MediaDisplay({ recordId, images, videos }: MediaDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    // Only fetch the first image if there are any images
    if (images.length > 0) {
      fetchFirstImage();
    }
    
    return () => {
      // Clean up object URL when component unmounts
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const fetchFirstImage = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (images.length === 0) {
        return; // No images to fetch
      }

      const firstImage = images[0];
      const response = await fetch(`http://localhost:4000/repair-records/${recordId}/file/${firstImage.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image with ID ${firstImage.id}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted || (!images.length)) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="w-full p-4 flex items-center justify-center bg-gray-100 min-h-[300px]">
        {loading ? (
          <p className="text-center">Loading image...</p>
        ) : error ? (
          <p className="text-red-500 text-center">Error: {error}</p>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Device image" 
            className="max-w-full max-h-[400px] object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">No image available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
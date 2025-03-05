'use client'
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Card } from './ui/card';
import { Image as ImageIcon, Play } from 'lucide-react';
import { Button } from './ui/button';

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
  const [loadedMedia, setLoadedMedia] = useState<{ type: 'image' | 'video', url: string }[]>([]);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { token } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    fetchMedia();
    
    return () => {
      // Clean up object URLs when component unmounts
      loadedMedia.forEach(media => URL.revokeObjectURL(media.url));
    };
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const fetchFile = async (fileId: number) => {
        const response = await fetch(`http://localhost:4000/repair-records/${recordId}/file/${fileId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file with ID ${fileId}`);
        }
        
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      };

      const mediaPromises = [
        ...images.map(async img => ({ type: 'image' as const, url: await fetchFile(img.id) })),
        ...videos.map(async vid => ({ type: 'video' as const, url: await fetchFile(vid.id) }))
      ];

      const loadedMediaUrls = await Promise.all(mediaPromises);
      setLoadedMedia(loadedMediaUrls);
      
      // Set the first media item as active by default
      if (loadedMediaUrls.length > 0) {
        setActiveMedia(loadedMediaUrls[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = (media: { type: 'image' | 'video', url: string }) => {
    setActiveMedia(media);
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  if (!isMounted || (!images.length && !videos.length)) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Thumbnails */}
        <div className="w-full lg:w-1/4 overflow-x-auto lg:overflow-y-auto p-3 flex lg:flex-col gap-2">
          {loading && <p className="text-center py-4">Loading media...</p>}
          {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
          {!loading && !error && (
            <div className="flex lg:flex-col gap-2">
              {loadedMedia.map((media, index) => (
                <div
                  key={index}
                  className={`cursor-pointer relative rounded overflow-hidden min-w-[100px] ${
                    activeMedia === media ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMediaClick(media)}
                >
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-24 bg-gray-100">
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main display area */}
        <div className="w-full lg:w-3/4 p-4 flex items-center justify-center bg-gray-100">
          {activeMedia ? (
            activeMedia.type === 'image' ? (
              <img 
                src={activeMedia.url} 
                alt="Selected media" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                src={activeMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-[70vh]"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">No media to display</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
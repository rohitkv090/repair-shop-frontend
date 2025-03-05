'use client'
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { Card } from './ui/card';
import { Play, X } from 'lucide-react';

interface MediaFile {
  id: number;
  url: string;
}

interface SimpleMediaDisplayProps {
  recordId: number;
  images: MediaFile[];
  videos: MediaFile[];
  maxHeight?: string; // Optional prop for controlling container height
}

export function SimpleMediaDisplay({ recordId, images, videos, maxHeight = "300px" }: SimpleMediaDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [loadedMedia, setLoadedMedia] = useState<{ type: 'image' | 'video', url: string, mimeType?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const { token } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

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

      const fetchFile = async (fileId: number, type: 'image' | 'video') => {
        const response = await fetch(`http://localhost:4000/repair-records/${recordId}/${type}/${fileId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file with ID ${fileId}`);
        }
        
        const blob = await response.blob();
        // Create a new blob with explicit type for videos
        if (type === 'video') {
          const videoBlob = new Blob([blob], { type: blob.type || 'video/mp4' });
          return URL.createObjectURL(videoBlob);
        }
        return URL.createObjectURL(blob);
      };

      const mediaPromises = [
        ...images.map(async img => ({ type: 'image' as const, url: await fetchFile(img.id, 'image') })),
        ...videos.map(async vid => ({ type: 'video' as const, url: await fetchFile(vid.id, 'video') }))
      ];

      const loadedMediaUrls = await Promise.all(mediaPromises);
      setLoadedMedia(loadedMediaUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoUrl: string) => {
    if (playingVideo === videoUrl) {
      const video = videoRef.current;
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    } else {
      setPlayingVideo(videoUrl);
    }
  };

  const handleVideoEnded = () => {
    setPlayingVideo(null);
  };

  if (!isMounted || (!images.length && !videos.length)) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-3" style={{ maxHeight, overflowY: 'auto' }}>
        {loading && <p className="text-center py-4">Loading media...</p>}
        {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {loadedMedia.map((media, index) => (
              <div
                key={index}
                className="relative rounded overflow-hidden aspect-square"
              >
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gray-100">
                    {playingVideo === media.url ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          src={media.url}
                          controls
                          autoPlay
                          className="w-full h-full object-cover"
                          onEnded={handleVideoEnded}
                        />
                        <button 
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                          onClick={() => setPlayingVideo(null)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <video
                          src={media.url}
                          className="w-full h-full object-cover"
                        />
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors cursor-pointer"
                          onClick={() => handleVideoClick(media.url)}
                        >
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
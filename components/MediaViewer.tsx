import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play } from 'lucide-react';

interface MediaFile {
  id: number;
  url: string;
}

interface MediaViewerProps {
  recordId: number;
  images: MediaFile[];
  videos: MediaFile[];
}

export function MediaViewer({ recordId, images, videos }: MediaViewerProps) {
  const [loadedMedia, setLoadedMedia] = useState<{ type: 'image' | 'video', url: string }[]>([]);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && loadedMedia.length === 0) {
      fetchMedia();
    }
  };

  useEffect(() => {
    if (activeMedia && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [activeMedia]);

  const handleMediaClick = (media: { type: 'image' | 'video', url: string }) => {
    setActiveMedia(media);
    if (media.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>View Media</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Viewer</DialogTitle>
        </DialogHeader>
        {loading && <p className="text-center py-4">Loading media...</p>}
        {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}
        {!loading && !error && (
          <div className="flex-grow overflow-hidden flex">
            <div className="w-1/3 overflow-y-auto p-4 border-r" ref={scrollContainerRef}>
              <div className="grid grid-cols-2 gap-2">
                {loadedMedia.map((media, index) => (
                  <div
                    key={index}
                    className="cursor-pointer relative"
                    onClick={() => handleMediaClick(media)}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="relative w-full h-24">
                        <video
                          src={media.url}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-2/3 p-4 flex items-center justify-center bg-gray-100 relative">
              {activeMedia ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setActiveMedia(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {activeMedia.type === 'image' ? (
                    <img src={activeMedia.url} alt="Selected media" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <video
                      ref={videoRef}
                      src={activeMedia.url}
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-500">Select an image or video to view</p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


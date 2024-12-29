import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MediaViewerProps {
  recordId: number;
}

export function MediaViewer({ recordId }: MediaViewerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [activeMedia, setActiveMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`http://localhost:4000/repair-records/${recordId}/files`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch media files');
        }

        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('multipart/mixed')) {
          throw new Error('Invalid response format');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Unable to read response');
        }

        const boundary = contentType.split('boundary=')[1];
        let buffer = new Uint8Array(0);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const newBuffer = new Uint8Array(buffer.length + value.length);
          newBuffer.set(buffer);
          newBuffer.set(value, buffer.length);
          buffer = newBuffer;
        }

        const text = new TextDecoder().decode(buffer);
        const parts = text.split(`--${boundary}`);

        const newImages: string[] = [];
        const newVideos: string[] = [];

        parts.forEach(part => {
          if (part.includes('Content-Disposition')) {
            const isImage = part.includes('name="images"');
            const isVideo = part.includes('name="videos"');
            const contentType = part.match(/Content-Type: (.+)\r\n/)?.[1];
            const base64Data = part.split('\r\n\r\n')[1]?.trim();

            if (base64Data && contentType) {
              const dataUrl = `data:${contentType};base64,${base64Data}`;
              if (isImage) newImages.push(dataUrl);
              if (isVideo) newVideos.push(dataUrl);
            }
          }
        });

        console.log(newImages, newVideos);
        setImages(newImages);
        setVideos(newVideos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [recordId]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Media</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Media Viewer</DialogTitle>
        </DialogHeader>
        {loading && <p>Loading media...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="mb-2 font-semibold">Images</h3>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="mb-2 cursor-pointer max-w-full h-auto"
                  onClick={() => setActiveMedia(image)}
                />
              ))}
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Videos</h3>
              {videos.map((video, index) => (
                <video
                  key={index}
                  src={video}
                  className="mb-2 cursor-pointer max-w-full h-auto"
                  onClick={() => setActiveMedia(video)}
                />
              ))}
            </div>
          </div>
        )}
        {activeMedia && (
          <div className="mt-4">
            {activeMedia.startsWith('data:video') ? (
              <video src={activeMedia} controls className="w-full" />
            ) : (
              <img src={activeMedia} alt="Selected media" className="w-full" />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


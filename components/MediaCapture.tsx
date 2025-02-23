import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Video, X } from 'lucide-react';

type MediaCaptureProps = {
  onCapture: (file: File, type: 'image' | 'video') => void;
};

export function MediaCapture({ onCapture }: MediaCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const webcamRef = useRef<Webcam>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    video: true,
    audio: true,
    mediaRecorderOptions: { mimeType: 'video/webm' }
  });

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Convert base64 to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file, 'image');
          setIsOpen(false);
        });
    }
  }, [webcamRef, onCapture]);

  const handleVideoStop = useCallback(() => {
    if (mediaBlobUrl) {
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
          onCapture(file, 'video');
          setIsOpen(false);
        });
    }
  }, [mediaBlobUrl, onCapture]);

  return (
    <>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setMode('photo');
            setIsOpen(true);
          }}
        >
          <Camera className="w-4 h-4 mr-2" />
          Take Photo
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setMode('video');
            setIsOpen(true);
          }}
        >
          <Video className="w-4 h-4 mr-2" />
          Record Video
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'photo' ? 'Take a Photo' : 'Record Video'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {mode === 'photo' ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border bg-black aspect-video relative">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: "user",
                      aspectRatio: 16/9,
                    }}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 border-4 border-white/20 pointer-events-none" />
                </div>
                <div className="flex justify-center">
                  <Button onClick={capturePhoto}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border bg-black aspect-video relative">
                  {status !== 'recording' && mediaBlobUrl ? (
                    <video
                      src={mediaBlobUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <>
                      <Webcam
                        audio={true}
                        ref={webcamRef}
                        videoConstraints={{
                          facingMode: "user",
                          aspectRatio: 16/9,
                        }}
                        className="w-full h-full object-contain"
                      />
                      {status === 'recording' && (
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-white text-sm">Recording...</span>
                        </div>
                      )}
                      <div className="absolute inset-0 border-4 border-white/20 pointer-events-none" />
                    </>
                  )}
                </div>
                <div className="flex justify-center gap-4">
                  {status === 'recording' ? (
                    <Button onClick={stopRecording} variant="destructive">
                      Stop Recording
                    </Button>
                  ) : status === 'stopped' ? (
                    <Button onClick={handleVideoStop}>
                      Use Video
                    </Button>
                  ) : (
                    <Button onClick={startRecording}>
                      Start Recording
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
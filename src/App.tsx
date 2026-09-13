import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { VoiceNote } from '@/components/ui/voice-note';

const DESKTOP_STREAM_URL =
  'https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = DESKTOP_STREAM_URL;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(DESKTOP_STREAM_URL);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, []);

  const handleSend = (data: { duration: number; blob: Blob | null }) => {
    console.log('Voice note sent:', data);
  };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <video
        ref={videoRef}
        className="desktop-video"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="video-scrim" />
      <div className="relative z-10 flex h-full w-full items-end justify-center">
        <VoiceNote onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;

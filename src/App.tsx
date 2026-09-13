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

    const play = () => {
      // Autoplay can be silently blocked (especially on a domain the
      // browser has no prior media-engagement with), and MSE-backed
      // playback doesn't reliably honor the `autoplay` attribute the way
      // a plain <video src> does, so kick playback explicitly.
      void video.play().catch((err) => console.warn('Desktop video autoplay was blocked:', err));
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = DESKTOP_STREAM_URL;
      video.addEventListener('loadedmetadata', play);
      return () => video.removeEventListener('loadedmetadata', play);
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('Desktop video HLS fatal error:', data.type, data.details);
        }
      });
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

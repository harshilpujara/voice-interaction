import { VoiceNote } from '@/components/ui/voice-note';

const DESKTOP_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_115329_5e00c9c5-4d69-49b7-94c3-9c31c60bb644.mp4';

function App() {
  const handleSend = (data: { duration: number; blob: Blob | null }) => {
    console.log('Voice note sent:', data);
  };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <video
        className="desktop-video"
        src={DESKTOP_VIDEO_URL}
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

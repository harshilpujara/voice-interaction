import { GradientWave } from '@/components/ui/gradient-wave';
import { VoiceNote } from '@/components/ui/voice-note';

function App() {
  const handleSend = (data: { duration: number; blob: Blob | null }) => {
    console.log('Voice note sent:', data);
  };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <GradientWave colors={['#0f172a', '#1e3a5f', '#0ea5e9', '#0f172a', '#155e75']} />
      <div className="bg-scrim" />
      <div className="relative z-10 flex h-full w-full items-end justify-center">
        <VoiceNote onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;

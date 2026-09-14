import { GradientWave } from '@/components/ui/gradient-wave';
import { VoiceNote } from '@/components/ui/voice-note';

function App() {
  const handleSend = (data: { duration: number; blob: Blob | null }) => {
    console.log('Voice note sent:', data);
  };

  return (
    <div className="relative h-svh w-full overflow-hidden">
      <GradientWave />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <VoiceNote onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;

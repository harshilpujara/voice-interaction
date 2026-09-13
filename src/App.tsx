import { VoiceNote } from '@/components/ui/voice-note';

function App() {
  const handleSend = (data: { duration: number; blob: Blob | null }) => {
    console.log('Voice note sent:', data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="ambient-bg" />
      <div className="ambient-grain" />
      <VoiceNote onSend={handleSend} />
    </div>
  );
}

export default App;

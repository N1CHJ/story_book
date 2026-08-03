import { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { WebReader } from './components/WebReader';

function App() {
  const [manifest, setManifest] = useState<any>(null);

  return (
    <>
      {!manifest ? (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#08060d]">
          <GeneratorForm onGenerated={(data) => setManifest(data)} />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50 dark:bg-[#08060d]">
          <WebReader manifest={manifest} onClose={() => setManifest(null)} />
        </div>
      )}
    </>
  );
}

export default App;

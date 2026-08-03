import { useState } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { WebReader } from './components/WebReader';
import { Home } from './components/Home';
import { StoryLibrary } from './components/StoryLibrary';

type ViewState = 'home' | 'create' | 'library' | 'reading';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [manifest, setManifest] = useState<any>(null);

  const handleGenerated = (data: any) => {
    setManifest(data);
    setView('reading');
  };

  const handleSelectBook = (data: any) => {
    setManifest(data);
    setView('reading');
  };

  const handleCloseReader = () => {
    setManifest(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#08060d]">
      {view === 'home' && (
        <Home
          onSelectCreate={() => setView('create')}
          onSelectLibrary={() => setView('library')}
        />
      )}
      
      {view === 'create' && (
        <div className="py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
          <div className="w-full relative">
            <button
              onClick={() => setView('home')}
              className="absolute -top-6 left-1/2 -translate-x-1/2 mb-4 text-sm font-medium text-[var(--text)] hover:text-[var(--color-accent)] transition-colors"
            >
              &larr; Back to Home
            </button>
            <GeneratorForm onGenerated={handleGenerated} />
          </div>
        </div>
      )}

      {view === 'library' && (
        <StoryLibrary
          onBack={() => setView('home')}
          onSelectBook={handleSelectBook}
        />
      )}

      {view === 'reading' && manifest && (
        <WebReader manifest={manifest} onClose={handleCloseReader} />
      )}
    </div>
  );
}

export default App;

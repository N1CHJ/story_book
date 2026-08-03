import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Loader2, Check } from 'lucide-react';

interface GeneratorFormProps {
  onGenerated: (manifest: any) => void;
}

const STYLES = [
  { id: 'Cartoon', name: 'Cartoon', img: '/images/style_cartoon.jpg' },
  { id: 'Realistic', name: 'Realistic', img: '/images/style_realistic.jpg' },
  { id: 'Wimmelbuch', name: 'Wimmelbuch', img: '/images/style_wimmelbuch.jpg' },
  { id: 'Whimsical', name: 'Whimsical', img: '/images/style_whimsical.jpg' },
  { id: 'Abstract', name: 'Abstract', img: '/images/style_abstract.jpg' },
  { id: 'Moody', name: 'Moody', img: '/images/style_moody.jpg' },
  { id: 'Line Drawing', name: 'Line Drawing', img: '/images/style_line.jpg' },
  { id: 'Vintage', name: 'Vintage', img: '/images/style_vintage.jpg' },
];

const COLORS = [
  { id: 'color_pastel', name: 'Pastel Spring', img: '/images/color_pastel.svg' },
  { id: 'color_earthy', name: 'Earthy Autumn', img: '/images/color_earthy.svg' },
  { id: 'color_vibrant', name: 'Vibrant Playtime', img: '/images/color_vibrant.svg' },
  { id: 'color_ocean', name: 'Ocean Blues', img: '/images/color_ocean.svg' },
  { id: 'color_grayscale', name: 'Classic Coloring Book', img: '/images/color_grayscale.svg' },
];

const CHARACTERS = [
  { id: 'Barnaby', label: 'Barnaby (A brave little brown bear with a red scarf)' },
  { id: 'Luna', label: 'Luna (A curious space cat in a tiny spacesuit)' },
  { id: 'Pip', label: 'Pip (A tiny, energetic green dragon)' },
  { id: 'Oliver', label: 'Oliver (A clumsy, spectacles-wearing owl)' },
  { id: 'Custom', label: 'Custom...' },
];

export function GeneratorForm({ onGenerated }: GeneratorFormProps) {
  const [theme, setTheme] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].id);
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0].id);
  const [customCharacter, setCustomCharacter] = useState('');
  
  const [pages, setPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      
      const charDesc = selectedCharacter === 'Custom' 
        ? customCharacter 
        : CHARACTERS.find(c => c.id === selectedCharacter)?.label;

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme, 
          character: charDesc, 
          style: selectedStyle,
          color: selectedColor,
          pages 
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate story';
        try {
          const errorData = await response.json();
          if (errorData.details) {
            errorMessage = `${errorData.error}: ${errorData.details}`;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      onGenerated(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1f2028] rounded-3xl shadow-2xl overflow-hidden border border-[var(--border)]"
      >
        <div className="p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 bg-[var(--accent-bg)] rounded-2xl text-[var(--color-accent)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-extrabold m-0 text-[var(--text-h)] tracking-tight">Create a Story</h2>
          </div>
          <p className="text-lg text-[var(--text)] mb-10 text-left">Generate a custom children's book for your e-paper device.</p>

          <form onSubmit={handleSubmit} className="space-y-10 text-left">
            {/* Theme Section */}
            <section>
              <label className="block text-xl font-bold mb-3 text-[var(--text-h)]">1. What's the story about?</label>
              <input
                required
                type="text"
                placeholder="e.g., A space adventure to find the moon cheese"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-[var(--border)] bg-gray-50 dark:bg-[#1a1b23] focus:ring-4 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              />
            </section>

            {/* Main Character Section */}
            <section>
              <label className="block text-xl font-bold mb-3 text-[var(--text-h)]">2. Choose a Main Character</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHARACTERS.map(char => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedCharacter === char.id 
                        ? 'border-[var(--color-accent)] bg-[var(--accent-bg)] shadow-md' 
                        : 'border-[var(--border)] hover:border-gray-400 dark:hover:border-gray-500 bg-transparent'
                    }`}
                  >
                    <div className="font-semibold text-[var(--text-h)]">{char.id}</div>
                    <div className="text-sm text-[var(--text)] mt-1">{char.label}</div>
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {selectedCharacter === 'Custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      required={selectedCharacter === 'Custom'}
                      type="text"
                      placeholder="Describe your character (e.g., A friendly pink elephant with a tiny hat)"
                      value={customCharacter}
                      onChange={(e) => setCustomCharacter(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--border)] bg-gray-50 dark:bg-[#1a1b23] focus:ring-4 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Style Section */}
            <section>
              <label className="block text-xl font-bold mb-3 text-[var(--text-h)]">3. Choose an Art Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STYLES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStyle(s.id)}
                    className={`relative rounded-2xl border-4 overflow-hidden transition-all aspect-square group ${
                      selectedStyle === s.id 
                        ? 'border-[var(--color-accent)] shadow-lg scale-[1.02]' 
                        : 'border-transparent hover:scale-105'
                    }`}
                  >
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                      <span className="text-white font-bold text-sm sm:text-base drop-shadow-md">{s.name}</span>
                    </div>
                    {selectedStyle === s.id && (
                      <div className="absolute top-2 right-2 bg-[var(--color-accent)] rounded-full p-1 shadow-md">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Color Section */}
            <section>
              <label className="block text-xl font-bold mb-3 text-[var(--text-h)]">4. Choose a Color Palette</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`relative rounded-2xl border-4 overflow-hidden transition-all aspect-square group bg-[#FDFBF7] ${
                      selectedColor === c.id 
                        ? 'border-[var(--color-accent)] shadow-lg scale-[1.02]' 
                        : 'border-transparent hover:scale-105 shadow hover:shadow-md'
                    }`}
                  >
                    <img src={c.img} alt={c.name} className="w-full h-full object-cover mix-blend-multiply" />
                    {selectedColor === c.id && (
                      <div className="absolute top-2 right-2 bg-[var(--color-accent)] rounded-full p-1 shadow-md">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Pages Section */}
            <section>
              <label className="block text-xl font-bold mb-3 text-[var(--text-h)]">5. Number of Pages</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-[var(--color-accent)]"
                />
                <span className="text-2xl font-bold text-[var(--text-h)] w-12 text-center">{pages}</span>
              </div>
            </section>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 rounded-2xl bg-[#08060d] dark:bg-white text-white dark:text-[#08060d] font-bold text-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Writing & Drawing... (This takes a minute)
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6" />
                  Generate Book
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

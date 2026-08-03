import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Loader2 } from 'lucide-react';

interface GeneratorFormProps {
  onGenerated: (manifest: any) => void;
}

export function GeneratorForm({ onGenerated }: GeneratorFormProps) {
  const [theme, setTheme] = useState('');
  const [character, setCharacter] = useState('');
  const [style, setStyle] = useState('Watercolor illustration, bright colors');
  const [pages, setPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8787/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, character, style, pages }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
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
    <div className="w-full max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1f2028] rounded-2xl shadow-xl overflow-hidden border border-[var(--border)]"
      >
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[var(--accent-bg)] rounded-xl text-[var(--color-accent)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold m-0 text-[var(--text-h)]">Create a Story</h2>
          </div>
          <p className="text-[var(--text)] mb-8 text-left">Generate a custom children's book for your e-paper device.</p>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-h)]">Story Theme</label>
              <input
                required
                type="text"
                placeholder="e.g., A space adventure to find the moon cheese"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--text-h)]">Main Character</label>
              <input
                required
                type="text"
                placeholder="e.g., Barnaby the brave little bear"
                value={character}
                onChange={(e) => setCharacter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-h)]">Picture Style</label>
                <input
                  required
                  type="text"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-h)]">Number of Pages</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={pages}
                  onChange={(e) => setPages(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-transparent focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl bg-[#08060d] dark:bg-white text-white dark:text-[#08060d] font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Writing & Drawing... (This takes a minute)
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
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

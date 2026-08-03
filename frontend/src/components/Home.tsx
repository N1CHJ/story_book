import { motion } from 'framer-motion';
import { PenTool, Library } from 'lucide-react';

interface HomeProps {
  onSelectCreate: () => void;
  onSelectLibrary: () => void;
}

export function Home({ onSelectCreate, onSelectLibrary }: HomeProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold text-[var(--text-h)] mb-4 tracking-tight">
          Welcome to <span className="text-[var(--color-accent)]">StoryBook</span>
        </h1>
        <p className="text-xl text-[var(--text)]">What would you like to do today?</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onSelectCreate}
          className="bg-white dark:bg-[#1f2028] p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-[var(--border)] flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 bg-[var(--accent-bg)] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent)] transition-colors">
            <PenTool className="w-10 h-10 text-[var(--color-accent)] group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-h)] mb-3">Create a New Story</h2>
          <p className="text-[var(--text)]">
            Write a brand new adventure using AI, and read it on your e-paper device.
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onSelectLibrary}
          className="bg-white dark:bg-[#1f2028] p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-[var(--border)] flex flex-col items-center text-center transition-all group"
        >
          <div className="w-20 h-20 bg-[var(--accent-bg)] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent)] transition-colors">
            <Library className="w-10 h-10 text-[var(--color-accent)] group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-h)] mb-3">Read an Old Story</h2>
          <p className="text-[var(--text)]">
            Browse through your collection of previously generated stories.
          </p>
        </motion.button>
      </div>
    </div>
  );
}

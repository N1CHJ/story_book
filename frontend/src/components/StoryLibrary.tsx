import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  theme: string;
  cover_image: string;
}

interface StoryLibraryProps {
  onBack: () => void;
  onSelectBook: (manifest: any) => void;
}

export function StoryLibrary({ onBack, onSelectBook }: StoryLibraryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
        const response = await fetch(`${apiUrl}/api/books`);
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleBookClick = async (id: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/api/book/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load book');
      }
      const manifest = await response.json();
      onSelectBook(manifest);
    } catch (err) {
      console.error(err);
      alert('Failed to load the book. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 bg-white dark:bg-[#1f2028] text-[var(--text)] hover:text-[var(--color-accent)] rounded-xl shadow border border-[var(--border)] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-[var(--text-h)]">Your Library</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
          <p className="text-[var(--text)]">Loading your stories...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-center">
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-[var(--border)] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[var(--text-h)] mb-2">No stories yet</h3>
          <p className="text-[var(--text)]">Go create a new adventure to see it here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book, index) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
            const coverUrl = `${apiUrl}/api/book/${book.id}/image/cover`;
            
            return (
              <motion.button
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBookClick(book.id)}
                className="bg-white dark:bg-[#1f2028] rounded-2xl shadow-md hover:shadow-xl border border-[var(--border)] overflow-hidden text-left transition-all flex flex-col h-full"
              >
                <div className="aspect-[3/4] w-full bg-[var(--accent-bg)] relative overflow-hidden">
                  <img
                    src={coverUrl}
                    alt={`Cover for ${book.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-[var(--text-h)] line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-[var(--text)] line-clamp-2 mt-auto">
                    {book.theme}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

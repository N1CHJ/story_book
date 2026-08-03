import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface Page {
  pageNumber: number;
  story_text: string;
  image_prompt: string;
  image_path: string;
}

interface Manifest {
  id: string;
  theme: string;
  character: string;
  style: string;
  pages: Page[];
}

interface WebReaderProps {
  manifest: Manifest;
  onClose: () => void;
}

export function WebReader({ manifest, onClose }: WebReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const page = manifest.pages[currentPage];
  
  // Since it's local development, assume backend is at http://localhost:8787
  const imageUrl = `http://localhost:8787/api/book/${manifest.id}/image/${currentPage}`;

  const handleNext = () => {
    if (currentPage < manifest.pages.length - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 h-[100svh] flex flex-col justify-center">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[var(--border)] transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>
        <div className="text-sm font-medium text-[var(--text)]">
          Page {currentPage + 1} of {manifest.pages.length}
        </div>
      </div>

      <div className="relative bg-white dark:bg-[#16171d] flex-grow rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 border-[var(--border)] flex flex-col md:flex-row">
        
        {/* Image Section */}
        <div className="w-full md:w-1/2 relative bg-[var(--code-bg)] flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={imageUrl}
              src={imageUrl}
              alt={page.image_prompt}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-auto max-h-full object-contain rounded-xl shadow-sm"
            />
          </AnimatePresence>
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={page.story_text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-2xl sm:text-3xl leading-relaxed text-[var(--text-h)] font-serif text-left"
            >
              {page.story_text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Hardware-like Navigation Buttons */}
      <div className="flex justify-center items-center gap-8 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="p-4 rounded-full bg-white dark:bg-[#1f2028] shadow-md border border-[var(--border)] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all text-[var(--text-h)]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === manifest.pages.length - 1}
          className="p-4 rounded-full bg-white dark:bg-[#1f2028] shadow-md border border-[var(--border)] disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all text-[var(--text-h)]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

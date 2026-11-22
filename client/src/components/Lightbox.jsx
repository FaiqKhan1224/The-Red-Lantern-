import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Lightbox({ items, index, onClose, onIndex }) {
  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [open, index, items.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <button className="lb-close" onClick={onClose} aria-label="Close"><X size={26} /></button>
          <button className="lb-nav prev" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label="Previous"><ChevronLeft size={34} /></button>
          <motion.figure key={index} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <img src={items[index].url} alt={items[index].title} />
            <figcaption><em>{items[index].category}</em> {items[index].title}</figcaption>
          </motion.figure>
          <button className="lb-nav next" onClick={() => onIndex((index + 1) % items.length)} aria-label="Next"><ChevronRight size={34} /></button>
          <div className="lb-count">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { usePaginatedMessages } from '../hooks/usePaginatedMessages';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export const Chat = () => {
  const { messages, loadMore, loading, hasMore } = usePaginatedMessages();
  const { t } = useTranslation();
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 ${
                message.senderId === 'jeune123' ? 'ml-auto' : 'mr-auto'
              }`}
            >
              <div
                className={`rounded-lg p-3 max-w-[70%] ${
                  message.senderId === 'jeune123'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={ref} className="h-10" />
      </div>
      
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center p-4"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </motion.div>
      )}
    </div>
  );
}; 
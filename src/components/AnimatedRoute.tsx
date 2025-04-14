import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedRouteProps {
  children: React.ReactNode;
  transitionKey: string;
}

/**
 * Composant qui anime les transitions entre les pages
 * Utilise Framer Motion pour créer des transitions fluides
 */
const AnimatedRoute: React.FC<AnimatedRouteProps> = ({ children, transitionKey }) => {
  // Configurations des animations
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 0.98
    }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <motion.div
      key={transitionKey}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedRoute; 
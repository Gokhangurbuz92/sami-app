import React from 'react';
import { Card, CardProps } from '@mui/material';
import { motion } from 'framer-motion';

// Création d'une carte animée en utilisant Framer Motion
const MotionCard = motion(Card);

interface AnimatedCardProps extends CardProps {
  delay?: number;
  hoverable?: boolean;
  index?: number;
}

/**
 * Composant de carte animée avec des effets visuels modernes
 * Étend les fonctionnalités de Card de MUI avec des animations Framer Motion
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  hoverable = true,
  index = 0,
  ...cardProps
}) => {
  // Animation en cascade basée sur l'index
  const calculatedDelay = delay + (index * 0.1);
  
  return (
    <MotionCard
      {...cardProps}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay: calculatedDelay,
          duration: 0.4,
          ease: "easeOut"
        }
      }}
      whileHover={
        hoverable 
          ? { 
              y: -5,
              boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)',
              transition: { duration: 0.2 }
            } 
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </MotionCard>
  );
};

export default AnimatedCard; 
import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';

// Création d'un bouton animé en utilisant Framer Motion
const MotionButton = motion(Button);

interface AnimatedButtonProps extends ButtonProps {
  whileHoverScale?: number;
  whileTapScale?: number;
  delay?: number;
}

/**
 * Composant de bouton animé avec des effets visuels modernes
 * Étend les fonctionnalités du Button de MUI avec des animations Framer Motion
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  whileHoverScale = 1.05,
  whileTapScale = 0.95,
  delay = 0,
  ...buttonProps
}) => {
  return (
    <MotionButton
      {...buttonProps}
      component={motion.button}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          delay,
          duration: 0.3
        }
      }}
      whileHover={{ 
        scale: whileHoverScale,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: whileTapScale }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton; 
#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des composants de base ===${NC}"

# Configurer le composant Button
echo -e "${YELLOW}Configuration du composant Button...${NC}"
cat > src/components/common/Button.tsx << 'EOL'
import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        borderRadius: theme.borderRadius.medium,
        textTransform: 'none',
        ...props.sx,
      }}
      {...props}
    >
      {loading ? 'Chargement...' : children}
    </MuiButton>
  );
};
EOL

# Configurer le composant Input
echo -e "${YELLOW}Configuration du composant Input...${NC}"
cat > src/components/common/Input.tsx << 'EOL'
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useTheme } from '../../hooks/useTheme';

interface InputProps extends TextFieldProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  required = false,
  type = 'text',
  value,
  onChange,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      error={!!error}
      helperText={error || helperText}
      fullWidth={fullWidth}
      disabled={disabled}
      required={required}
      type={type}
      value={value}
      onChange={onChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.borderRadius.medium,
        },
        ...props.sx,
      }}
      {...props}
    />
  );
};
EOL

# Configurer le composant Card
echo -e "${YELLOW}Configuration du composant Card...${NC}"
cat > src/components/common/Card.tsx << 'EOL'
import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends MuiCardProps {
  children: React.ReactNode;
  elevation?: number;
  variant?: 'elevation' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  variant = 'elevation',
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <MuiCard
      elevation={elevation}
      variant={variant}
      sx={{
        borderRadius: theme.borderRadius.medium,
        padding: theme.spacing.md,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};
EOL

# Configurer le composant Avatar
echo -e "${YELLOW}Configuration du composant Avatar...${NC}"
cat > src/components/common/Avatar.tsx << 'EOL'
import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import { useTheme } from '../../hooks/useTheme';

interface AvatarProps extends MuiAvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'rounded' | 'square';
  children?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'medium',
  variant = 'circular',
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const sizes = {
    small: 32,
    medium: 48,
    large: 64,
  };

  return (
    <MuiAvatar
      src={src}
      alt={alt}
      variant={variant}
      sx={{
        width: sizes[size],
        height: sizes[size],
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiAvatar>
  );
};
EOL

# Configurer le composant Badge
echo -e "${YELLOW}Configuration du composant Badge...${NC}"
cat > src/components/common/Badge.tsx << 'EOL'
import React from 'react';
import { Badge as MuiBadge, BadgeProps as MuiBadgeProps } from '@mui/material';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps extends MuiBadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  variant?: 'standard' | 'dot';
  badgeContent?: React.ReactNode;
  invisible?: boolean;
  max?: number;
  showZero?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  variant = 'standard',
  badgeContent,
  invisible = false,
  max = 99,
  showZero = false,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <MuiBadge
      color={color}
      variant={variant}
      badgeContent={badgeContent}
      invisible={invisible}
      max={max}
      showZero={showZero}
      sx={{
        '& .MuiBadge-badge': {
          borderRadius: theme.borderRadius.small,
        },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiBadge>
  );
};
EOL

echo -e "${GREEN}✓ Composants de base configurés avec succès${NC}" 
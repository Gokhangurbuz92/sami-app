#!/bin/bash

# Couleurs pour les messages
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Configuration des pages de base ===${NC}"

# Configurer la page de connexion
echo -e "${YELLOW}Configuration de la page de connexion...${NC}"
cat > src/pages/auth/Login.tsx << 'EOL'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/chat');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.background,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: theme.spacing.lg,
        }}
      >
        <form onSubmit={handleSubmit}>
          <h1 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            Connexion
          </h1>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          {error && (
            <p style={{ color: theme.error, marginBottom: theme.spacing.md }}>
              {error}
            </p>
          )}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            sx={{ marginBottom: theme.spacing.md }}
          >
            Se connecter
          </Button>
          <p style={{ textAlign: 'center' }}>
            Pas encore de compte ?{' '}
            <a
              href="/register"
              style={{ color: theme.primary, textDecoration: 'none' }}
            >
              S'inscrire
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};
EOL

# Configurer la page d'inscription
echo -e "${YELLOW}Configuration de la page d'inscription...${NC}"
cat > src/pages/auth/Register.tsx << 'EOL'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../hooks/useTheme';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, displayName, 'youth');
      navigate('/chat');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: theme.background,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: theme.spacing.lg,
        }}
      >
        <form onSubmit={handleSubmit}>
          <h1 style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            Inscription
          </h1>
          <Input
            label="Nom d'utilisateur"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            sx={{ marginBottom: theme.spacing.md }}
          />
          {error && (
            <p style={{ color: theme.error, marginBottom: theme.spacing.md }}>
              {error}
            </p>
          )}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            sx={{ marginBottom: theme.spacing.md }}
          >
            S'inscrire
          </Button>
          <p style={{ textAlign: 'center' }}>
            Déjà un compte ?{' '}
            <a
              href="/login"
              style={{ color: theme.primary, textDecoration: 'none' }}
            >
              Se connecter
            </a>
          </p>
        </form>
      </Card>
    </div>
  );
};
EOL

# Configurer la page de chat
echo -e "${YELLOW}Configuration de la page de chat...${NC}"
cat > src/pages/chat/Chat.tsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { useTheme } from '../../hooks/useTheme';
import { Message } from '../../types/chat';

export const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { chats, messages, sendMessage, loading, error } = useChat();
  const { user } = useAuth();
  const { theme } = useTheme();

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      await sendMessage(selectedChat, message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: theme.background,
      }}
    >
      {/* Liste des chats */}
      <div
        style={{
          width: 300,
          borderRight: `1px solid ${theme.divider}`,
          padding: theme.spacing.md,
        }}
      >
        <h2 style={{ marginBottom: theme.spacing.md }}>Conversations</h2>
        {chats.map((chat) => (
          <Card
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            sx={{
              marginBottom: theme.spacing.sm,
              cursor: 'pointer',
              backgroundColor:
                selectedChat === chat.id ? theme.surface : 'transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={chat.participants[0]?.photoURL}
                alt={chat.participants[0]?.displayName}
                size="small"
                sx={{ marginRight: theme.spacing.sm }}
              />
              <div>
                <h3 style={{ margin: 0 }}>{chat.name}</h3>
                <p style={{ margin: 0, color: theme.text.secondary }}>
                  {chat.lastMessage?.content}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <Badge
                  badgeContent={chat.unreadCount}
                  color="primary"
                  sx={{ marginLeft: 'auto' }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Zone de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <div
              style={{
                flex: 1,
                padding: theme.spacing.md,
                overflowY: 'auto',
              }}
            >
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    marginBottom: theme.spacing.md,
                    justifyContent:
                      message.senderId === user?.id ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.senderId !== user?.id && (
                    <Avatar
                      src={message.sender?.photoURL}
                      alt={message.sender?.displayName}
                      size="small"
                      sx={{ marginRight: theme.spacing.sm }}
                    />
                  )}
                  <Card
                    sx={{
                      maxWidth: '70%',
                      backgroundColor:
                        message.senderId === user?.id
                          ? theme.primary
                          : theme.surface,
                      color:
                        message.senderId === user?.id
                          ? theme.text.primary
                          : theme.text.primary,
                    }}
                  >
                    <p style={{ margin: 0 }}>{message.content}</p>
                  </Card>
                </div>
              ))}
            </div>
            <div
              style={{
                padding: theme.spacing.md,
                borderTop: `1px solid ${theme.divider}`,
                display: 'flex',
                gap: theme.spacing.sm,
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrire un message..."
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                Envoyer
              </Button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: theme.text.secondary,
            }}
          >
            Sélectionnez une conversation
          </div>
        )}
      </div>
    </div>
  );
};
EOL

echo -e "${GREEN}✓ Pages de base configurées avec succès${NC}" 
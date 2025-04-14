import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { User } from '@/types/user';

interface UserListProps {
  users: User[];
  onUserClick?: (user: User) => void;
}

export const UserList = ({ users, onUserClick }: UserListProps) => {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleUserClick = (user: User) => {
    setSelectedUser(user.id);
    onUserClick?.(user);
  };

  return (
    <List>
      {users.map((user) => (
        <ListItem
          key={user.id}
          button
          onClick={() => handleUserClick(user)}
          selected={selectedUser === user.id}
          sx={{
            mb: 1,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemAvatar>
            <Avatar src={user.profilePicture}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{user.name}</Typography>
                {user.role === 'young' && user.roomNumber && (
                  <Chip
                    label={`${t('common.room')} ${user.roomNumber}`}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            }
            secondary={
              <Typography variant="body2" color="text.secondary">
                {t(`roles.${user.role}`)}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}; 
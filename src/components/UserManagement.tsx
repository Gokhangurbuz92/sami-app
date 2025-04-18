import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  SelectChangeEvent,
  CircularProgress,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { userService } from '../services/userService';
import { User, UserRole } from '../types/firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `user-tab-${index}`,
    'aria-controls': `user-tabpanel-${index}`
  };
}

export default function UserManagement() {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [youths, setYouths] = useState<User[]>([]);
  const [referents, setReferents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedYouth, setSelectedYouth] = useState<User | null>(null);
  const [selectedReferents, setSelectedReferents] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<{
    email: string;
    displayName: string;
    password: string;
    role: UserRole;
  }>({
    email: '',
    displayName: '',
    password: '',
    role: 'jeune'
  });
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Récupérer les jeunes
      const youthList = await userService.getUsersByRole('jeune');
      if (youthList.data) {
        setYouths(youthList.data);
      }

      // Récupérer les référents
      const referentList = await userService.getUsersByRole('referent');
      const coreferentList = await userService.getUsersByRole('coreferent');
      if (referentList.data && coreferentList.data) {
        setReferents([...referentList.data, ...coreferentList.data]);
      }

      // Récupérer tous les utilisateurs
      if (youthList.data && referentList.data && coreferentList.data) {
        setUsers([...youthList.data, ...referentList.data, ...coreferentList.data]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Réinitialiser le formulaire
    setNewUser({
      email: '',
      displayName: '',
      password: '',
      role: 'jeune'
    });
    setError(null);
  };

  const handleOpenAssignDialog = (youth: User) => {
    setSelectedYouth(youth);
    setSelectedReferents(youth.assignedReferents || []);
    setOpenAssignDialog(true);
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setSelectedYouth(null);
    setSelectedReferents([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent<UserRole>) => {
    setNewUser((prev) => ({
      ...prev,
      role: e.target.value as UserRole
    }));
  };

  const handleReferentSelectionChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setSelectedReferents(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSaveUser = async () => {
    try {
      setError(null);
      // Ici vous devez intégrer cette fonction avec votre système d'authentification
      // Par exemple en utilisant la fonction signUp du contexte d'authentification
      const { email, password, displayName, role } = newUser;

      // Vérifier que tous les champs sont remplis
      if (!email || !password || !displayName || !role) {
        setError('Veuillez remplir tous les champs');
        return;
      }

      // Créer l'utilisateur
      await userService.createUser({
        id: `temp-${Date.now()}`, // Ceci devrait être remplacé par l'UID généré par Firebase Auth
        uid: `temp-${Date.now()}`, // Ceci devrait être remplacé par l'UID généré par Firebase Auth
        email,
        displayName,
        role
      });

      // Fermer le dialogue et rafraîchir la liste des utilisateurs
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      setError("Erreur lors de la création de l'utilisateur");
    }
  };

  const handleSaveAssignments = async () => {
    if (!selectedYouth) return;

    try {
      setError(null);

      // Récupérer les assignations actuelles
      const currentAssignments = selectedYouth.assignedReferents || [];

      // Déterminer les référents à ajouter et à retirer
      const referentsToAdd = selectedReferents.filter(
        (refId) => !currentAssignments.includes(refId)
      );
      const referentsToRemove = currentAssignments.filter(
        (refId) => !selectedReferents.includes(refId)
      );

      // Ajouter de nouveaux référents
      for (const refId of referentsToAdd) {
        await userService.updateUser(selectedYouth.id, {
          assignedReferents: [...currentAssignments, refId]
        });
      }

      // Retirer les référents désélectionnés
      for (const refId of referentsToRemove) {
        await userService.updateUser(selectedYouth.id, {
          assignedReferents: currentAssignments.filter(id => id !== refId)
        });
      }

      // Fermer le dialogue et rafraîchir la liste des utilisateurs
      handleCloseAssignDialog();
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de l'assignation des référents:", error);
      setError("Erreur lors de l'assignation des référents");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await userService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const getReferentName = (id: string): string => {
    const referent = referents.find((r) => r.uid === id);
    return referent ? referent.displayName : id;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user tabs">
          <Tab label={t('users.all')} {...a11yProps(0)} />
          <Tab label={t('users.youths')} {...a11yProps(1)} />
          <Tab label={t('users.referents')} {...a11yProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.name')}</TableCell>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>{t('users.role')}</TableCell>
                <TableCell>{t('users.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{t(`users.roles.${user.role}`)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteUser(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.name')}</TableCell>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>{t('users.referents')}</TableCell>
                <TableCell>{t('users.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {youths.map((youth) => (
                <TableRow key={youth.id}>
                  <TableCell>{youth.displayName}</TableCell>
                  <TableCell>{youth.email}</TableCell>
                  <TableCell>
                    {youth.assignedReferents?.map((refId) => (
                      <Chip
                        key={refId}
                        label={getReferentName(refId)}
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenAssignDialog(youth)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(youth.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('users.name')}</TableCell>
                <TableCell>{t('users.email')}</TableCell>
                <TableCell>{t('users.assignedYouths')}</TableCell>
                <TableCell>{t('users.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referents.map((referent) => (
                <TableRow key={referent.id}>
                  <TableCell>{referent.displayName}</TableCell>
                  <TableCell>{referent.email}</TableCell>
                  <TableCell>
                    {referent.assignedYouths?.map((youthId) => (
                      <Chip
                        key={youthId}
                        label={youths.find((y) => y.id === youthId)?.displayName || youthId}
                        sx={{ mr: 1 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteUser(referent.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Button variant="contained" onClick={handleOpenDialog} sx={{ mt: 2 }}>
        {t('users.addUser')}
      </Button>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('users.addUser')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label={t('users.email')}
            type="email"
            fullWidth
            value={newUser.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="displayName"
            label={t('users.name')}
            fullWidth
            value={newUser.displayName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="password"
            label={t('users.password')}
            type="password"
            fullWidth
            value={newUser.password}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('users.role')}</InputLabel>
            <Select
              value={newUser.role}
              onChange={handleRoleChange}
              label={t('users.role')}
            >
              <MenuItem value="jeune">{t('users.roles.jeune')}</MenuItem>
              <MenuItem value="referent">{t('users.roles.referent')}</MenuItem>
              <MenuItem value="admin">{t('users.roles.admin')}</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveUser}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>
          {t('users.assignReferentsTo', { name: selectedYouth?.displayName })}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('users.referents')}</InputLabel>
            <Select
              multiple
              value={selectedReferents}
              onChange={handleReferentSelectionChange}
              label={t('users.referents')}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={getReferentName(value)} />
                  ))}
                </Box>
              )}
            >
              {referents.map((referent) => (
                <MenuItem key={referent.id} value={referent.id}>
                  {referent.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveAssignments}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

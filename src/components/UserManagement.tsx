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
import { userService, User } from '../services/userService';

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
    role: User['role'];
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
      setYouths(youthList);

      // Récupérer les référents
      const referentList = await userService.getUsersByRole('referent');
      const coreferentList = await userService.getUsersByRole('coreferent');
      setReferents([...referentList, ...coreferentList]);

      // Récupérer tous les utilisateurs
      setUsers([...youthList, ...referentList, ...coreferentList]);
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

  const handleRoleChange = (e: SelectChangeEvent<User['role']>) => {
    setNewUser((prev) => ({
      ...prev,
      role: e.target.value as User['role']
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
        await userService.assignReferentToYouth(selectedYouth.uid, refId);
      }

      // Retirer les référents désélectionnés
      for (const refId of referentsToRemove) {
        await userService.removeReferentFromYouth(selectedYouth.uid, refId);
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
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user management tabs">
          <Tab label={t('userManagement.allUsers')} {...a11yProps(0)} />
          <Tab label={t('userManagement.youths')} {...a11yProps(1)} />
          <Tab label={t('userManagement.referents')} {...a11yProps(2)} />
        </Tabs>
        <Button variant="contained" color="primary" onClick={handleOpenDialog} sx={{ m: 1 }}>
          {t('userManagement.addUser')}
        </Button>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('userManagement.name')}</TableCell>
                <TableCell>{t('userManagement.email')}</TableCell>
                <TableCell>{t('userManagement.role')}</TableCell>
                <TableCell>{t('userManagement.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{t(`roles.${user.role}`)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteUser(user.uid)}>
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
                <TableCell>{t('userManagement.name')}</TableCell>
                <TableCell>{t('userManagement.email')}</TableCell>
                <TableCell>{t('userManagement.assignedReferents')}</TableCell>
                <TableCell>{t('userManagement.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {youths.map((youth) => (
                <TableRow key={youth.uid}>
                  <TableCell>{youth.displayName}</TableCell>
                  <TableCell>{youth.email}</TableCell>
                  <TableCell>
                    {youth.assignedReferents && youth.assignedReferents.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {youth.assignedReferents.map((refId) => (
                          <Chip key={refId} label={getReferentName(refId)} size="small" />
                        ))}
                      </Box>
                    ) : (
                      t('userManagement.noReferentsAssigned')
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenAssignDialog(youth)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteUser(youth.uid)}>
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
                <TableCell>{t('userManagement.name')}</TableCell>
                <TableCell>{t('userManagement.email')}</TableCell>
                <TableCell>{t('userManagement.role')}</TableCell>
                <TableCell>{t('userManagement.assignedYouths')}</TableCell>
                <TableCell>{t('userManagement.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referents.map((referent) => (
                <TableRow key={referent.uid}>
                  <TableCell>{referent.displayName}</TableCell>
                  <TableCell>{referent.email}</TableCell>
                  <TableCell>{t(`roles.${referent.role}`)}</TableCell>
                  <TableCell>
                    {referent.assignedYouths && referent.assignedYouths.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {referent.assignedYouths.map((youthId) => {
                          const youth = youths.find((y) => y.uid === youthId);
                          return (
                            <Chip
                              key={youthId}
                              label={youth ? youth.displayName : youthId}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      t('userManagement.noYouthsAssigned')
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteUser(referent.uid)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Dialogue pour ajouter un utilisateur */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{t('userManagement.addUser')}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
            <TextField
              margin="dense"
              id="email"
              name="email"
              label={t('auth.email')}
              type="email"
              fullWidth
              variant="outlined"
              value={newUser.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              id="displayName"
              name="displayName"
              label={t('auth.displayName')}
              type="text"
              fullWidth
              variant="outlined"
              value={newUser.displayName}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              id="password"
              name="password"
              label={t('auth.password')}
              type="password"
              fullWidth
              variant="outlined"
              value={newUser.password}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="role-label">{t('auth.role')}</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={newUser.role}
                label={t('auth.role')}
                onChange={handleRoleChange}
              >
                <MenuItem value="jeune">{t('roles.jeune')}</MenuItem>
                <MenuItem value="referent">{t('roles.referent')}</MenuItem>
                <MenuItem value="coreferent">{t('roles.coreferent')}</MenuItem>
                <MenuItem value="admin">{t('roles.admin')}</MenuItem>
              </Select>
            </FormControl>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveUser}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pour attribuer des référents à un jeune */}
      <Dialog open={openAssignDialog} onClose={handleCloseAssignDialog}>
        <DialogTitle>
          {t('userManagement.assignReferents')}
          {selectedYouth && `: ${selectedYouth.displayName}`}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="referents-label">{t('userManagement.referents')}</InputLabel>
            <Select
              labelId="referents-label"
              id="referents"
              multiple
              value={selectedReferents}
              onChange={handleReferentSelectionChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((refId) => (
                    <Chip key={refId} label={getReferentName(refId)} />
                  ))}
                </Box>
              )}
            >
              {referents.map((referent) => (
                <MenuItem key={referent.uid} value={referent.uid}>
                  {referent.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
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

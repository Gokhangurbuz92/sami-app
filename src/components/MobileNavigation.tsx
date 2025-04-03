import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { Home, CalendarMonth, Person, Notifications } from '@mui/icons-material'

export default function MobileNavigation() {
  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        sx={{
          height: 56,
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 0',
          },
        }}
      >
        <BottomNavigationAction 
          label="Accueil" 
          icon={<Home />} 
        />
        <BottomNavigationAction 
          label="Planning" 
          icon={<CalendarMonth />} 
        />
        <BottomNavigationAction 
          label="Profil" 
          icon={<Person />} 
        />
        <BottomNavigationAction 
          label="Notifications" 
          icon={<Notifications />} 
        />
      </BottomNavigation>
    </Paper>
  )
} 
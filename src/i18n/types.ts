import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      common: {
        welcome: string;
        login: string;
        logout: string;
        email: string;
        password: string;
        save: string;
        cancel: string;
        delete: string;
      };
      auth: {
        loginTitle: string;
        loginError: string;
        loginSuccess: string;
        errors: {
          signUp: string;
          signIn: string;
          logout: string;
          resetPassword: string;
        };
      };
      navigation: {
        home: string;
        planning: string;
        profile: string;
        notifications: string;
      };
      dashboard: {
        searchYouth: string;
        planning: string;
        appointments: string;
        notes: string;
      };
      notes: {
        confirmDelete: string;
        searchPlaceholder: string;
        priority: {
          high: string;
          medium: string;
          low: string;
        };
        category: {
          general: string;
          medical: string;
          social: string;
          education: string;
          other: string;
        };
        addNote: string;
        editNote: string;
        noteTitle: string;
        noteContent: string;
        addTag: string;
      };
      youth: {
        editTitle: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        genderMale: string;
        genderFemale: string;
        genderOther: string;
        address: string;
        phone: string;
        email: string;
        confirmDelete: string;
        deleteMessage: string;
      };
      notifications: {
        title: string;
        markAllAsRead: string;
        noNotifications: string;
        newAppointment: string;
        appointmentReminder: string;
        newNote: string;
        noteUpdated: string;
        newYouth: string;
        youthUpdated: string;
      };
    };
  }
} 
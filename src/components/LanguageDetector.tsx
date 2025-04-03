import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageDetector() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Détecter la langue du navigateur
    const browserLang = navigator.language;
    
    // Mapping des langues et dialectes
    const languageMapping: { [key: string]: string } = {
      // Arabe et ses dialectes
      'ar-SA': 'ar_SA', // Arabe saoudien
      'ar-AE': 'ar_AE', // Arabe émirati
      'ar-EG': 'ar_EG', // Arabe égyptien
      'ar-MA': 'ar_MA', // Arabe marocain
      'ar-DZ': 'ar_DZ', // Arabe algérien
      'ar-TN': 'ar_TN', // Arabe tunisien
      'ar-LY': 'ar_LY', // Arabe libyen
      'ar-SD': 'ar_SD', // Arabe soudanais
      'ar': 'ar', // Arabe standard

      // Autres langues
      'ps': 'ps', // Pachto
      'tr': 'tr', // Turc
      'so': 'so', // Somali
      'bm': 'ml', // Bambara (Mali)
      'ff': 'gn', // Fula (Guinée)
      'bci': 'ci', // Baoulé (Côte d'Ivoire)
      'bn': 'bn', // Bengali (Bangladesh)
      'ur': 'ur', // Urdu (Pakistan)
      'fr': 'fr', // Français
      'en': 'en'  // Anglais
    };

    // Vérifier si la langue complète est supportée
    let detectedLang = languageMapping[browserLang];
    
    // Si non, essayer avec le code de langue principal
    if (!detectedLang) {
      const mainLang = browserLang.split('-')[0];
      detectedLang = languageMapping[mainLang];
    }

    // Si toujours pas de correspondance, utiliser le français par défaut
    if (!detectedLang) {
      detectedLang = 'fr';
    }

    // Appliquer la langue détectée
    i18n.changeLanguage(detectedLang);
  }, [i18n]);

  return null;
} 
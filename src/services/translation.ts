import axios from 'axios';

// Fonction pour traduire un texte
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    // Utiliser l'API de traduction de votre choix (Google, DeepL, etc.)
    // Exemple avec l'API de Google Cloud Translation
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY}`,
      {
        q: text,
        target: targetLang,
        format: 'text'
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Erreur de traduction:', error);
    throw new Error('Échec de la traduction');
  }
};

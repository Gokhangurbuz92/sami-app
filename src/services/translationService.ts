import axios from 'axios';

const GOOGLE_TRANSLATE_API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage: string;
    }>;
  };
}

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      throw new Error('Google Translate API key is not configured');
    }

    const response = await axios.post<TranslationResponse>(
      GOOGLE_TRANSLATE_API_URL,
      {
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        key: GOOGLE_TRANSLATE_API_KEY,
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    // Retourner le texte original en cas d'erreur
    return text;
  }
};

export const detectLanguage = async (text: string): Promise<string> => {
  try {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      throw new Error('Google Translate API key is not configured');
    }

    const response = await axios.post(
      'https://translation.googleapis.com/language/translate/v2/detect',
      {
        q: text,
        key: GOOGLE_TRANSLATE_API_KEY,
      }
    );

    return response.data.data.detections[0][0].language;
  } catch (error) {
    console.error('Erreur lors de la détection de la langue:', error);
    return 'fr'; // Langue par défaut
  }
}; 
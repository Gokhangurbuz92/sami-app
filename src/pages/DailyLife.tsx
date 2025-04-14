import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { translateText } from '../services/translationService';

interface EducationalContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  pictograms: string[];
}

const EDUCATIONAL_VIDEOS: EducationalContent[] = [
  {
    id: 'hygiene-general',
    title: 'dailyLife.hygieneGeneral.title',
    description: 'dailyLife.hygieneGeneral.description',
    videoUrl: 'https://www.youtube.com/embed/uMsMqal0uiw',
    thumbnailUrl: 'https://img.youtube.com/vi/uMsMqal0uiw/maxresdefault.jpg',
    pictograms: ['🚿', '🧼', '🧴']
  },
  {
    id: 'brushing-teeth',
    title: 'dailyLife.brushingTeeth.title',
    description: 'dailyLife.brushingTeeth.description',
    videoUrl: 'https://www.youtube.com/embed/WgsOuDJ_XRA',
    thumbnailUrl: 'https://img.youtube.com/vi/WgsOuDJ_XRA/maxresdefault.jpg',
    pictograms: ['🪥', '🧴', '⏱️']
  },
  {
    id: 'intimate-hygiene',
    title: 'dailyLife.intimateHygiene.title',
    description: 'dailyLife.intimateHygiene.description',
    videoUrl: 'https://www.youtube.com/embed/ISYOX1_1dJU',
    thumbnailUrl: 'https://img.youtube.com/vi/ISYOX1_1dJU/maxresdefault.jpg',
    pictograms: ['🚿', '🧼', '🧴']
  }
];

const DailyLife = () => {
  const { t, i18n } = useTranslation();
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        // Traduire les titres et descriptions
        const translatedContents = await Promise.all(
          EDUCATIONAL_VIDEOS.map(async (content) => ({
            ...content,
            title: await translateText(t(content.title), i18n.language),
            description: await translateText(t(content.description), i18n.language)
          }))
        );
        setContents(translatedContents);
      } catch (error) {
        console.error('Erreur lors du chargement des contenus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [i18n.language, t]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dailyLife.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {contents.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="iframe"
                src={content.videoUrl}
                title={content.title}
                sx={{ height: 200 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {content.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {content.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  {content.pictograms.map((picto, index) => (
                    <Chip
                      key={index}
                      label={picto}
                      size="small"
                      sx={{ fontSize: '1.2rem' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DailyLife; 
import { styled } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

const ToDoDashboardStyles = {
  Container: styled(Box)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  })),
  Greeting: styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
  })),
  Subtitle: styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
  })),
  SectionTitle: styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  })),
	ContentIcons: styled(Box)(({}) => ({
		display: 'flex',
		alignItems: 'center',
	})),
};

export default ToDoDashboardStyles;

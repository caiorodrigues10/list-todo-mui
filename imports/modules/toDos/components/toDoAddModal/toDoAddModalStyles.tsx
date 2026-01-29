import { styled } from '@mui/material/styles';
import { DialogTitle, DialogContent, DialogActions, Box, Typography, Button, IconButton } from '@mui/material';

export const ToDoAddModalStyles = {
  Title: styled(DialogTitle)(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  })),
  CloseButton: styled(IconButton)(({ theme }) => ({
    color: theme.palette.grey[500],
  })),
  Content: styled(DialogContent)(() => ({
    borderTop: 'none',
    borderBottom: 'none',
  })),
  FormContainer: styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
  })),
  Label: styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
  })),
  Actions: styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2),
    justifyContent: 'center',
  })),
  SaveButton: styled(Button)(({ theme }) => ({
    width: '200px',
    backgroundColor: '#bdbdbd',
    color: '#000',
    '&:hover': {
      backgroundColor: '#9e9e9e',
    },
    textTransform: 'none',
    fontWeight: 'bold',
    boxShadow: 'none',
  })),
};

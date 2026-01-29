import React from 'react';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { sysSizing } from '../../../ui/materialui/styles';

interface ISignInStyles {
	Container: React.ElementType;
	Content: React.ElementType;
	FormContainer: React.ElementType;
	FormWrapper: React.ElementType;
}

const SignInStyles: ISignInStyles = {
	Container: styled(Box)(({ theme }) => ({
		minHeight: '100vh',
		width: '100%',
		backgroundColor: theme.palette.sysBackground?.default || '#F5F5F5',
		color: theme.palette.sysText?.primary || '#000000',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center'
	})),
	Content: styled(Box)(({ theme }) => ({
		width: '100%',
		maxWidth: '650px',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: theme.spacing(4),
		padding: theme.spacing(3)
	})),
	FormContainer: styled(Box)(({ theme }) => ({
		width: '100%',
		padding: theme.spacing(4),
		borderRadius: theme.spacing(2),
		gap: theme.spacing(3),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
	})),
	FormWrapper: styled(Box)(({ theme }) => ({
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		gap: theme.spacing(2)
	}))
};

export default SignInStyles;

// login page overrides the form’s submit event and call Meteor’s loginWithPassword()
// Authentication errors modify the component’s state to be displayed
import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import TextField from '/imports/ui/components/SimpleFormFields/TextField/TextField';
import Button from '@mui/material/Button';
import SimpleForm from '/imports/ui/components/SimpleForm/SimpleForm';


import { IDefaultContainerProps } from '/imports/typings/BoilerplateDefaultTypings';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import SignInStyles from '../signIn/signInStyles';
import { useNavigate } from 'react-router-dom';
import { sysSizing } from '/imports/ui/materialui/styles';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';


export const PasswordRecovery = (props: IDefaultContainerProps) => {
	const [loading, setLoading] = React.useState<boolean>(false);
	const [msg, setMsg] = React.useState<boolean>(false);

	const { showNotification } = useContext(AppLayoutContext);
	const navigate = useNavigate();
  const {
    Container,
    Content,
    FormContainer,
    FormWrapper,
  } = SignInStyles;

	const handleSubmit = (doc: { email: string }) => {
		const { email } = doc;
		setLoading(true);
		Accounts.forgotPassword({ email }, (err?: Meteor.Error | Error | undefined) => {
			if (err) {
				if (err.message === 'User not found [403]') {
					showNotification &&
						showNotification({
							type: 'warning',
							title: 'Problema na recuperação da senha!',
							message: 'Este email não está cadastrado em nossa base de dados!'
						});
					setLoading(false);
				} else {
					showNotification &&
						showNotification({
							type: 'warning',
							title: 'Problema na recuperação da senha!',
							message: 'Erro ao recriar a senha, faça contato com o administrador!!'
						});
					setLoading(false);
				}
			} else {
				showNotification &&
					showNotification({
						type: 'success',
						title: 'Senha enviada!',
						message: 'Acesse seu email e clique no link para criar uma nova senha.'
					});
				setLoading(false);
				setMsg((prev) => !prev);
			}
		});
	};

	const schema = {
		email: {
			type: 'String',
			label: 'Email',
			optional: false
		}
	};

	return (
		<Container>
			<Content>
				<Typography
					variant="h1"
					color={(theme) => theme.palette.text.primary}
					sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900'}}>
					ToDo List
				</Typography>

				<Typography variant="body1" textAlign="center" color="sysText.secondary" sx={{ mb: 2 }}>
					{!msg
						? 'Esqueceu sua senha? Confirme seu e-mail abaixo para receber um link de redefinição da sua senha'
						: 'Caso o e-mail informado esteja cadastrado no sistema, enviaremos um link para a redefinição de sua senha'}
				</Typography>

				<FormContainer>
					<SimpleForm schema={schema} onSubmit={handleSubmit} styles={{ display: !msg ? 'block' : 'none' }}>
						<FormWrapper>
							<TextField
								label="E-mail"
								fullWidth={true}
								name="email"
								type="email"
								placeholder="Digite seu email"
								disabled={loading}
								sx={{
									'& .MuiInputBase-input': { color: '#000000' },
									'& .MuiInputLabel-root': { color: '#000000' }
								}}
							/>
							<Box />
							<Box sx={{ display: 'flex', gap: sysSizing.spacingFixedMd, justifyContent: 'center', mt: 2 }}>
								<Button
									onClick={() => navigate('/signin')}
									variant="outlined"
									color="primary"
									id="cancelar"
									disabled={loading}
									sx={{ transition: 'all 0.3s ease', width: '45%' }}>
									{loading ? <CircularProgress size={24} /> : 'Cancelar'}
								</Button>
								<Button
									variant="contained"
									color="primary"
									id="submit"
									type="submit"
									sx={{ transition: 'all 0.3s ease', display: loading ? 'none' : 'flex', width: '45%' }}>
									{loading ? <CircularProgress size={24} /> : 'Confirmar'}
								</Button>
							</Box>
						</FormWrapper>
					</SimpleForm>
					<Button
						onClick={() => navigate('/signin')}
						variant="contained"
						color="primary"
						id="voltar"
						fullWidth
						sx={{ transition: 'all 0.3s ease', display: !msg ? 'none' : 'flex', mt: 2 }}>
						{loading ? <CircularProgress size={24} /> : 'Voltar para o Login'}
					</Button>
				</FormContainer>

				<Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
					Lembrou sua senha?{' '}
					<Typography
						component="span"
						variant="body2"
						color="primary"
						sx={{ textDecoration: 'underline', cursor: 'pointer' }}
						onClick={() => navigate('/signin')}
					>
						Faça login
					</Typography>
				</Typography>
			</Content>
		</Container>
	);
};

import Typography from '@mui/material/Typography';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SysForm from '../../../ui/components/sysForm/sysForm';
import SysFormButton from '../../../ui/components/sysFormFields/sysFormButton/sysFormButton';
import SysTextField from '../../../ui/components/sysFormFields/sysTextField/sysTextField';
import { signUpSchema } from './signUpSch';
import SignUpStyles from './signUpStyle';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import { VerifyCodeModal } from '/imports/ui/appComponents/verifyCodeModal/verifyCodeModal';

const SignUpPage: React.FC = () => {
	const { showNotification } = useContext(AppLayoutContext);
	const { user, signUp } = useContext<IAuthContext>(AuthContext);
	const navigate = useNavigate();
	const { Container, Content, FormContainer, FormWrapper } = SignUpStyles;
	const [openCodeVerify, setOpenCodeVerify] = React.useState(false);
	const [emailToVerify, setEmailToVerify] = React.useState('');

	const handleSubmit = (userData: { username: string; email: string; password?: string }) => {
		signUp(userData, (err) => {
			if (!err) {
				setEmailToVerify(userData.email);
				setOpenCodeVerify(true);
				showNotification({
					type: 'success',
					title: 'Cadastro realizado!',
					message: 'Bem-vindo! Enviamos um código de 4 dígitos para o seu e-mail para ativar sua conta.',
				});
			} else {
				showNotification({
					type: 'error',
					title: 'Erro ao tentar cadastrar',
					message: err.reason || 'Ocorreu um erro inesperado',
				});
			}
		});
	};

	const handleGoToSignIn = () => navigate('/signin');

	useEffect(() => {
		if (user && user.status !== 'disabled') navigate('/');
	}, [user]);

	return (
		<Container>
			<Content>
				<Typography
					variant="h1"
					color={(theme) => theme.palette.text.primary}
					sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '900' }}>
					ToDo List
				</Typography>

				<Typography variant="body1" textAlign="center" color="sysText.secondary" sx={{ mb: 2 }}>
					Crie sua conta para gerenciar suas tarefas.
					<br />
					Preencha os campos abaixo:
				</Typography>

				<FormContainer>
					<SysForm schema={signUpSchema} onSubmit={handleSubmit} debugAlerts={false}>
						<FormWrapper>
							<SysTextField name="username" label="Nome de Usuário" fullWidth placeholder="Digite seu nome de usuário"
								sx={{
									'& .MuiInputBase-input': { color: '#000000' },
									'& .MuiInputLabel-root': { color: '#000000' }
								}}
							/>
							<SysTextField name="email" label="Email" fullWidth placeholder="Digite seu email"
								sx={{
									'& .MuiInputBase-input': { color: '#000000' },
									'& .MuiInputLabel-root': { color: '#000000' }
								}}
							/>
							<SysTextField label="Senha" fullWidth name="password" placeholder="Digite sua senha" type="password" sx={{
								'& .MuiInputBase-input': { color: '#000000' },
								'& .MuiInputLabel-root': { color: '#000000' }
							}} />

							<SysFormButton
								variant="contained"
								color="primary"
								type="submit"
								sx={{ mt: 2, width: '50%' }}
							>
								Cadastrar
							</SysFormButton>
						</FormWrapper>
					</SysForm>
				</FormContainer>

				<Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
					Já tem uma conta?{' '}
					<Typography
						component="span"
						variant="body2"
						color="primary"
						sx={{ textDecoration: 'underline', cursor: 'pointer' }}
						onClick={handleGoToSignIn}
					>
						Fazer Login
					</Typography>
				</Typography>
				<VerifyCodeModal
					open={openCodeVerify}
					email={emailToVerify}
					onClose={() => setOpenCodeVerify(false)}
					onSuccess={() => {
						setOpenCodeVerify(false);
						showNotification({
							type: 'success',
							title: 'Conta Ativada!',
							message: 'Sua conta foi ativada com sucesso. Agora você pode fazer login.',
						});
						navigate('/signin');
					}}
				/>
			</Content>
		</Container>
	);
};

export default SignUpPage;

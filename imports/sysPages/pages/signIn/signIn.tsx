import Typography from '@mui/material/Typography';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SysForm from '../../../ui/components/sysForm/sysForm';
import SysFormButton from '../../../ui/components/sysFormFields/sysFormButton/sysFormButton';
import SysTextField from '../../../ui/components/sysFormFields/sysTextField/sysTextField';
import { signInSchema } from './signinsch';
import SignInStyles from './signInStyles';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import { VerifyCodeModal } from '/imports/ui/appComponents/verifyCodeModal/verifyCodeModal';

const SignInPage: React.FC = () => {
	const { showNotification } = useContext(AppLayoutContext);
	const { user, signIn } = useContext<IAuthContext>(AuthContext);
	const navigate = useNavigate();
	const { Container, Content, FormContainer, FormWrapper } = SignInStyles;
	const [openCodeVerify, setOpenCodeVerify] = React.useState(false);
	const [emailToVerify, setEmailToVerify] = React.useState('');
	const [tempPassword, setTempPassword] = React.useState('');

	const handleSubmit = ({ email, password }: { email: string; password: string }) => {
		signIn(email, password, (err) => {
			if (!err) {
				showNotification({
					type: 'success',
					title: 'Login realizado com sucesso!',
					message: 'Bem-vindo de volta!',
				});
				setTempPassword('');
				navigate('/');
			} else {
				if (err.error === 'user-disabled') {
					setEmailToVerify(email);
					setTempPassword(password);
					setOpenCodeVerify(true);
					showNotification({
						type: 'warning',
						title: 'Conta não ativada',
						message: 'Sua conta ainda não foi ativada. Por favor, insira o código de verificação.',
					});
				} else {
					showNotification({
						type: 'error',
						title: 'Erro ao tentar logar',
						message: 'Email ou senha inválidos',
					});
				}
			}
		});
	};

	const handleVerifySuccess = () => {
		setOpenCodeVerify(false);
		if (emailToVerify && tempPassword) {
			handleSubmit({ email: emailToVerify, password: tempPassword });
		} else {
			showNotification({
				type: 'success',
				title: 'Sucesso!',
				message: 'Seu e-mail foi verificado. Agora faça o seu login!',
			});
		}
	};

	const handleVerifyClose = () => {
		setOpenCodeVerify(false);
		setTempPassword('');
	};

	const handleForgotPassword = () => navigate('/password-recovery');
	const handleSignUp = () => navigate('/signup');

	useEffect(() => {
		if (user) navigate('/');
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
					Boas-vindas a sua lista de tarefas.
					<br />
					Insira seu e-mail e senha para efetuar o login:
				</Typography>

				<FormContainer>
					<SysForm schema={signInSchema} onSubmit={handleSubmit} debugAlerts={false}>
						<FormWrapper>
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
								sx={{ mt: 2, width: '50%' }}
							>
								Entrar
							</SysFormButton>
						</FormWrapper>
					</SysForm>
				</FormContainer>


				<Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
					Esqueceu sua senha?{' '}
					<Typography
						component="span"
						variant="body2"
						color="primary"
						sx={{ textDecoration: 'underline', cursor: 'pointer' }}
						onClick={handleForgotPassword}
					>
						Clique aqui
					</Typography>
				</Typography>

				<Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
					Ainda não tem uma conta?{' '}
					<Typography
						component="span"
						variant="body2"
						color="primary"
						sx={{ textDecoration: 'underline', cursor: 'pointer' }}
						onClick={handleSignUp}
					>
						Cadastre-se
					</Typography>
				</Typography>
				<VerifyCodeModal
					open={openCodeVerify}
					email={emailToVerify}
					onSuccess={handleVerifySuccess}
					onClose={handleVerifyClose}
				/>
			</Content>
		</Container>
	);
};

export default SignInPage;

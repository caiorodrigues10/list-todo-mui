import React, { useContext } from 'react';
import { Box, Typography, Link, Container, Paper } from '@mui/material';
import SysForm from '/imports/ui/components/sysForm/sysForm';
import SysTextField from '/imports/ui/components/sysFormFields/sysTextField/sysTextField';
import SysFormButton from '/imports/ui/components/sysFormFields/sysFormButton/sysFormButton';
import { verifyCodeSchema } from './verifyCodeSch';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';
import { useNavigate } from 'react-router-dom';

export const VerifyCode: React.FC<{ email: string }> = ({ email }) => {
	const { verifyCode, resendCode, logout } = useContext<IAuthContext>(AuthContext);
	const { showNotification } = useContext(AppLayoutContext);
	const navigate = useNavigate();

	const handleSubmit = (data: { code: string }) => {
		verifyCode(data.code, email, (err) => {
			if (err) {
				showNotification({
					type: 'error',
					title: 'Erro na Verificação',
					message: err.reason || 'Código inválido ou expirado.'
				});
			} else {
				showNotification({
					type: 'success',
					title: 'Sucesso!',
					message: 'Seu e-mail foi verificado. Bem-vindo!'
				});
				navigate('/');
			}
		});
	};

	const handleResend = (e: React.MouseEvent) => {
		e.preventDefault();
		resendCode(email, (err) => {
			if (err) {
				showNotification({
					type: 'error',
					title: 'Erro ao Reenviar',
					message: err.reason || 'Não foi possível reenviar o código.'
				});
			} else {
				showNotification({
					type: 'success',
					title: 'E-mail Enviado',
					message: 'Um novo código foi enviado para o seu e-mail.'
				});
			}
		});
	};

	const handleLogout = (e: React.MouseEvent) => {
		e.preventDefault();
		logout(() => navigate('/signin'));
	}

	return (
		<Container maxWidth="xs" sx={{ mt: 10 }}>
			<Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
				<Typography variant="h4" fontWeight="bold" gutterBottom>
					Verifique seu E-mail
				</Typography>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
					Enviamos um código de 4 dígitos para <strong>{email}</strong>.
					<br />
					O código expira em 30 minutos.
				</Typography>

				<SysForm schema={verifyCodeSchema} onSubmit={handleSubmit}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<SysTextField
							name="code"
							label="Código de Verificação"
							placeholder="0000"
							fullWidth
							autoFocus
							sx={{
								'& .MuiInputBase-input': { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
							}}
						/>
						<SysFormButton variant="contained" color="primary" type="submit" fullWidth>
							Verificar
						</SysFormButton>
					</Box>
				</SysForm>

				<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
					<Typography variant="body2">
						Não recebeu o código?{' '}
						<Link href="#" onClick={(e) => handleResend(e)} underline="hover">
							Reenviar código
						</Link>
					</Typography>
					<Typography variant="body2">
						Deseja entrar com outra conta?{' '}
						<Link href="#" onClick={handleLogout} underline="hover" color="error">
							Sair
						</Link>
					</Typography>
				</Box>
			</Paper>
		</Container>
	);
};

export default VerifyCode;

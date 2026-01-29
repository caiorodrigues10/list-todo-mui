import { Box, Dialog, DialogContent, DialogTitle, Link, Typography } from '@mui/material';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayoutContext from '/imports/app/appLayoutProvider/appLayoutContext';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import { verifyCodeSchema } from '/imports/sysPages/pages/verifyCode/verifyCodeSch';
import SysForm from '/imports/ui/components/sysForm/sysForm';
import SysFormButton from '/imports/ui/components/sysFormFields/sysFormButton/sysFormButton';
import SysTextField from '/imports/ui/components/sysFormFields/sysTextField/sysTextField';

export const VerifyCodeModal: React.FC<{ open: boolean; email: string; onSuccess?: () => void; onClose?: () => void }> = ({ open, email, onSuccess, onClose }) => {
	const { verifyCode, resendCode, user } = useContext<IAuthContext>(AuthContext);
	const { showNotification } = useContext(AppLayoutContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (open && email) {
			resendCode(email, (err) => {
				if (err) {
					console.error('Error auto-resending code:', err);
				}
			});
		}
	}, [open, email]);

	const handleSubmit = (data: { code: string }) => {
		verifyCode(data.code, email, (err) => {
			if (err) {
				showNotification({
					type: 'error',
					title: 'Erro na Verificação',
					message: err.reason || 'Código inválido ou expirado.'
				});
			} else {
				if (onSuccess) {
					onSuccess();
				} else {
					showNotification({
						type: 'success',
						title: 'Sucesso!',
						message: 'Seu e-mail foi verificado. Agora faça o seu primeiro login!'
					});
					navigate('/signin');
				}
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

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: { borderRadius: 3, p: 2, maxWidth: '400px' }
			}}
		>
			<DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
				Verifique seu E-mail
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
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
						<SysFormButton variant="contained" color="primary" type="submit" fullWidth sx={{ py: 1.5, fontWeight: 'bold' }}>
							Verificar
						</SysFormButton>
					</Box>
				</SysForm>

				<Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
					<Typography variant="body2">
						Não recebeu o código?{' '}
						<Link href="#" onClick={handleResend} underline="hover" sx={{ fontWeight: 'bold' }}>
							Reenviar código
						</Link>
					</Typography>
				</Box>
			</DialogContent>
		</Dialog>
	);
};

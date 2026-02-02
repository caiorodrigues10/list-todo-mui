import React, { useMemo, useState } from 'react';
import { Box, Typography, IconButton, Divider, Button } from '@mui/material';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import SysCircleCheck from '/imports/ui/components/sysCircleCheck/sysCircleCheck';
import SysForm, { ISysFormMethods } from '/imports/ui/components/sysForm/sysForm';
import SysFormButton from '/imports/ui/components/sysFormFields/sysFormButton/sysFormButton';
import SysTextField from '/imports/ui/components/sysFormFields/sysTextField/sysTextField';
import { SysSelectField } from '/imports/ui/components/sysFormFields/sysSelectField/sysSelectField';
import SysSwitch from '/imports/ui/components/sysFormFields/sysSwitch/sysSwitch';
import { SysOptionMenu } from '/imports/ui/components/sysMenu/sysOptionMenu';
import { IToDo } from '../api/toDoSch';
import { EnumToDoStatus } from '../api/toDoEnum';
import { toDoApi } from '../api/toDoApi';

export type TToDoDrawerMode = 'view' | 'edit';

interface IToDoDrawerProps {
	initialToDo: IToDo;
	initialMode: TToDoDrawerMode;
	schema: any;
	userId?: string;
	onClose: () => void;
	onDelete: (doc: IToDo) => void;
	showSuccess: (message: string) => void;
	showError: (message: string) => void;
}

export const ToDoDrawer: React.FC<IToDoDrawerProps> = ({
	initialToDo,
	initialMode,
	schema,
	userId,
	onClose,
	onDelete,
	showSuccess,
	showError
}) => {
	const [mode, setMode] = useState<TToDoDrawerMode>(initialMode);
	const [doc, setDoc] = useState<IToDo>(initialToDo);
	const [docBeforeEdit, setDocBeforeEdit] = useState<IToDo>(initialToDo);
	const [saving, setSaving] = useState(false);
	const canEdit = doc.ownerId === userId || doc.assigneeId === userId;
	const sysFormRef = React.useRef<ISysFormMethods>(null);

	const typeLabel = useMemo(() => {
		return doc.type === 'shared' ? 'Compartilhado' : 'Pessoal';
	}, [doc.type]);

	const assigneeLabel = useMemo(() => {
		if (doc.type === 'personal') return doc.ownerId === userId ? 'Você' : doc.username || 'Desconhecido';
		if (!doc.assigneeId) return 'Não atribuído';
		if (doc.assigneeId === userId) return 'Você';
		const options = schema.assigneeId?.options?.() || [];
		const option = options.find((o: { value: string; label: string }) => o.value === doc.assigneeId);
		return option ? option.label : 'Desconhecido';
	}, [doc.assigneeId, doc.type, doc.ownerId, doc.username, schema, userId]);

	const handleSubmit = async (nextDoc: IToDo) => {
		setSaving(true);
		try {
			await Promise.resolve(toDoApi.update(nextDoc));
			setDoc(nextDoc);
			setDocBeforeEdit(nextDoc);
			setMode('view');
			showSuccess('Editado com sucesso!');
		} catch (e) {
			showError('Erro ao editar. Tente novamente.');
		} finally {
			setSaving(false);
		}
	};

	const toggleStatus = () => {
		const nextStatus =
			doc.status === EnumToDoStatus.CONCLUDED ? EnumToDoStatus.NOT_CONCLUDED : EnumToDoStatus.CONCLUDED;
		const nextDoc = { ...doc, status: nextStatus };
		setDoc(nextDoc);
		setDocBeforeEdit(nextDoc);
		try {
			toDoApi.update(nextDoc);
		} catch (e) {
			showError('Erro ao atualizar status.');
		}
	};

	const changeStatusEdit = (newStatus: EnumToDoStatus) => {
		if (doc.status === newStatus) return;
		const currentFormValues = sysFormRef.current?.getDocValues() || {};
		const nextDoc = { ...doc, ...currentFormValues, status: newStatus };
		setDoc(nextDoc);
	};

	const drawerPaddingX = 6;

	return (
		<Box
			role="dialog"
			aria-label="Edição de tarefa"
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				width: '100%'
			}}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
					px: drawerPaddingX,
					pt: 2,
					pb: 1
				}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
				</Box>

				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						ml: 1
					}}>
					{canEdit && (
						<SysOptionMenu
							options={[
								{
									key: 'delete',
									label: 'Excluir',
									startIcon: <SysIcon name="delete" />,
									onClick: () => onDelete(doc)
								}
							]}>
							<IconButton aria-label="opções" sx={{ color: 'black' }}>
								<SysIcon name="moreVert" />
							</IconButton>
						</SysOptionMenu>
					)}
					<IconButton aria-label="fechar" onClick={onClose} sx={{ color: 'black' }}>
						<SysIcon name="close" />
					</IconButton>
				</Box>
			</Box>

			<SysForm ref={sysFormRef} mode={mode} schema={schema} doc={doc} onSubmit={handleSubmit} loading={saving}>
				{mode === 'view' ? (
					<>
						<Box sx={{ flexGrow: 1, overflow: 'auto', px: drawerPaddingX, py: 6 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
									<Box
										onClick={() => {
											if (canEdit) toggleStatus();
										}}
										sx={{ cursor: canEdit ? 'pointer' : 'default', mt: 0.5 }}
										aria-label="alternar status da tarefa"
										role="button"
										tabIndex={canEdit ? 0 : -1}
										onKeyDown={(e) => {
											if (canEdit && (e.key === 'Enter' || e.key === ' ')) toggleStatus();
										}}>
										<SysCircleCheck checked={doc.status === EnumToDoStatus.CONCLUDED} />
									</Box>
									<Typography variant="h5" sx={{ fontWeight: 400, lineHeight: 1.3 }}>
										{doc.title}
									</Typography>
								</Box>

								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, fontSize: '14px' }}>
										Descrição
									</Typography>
									<Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
										{doc.description || '-'}
									</Typography>
								</Box>
								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '14px' }}>
										Tipo
									</Typography>
									<Typography variant="body1" color="text.primary">
										{typeLabel}
									</Typography>
								</Box>
								<Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, fontSize: '14px' }}>
										Responsável
									</Typography>
									<Typography variant="body1" color="text.primary">
										{assigneeLabel}
									</Typography>
								</Box>
							</Box>
						</Box>
						<Box sx={{ px: drawerPaddingX, pb: 4, pt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
							{canEdit && (
								<Button
									variant="outlined"
									onClick={() => {
										setDocBeforeEdit(doc);
										setMode('edit');
									}}
									sx={{
										width: { xs: '100%', sm: 260 },
										height: 48,
										borderColor: (theme) => theme.palette.grey[400],
										color: (theme) => theme.palette.text.primary,
										fontWeight: 700,
										textTransform: 'none',
										borderRadius: '8px',
										'&:hover': {
											borderColor: (theme) => theme.palette.grey[500],
											backgroundColor: (theme) => theme.palette.grey[100]
										}
									}}>
									Editar
								</Button>
							)}
							<Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
								<Typography variant="caption" sx={{ color: '#999999', fontSize: '12px' }}>
									Criada por: <span style={{ textDecoration: 'underline' }}>{doc.ownerId === userId ? 'Você' : doc.username || 'Outro'}</span>
								</Typography>
							</Box>
						</Box>
					</>
				) : (
					<>
						<Box sx={{ flexGrow: 1, overflow: 'auto', px: drawerPaddingX, py: 2 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
								<SysTextField name="title" placeholder="Ex.: Tarefa X" />
								<SysTextField
									name="description"
									placeholder="Acrescente informações sobre a tarefa"
									multiline
									rows={3}
									showNumberCharactersTyped
									max={200}
								/>
								{canEdit && (
									<Box sx={{ mt: 1 }}>
										<SysSwitch
											name="type"
											label="Tarefa Compartilhada?"
											value={doc.type}
											trueValue="shared"
											falseValue="personal"
											disabled={doc.ownerId !== userId}
											onChange={(e: any) => {
												const nextType = e.target.value;
												setDoc({
													...doc,
													type: nextType,
													assigneeId: nextType === 'personal' ? userId : doc.assigneeId
												});
											}}
										/>
									</Box>
								)}
								<Box sx={{ mt: 1 }}>
									<SysSelectField name="assigneeId" disabled={doc.ownerId !== userId} />
								</Box>
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
									<Button
										variant={doc.status === EnumToDoStatus.NOT_CONCLUDED ? "contained" : "outlined"}
										onClick={() => changeStatusEdit(EnumToDoStatus.NOT_CONCLUDED)}
										size="small"
										sx={{ textTransform: 'none' }}
									>
										Não Concluída
									</Button>
									<Button
										variant={doc.status === EnumToDoStatus.CONCLUDED ? "contained" : "outlined"}
										onClick={() => changeStatusEdit(EnumToDoStatus.CONCLUDED)}
										size="small"
										sx={{ textTransform: 'none' }}
									>
										Concluída
									</Button>
								</Box>
							</Box>
						</Box>
						<Divider />
						<Box
							sx={{
								display: 'flex',
								flexDirection: { xs: 'column', sm: 'row' },
								justifyContent: 'center',
								gap: 1.5,
								px: drawerPaddingX,
								py: 2
							}}>
							<Button
								variant="outlined"
								onClick={() => {
									setDoc(docBeforeEdit);
									setMode('view');
								}}
								sx={{
									width: { xs: '100%', sm: 180 },
									borderColor: (theme) => theme.palette.grey[400],
									color: (theme) => theme.palette.grey[900],
									'&:hover': { borderColor: (theme) => theme.palette.grey[500], backgroundColor: (theme) => theme.palette.grey[100] }
								}}>
								Cancelar
							</Button>
							<SysFormButton
								variant="outlined"
								sx={{
									width: { xs: '100%', sm: 180 },
									borderColor: (theme) => theme.palette.grey[400],
									color: (theme) => theme.palette.grey[900],
									backgroundColor: 'transparent',
									'&:hover': {
										backgroundColor: (theme) => theme.palette.grey[100],
										borderColor: (theme) => theme.palette.grey[500]
									}
								}}>
								Salvar
							</SysFormButton>
						</Box>
					</>
				)}
			</SysForm>
		</Box>
	);
};

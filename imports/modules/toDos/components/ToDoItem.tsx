import React from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import SysCircleCheck from '/imports/ui/components/sysCircleCheck/sysCircleCheck';
import { EnumToDoStatus } from '../api/toDoEnum';
import { IToDo } from '../api/toDoSch';
import { SysOptionMenu } from '/imports/ui/components/sysMenu/sysOptionMenu';

interface IToDoItemProps {
	item: IToDo;
	userId?: string;
	onStatusChange: (item: IToDo, newStatus: EnumToDoStatus) => void;
	onEdit: (item: IToDo) => void;
	onView?: (item: IToDo) => void;
	onDelete?: (item: IToDo) => void;
}

export const ToDoItem: React.FC<IToDoItemProps> = ({ item, userId, onStatusChange, onEdit, onView, onDelete }) => {
	const canEdit = item.ownerId === userId || item.assigneeId === userId;

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 1.5 }}>
			<Box
				onClick={() => {
					if (canEdit) {
						onStatusChange(
							item,
							item.status === EnumToDoStatus.CONCLUDED ? EnumToDoStatus.NOT_CONCLUDED : EnumToDoStatus.CONCLUDED
						);
					}
				}}
				sx={{
					minWidth: 40,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: canEdit ? 'pointer' : 'default'
				}}
			>
				<SysCircleCheck checked={item.status === EnumToDoStatus.CONCLUDED} />
			</Box>

			<Box
				onClick={() => (onView ? onView(item) : onEdit(item))}
				sx={{
					flex: 1,
					cursor: 'pointer',
					'&:hover': {
						backgroundColor: 'action.hover'
					},
					borderRadius: 1,
					px: 1,
					py: 0.5
				}}
			>
				<Typography
					variant="body1"
					sx={{
						fontWeight: 'bold',
						fontSize: '18px',
						mb: 0.5,
						textDecoration: item.status === EnumToDoStatus.CONCLUDED ? 'line-through' : 'none',
						color: item.status === EnumToDoStatus.CONCLUDED ? 'text.secondary' : 'text.primary'
					}}
				>
					{item.title}
				</Typography>
				<Typography component="span" variant="caption" sx={{ color: '#999999', fontSize: '14px', display: 'block' }}>
					Criada por: <span style={{ textDecoration: 'underline' }}>{item.ownerId === userId ? 'Você' : ((item as any).username || 'Outro')}</span>
				</Typography>
			</Box>

			{canEdit && (onEdit || onDelete) && (
				<SysOptionMenu
					options={[
						{
							key: 'edit',
							label: 'Editar',
							startIcon: <SysIcon name="edit" />,
							onClick: () => onEdit(item)
						},
						...(onDelete
							? [
									{
										key: 'delete',
										label: 'Excluir',
										startIcon: <SysIcon name="delete" />,
										onClick: () => onDelete(item)
									}
							  ]
							: [])
					]}
				>
					<IconButton edge="end" aria-label="opções">
						<SysIcon name="moreVert" />
					</IconButton>
				</SysOptionMenu>
			)}
		</Box>
	);
};

import React, { useContext } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { ToDoDashboardControllerContext } from './toDoDashboardController';
import ToDoDashboardStyles from './toDoDashboardStyles';
import SysList from '/imports/ui/components/sysList/sysList';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import { IToDo } from '../../api/toDoSch';
import { ToDoItem } from '../../components/ToDoItem';
import { ToDoStatsCards } from '../../components/ToDoStatsCards';
import { ToDoDrawer } from '../../components/ToDoDrawer';
import DeleteDialog from '/imports/ui/appComponents/showDialog/custom/deleteDialog/deleteDialog';
import { SysFab } from '/imports/ui/components/sysFab/sysFab';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import { useNavigate } from 'react-router-dom';

const ToDoDashboardView = () => {
	const { userName, recentTasks, toggleTaskStatus, onDeleteButtonClick, schema, loading, userId } = useContext(ToDoDashboardControllerContext);
	const { Container, Greeting, Subtitle, SectionTitle, ContentIcons } = ToDoDashboardStyles;
	const sysLayoutContext = useContext<IAppLayoutContext>(AppLayoutContext);
	const navigate = useNavigate();

	const handleEdit = (item: IToDo) => {
		sysLayoutContext.showDrawer({
			anchor: 'right',
			sx: {
				width: { xs: '100vw', sm: 440, md: 520 },
				maxWidth: '100vw'
			},
			children: (
				<ToDoDrawer
					initialToDo={item}
					initialMode="view"
					schema={schema}
					userId={userId}
					onClose={() => sysLayoutContext.closeDrawer()}
					onDelete={(doc) => {
						DeleteDialog({
							showDialog: sysLayoutContext.showDialog,
							closeDialog: sysLayoutContext.closeDialog,
							title: `Excluir dado ${doc.title}`,
							message: `Tem certeza que deseja excluir o arquivo ${doc.title}?`,
							onDeleteConfirm: () => {
								onDeleteButtonClick(doc);
								sysLayoutContext.showNotification({ message: 'Excluído com sucesso!' });
								sysLayoutContext.closeDrawer();
							}
						});
					}}
					showSuccess={(message) => sysLayoutContext.showNotification({ message })}
					showError={(message) => sysLayoutContext.showNotification({ message, type: 'error' })}
				/>
			)
		});
	};

	return (
		<Container>
			<Box>
				<Greeting variant="h1">Olá, {userName}</Greeting>
				<Subtitle variant="subtitle1" sx={{ mb: 4 }}>
					Seus projetos muito mais organizados. Veja as tarefas adicionadas por seu time, por você e para você!
				</Subtitle>
			</Box>

			<Typography variant="h6">Atividades do time</Typography>

			<ToDoStatsCards team />

			<Typography variant="h6">Minhas atividades</Typography>

			<ToDoStatsCards />

			<Box sx={{ mt: 4 }}>

				<SectionTitle variant="h6">Atividades recentes</SectionTitle>
				<SysList
					items={recentTasks}
					loading={loading}
					renderItem={(item, index) => (
						<React.Fragment key={item._id || index}>
							<ToDoItem
								item={item}
								userId={userId}
								onStatusChange={toggleTaskStatus}
								onEdit={handleEdit}
							/>
							<Divider />
						</React.Fragment>
					)}
				/>
			</Box>
			<SysFab
				variant="extended"
				text="Ir para Tarefas"
				endIcon={
					<ContentIcons>
						<SysIcon name={'chevronRight'} />
						<SysIcon name={'chevronRight'} sx={{marginLeft: '-16px'}} />
					</ContentIcons>
				}
				fixed={true}
				location="bottom-center"
				onClick={() => navigate('/todo')}
        sx={{ color: 'black', backgroundColor: (theme) => theme.palette.grey[400], '&:hover': { backgroundColor: (theme) => theme.palette.grey[500] } }}
			/>
		</Container>
	);
};

export default ToDoDashboardView;

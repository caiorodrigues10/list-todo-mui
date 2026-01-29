import { Collapse, Divider, IconButton, Link } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import React, { useContext } from 'react';
import DeleteDialog from '../../../../ui/appComponents/showDialog/custom/deleteDialog/deleteDialog';
import { SysFab } from '../../../../ui/components/sysFab/sysFab';
import SysTextField from '../../../../ui/components/sysFormFields/sysTextField/sysTextField';
import SysIcon from '../../../../ui/components/sysIcon/sysIcon';
import ToDoListStyles from './toDoListStyles';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import { TodoListControllerContext } from '/imports/modules/toDos/pages/toDoList/toDoListController';
import SysList from '/imports/ui/components/sysList/sysList';
import { ToDoDrawer } from '../../components/ToDoDrawer';
import { ToDoItem } from '../../components/ToDoItem';
import { SysTabs } from '/imports/ui/components/sysTabs/sysTabs';
import { ToDoAddModalController } from '/imports/modules/toDos/components/toDoAddModal/toDoAddModalController';


const ToDoListView = () => {
	const controller = useContext(TodoListControllerContext);
	const sysLayoutContext = useContext<IAppLayoutContext>(AppLayoutContext);
	const { Container, LoadingContainer, SearchContainer } = ToDoListStyles;
	const { pendingTasks, completedTasks } = controller;

	const abas = [
		{ label: 'Minhas Tarefas', value: '1' },
		{ label: 'Tarefas do Time', value: '2' }
	];

	const renderTaskList = (tasks: any[]) => (
		<SysList
			items={tasks}
			emptyMessage="Nenhum item nesta seção"
			renderItem={(item, index) => (
				<React.Fragment key={item._id || index}>
					<ToDoItem
						item={item}
						userId={controller.userId}
						onStatusChange={controller.changeTaskStatus}
						onView={(item) => {
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
										schema={controller.schema}
										userId={controller.userId}
										onClose={() => sysLayoutContext.closeDrawer()}
										onDelete={(doc) => {
											DeleteDialog({
												showDialog: sysLayoutContext.showDialog,
												closeDialog: sysLayoutContext.closeDialog,
												title: `Excluir dado ${doc.title}`,
												message: `Tem certeza que deseja excluir o arquivo ${doc.title}?`,
												onDeleteConfirm: () => {
													controller.onDeleteButtonClick(doc);
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
						}}
						onEdit={(item) => {
							sysLayoutContext.showDrawer({
								anchor: 'right',
								sx: {
									width: { xs: '100vw', sm: 440, md: 520 },
									maxWidth: '100vw'
								},
								children: (
									<ToDoDrawer
										initialToDo={item}
										initialMode="edit"
										schema={controller.schema}
										userId={controller.userId}
										onClose={() => sysLayoutContext.closeDrawer()}
										onDelete={(doc) => {
											DeleteDialog({
												showDialog: sysLayoutContext.showDialog,
												closeDialog: sysLayoutContext.closeDialog,
												title: `Excluir dado ${doc.title}`,
												message: `Tem certeza que deseja excluir o arquivo ${doc.title}?`,
												onDeleteConfirm: () => {
													controller.onDeleteButtonClick(doc);
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
						}}
						onDelete={
							item.ownerId === controller.userId || item.assigneeId === controller.userId
								? (item) => {
										DeleteDialog({
											showDialog: sysLayoutContext.showDialog,
											closeDialog: sysLayoutContext.closeDialog,
											title: `Excluir dado ${item.title}`,
											message: `Tem certeza que deseja excluir o arquivo ${item.title}?`,
											onDeleteConfirm: () => {
												controller.onDeleteButtonClick(item);
												sysLayoutContext.showNotification({
													message: 'Excluído com sucesso!'
												});
											}
										});
								  }
								: undefined
						}
					/>
					<Divider />
				</React.Fragment>
			)}
		/>
	);

	const renderSection = (title: string, count: number, tasks: any[], sectionKey: string, hasMore: boolean, type: 'pending' | 'completed') => (
		<Box sx={{ width: '100%', mt: 2 }}>
			<Box
				onClick={() => controller.toggleSection(sectionKey)}
				sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
			>
				<IconButton size="small">
					<SysIcon name={controller.expandedSections[sectionKey] ? 'expandMore' : 'chevronRight'} />
				</IconButton>
				<Typography variant="h6" sx={{ fontWeight: 'bold' }}>
					{title} ({count})
				</Typography>
			</Box>
			<Collapse in={controller.expandedSections[sectionKey]}>
				{renderTaskList(tasks)}
				{hasMore && (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
						<Link
							onClick={() => controller.onLoadMore(type)}
							component="button"
							underline="always"
							sx={{
								fontWeight: 'bold',
								textTransform: 'none',
								color: 'text.primary',
								fontSize: '16px',
								cursor: 'pointer',
								backgroundColor: 'transparent',
								border: 'none',
								padding: 0
							}}
						>
							Ver mais
						</Link>
					</Box>
				)}
			</Collapse>
		</Box>
	);

	return (
		<Container>
			<SysTabs
				abas={abas}
				value={controller.currentTab}
				handleChange={controller.onChangeTab}
				textColor='neutral'
				indicatorColor='neutral'
				sxMap={{
					container: {
						width: '100%'
					},
					tab: {
						marginRight: '20px'
					}
				}}
			/>
			<SearchContainer>
				<SysTextField
					name="search"
					placeholder="Pesquisar por nome ou descrição"
					value={controller.searchText}
					onChange={controller.onChangeTextField}
					startAdornment={<SysIcon name={'search'} color='secondary' />}
				/>
			</SearchContainer>
			{controller.loading ? (
				<LoadingContainer>
					<CircularProgress />
					<Typography variant="body1">Aguarde, carregando informações...</Typography>
				</LoadingContainer>
			) : (
				<Box sx={{ width: '100%' }}>
					{renderSection('Não Concluídas', controller.totalPending, pendingTasks, 'Não Concluídas', controller.hasMorePending, 'pending')}
					<Box sx={{ my: 5 }} />
					{renderSection('Concluídas', controller.totalCompleted, completedTasks, 'Concluídas', controller.hasMoreCompleted, 'completed')}
				</Box>
			)}

			<SysFab
				variant="extended"
				text="Adicionar tarefa"
				startIcon={<SysIcon name={'add'} />}
				fixed={true}
				location="bottom-center"
        sx={{ color: 'black', backgroundColor: (theme) => theme.palette.grey[400], '&:hover': { backgroundColor: (theme) => theme.palette.grey[500] } }}
				onClick={controller.onAddButtonClick}
			/>
			<ToDoAddModalController
				open={controller.showAddModal}
				onClose={controller.handleCloseAddModal}
				onSave={controller.handleSaveToDo}
				userOptions={controller.userOptions}
			/>
		</Container>
	);
};

export default ToDoListView;

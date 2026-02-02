import { useTracker } from 'meteor/react-meteor-data';
import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { ISchema } from '../../../../typings/ISchema';
import { toDoApi } from '../../api/toDoApi';
import { EnumToDoStatus } from '../../api/toDoEnum';
import { IToDo } from '../../api/toDoSch';
import ToDoListView from './toDoListView';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import { userprofileApi } from '/imports/modules/userprofile/api/userProfileApi';

interface IInitialConfig {
	sortProperties: { field: string; sortAscending: boolean };
	filter: {
		searchText?: string;
		status?: any;
	};
	searchBy: string | null;
	viewComplexTable: boolean;
	limitPending: number;
	limitCompleted: number;
}

interface ITodoListControllerContext {
	onAddButtonClick: () => void;
	onDeleteButtonClick: (row: any) => void;
	todoList: IToDo[];
	schema: ISchema<any>;
	loading: boolean;
	onChangeTextField: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onChangeCategory: (event: React.ChangeEvent<HTMLInputElement>) => void;
	expandedSections: { [key: string]: boolean };
	toggleSection: (section: string) => void;
	changeTaskStatus: (task: IToDo, status: EnumToDoStatus) => void;
	currentTab: string;
	onChangeTab: (event: React.SyntheticEvent, newValue: string) => void;
	myTasks: IToDo[];
	teamTasks: IToDo[];
	pendingTasks: IToDo[];
	completedTasks: IToDo[];
	showAddModal: boolean;
	handleCloseAddModal: () => void;
	handleSaveToDo: (data: { title: string; description: string; type: 'personal' | 'shared'; assigneeId?: string }) => void;
	userId?: string;
	onLoadMore: (type: 'pending' | 'completed') => void;
	hasMorePending: boolean;
	hasMoreCompleted: boolean;
	searchText: string;
	totalPending: number;
	totalCompleted: number;
	userOptions: { value: string; label: string }[];
}

export const TodoListControllerContext = React.createContext<ITodoListControllerContext>(
	{} as ITodoListControllerContext
);

const initialConfig: IInitialConfig = {
	sortProperties: { field: 'createdat', sortAscending: true },
	filter: {},
	searchBy: null,
	viewComplexTable: false,
	limitPending: 4,
	limitCompleted: 4
};

const ToDoListController = () => {
	const { user } = useContext<IAuthContext>(AuthContext);
	const { showNotification } = useContext<IAppLayoutContext>(AppLayoutContext);
	const currentUserId = user?._id;
	const [config, setConfig] = React.useState<IInitialConfig>(initialConfig);
	const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
		'Não Concluídas': true,
		'Concluídas': true
	});
	const [currentTab, setCurrentTab] = React.useState('1');
	const [showAddModal, setShowAddModal] = React.useState(false);
	const [searchText, setSearchText] = React.useState('');

	const onChangeTab = useCallback((event: React.SyntheticEvent, newValue: string) => {
		setCurrentTab(newValue);
	}, []);

	const toggleSection = useCallback((section: string) => {
		setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
	}, []);

	const { title, description, status, ownerId, date, type, assigneeId } = toDoApi.getSchema();

	const { userOptions } = useTracker(() => {
		const subHandle = userprofileApi.subscribe('userProfileList', {});
		const users = subHandle.ready() ? userprofileApi.find({}).fetch() : [];
		return {
			userOptions: users.map(u => ({ value: (u._id || ''), label: u.username })),
			usersReady: subHandle.ready()
		};
	}, []);

	const toDoSchReduced = useMemo(() => ({
		title,
		ownerId: { ...ownerId, optional: true },
		description: { ...description, optional: true },
		status: { ...status, optional: true },
		date: { ...date, optional: true },
		type: { ...type, optional: true },
		assigneeId: {
			...assigneeId,
			options: () => userOptions,
			visibilityFunction: (doc: any) => doc.type === 'shared',
			optional: true,
			validationFunction: (value: any, doc: any) => {
				if (doc?.type === 'shared' && !value) {
					return 'O responsável é obrigatório para tarefas compartilhadas';
				}
				return undefined;
			}
		},
		createdat: { type: Date, label: 'Criado em', optional: true }
	}), [userOptions]);

	const { sortProperties, filter } = config;
	const sort = {
		[sortProperties.field]: sortProperties.sortAscending ? 1 : -1
	};

	const {
		pendingTasks = [],
		completedTasks = [],
		loading = false,
		hasMorePending = false,
		hasMoreCompleted = false,
		totalPending = 0,
		totalCompleted = 0
	} = useTracker(() => {
		const shared = currentTab === '2';
		const publicationFilterPending = {
			searchText: filter.searchText,
			shared,
			sort,
			limit: config.limitPending + 1
		};
		const publicationFilterCompleted = {
			searchText: filter.searchText,
			shared,
			sort,
			limit: config.limitCompleted + 1
		};

		const subPending = toDoApi.subscribe('toDoListPending', publicationFilterPending);
		const subCompleted = toDoApi.subscribe('toDoListCompleted', publicationFilterCompleted);

		const ready = subPending?.ready() && subCompleted?.ready();

		const clientTabFilter = shared
			? { type: 'shared', assigneeId: { $ne: currentUserId } }
			: { $or: [{ assigneeId: currentUserId }, { type: 'personal' }] };

		const clientSearchFilter = filter.searchText
			? {
					$or: [
						{ title: { $regex: filter.searchText, $options: 'i' } },
						{ description: { $regex: filter.searchText, $options: 'i' } }
					]
			  }
			: {};

		const clientFilterPending = { ...clientTabFilter, ...clientSearchFilter, status: EnumToDoStatus.NOT_CONCLUDED };
		const clientFilterCompleted = { ...clientTabFilter, ...clientSearchFilter, status: EnumToDoStatus.CONCLUDED };

		const listPending = ready ? toDoApi.find(clientFilterPending, { sort, limit: config.limitPending + 1 }).fetch() : [];
		const listCompleted = ready ? toDoApi.find(clientFilterCompleted, { sort, limit: config.limitCompleted + 1 }).fetch() : [];

		return {
			pendingTasks: listPending.slice(0, config.limitPending),
			completedTasks: listCompleted.slice(0, config.limitCompleted),
			hasMorePending: listPending.length > config.limitPending,
			hasMoreCompleted: listCompleted.length > config.limitCompleted,
			loading: !ready,
			totalPending: subPending?.total || 0,
			totalCompleted: subCompleted?.total || 0
		};
	}, [config, currentTab, currentUserId]);

	const onLoadMore = useCallback((type: 'pending' | 'completed') => {
		setConfig(prev => ({
			...prev,
			[type === 'pending' ? 'limitPending' : 'limitCompleted']: prev[type === 'pending' ? 'limitPending' : 'limitCompleted'] + 4
		}));
	}, []);


	const changeTaskStatus = useCallback((task: IToDo, newStatus: EnumToDoStatus) => {
		try {
			const updateData = {
				...task,
				status: newStatus,
				type: task.type || 'personal',
				assigneeId: (task.type === 'personal' || !task.type) ? (task.assigneeId || currentUserId) : task.assigneeId
			};

			toDoApi.update(updateData, (e: any) => {
				if (e) {
					showNotification({
						type: 'error',
						title: 'Atenção',
						message: `Erro ao atualizar a tarefa: ${e.reason}`
					});
				} else {
					showNotification({
						type: 'success',
						title: 'Concluído',
						message: `Tarefa ${newStatus === EnumToDoStatus.CONCLUDED ? 'concluída' : 'reaberta'} com sucesso!`
					});
				}
			});
		} catch (e) {
			console.error('Error updating task status:', e);
			showNotification({
				type: 'error',
				title: 'Atenção',
				message: `Erro ao atualizar a tarefa`
			});
		}
	}, [currentUserId, showNotification]);

	const onAddButtonClick = useCallback(() => {
		setShowAddModal(true);
	}, []);

	const handleCloseAddModal = useCallback(() => {
		setShowAddModal(false);
	}, []);

	const handleSaveToDo = useCallback((data: { title: string; description: string; type: 'personal' | 'shared'; assigneeId?: string }) => {
		const newDoc = {
			...data,
			type: data.type || 'personal',
			assigneeId: data.type === 'personal' ? currentUserId : (data.assigneeId || currentUserId),
			status: EnumToDoStatus.NOT_CONCLUDED,
			ownerId: currentUserId || 'unknown',
			date: new Date(),
		};
		toDoApi.insert(newDoc, (e: any, r: string) => {
			if (e) {
				console.error('Error inserting todo', e);
				showNotification({
					type: 'error',
					title: 'Atenção',
					message: `Erro ao criar a tarefa: ${e.reason}`
				});
			} else {
				setShowAddModal(false);
				showNotification({
					type: 'success',
					title: 'Concluído',
					message: 'Tarefa criada com sucesso!'
				});
			}
		});
	}, [currentUserId]);

	const onDeleteButtonClick = useCallback((row: any) => {
		toDoApi.remove(row, (e: any) => {
			if (e) {
				showNotification({
					type: 'error',
					title: 'Atenção',
					message: `Erro ao deletar a tarefa: ${e.reason}`
				});
			} else {
				showNotification({
					type: 'success',
					title: 'Concluído',
					message: 'Tarefa deletada com sucesso!'
				});
			}
		});
	}, []);


	const onChangeTextField = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value);
	}, []);

	useEffect(() => {
		const delayedSearch = setTimeout(() => {
			setConfig((prev) => ({
				...prev,
				filter: {
					...prev.filter,
					searchText: searchText.trim() || undefined
				}
			}));
		}, 500);

		return () => clearTimeout(delayedSearch);
	}, [searchText]);

	const onSelectedCategory = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		if (!value) {
			setConfig((prev) => ({
				...prev,
				filter: {
					...prev.filter,
					status: { $ne: null }
				}
			}));
			return;
		}
		setConfig((prev) => ({ ...prev, filter: { ...prev.filter, status: value } }));
	}, []);

	const providerValues: ITodoListControllerContext = useMemo(
		() => ({
			onAddButtonClick,
			onDeleteButtonClick,
			todoList: [...pendingTasks, ...completedTasks],
			schema: toDoSchReduced,
			loading,
			onChangeTextField,
			onChangeCategory: onSelectedCategory,
			expandedSections,
			toggleSection,
			changeTaskStatus,
			currentTab,
			onChangeTab,
			myTasks: currentTab === '1' ? [...pendingTasks, ...completedTasks] : [],
			teamTasks: currentTab === '2' ? [...pendingTasks, ...completedTasks] : [],
			pendingTasks,
			completedTasks,
			showAddModal,
			handleCloseAddModal,
			handleSaveToDo,
			userId: currentUserId,
			onLoadMore,
			hasMorePending,
			hasMoreCompleted,
			searchText,
			totalPending,
			totalCompleted,
			userOptions
		}),
		[
			onAddButtonClick,
			onDeleteButtonClick,
			pendingTasks,
			completedTasks,
			toDoSchReduced,
			loading,
			onChangeTextField,
			onSelectedCategory,
			expandedSections,
			toggleSection,
			changeTaskStatus,
			currentTab,
			onChangeTab,
			showAddModal,
			handleCloseAddModal,
			handleSaveToDo,
			currentUserId,
			onLoadMore,
			hasMorePending,
			hasMoreCompleted,
			searchText,
			totalPending,
			totalCompleted,
			userOptions
		]
	);

	return (
		<TodoListControllerContext.Provider value={providerValues}>
			<ToDoListView />
		</TodoListControllerContext.Provider>
	);
};

export default ToDoListController;

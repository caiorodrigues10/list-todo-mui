import React from 'react';
import { IDefaultContainerProps } from '../../typings/BoilerplateDefaultTypings';
import { useParams } from 'react-router-dom';
import ToDoListController from './pages/toDoList/toDoListController';
import ToDoDetailController from '/imports/modules/toDos/pages/toDoDetail/toDoDetailController';
import ToDoDashboardControllerProvider from './pages/toDoDashboard/toDoDashboardController';
import ToDoDashboardView from './pages/toDoDashboard/toDoDashboardView';

export interface ITodoModuleContext {
	state?: string;
	id?: string;
}

export const ToDoModuleContext = React.createContext<ITodoModuleContext>({});

export default (props: IDefaultContainerProps) => {
	let { screenState, todoId } = useParams();
	const state = screenState ?? props.screenState;
	const id = todoId ?? props.id;

	const validState = ['view', 'edit', 'create'];

	const renderPage = () => {
		if (state === 'dashboard') {
			return (
				<ToDoDashboardControllerProvider>
					<ToDoDashboardView />
				</ToDoDashboardControllerProvider>
			);
		}
		if (!state || !validState.includes(state)) return <ToDoListController />;
		return <ToDoDetailController />;
	};

	const providerValue = {
		state,
		id
	};
	return <ToDoModuleContext.Provider value={providerValue}>{renderPage()}</ToDoModuleContext.Provider>;
};

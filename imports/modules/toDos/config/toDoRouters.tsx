import { IRoute } from '../../modulesTypings';
import ToDoDashboardController from '../pages/toDoDashboard/toDoDashboardController';
import { Resources } from './resources';
import ToDoListController from '../pages/toDoList/toDoListController';

export const toDoRouterList: (IRoute | null)[] = [
	{
		path: '/todo',
		component: ToDoListController,
		isProtected: true,
		resources: [Resources.TODO_VIEW]
	},
	{
		path: '/',
		exact: true,
		component: ToDoDashboardController,
		isProtected: true,
		resources: [Resources.TODO_DASHBOARD]
	}
];

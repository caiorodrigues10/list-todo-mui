import { Resources } from './resources';
import { IRoute } from '../../modulesTypings';
import todoContainer from '../toDoContainer';

export const toDoRouterList: (IRoute | null)[] = [
	{
		path: '/todo',
		component: todoContainer,
		isProtected: true,
		resources: [Resources.TODO_VIEW]
	}
];

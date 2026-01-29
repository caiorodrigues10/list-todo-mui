import { IModuleHub } from '../../modulesTypings';
import { toDoMenuItemList } from './toDoAppMenu';
import { toDoRouterList } from './toDoRouters';

const ToDo: IModuleHub = {
	pagesRouterList: toDoRouterList,
	pagesMenuItemList: toDoMenuItemList
};

export default ToDo;

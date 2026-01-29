import { ProductBase } from '../../../api/productBase';
import { toDoSch, IToDo } from './toDoSch';

class ToDoApi extends ProductBase<IToDo> {
	constructor() {
		super('toDo', toDoSch, {
			enableCallMethodObserver: true,
			enableSubscribeObserver: true
		});
	}
}

export const toDoApi = new ToDoApi();

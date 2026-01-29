import React, { createContext, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToDoModuleContext } from '../../toDoContainer';
import { useTracker } from 'meteor/react-meteor-data';
import { toDoApi } from '../../api/toDoApi';
import { IToDo } from '../../api/toDoSch';
import { ISchema } from '../../../../typings/ISchema';
import { IMeteorError } from '../../../../typings/BoilerplateDefaultTypings';
import AppLayoutContext, { IAppLayoutContext } from '../../../../app/appLayoutProvider/appLayoutContext';
import ToDoDetailView from '/imports/modules/toDos/pages/toDoDetail/toDoDetailView';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';

interface IToDoDetailControllerContext {
	closePage: () => void;
	document: IToDo;
	loading: boolean;
	schema: ISchema<IToDo>;
	onSubmit: (doc: IToDo) => void;
	changeToEdit: (id: string) => void;
}

export const ToDoDetailControllerContext = createContext<IToDoDetailControllerContext>(
	{} as IToDoDetailControllerContext
);

const ToDoDetailController = () => {
	const navigate = useNavigate();
	const { id, state } = useContext(ToDoModuleContext);
	const { showNotification } = useContext<IAppLayoutContext>(AppLayoutContext);
	const { user } = useContext<IAuthContext>(AuthContext);
	const currentUserId = user?._id;

	const { document, loading } = useTracker(() => {
		const subHandle = !!id ? toDoApi.subscribe('toDoDetail', { _id: id }) : null;
		const document = id && subHandle?.ready() ? toDoApi.findOne({ _id: id }) : {};
		return {
			document: (document as IToDo) ?? ({ _id: id } as IToDo),
			loading: !!subHandle && !subHandle?.ready()
		};
	}, [id]);

	const closePage = useCallback(() => {
		navigate(-1);
	}, []);
	const changeToEdit = useCallback((id: string) => {
		navigate(`/todo/edit/${id}`);
	}, [navigate]);

	const onSubmit = useCallback((doc: IToDo) => {
		const selectedAction = state === 'create' ? 'insert' : 'update';
		const docToSave = { ...doc, ownerId: doc.ownerId || currentUserId || '' };
		toDoApi[selectedAction](docToSave, (e: IMeteorError) => {
			if (!e) {
				closePage();
				showNotification({
					type: 'success',
					title: 'Operação realizada!',
					message: `A tarefa foi ${selectedAction === 'update' ? 'atualizada' : 'cadastrada'} com sucesso!`
				});
			} else {
				showNotification({
					type: 'error',
					title: 'Operação não realizada!',
					message: `Erro ao realizar a operação: ${e.reason}`
				});
			}
		});
	}, [state, currentUserId, showNotification, closePage]);

	return (
		<ToDoDetailControllerContext.Provider
			value={{
				closePage,
				document: { ...document, _id: id, ownerId: document.ownerId || currentUserId || '' },
				loading,
				schema: toDoApi.getSchema(),
				onSubmit,
				changeToEdit
			}}>
			{<ToDoDetailView />}
		</ToDoDetailControllerContext.Provider>
	);
};

export default ToDoDetailController;

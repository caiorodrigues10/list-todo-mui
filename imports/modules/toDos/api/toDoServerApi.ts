import { Meteor } from 'meteor/meteor';
import { ProductServerBase } from '../../../api/productServerBase';
import { IContext } from '../../../typings/IContext';
import { getUserServer, transformDoc } from '../../userprofile/api/userProfileServerApi';
import { Resources } from '../config/resources';
import { EnumToDoStatus } from './toDoEnum';
import { IToDo, toDoSch } from './toDoSch';

class ToDoServerApi extends ProductServerBase<IToDo> {
	constructor() {
		super('toDo', toDoSch, {
			resources: Resources
		});

		this.addTransformedPublication('toDoList', async (filter = {}, options = {}) => {
			const userId = await getUserServer() ? (await getUserServer())?._id : 'unknown';
			const privacyFilter = { $or: [{ type: 'shared' }, { ownerId: userId }] };
			const finalFilter = { $and: [filter, privacyFilter] };

			return this.defaultListCollectionPublication(finalFilter, {
				...options,
				projection: {
					title: 1,
					description: 1,
					status: 1,
					date: 1,
					ownerId: 1,
					assigneeId: 1,
					teamId: 1,
					type: 1,
					createdat: 1,
					lastupdate: 1
				}
			});
		}, transformDoc);

		this.addTransformedPublication('toDoListPending', async (filter = {}, options = {}, countOptions = {}) => {
			const userId = await getUserServer() ? (await getUserServer())?._id : 'unknown';
			const privacyFilter = { $or: [{ type: 'shared' }, { ownerId: userId }] };
			const finalFilter = { $and: [filter, privacyFilter] };

			return this.defaultListCollectionPublication(finalFilter, {
				...options,
				...countOptions,
				projection: {
					title: 1,
					description: 1,
					status: 1,
					date: 1,
					ownerId: 1,
					assigneeId: 1,
					teamId: 1,
					type: 1,
					createdat: 1,
					lastupdate: 1
				}
			});
		}, transformDoc);

		this.addTransformedPublication('toDoListCompleted', async (filter = {}, options = {}, countOptions = {}) => {
			const userId = await getUserServer() ? (await getUserServer())?._id : 'unknown';
			const privacyFilter = { $or: [{ type: 'shared' }, { ownerId: userId }] };
			const finalFilter = { $and: [filter, privacyFilter] };

			return this.defaultListCollectionPublication(finalFilter, {
				...options,
				...countOptions,
				projection: {
					title: 1,
					description: 1,
					status: 1,
					date: 1,
					ownerId: 1,
					assigneeId: 1,
					teamId: 1,
					type: 1,
					createdat: 1,
					lastupdate: 1
				}
			});
		}, transformDoc);

		this.addPublication('toDoDetail', async (filter = {}) => {
			const userId = await getUserServer() ? (await getUserServer())?._id : 'unknown';
			const privacyFilter = { $or: [{ type: 'shared' }, { ownerId: userId }] };
			const finalFilter = { $and: [filter, privacyFilter] };

			return this.defaultDetailCollectionPublication(finalFilter as any, {
				projection: {
					title: 1,
					description: 1,
					status: 1,
					date: 1,
					ownerId: 1,
					assigneeId: 1,
					teamId: 1,
					type: 1,
					createdat: 1,
					lastupdate: 1
				}
			});
		});

		this.addTransformedPublication('toDoRecent', async (filter = {}, options = {}) => {
			const userId = await getUserServer() ? (await getUserServer())?._id : 'unknown';
			const privacyFilter = { $or: [{ type: 'shared' }, { ownerId: userId }] };
			const finalFilter = { $and: [filter, privacyFilter] };

			return this.defaultListCollectionPublication(finalFilter, {
				...options,
				limit: 5,
				sort: { lastupdate: -1, createdat: -1 },
				projection: {
					title: 1,
					description: 1,
					status: 1,
					date: 1,
					ownerId: 1,
					assigneeId: 1,
					teamId: 1,
					type: 1,
					createdat: 1,
					lastupdate: 1
				}
			});
		}, transformDoc);

		this.registerMethod('toDoListCompletedInPeriod', async (filter = {}, options = {}, context: any) => {
			const userId = context.user ? context.user._id : 'unknown';

			const getCountForPeriod = async (period: '7days' | '1month' | '1year', isTeam: boolean) => {
				const now = new Date();
				let startDate = new Date();
				if (period === '7days') startDate.setDate(now.getDate() - 7);
				else if (period === '1month') startDate.setMonth(now.getMonth() - 1);
				else if (period === '1year') startDate.setFullYear(now.getFullYear() - 1);

				const periodFilter = {
					status: EnumToDoStatus.CONCLUDED,
					concludedAt: { $gte: startDate }
				};

				const privacyFilter = isTeam
					? { type: 'shared' }
					: { assigneeId: userId };

				return this.getCollectionInstance().find({
					$and: [filter, periodFilter, privacyFilter]
				}).countAsync();
			};

			return {
				personal: {
					last7Days: await getCountForPeriod('7days', false),
					lastMonth: await getCountForPeriod('1month', false),
					lastYear: await getCountForPeriod('1year', false),
				},
				team: {
					last7Days: await getCountForPeriod('7days', true),
					lastMonth: await getCountForPeriod('1month', true),
					lastYear: await getCountForPeriod('1year', true),
				}
			};
		});
	}
	async beforeUpdate(docObj: IToDo, context: IContext) {
		const user = context.user;
		if (!user || !user._id) {
			throw new Meteor.Error('acesso-negado', 'Usuário não autenticado');
		}

		const oldDoc = await this.getCollectionInstance().findOneAsync({ _id: docObj._id! });

		if (!oldDoc) {
			throw new Meteor.Error('id-invalido', 'Tarefa não encontrada');
		}

		if (oldDoc.ownerId !== user._id && oldDoc.assigneeId !== user._id) {
			throw new Meteor.Error('acesso-negado', 'Você só pode alterar tarefas criadas por você ou das quais você é responsável.');
		}

		if (docObj.status === EnumToDoStatus.CONCLUDED && oldDoc.status !== EnumToDoStatus.CONCLUDED) {
			docObj.concludedAt = new Date();
		} else if (docObj.status !== EnumToDoStatus.CONCLUDED && oldDoc.status === EnumToDoStatus.CONCLUDED) {
			docObj.concludedAt = null;
		}

		return super.beforeUpdate(docObj, context);
	}

	async beforeRemove(docObj: IToDo, context: IContext) {
		const user = context.user;
		if (!user || !user._id) {
			throw new Meteor.Error('acesso-negado', 'Usuário não autenticado');
		}

		const oldDoc = await this.getCollectionInstance().findOneAsync({ _id: docObj._id! });

		if (!oldDoc) {
			throw new Meteor.Error('id-invalido', 'Tarefa não encontrada');
		}

		if (oldDoc.ownerId !== user._id && oldDoc.assigneeId !== user._id) {
			throw new Meteor.Error('acesso-negado', 'Você só pode excluir tarefas criadas por você ou das quais você é responsável.');
		}

		return super.beforeRemove(docObj, context);
	}
}

export const toDoServerApi = new ToDoServerApi();

import { Meteor } from 'meteor/meteor';
import { ProductServerBase } from '../../../api/productServerBase';
import { IContext } from '../../../typings/IContext';
import { getUserServer, userprofileServerApi } from '../../userprofile/api/userProfileServerApi';
import { Resources } from '../config/resources';
import { EnumToDoStatus } from './toDoEnum';
import { IToDo, toDoSch } from './toDoSch';

interface IToDoListCompletedInPeriod {
	period: 'week' | 'month' | 'year';
	shared: boolean;
}

interface IToDoFilter {
	searchText?: string;
	shared?: boolean;
	status?: string;
	limit?: number;
	skip?: number;
	sort?: { [key: string]: number };
}

class ToDoServerApi extends ProductServerBase<IToDo> {
	constructor() {
		super('toDo', toDoSch, { resources: Resources });

		this.addPublication(
			'toDoListPending',
			this.toDoListPending.bind(this),
		);

		this.addPublication(
			'toDoListCompleted',
			this.toDoListCompleted.bind(this),
		);

		this.addTransformedPublication('toDoRecent', this.toDoRecent.bind(this), this.transformToDo.bind(this));

		this.registerMethod('toDoListCompletedInPeriod', this.toDoListCompletedInPeriod.bind(this));

		this.getUserId.bind(this);
	}

	async toDoListPending(filter: IToDoFilter) {
		const userId = await this.getUserId();
		const privacyFilter = filter.shared
			? { type: 'shared', assigneeId: { $ne: userId } }
			: { $or: [{ ownerId: userId, type: 'personal' }, { assigneeId: userId, type: 'shared' }] };

		const searchFilter = filter.searchText
			? {
					$or: [
						{ title: { $regex: filter.searchText, $options: 'i' } },
						{ description: { $regex: filter.searchText, $options: 'i' } }
					]
			  }
			: {};

		const finalFilter = {
			$and: [{ status: { $ne: EnumToDoStatus.CONCLUDED } }, privacyFilter, searchFilter]
		};

		return this.defaultListCollectionPublication(finalFilter, {
			limit: filter.limit,
			skip: filter.skip,
			sort: filter.sort,
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
	}

	async toDoListCompleted(filter: IToDoFilter) {
		const userId = await this.getUserId();

		const privacyFilter = filter.shared
			? { type: 'shared', assigneeId: { $ne: userId } }
			: { $or: [{ ownerId: userId, type: 'personal' }, { assigneeId: userId, type: 'shared' }] };

		const searchFilter = filter.searchText
			? {
					$or: [
						{ title: { $regex: filter.searchText, $options: 'i' } },
						{ description: { $regex: filter.searchText, $options: 'i' } }
					]
			  }
			: {};

		const finalFilter = {
			$and: [{ status: EnumToDoStatus.CONCLUDED }, privacyFilter, searchFilter]
		};

		return this.defaultListCollectionPublication(finalFilter, {
			limit: filter.limit,
			skip: filter.skip,
			sort: filter.sort,
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
	}

	async toDoRecent() {
		const userId = await this.getUserId();

		const privacyFilter = { $or: [{ type: 'shared' }, { assigneeId: userId }] };

		return this.defaultListCollectionPublication(privacyFilter, {
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
	}

	async toDoListCompletedInPeriod(params: IToDoListCompletedInPeriod, context: IContext) {
		const userId = context.user?._id;

		if (!userId) {
			throw new Meteor.Error('acesso-negado', 'Usuário não autenticado');
		}

		const { period, shared } = params || {};

		if (!period) {
			throw new Meteor.Error('parametro-invalido', 'O período é obrigatório');
		}

		const now = new Date();
		let startDate = new Date();
		if (period === 'week') startDate.setDate(now.getDate() - 7);
		else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
		else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

		const periodFilter = {
			status: EnumToDoStatus.CONCLUDED,
			concludedAt: { $gte: startDate }
		};

		const privacyFilter = shared
			? { type: 'shared' }
			: { $or: [{ ownerId: userId, type: 'personal' }, { assigneeId: userId, type: 'shared' }] };

		return this.getCollectionInstance()
			.find({ $and: [periodFilter, privacyFilter] })
			.countAsync();
	}

	async transformToDo(doc: any) {
		const owner = await userprofileServerApi.getCollectionInstance().findOneAsync(
			{ _id: doc.ownerId },
			{ fields: { username: 1 } }
		);
		const assignee = doc.assigneeId
			? await userprofileServerApi.getCollectionInstance().findOneAsync(
				{ _id: doc.assigneeId },
				{ fields: { username: 1 } }
			)
			: null;

		return {
			...doc,
			ownerUsername: owner?.username || 'Desconhecido',
			assigneeUsername: assignee?.username || (doc.type === 'personal' ? owner?.username : 'Nenhum')
		};
	}

	async getUserId() {
		const { _id: userId } = (await getUserServer()) ?? { _id: 'unknown' };
		return userId;
	}
}

export const toDoServerApi = new ToDoServerApi();

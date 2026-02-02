import { IDoc } from '../../../typings/IDoc';
import { ISchema } from '../../../typings/ISchema';
import { EnumToDoStatus } from './toDoEnum';

export const toDoSch: ISchema<IToDo> = {
	title: {
		type: String,
		label: 'Nome',
		defaultValue: '',
		optional: false
	},
	description: {
		type: String,
		label: 'Descrição',
		defaultValue: '',
		optional: true
	},
	status: {
		type: String,
		label: 'Status',
		defaultValue: EnumToDoStatus.NOT_CONCLUDED,
		optional: true,
		options: () => [
			{ value: EnumToDoStatus.NOT_CONCLUDED, label: 'Não Concluída' },
			{ value: EnumToDoStatus.CONCLUDED, label: 'Concluída' }
		]
	},
	date: {
		type: Date,
		label: 'Data',
		defaultValue: null,
		optional: true
	},
	type: {
		type: String,
		label: 'Tipo',
		defaultValue: 'personal',
		optional: true,
		options: () => [
			{ value: 'personal', label: 'Pessoal' },
			{ value: 'shared', label: 'Compartilhado' }
		]
	},
	ownerId: {
		type: String,
		label: 'ID do proprietário',
		defaultValue: '',
		optional: true
	},
	assigneeId: {
		type: String,
		label: 'Responsável',
		defaultValue: '',
		optional: true,
		visibilityFunction: (doc: any) => doc.type === 'shared'
	},
	teamId: {
		type: String,
		label: 'ID do time',
		defaultValue: '',
		optional: true
	},
	concludedAt: {
		type: Date,
		label: 'Concluído em',
		defaultValue: null,
		optional: true
	}
};

export interface IToDo extends IDoc {
	title: string;
	description: string;
	status: EnumToDoStatus;
	type: 'personal' | 'shared';
	ownerId: string;
	assigneeId?: string;
	teamId?: string;
	date: Date;
	concludedAt?: Date | null;
}

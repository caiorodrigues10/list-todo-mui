import { ISchema } from '/imports/typings/ISchema';

export const verifyCodeSchema: ISchema<any> = {
	code: {
		type: String,
		label: 'Código de 4 dígitos',
		defaultValue: '',
		optional: false,
		mask: '####',
		validationFunction: (value: string) => {
			if (!value || value.length !== 4) return 'Digite o código de 4 dígitos';
			return undefined;
		}
	}
};

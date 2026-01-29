// region Imports
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { IMeteorUser, IUserProfile, userProfileSch } from './userProfileSch';
import { userprofileData } from '../../../libs/getUser';
import settings from '../../../../settings.json';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import { IContext } from '../../../typings/IContext';
import { IDoc } from '../../../typings/IDoc';
import { ProductServerBase } from '../../../api/productServerBase';
import { EnumUserRoles } from './enumUser';
import { nanoid } from 'nanoid';
import User = Meteor.User;

interface IUserProfileEstendido extends IUserProfile {
	password?: string;
}

/**
 * Return Logged User if exists.
 * @return {Object} Logged User
 */
export const getUserServer = async (connection?: { id: string } | null): Promise<IUserProfile> => {
	const user = (await Meteor.userAsync()) as (User & IMeteorUser) | null;

	try {
		const userProfile = await userprofileServerApi.getCollectionInstance().findOneAsync({
			email: user?.profile?.email
		});

		if (userProfile) {
			return userProfile;
		}
		const d = new Date();
		const simpleDate = `${d.getFullYear()}${d.getMonth() + 1}${d.getDay()}`;
		const id = connection && connection.id ? simpleDate + connection.id : nanoid();

		return {
			email: '',
			username: '',
			_id: id,
			roles: [EnumUserRoles.PUBLICO]
		};
	} catch (e) {
		const d = new Date();
		const simpleDate = `${d.getFullYear()}${d.getMonth() + 1}${d.getDay()}`;
		const id = connection && connection.id ? simpleDate + connection.id : nanoid();
		return {
			_id: id,
			roles: [EnumUserRoles.PUBLICO]
		} as IUserProfile;
	}
};

class UserProfileServerApi extends ProductServerBase<IUserProfile> {
	constructor() {
		super('userprofile', userProfileSch);
		this.addPublicationMeteorUsers();
		this.addUserProfileProfilePublication();
		this.serverInsert = this.serverInsert.bind(this);
		this.afterInsert = this.afterInsert.bind(this);
		this.beforeInsert = this.beforeInsert.bind(this);
		this.beforeUpdate = this.beforeUpdate.bind(this);
		this.beforeRemove = this.beforeRemove.bind(this);
		this._includeAuditData = this._includeAuditData.bind(this);
		this.changeUserStatus = this.changeUserStatus.bind(this);
		this.verifyCode = this.verifyCode.bind(this);
		this.resendCode = this.resendCode.bind(this);

		this.noImagePath = `${Meteor.absoluteUrl()}images/wireframe/user_no_photo.png`;

		this.afterInsert = this.afterInsert.bind(this);

		this.registerMethod('sendVerificationEmail', async (userData: IUserProfile) => {
			check(userData, Object);
			if (Meteor.isServer && userData) {
				if (userData._id) {
					Accounts.sendVerificationEmail(userData._id);
				} else if (userData.email) {
					const user = await Meteor.users.findOneAsync({
						'emails.address': userData.email
					});
					Accounts.sendVerificationEmail(user?._id ?? '');
				}
			}
		});

		this.registerMethod('sendResetPasswordEmail', async (userData: IUserProfile) => {
			check(userData, Object);
			if (Meteor.isServer && userData) {
				if (userData._id) {
					Accounts.sendResetPasswordEmail(userData._id);
				} else if (userData.email) {
					const user = await Meteor.users.findOneAsync({
						'emails.address': userData.email
					});
					if (user) {
						Accounts.sendResetPasswordEmail(user._id);
					} else {
						return false;
					}
				}
			}
			return true;
		});

		this.registerMethod('ChangeUserStatus', this.changeUserStatus);
		this.registerMethod('verifyCode', this.verifyCode);
		this.registerMethod('resendCode', this.resendCode);

		this.addPublication('userProfileList', (filter = {}) => {
			return this.defaultListCollectionPublication(filter, {
				projection: { email: 1, username: 1, status: 1, roles: 1, createdat: 1 }
			});
		});

		this.addPublication('userProfileDetail', (filter = {}) => {
			return this.defaultDetailCollectionPublication(filter, {});
		});

		this.addPublication('getListOfusers', (filter = {}) => {
			const queryOptions = {
				fields: { photo: 1, email: 1, username: 1 }
			};

			return this.collectionInstance.find(Object.assign({}, { ...filter }), queryOptions);
		});

		this.addPublication('getLoggedUserProfile', async () => {
			const user = (await Meteor.userAsync()) as IMeteorUser | null;

			if (!user) {
				return;
			}
			return this.collectionInstance.find({
				email: user?.profile?.email || null
			});
		});

		// @ts-ignore
		userprofileData.collectionInstance = this.collectionInstance;
	}

	registrarUserProfileNoMeteor = async (userprofile: IUserProfileEstendido) => {
		if (Meteor.isServer) {
			const existingUser = await Meteor.users.findOneAsync({
				$or: [{ 'emails.address': userprofile.email }, { username: userprofile.username }]
			});

			if (existingUser) {
				if (existingUser.username === userprofile.username) {
					throw new Meteor.Error(403, 'Este nome de usuário já está em uso.');
				}
				throw new Meteor.Error(403, 'Este email já está cadastrado.');
			}

			if (userprofile.password) {
				userprofile._id = await Accounts.createUserAsync({
					username: userprofile.username,
					password: userprofile.password,
					email: userprofile.email
				});
			} else {
				userprofile._id = await Accounts.createUserAsync({
					username: userprofile.username,
					email: userprofile.email
				});
			}
		}
	};

	async changeUserStatus(userId: string) {
		const user = await this.collectionInstance.findOneAsync({ _id: userId });
		let newStatus = '';
		try {
			if (user) {
				if (user.status !== 'active') {
					newStatus = 'active';
				} else {
					newStatus = 'disabled';
				}
				await this.collectionInstance.updateAsync(
					{ _id: userId },
					{
						$set: {
							status: newStatus
						}
					}
				);
				return true;
			}
		} catch (error) {
			console.error('error :>> ', error);
			throw new Meteor.Error('Acesso negado', `Vocẽ não tem permissão para alterar esses dados`);
		}
	}

	generateVerificationCode(): string {
		return Math.floor(1000 + Math.random() * 9000).toString();
	}

	async sendVerificationCodeEmail(userProfile: IUserProfile) {
		const { email, verificationCode, username } = userProfile;
		const subject = `Código de Verificação - ${settings.name}`;
		const text = `Olá ${username},\n\nSeu código de verificação é: ${verificationCode}\n\nEste código é válido por 30 minutos.`;

		try {
			await Email.sendAsync({
				to: email,
				from: settings.mail_no_reply || 'no-reply@synergia.adetech.com.br',
				subject,
				text
			});
			console.log(`Verification email sent to ${email} with code ${verificationCode}`);
		} catch (error) {
			console.error(`Error sending verification email to ${email}:`, error);
		}
	}

	async verifyCode(code: string, email: string) {
		check(code, String);
		check(email, String);

		const userProfile = await this.collectionInstance.findOneAsync({ email });
		if (!userProfile) throw new Meteor.Error('user-not-found', 'Perfil do usuário não encontrado.');

		if (!userProfile.verificationCode || !userProfile.verificationCodeExpires) {
			throw new Meteor.Error('no-code', 'Nenhum código de verificação encontrado.');
		}

		if (userProfile.verificationCodeExpires < new Date()) {
			throw new Meteor.Error('code-expired', 'O código de verificação expirou.');
		}

		if (userProfile.verificationCode !== code) {
			throw new Meteor.Error('invalid-code', 'Código de verificação inválido.');
		}

		await this.collectionInstance.updateAsync(
			{ _id: userProfile._id },
			{
				$set: { status: 'active' },
				$unset: { verificationCode: '', verificationCodeExpires: '' }
			}
		);

		// Mark email as verified in Meteor Accounts
		const meteorUser = await Meteor.users.findOneAsync({ 'emails.address': email });
		if (meteorUser && meteorUser.emails && meteorUser.emails.length > 0) {
			await Meteor.users.updateAsync(
				{ _id: meteorUser._id, 'emails.address': email },
				{ $set: { 'emails.$.verified': true } }
			);
		}

		return true;
	}

	async resendCode(email: string) {
		check(email, String);

		const userProfile = await this.collectionInstance.findOneAsync({ email });
		if (!userProfile) throw new Meteor.Error('user-not-found', 'Perfil do usuário não encontrado.');

		const code = this.generateVerificationCode();
		const expiration = new Date();
		expiration.setMinutes(expiration.getMinutes() + 30);

		await this.collectionInstance.updateAsync(
			{ _id: userProfile._id },
			{
				$set: {
					verificationCode: code,
					verificationCodeExpires: expiration
				}
			}
		);

		const updatedProfile = { ...userProfile, verificationCode: code };
		await this.sendVerificationCodeEmail(updatedProfile);

		return true;
	}

	async serverInsert(dataObj: IUserProfileEstendido & { otheraccounts: any }, context: IContext) {
		let insertId = null;
		try {
			const { password } = dataObj;
			dataObj = (await this._checkDataBySchema(dataObj)) as IUserProfileEstendido & {
				otheraccounts: any;
			};
			if (password) {
				dataObj = Object.assign({}, dataObj, { password });
			}

			this._includeAuditData(dataObj, 'insert');
			if (await this.beforeInsert(dataObj, context)) {
				await this.registrarUserProfileNoMeteor(dataObj);
				delete dataObj.password;
				if (!dataObj.roles) {
					dataObj.roles = ['Usuario'];
				} else if (dataObj.roles.indexOf('Usuario') === -1) {
					dataObj.roles.push('Usuario');
				}

				const userProfile = await this.collectionInstance.findOneAsync({
					email: dataObj.email
				});
				if (!userProfile) {
					dataObj.otheraccounts = [
						{
							_id: dataObj._id,
							service: settings.service
						}
					];

					insertId = await this.collectionInstance.insertAsync(dataObj);

					delete dataObj.otheraccounts;
					await Meteor.users.updateAsync(
						{ _id: dataObj._id || insertId },
						{
							$set: {
								profile: {
									name: dataObj.username,
									email: dataObj.email
								}
							}
						}
					);
				} else {
					insertId = userProfile._id;

					await Meteor.users.updateAsync(
						{ _id: dataObj._id },
						{
							$set: {
								profile: {
									name: dataObj.username,
									email: dataObj.email
								},
								roles: dataObj.roles
							}
						}
					);
					await this.collectionInstance.updateAsync(
						{ _id: userProfile._id },
						{
							$addToSet: {
								otheraccounts: {
									_id: dataObj._id,
									service: settings.service
								}
							}
						}
					);
				}

				dataObj.password = password;

				this.afterInsert(dataObj, context);
				if (context.rest) {
					context.rest.response.statusCode = 201;
				}
				return insertId;
			}
			return null;
		} catch (insertError) {
			throw insertError;
		}
	}

	async _includeAuditData(doc: IDoc, action: string, defaultUser: string = 'Anonymous') {
		const user: IUserProfile = await getUserServer();
		if (action === 'insert') {
			doc.createdby = user ? user._id : defaultUser;
			doc.createdat = new Date();
			doc.lastupdate = new Date();
		} else {
			doc.lastupdate = new Date();
		}
	}

	addPublicationMeteorUsers = () => {
		if (Meteor.isServer) {
			Meteor.publish('statusCadastroUserProfile', async (userId) => {
				check(userId, String);
				const user = await getUserServer();

				if (user && user.roles && user.roles.indexOf('Administrador') !== -1) {
					return Meteor.users.find(
						{},
						{
							fields: {
								_id: 1,
								username: 1,
								'emails.verified': 1,
								'emails.address': 1,
								roles: 1,
								productProfile: 1
							}
						}
					);
				}
				return Meteor.users.find({ _id: userId });
			});
			Meteor.publish('user', function () {
				if (this.userId) {
					return Meteor.users.find(
						{ _id: this.userId },
						{
							fields: {
								emails: 1,
								username: 1
							}
						}
					);
				}
				return this.ready();
			});
		}
	};

	addUserProfileProfilePublication = () => {
		if (Meteor.isServer) {
			// eslint-disable-next-line
			Meteor.publish('userprofile-profile', function () {
				if (this.userId) {
					return Meteor.users.find(
						{ _id: this.userId },
						{
							fields: {
								'emails.address': 1,
								productProfile: 1
							}
						}
					);
				}
				this.ready();
			});
		}
	};

	async beforeInsert(docObj: IUserProfile, context: IContext) {
		return super.beforeInsert(docObj, context);
	}

	async afterInsert(doc: IUserProfileEstendido, _context: IContext) {
		if (Meteor.isServer) {
			if (doc.password) {
				const code = this.generateVerificationCode();
				const expiration = new Date();
				expiration.setMinutes(expiration.getMinutes() + 30);

				await this.collectionInstance.updateAsync(
					{ _id: doc._id },
					{
						$set: {
							verificationCode: code,
							verificationCodeExpires: expiration,
							status: 'disabled'
						}
					}
				);

				const updatedDoc = { ...doc, verificationCode: code };
				await this.sendVerificationCodeEmail(updatedDoc);
			} else {
				Accounts.sendEnrollmentEmail(doc._id!);
			}
		}
	}

	async beforeUpdate(docObj: IUserProfile, context: IContext) {
		const user: IUserProfile = await getUserServer();
		if (
			!docObj._id ||
			(user && user._id !== docObj._id && user && user.roles && user.roles.indexOf('Administrador') === -1)
		) {
			throw new Meteor.Error('Acesso negado', `Vocẽ não tem permissão para alterar esses dados`);
		}

		if (user && user.roles && user.roles.indexOf('Administrador') === -1) {
			// prevent user change your self roles
			if (docObj && docObj.roles) delete docObj.roles;
		}

		return await super.beforeUpdate(docObj, context);
	}

	async beforeRemove(docObj: IUserProfile, context: IContext) {
		super.beforeRemove(docObj, context);
		Meteor.users.remove({ _id: docObj._id });
		return true;
	}
}

export const userprofileServerApi = new UserProfileServerApi();

export const transformDoc = async (doc: any) => {
	const user = await userprofileServerApi.getCollectionInstance().findOneAsync({ _id: doc.ownerId });
	return { ...doc, username: user?.username || 'Desconhecido' };
};

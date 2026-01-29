import { createStore, del, get, keys, set } from 'idb-keyval';
import { parse, stringify } from 'zipson';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'lodash';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

import settings from '../../settings.json';
import { ApiBase } from './base';
import { IDoc } from '../typings/IDoc';
import { ISchema } from '../typings/ISchema';
import { IBaseOptions } from '../typings/IBaseOptions';

interface IControlStoreData {
	removedDocs?: string[];
	updatedDocs?: any[];
	syncHistory?: any[];
	lastClientSync?: Date;
	syncnavigate?: (historyItem: any) => void;
}

interface IHistoryItem {
	date: Date;
	type: string;
	status: string;
	docId?: string;
	error?: any;
}

class PersistentMinimongoStorage {
	collectionName!: string;
	customStore!: ReturnType<typeof createStore>;
	controlStore!: ReturnType<typeof createStore>;
	collection!: Mongo.Collection<any> | null;
	inited!: ReactiveVar<boolean>;
	cachedCollection!: Mongo.Collection<any>;
	list!: string[];
	stats!: { added: number; removed: number; changed: number };
	controlStoreData?: IControlStoreData;
	lastCallInit?: Date;
	private insertOriginal?: (doc: any, callback?: Function) => string;
	private updateOriginal?: (selector: any, modifier: any, options?: any, callback?: Function) => number;
	private removeOriginal?: (selector: any, callback?: Function) => number;

	constructor(collectionName: string, collectionInstance: Mongo.Collection<any> | null) {
		const self = this;
		self.collectionName = collectionName;
		self.customStore = createStore(`${settings.name}_${collectionName}`, `${collectionName}-store`);
		self.controlStore = createStore(`${settings.name}_${collectionName}_Control`, `${collectionName}-control`);
		self.collection = collectionInstance;

		self.inited = new ReactiveVar(false);
		self.cachedCollection = new Mongo.Collection(null);

		// Store original methods
		self.insertOriginal = self.cachedCollection.insert.bind(self.cachedCollection);
		self.updateOriginal = self.cachedCollection.update.bind(self.cachedCollection);
		self.removeOriginal = self.cachedCollection.remove.bind(self.cachedCollection);

		// Override insert
		(self.cachedCollection as any).insert = (
			doc: any,
			callback: (err: any, id?: string) => void = () => {},
			updateFromSync = false
		) => {
			if (!doc || Object.keys(doc).length === 0) {
				return;
			}
			try {
				const id = self.insertOriginal!(doc);
				doc._id = id;
				if (self.list.indexOf(doc._id) === -1) {
					self.list.push(doc._id);
				}
				set(doc._id, stringify(doc), self.customStore);
				if (!updateFromSync) {
					doc.lastupdate = new Date();
					self.addUpdatedDocsIntoControlStoreData(doc);
				}

				callback(null, id);
			} catch (e) {
				callback(e, undefined);
			}
		};

		// Override update
		(self.cachedCollection as any).update = (
			selector: any,
			modifier: any,
			options: any,
			callback: (err: any, result?: any) => void = () => {},
			updateFromSync = false
		) => {
			if (!modifier || Object.keys(modifier).length === 0) {
				return;
			}
			try {
				self.updateOriginal!(selector, modifier, {
					...options,
					upsert: true
				});
				const newDoc = self.cachedCollection.findOne(selector);
				if (newDoc) {
					set(newDoc._id, stringify(newDoc), self.customStore);
					if (!updateFromSync) {
						newDoc.lastupdate = new Date();
						self.addUpdatedDocsIntoControlStoreData(newDoc);
					}
					callback(null, { ...selector, ...newDoc });
				}
			} catch (e) {
				console.log('Error:', e);
				callback(e, undefined);
			}
		};

		// Override remove
		(self.cachedCollection as any).remove = (
			doc: any,
			callback: (err: any, result?: boolean) => void = () => {},
			removeFromSync = false
		) => {
			if (!doc || Object.keys(doc).length === 0) {
				return;
			}
			try {
				self.removeOriginal!(doc._id);
				if (!doc.removeOnly) {
					self.list = self.list.filter((key: string) => key !== doc._id);
					del(doc._id, self.customStore);
					self.delUpdatedDocsIntoControlStoreData(doc);
					if (!removeFromSync) {
						self.addRemovedDocIntoControlStoreData(doc);
					}
				}
				callback(null, true);
			} catch (e) {
				callback(e, undefined);
			}
		};

		// Add clear method
		(self.cachedCollection as any).clear = () => {
			if (self.list.length > 0) {
				self.list.forEach((key: string) => {
					del(key, self.customStore).then((result) => {
						self.removeOriginal!(key);
					});
				});
			}
			self.list = [];
		};

		self.stats = { added: 0, removed: 0, changed: 0 };
		self.list = [];
		self.updateKeys();
		// Meteor.startup(function () {

		self.initObserver();

		self.initControlStore();
	}

	initObserver = () => {
		if (!Meteor.isClient) {
			return;
		}

		const self = this;

		if (self.collection) {
			self.collection.find({}).observe({
				added(doc: any) {
					// add document id to tracking list and store
					if (!_.includes(self.list, doc._id)) {
						self.list.push(doc._id);
						set(doc._id, stringify(doc), self.customStore);
					}

					(self.cachedCollection as any).update({ _id: doc._id }, { $set: doc }, { upsert: true }, undefined, true);
					++self.stats.added;
				},

				removed(doc: any, ...params: any[]) {
					// if not in list, nothing to do
					// if(!_.includes(self.list, doc._id)) {
					//     return;
					// }
					// del(doc._id,self.customStore);
					// self.list = self.list.filter(key=>key!==doc._id);
					(self.cachedCollection as any).remove({ _id: doc._id, removeOnly: true });
					++self.stats.removed;
				},

				changed(newDoc: any, oldDoc: any) {
					const doc = _.merge(oldDoc, newDoc);
					// update document in local storage
					if (_.includes(self.list, doc._id)) {
						set(doc._id, stringify(doc), self.customStore);
					} else {
						self.list.push(doc._id);
						set(doc._id, stringify(doc), self.customStore);
					}
					(self.cachedCollection as any).update({ _id: doc._id }, { $set: doc }, { upsert: true }, undefined, true);
					++self.stats.changed;
				}
			});
		}
	};

	updateDateOnJson = (object: any): any => {
		function reviver(key: string, value: any): any {
			if (`${value}`.length === 24 && !!Date.parse(value)) {
				return new Date(value);
			}
			return value;
		}

		return JSON.parse(JSON.stringify(object), reviver);
	};

	initControlStore = (callback: (err: any, result?: IControlStoreData) => void = () => {}) => {
		const self = this;
		if (self.controlStoreData) {
			callback(null, self.controlStoreData);
			return self.controlStoreData;
		}
		get('config', self.controlStore).then((resultString) => {
			const result = self.updateDateOnJson(resultString ? parse(resultString) : {}) as IControlStoreData;

			self.controlStoreData = {
				removedDocs: [],
				updatedDocs: [],
				syncHistory: [],
				lastClientSync: new Date(),
				...(result || {})
			};
			callback(null, {
				removedDocs: [],
				updatedDocs: [],
				syncHistory: [],
				lastClientSync: new Date(),
				...(result || {})
			});
		});
	};

	getControlStoreData = (): IControlStoreData =>
		this.controlStoreData || {
			removedDocs: [],
			updatedDocs: [],
			syncHistory: [],
			lastClientSync: new Date()
		};

	updateControlStoreData = (newData: Partial<IControlStoreData>): IControlStoreData => {
		const self = this;
		const newControlStoreDate = {
			...(this.controlStoreData || {}),
			...(newData || {})
		};
		set('config', stringify(newControlStoreDate), self.controlStore);
		this.controlStoreData = newControlStoreDate;
		return newControlStoreDate;
	};

	addUpdatedDocsIntoControlStoreData = (doc: any, historyItem?: IHistoryItem): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (!controlStore.updatedDocs) {
			controlStore.updatedDocs = [doc];
			if (historyItem && controlStore.syncnavigate) {
				controlStore.syncnavigate(historyItem);
			}
			self.updateControlStoreData(controlStore);
			return true;
		}
		controlStore.updatedDocs = controlStore.updatedDocs.filter((d: any) => d._id !== doc._id);
		controlStore.updatedDocs.push(doc);
		if (historyItem && controlStore.syncnavigate) {
			controlStore.syncnavigate(historyItem);
		}

		self.updateControlStoreData(controlStore);
		return true;
	};

	delUpdatedDocsIntoControlStoreData = (doc: any, historyItem?: IHistoryItem): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (!controlStore.updatedDocs) {
			return false;
		}
		controlStore.updatedDocs = controlStore.updatedDocs.filter((d: any) => d._id !== doc._id);
		if (historyItem && controlStore.syncnavigate) {
			controlStore.syncnavigate(historyItem);
		}
		self.updateControlStoreData(controlStore);
		return true;
	};

	addRemovedDocIntoControlStoreData = (doc: any, historyItem?: IHistoryItem): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (!controlStore.removedDocs) {
			controlStore.removedDocs = [doc._id];
		} else {
			controlStore.removedDocs.push(doc._id);
		}
		if (historyItem && controlStore.syncnavigate) {
			controlStore.syncnavigate(historyItem);
		}
		self.updateControlStoreData(controlStore);
		return true;
	};
	delRemovedDocIntoControlStoreData = (doc: any, historyItem?: IHistoryItem): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (!controlStore.removedDocs) {
			return false;
		}
		controlStore.removedDocs = controlStore.removedDocs.filter((d: string) => d !== doc._id);
		if (historyItem && controlStore.syncnavigate) {
			controlStore.syncnavigate(historyItem);
		}
		self.updateControlStoreData(controlStore);
		return true;
	};

	updateSyncHistory = (historyItem?: IHistoryItem): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (historyItem && controlStore.syncnavigate) {
			controlStore.syncnavigate(historyItem);
		}
		self.updateControlStoreData(controlStore);
		return true;
	};

	needSync = (): boolean => {
		const self = this;
		const controlStore = self.getControlStoreData();
		if (!controlStore) {
			return false;
		}
		return (
			(!!controlStore.removedDocs && controlStore.removedDocs.length > 0) ||
			(!!controlStore.updatedDocs && controlStore.updatedDocs.length > 0) ||
			!controlStore.lastClientSync ||
			(new Date().getTime() - controlStore.lastClientSync.getTime()) / (1000 * 3600 * 24) > 15
		); // greater than 15 days
	};

	initCachedMinimongo = (callback?: (err: any, result?: boolean) => void): ReactiveVar<boolean> => {
		const self = this;

		const seconds = self.lastCallInit ? (new Date().getTime() - self.lastCallInit.getTime()) / 1000 : 61;

		if (seconds > 60 && (!!callback || !this.inited.get())) {
			this.updateKeys((e: any, r?: boolean) => {
				if (r) {
					self.removeOriginal!({});
					self.list.forEach(async (key: string, i: number) => {
						const res = await get(key, self.customStore).then((result) => {
							const docR = parse(result);
							const doc = self.updateDateOnJson(docR);
							self.updateOriginal!({ _id: doc._id }, { $set: doc }, { upsert: true });
						});
					});
					self.inited.set(true);
					if (callback) {
						callback(null, true);
					}
				} else {
					if (callback) {
						callback(e, undefined);
					}
					console.log('Error:', self.collectionName, ':', e);
				}
			});
		}

		self.lastCallInit = new Date();
		return this.inited;
	};

	updateKeys = (
		callback: (e: any, r?: boolean) => void = (e: any) => {
			if (e) {
			}
		}
	): void => {
		const self = this;
		keys(self.customStore)
			.then((keysList) => {
				self.list = keysList.map((k) => String(k));
				callback(null, true);
			})
			.catch((err) => callback(err, undefined));
	};

	getDocs = (filter: any = {}, callback: (err: any, result?: any[]) => void = () => {}): void => {
		const self = this;
		const matchFilter = (o1: any, o2: any): boolean => {
			const matches = Object.keys(o1).map((k) => _.isEqual(o1[k], o2[k]));
			return matches.filter((o: boolean) => !!o).length === Object.keys(o1).length;
		};
		this.updateKeys((e: any, r?: boolean) => {
			const result: any[] = [];
			if (r) {
				self.list.forEach(async (key: string, i: number) => {
					const res = await get(key, self.customStore).then((result) => {
						const docR = parse(result);
						if (matchFilter(filter, docR)) {
							result.push(self.updateDateOnJson(docR));
						}
					});
				});
			}

			callback(e, result);
		});
	};

	syncRemovedDocs = (
		removeDocFunc: (doc: any, callback: (err: any, result?: any) => void) => void = () => {}
	): void => {
		const self = this;
		const controlStoreData = this.getControlStoreData();
		(controlStoreData.removedDocs || []).forEach((docId: string) => {
			removeDocFunc({ _id: docId }, (e: any, r?: any) => {
				if (!e) {
					self.delRemovedDocIntoControlStoreData(
						{ _id: docId },
						{
							date: new Date(),
							type: 'remove',
							status: 'success',
							docId
						}
					);
				} else {
					self.updateSyncHistory({
						date: new Date(),
						type: 'remove',
						status: 'error',
						error: e,
						docId
					});
				}
			});
		});
	};
	syncUpdatedDocs = (
		updateDocFunc: (doc: any, callback: (err: any, serverDoc?: any) => void) => void = () => {}
	): void => {
		const self = this;
		const controlStoreData = this.getControlStoreData();
		console.log('#syncUpdatedDocs', controlStoreData);
		(controlStoreData.updatedDocs || []).forEach((doc: any) => {
			updateDocFunc(doc, (e: any, serverDoc?: any) => {
				if (!e) {
					if (!!serverDoc && !!serverDoc.removedServer) {
						(self.cachedCollection as any).remove(serverDoc, undefined, true);
					} else {
						if (serverDoc) {
							delete serverDoc.updatedServer;
							self.delUpdatedDocsIntoControlStoreData(doc, {
								date: new Date(),
								type: 'update',
								status: 'success',
								docId: doc._id
							});
							(self.cachedCollection as any).update({ _id: serverDoc._id }, { $set: serverDoc }, {}, undefined, true);
						}
					}
				} else {
					self.updateSyncHistory({
						date: new Date(),
						type: 'update',
						status: 'error',
						error: e,
						docId: doc._id
					});
				}
			});
		});
	};

	syncFromClient = (
		removeFunction?: (doc: any, callback: (err: any, result?: any) => void) => void,
		updateFunction?: (doc: any, callback: (err: any, serverDoc?: any) => void) => void
	): void => {
		removeFunction && this.syncRemovedDocs(removeFunction);
		updateFunction && this.syncUpdatedDocs(updateFunction);
		this.updateControlStoreData({ lastClientSync: new Date() });
	};

	syncFromServer = (serverDocs: any[]): void => {
		serverDocs.forEach((doc: any) => {
			if (!doc || !doc._id) {
				return;
			}
			if (doc.removedServer) {
				(this.cachedCollection as any).remove(doc, undefined, true);
			} else {
				(this.cachedCollection as any).update({ _id: doc._id }, { $set: doc }, {}, undefined, true);
			}
		});
	};
}

export class OfflineBaseApi<Doc extends IDoc> extends ApiBase<Doc> {
	minimongoStorage: PersistentMinimongoStorage;
	persistentCollectionInstance: Mongo.Collection<any>;

	constructor(apiName: string, apiSch: ISchema<Doc>, options?: IBaseOptions) {
		super(apiName, apiSch, options);
		this.subscribe = this.subscribe.bind(this);
		this.findOne = this.findOne.bind(this);
		this.find = this.find.bind(this);
		this.callMethod = this.callMethod.bind(this);

		// Init chached collection
		this.minimongoStorage = new PersistentMinimongoStorage(apiName, this.collectionInstance);
		this.persistentCollectionInstance = this.minimongoStorage.cachedCollection;
	}

	/**
	 * Wrapper to find items on an collection.
	 * This guarantees the the action will be executed
	 * by a Meteor Mongo Collection of this framework.
	 * @param  {Object} query - Params to query a document.
	 * @param  {Object} projection - Params to define which fiedls will return.
	 */
	find(query: any, projection = {}): Mongo.Cursor<Doc> {
		if (Meteor.isClient) {
			return this.persistentCollectionInstance.find(query, projection) as Mongo.Cursor<Doc>;
		}
		return super.find(query, projection);
	}

	/**
	 * Wrapper to findOne items on an collection.
	 * This guarantees the the action will be executed
	 * by a Meteor Mongo Collection of this framework.
	 * @param  {Object} query - Params to query a document.
	 * @param  {Object} projection - Params to define which fiedls will return.
	 */
	findOne(query: any = {}, projection = {}): Partial<Doc> {
		if (Meteor.isClient) {
			const result = this.persistentCollectionInstance.findOne(query, projection);
			return (result as Partial<Doc>) || ({} as Partial<Doc>);
		}
		return super.findOne(query, projection);
	}

	/**
	 * Make a subscribe for a collection.
	 * @param  {} api='default'
	 * @param  {} ...param
	 */
	subscribe(api = 'default', ...param: any[]): any {
		const self = this;
		if (Meteor.isClient) {
			if (Meteor.status().status !== 'waiting') {
				// Sync Functions ###################################################
				if (self.minimongoStorage.needSync() && Meteor.status().connected) {
					self.minimongoStorage.syncFromClient(self.remove.bind(self), self.sync.bind(self));
				}

				// ##################################################################

				return Meteor.subscribe(`${self.collectionName}.${api}`, ...param);
			}

			return {
				ready: () => self.minimongoStorage.initCachedMinimongo().get()
			};
		}
		return null;
	}

	callOfflineMethod = (name: string, docObj: any, callback: (err: any, result?: any) => void = () => {}): void => {
		if (name === 'update') {
			const oldDoc = Meteor.status().connected
				? this.getCollectionInstance().findOne({ _id: docObj._id })
				: this.persistentCollectionInstance.findOne({ _id: docObj._id });
			(this.persistentCollectionInstance as any).update(
				{ _id: docObj._id },
				{ ...(oldDoc || {}), ...docObj },
				{},
				callback
			);
		} else {
			(this.persistentCollectionInstance as any)[name](docObj, callback);
		}
	};

	/**
	 * Wrapper to the Meteor call. This check if the user has
	 * connection with the server, in this way we can return the result from
	 * a cached collection or from the server.
	 * @param  {String} name - Meteor method name defin
	 * @param  {Object} ...params - Parameters for this meteor method.
	 */
	callMethod(name: string, ...params: any[]): void {
		const self = this;

		if (Meteor.status().connected) {
			Meteor.call(`${this.collectionName}.${name}`, ...params);
		} else if (Meteor.status().status === 'waiting') {
			if (name === 'insert' || name === 'update' || name === 'remove') {
				self.callOfflineMethod(name, params[0], params[1]);
			} else {
				console.log('Sem Conexão com o Servidor');
			}

			// window.$app.globalFunctions.openSnackBar('SEM CONEXÃO COM O SERVIDOR:Sua operçaão não será registrada. Verifique sua conexão com a internet.', 'info');
		}
	}
}

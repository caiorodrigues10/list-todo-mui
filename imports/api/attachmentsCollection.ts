import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { nanoid } from 'nanoid';

// Type declaration for FilesCollection from meteor/ostrio:files
interface IFilesCollection {
	collectionName: string;
	allowClientCode: boolean;
	storagePath?: string | null;
	onBeforeUpload?: (file: { size: number; extension: string }) => boolean | string;
	collection: {
		find: (filter: any) => any;
		insert: (doc: any) => string;
	};
	findOne: (filter: any) => any;
	allowClient: () => void;
}

// @ts-ignore - meteor/ostrio:files may not have type definitions
const FilesCollection = require('meteor/ostrio:files').FilesCollection as {
	new (options: {
		collectionName: string;
		allowClientCode: boolean;
		storagePath?: string | null;
		onBeforeUpload?: (file: { size: number; extension: string }) => boolean | string;
	}): IFilesCollection;
};

let uploadPaths: string | null = null;
if (Meteor.isServer) {
	const fs = require('fs');
	const path = require('path');

	// Use process.cwd() or a relative path instead of Meteor.absolutePath
	uploadPaths = path.join(process.cwd(), 'uploads', 'meteorUploads');

	if (!fs.existsSync(uploadPaths)) {
		fs.mkdirSync(uploadPaths, { recursive: true });
	}
}

class AttachmentsCollection {
	attachments: IFilesCollection;

	constructor() {
		/**
		 * Don't forget to change the path to the server path
		 */
		// const storagePath = path: '/home/servicedesk/DEPLOY/LINIO_SERVICEDESK_PRODUCAO/bundle/uploads'
		this.attachments = new FilesCollection({
			collectionName: 'Attachments',
			allowClientCode: false, // actions from client
			// Mudar a cada versão
			// ToDo Colocar em uma variável de ambiente
			storagePath: uploadPaths,
			onBeforeUpload(file: { size: number; extension: string }) {
				// Allow upload files under 10MB, and only in png/jpg/jpeg formats
				if (
					file.size <= 1048576 * 15 && // (15MB)
					/xlsx|xls|jpeg|png|jpg|svg|bmp|gif|doc|docx|odt|ods|txt|pdf|csv|zip|rar|gz/i.test(file.extension)
				) {
					return true;
				}
				return 'Please upload image, with size equal or less than 10MB';
			}
		});
		if (Meteor.isServer) {
			/* Allow all
			 * @see http://docs.meteor.com/#/full/allow
			 */
			this.attachments.allowClient();
		}
		this.applyPublication();
		this.serverGetFileFileByDocId('MapaCalorConfig');
	}

	applyPublication = () => {
		const self = this;
		if (Meteor.isServer) {
			Meteor.methods({
				RemoveFile: (id: string) => {
					check(id, String);
					try {
						const file = self.attachments.findOne({ _id: id });
						if (file && (file as any).remove) {
							(file as any).remove();
						}
					} catch (e) {
						// console.log('Error on Remove File',e);
						return true;
					}
				}
			});

			Meteor.publish('files-attachments', (filter: any) => {
				check(filter, Object);
				return self.attachments.collection.find({ ...filter });
			});
		}
	};

	find = (filter: any) => this.attachments.collection.find(filter);

	getAttachmentDoc = (doc: { _id: string; size: number; name: string; path: string }) => ({
		_id: doc._id,
		size: doc.size,
		type: 'application/octet-stream',
		name: doc.name,
		ext: 'csv',
		extension: 'csv',
		extensionWithDot: '.csv',
		mime: '',
		'mime-type': '',
		userId: 'B2WZtLcLjeAoadsML',
		path: doc.path,
		versions: {
			original: {
				path: doc.path,
				size: doc.size,
				type: '',
				extension: 'csv'
			}
		},
		_downloadRoute: '/cdn/storage',
		_collectionName: 'Attachments',
		isVideo: false,
		isAudio: false,
		isImage: false,
		isText: false,
		isJSON: false,
		isPDF: false,
		_storagePath: '/meteorUploads',
		public: false
	});

	serverInsert = (doc: any) => {
		this.attachments.collection.insert(doc);
	};

	serverGetFileFileByDocId = (id: string): string | null => {
		const docFile = this.find({ 'meta.docId': id }).fetch()[0];
		return docFile && docFile.path ? docFile.path : null;
	};

	serverSaveCSVFile = async (file: Buffer | string, fileName?: string): Promise<string> => {
		if (Meteor.isServer) {
			const fileId = nanoid();
			const nameFile = `${fileName ? fileName : fileId}.csv`;
			const fs = require('fs').promises;
			if (!uploadPaths) {
				throw new Error('Upload path not initialized');
			}
			await fs.writeFile(`${uploadPaths}/${nameFile}`, file);
			const fileStat = await fs.stat(`${uploadPaths}/${nameFile}`);
			const fileData = {
				_id: fileId,
				name: nameFile,
				size: fileStat.size,
				path: `${uploadPaths}/${nameFile}`
			};
			this.serverInsert(this.getAttachmentDoc(fileData));
			return `${Meteor.absoluteUrl()}cdn/storage/Attachments/${fileId}/original/${nameFile}`;
		}
		return '';
	};

	findOne = (filter: any) => this.attachments.findOne(filter);

	getCollection = () => this.attachments;
}

export const attachmentsCollection = new AttachmentsCollection();

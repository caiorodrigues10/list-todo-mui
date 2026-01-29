import './browserPolicy';
import './databaseIndexes';
import './registerApi';
import './fixtures';
import './accounts';
import FacebookOAuthInit from './oauth-facebook';
import GoogleOAuthInit from './oauth-google';
import { Meteor } from 'meteor/meteor';
// @ts-ignore
import settings from '/settings';

Meteor.startup(() => {
	if (settings.mail_url_smtp) {
		process.env.MAIL_URL = settings.mail_url_smtp;
	}
	FacebookOAuthInit();
	GoogleOAuthInit();
});

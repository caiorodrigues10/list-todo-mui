import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
import settings from '/settings';

import Handlebars from 'handlebars';

const configureMailServer = () => {
	// process.env.MAIL_URL = 'smtp://192.168.0.13:25';
	process.env.MAIL_URL = settings.mail_url_smtp;
};

export const getHTMLEmailTemplate = async (title: string = settings.name, text: string = 'Message', footer?: string) => {
	const templateSource = await Assets.getTextAsync('templateEmail.html');
	const template = Handlebars.compile(templateSource);
	return template({
		title,
		text,
		footer
	});
};

async function sendEmail(to: string, from: string, subject: string, msg: string, attachments: any[] = [], callback?: (err?: any, res?: any) => void) {
	// Make sure that all arguments are strings.
	check([to, from, subject, msg], [String]);
	// Let other method calls from the same client start running, without
	// waiting for the email sending to complete.
	// this.unblock();
	try {
		const htmlTemplate = await getHTMLEmailTemplate(subject, msg);
		await Email.sendAsync({
			to,
			from,
			subject,
			replyTo: settings.mail_no_reply,
			html: htmlTemplate,
			attachments
		});
		if (callback) callback(null, 'EMAIL OK');
		return 'EMAIL OK';
	} catch (e) {
		if (callback) callback(e);
		throw e;
	}
}

Meteor.methods({
	sendEmail
});

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
	configureMailServer();
});

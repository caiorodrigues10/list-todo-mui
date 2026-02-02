import { IRoute } from '../../modules/modulesTypings';
import { EmailVerify } from '../../sysPages/pages/emailVerify/emailVerify';
import { NoPermission } from '../../sysPages/pages/noPermission/noPermission';
import { PasswordRecovery } from '../../sysPages/pages/recoveryPassword/passwordRecovery';
import { ResetPassword } from '../../sysPages/pages/resetPassword/resetPassword';
import SignUpPage from '../../sysPages/pages/signUp/signUp';
import SysFormPlayground from '../../sysPages/pages/sysFormPlayground/sysFormPlayground';
import SignInPage from '../pages/signIn/signIn';
import { SysFormTestPageResources } from './resources';

export const pagesRouterList: (IRoute | null)[] = [
	{
		path: '/sysFormTests',
		component: SysFormPlayground,
		isProtected: true,
		resources: [SysFormTestPageResources.SYSFORMTESTS_VIEW]
	},
	{
		path: '/signin',
		component: SignInPage,
		isProtected: false,
		templateVariant: 'None'
	},
	{
		path: '/signup',
		component: SignUpPage,
		isProtected: false,
		templateVariant: 'None'
	},
	{
		path: '/no-permission',
		component: NoPermission,
		isProtected: true
	},
	{
		path: '/password-recovery',
		component: PasswordRecovery,
		templateVariant: 'None'
	},
	{
		path: '/reset-password/:token',
		component: ResetPassword,
		templateVariant: 'None'
	},
	{
		path: '/enroll-account/:token',
		component: ResetPassword,
		templateVariant: 'None'
	},
	{
		path: '/verify-email/:token',
		component: EmailVerify,
		templateVariant: 'None'
	},
];

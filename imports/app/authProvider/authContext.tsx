import React, { createContext } from 'react';
import { IUserProfile } from '/imports/modules/userprofile/api/userProfileSch';
import { IMeteorError } from '/imports/typings/IMeteorError';

interface IAuthContext {
    isLoggedIn: boolean;
    user?: IUserProfile;
    userLoading: boolean;
    logout: (callback: () => void) => void;
    signIn: (email: string, password: string, callback: (err?: IMeteorError) => void) => void;
    signUp: (userData: { username: string; email: string; password?: string }, callback: (err?: IMeteorError) => void) => void;
    verifyCode: (code: string, email: string, callBack: (error: IMeteorError) => void) => void
    resendCode: (email: string, callBack: (error: IMeteorError) => void) => void
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export default AuthContext;
export type { IAuthContext };
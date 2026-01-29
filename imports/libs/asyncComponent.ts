import React from 'react';
import Loadable from 'react-loadable';
import { SysLoading } from '/imports/ui/components/sysLoading/sysLoading';

const asyncComponent = (importingComponent, LoadingComponent = () => React.createElement(SysLoading)) =>
	Loadable({
		loader: typeof importingComponent === 'function' ? importingComponent : () => importingComponent,
		loading: LoadingComponent
	});

export default asyncComponent;

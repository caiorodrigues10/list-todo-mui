import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import SysIcon from '../sysIcon/sysIcon';
import Styles from './sysCircleCheckStyles';

interface ISysCircleCheckProps extends BoxProps {
	checked?: boolean;
}

const SysCircleCheck: React.FC<ISysCircleCheckProps> = ({ checked = false, ...props }) => {
	return (
		<Styles.Container checked={checked} {...props}>
			{checked && <SysIcon name="check" sx={{ fontSize: '16px', color: '#000' }} />}
		</Styles.Container>
	);
};

export default SysCircleCheck;

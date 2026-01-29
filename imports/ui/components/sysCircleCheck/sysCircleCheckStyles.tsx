import { ElementType } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { sysSizing } from '../../materialui/styles';

interface IContainerProps extends BoxProps {
	checked?: boolean;
}

interface ISysCircleCheckStyles {
	Container: ElementType<IContainerProps>;
}

const SysCircleCheckStyles: ISysCircleCheckStyles = {
	Container: styled(Box, {
		shouldForwardProp: (prop) => prop !== 'checked'
	})<IContainerProps>(({ theme, checked }) => ({
		width: sysSizing.base.baseFixed125,
		height: sysSizing.base.baseFixed125,
		minWidth: sysSizing.base.baseFixed125,
		minHeight: sysSizing.base.baseFixed125,
		borderRadius: '50%',
		border: `2px solid ${theme.palette.text.primary}`,
		backgroundColor: checked
			? (theme.palette.sysBackground?.default || '#000000')
			: 'transparent',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		'&:hover': {
			backgroundColor: theme.palette.action.hover
		}
	}))
};

export default SysCircleCheckStyles;

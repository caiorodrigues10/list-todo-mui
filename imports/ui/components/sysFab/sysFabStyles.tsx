import { Theme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Fab, { FabProps } from '@mui/material/Fab';
import React from 'react';
import { sysSizing } from '../../materialui/styles';

interface ISysFabProps extends FabProps {
	fixed?: boolean;
	location?: 'bottom-right' | 'bottom-center' | 'bottom-left';
	theme?: Theme;
}

export const SysFabStyled = styled(({ fixed, location, ...otherProps }: ISysFabProps) => <Fab {...otherProps} />)<ISysFabProps>(({
	theme,
	fixed,
	location = 'bottom-right',
}) => {
	const defaultStyle = {
		borderRadius: sysSizing.radiusInfinite,
		backgroundColor: theme?.palette.sysAction?.primary,
		color: theme?.palette.sysAction?.primaryContrastText,
		'&:hover': {
			backgroundColor: theme?.palette.sysAction?.primaryHover
		},
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: sysSizing.componentsButtonGap
	};

	const fixedStyle = {
		position: 'absolute',
		bottom: '56px',
		...(location === 'bottom-right' && {
			right: '72px',
			[theme.breakpoints.down('md')]: {
				right: '40px',
				bottom: '32px'
			},
			[theme.breakpoints.down('sm')]: {
				right: '24px'
			}
		}),
		...(location === 'bottom-center' && {
			left: '50%',
			transform: 'translateX(-50%)',
			right: 'auto',
			[theme.breakpoints.down('md')]: {
				bottom: '32px'
			}
		}),
		...(location === 'bottom-left' && {
			left: '72px',
			[theme.breakpoints.down('md')]: {
				left: '40px',
				bottom: '32px'
			},
			[theme.breakpoints.down('sm')]: {
				left: '24px'
			}
		})
	};

	if (fixed)
		return {
			...defaultStyle,
			...fixedStyle
		};
	return defaultStyle;
});

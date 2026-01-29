import React from 'react';
import Typography from '@mui/material/Typography';
import { FabProps } from '@mui/material/Fab';
import { SysFabStyled } from './sysFabStyles';

interface ISysFabProps extends FabProps {
	fixed?: boolean;
	location?: 'bottom-right' | 'bottom-center' | 'bottom-left';
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;
	text?: string;
	children?: React.ReactNode;
}

export const SysFab: React.FC<ISysFabProps> = ({
	fixed = false,
	location = 'bottom-right',
	children,
	startIcon,
	endIcon,
	...props
}: ISysFabProps) => {
	return (
		<SysFabStyled {...props} fixed={fixed} location={location}>
			{children ?? (
				<>
					{startIcon}
					{!!props.text && (
						<Typography variant="button" sx={{ textTransform: 'none' }}>
							{props.text}
						</Typography>
					)}
					{endIcon}
				</>
			)}
		</SysFabStyled>
	);
};

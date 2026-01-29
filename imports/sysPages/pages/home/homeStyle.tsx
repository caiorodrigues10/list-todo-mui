import { ElementType } from 'react';
import { styled } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';
import {SysSectionPaddingXY} from "/imports/ui/layoutComponents/sysLayoutComponents";

interface IHomeStyles {
	Container: ElementType<BoxProps>;
	Header: ElementType<BoxProps>;
	ContentIcons: ElementType<BoxProps>;
}

const HomeStyles: IHomeStyles = {
	Container: styled(SysSectionPaddingXY)(() => ({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		gap: '2.5rem',
		width: '100%',
	})),
	Header: styled(Box)(({}) => ({
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		gap: '1rem',
		marginBottom: '1rem'
	})),
  ContentIcons: styled(Box)(({}) => ({
		display: 'flex',
		alignItems: 'center',
	})),
};

export default HomeStyles;

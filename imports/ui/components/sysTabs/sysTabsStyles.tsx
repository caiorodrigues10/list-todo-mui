import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

interface IContainer {
	orientation?: 'horizontal' | 'vertical';
}

interface ITabs {
	sysTextColor?: 'secondary' | 'inherit' | 'primary' | 'neutral' | undefined;
	sysIndicatorColor?: 'secondary' | 'primary' | 'neutral' | undefined;
}

const SysTabsStyles = {
	Container: styled(Box)<IContainer>(({ theme, orientation }) => ({
		borderRight: orientation === 'vertical' ? '1px solid' : 'none',
		borderBottom: orientation === 'horizontal' ? '1px solid' : 'none',
		borderColor: theme.palette.divider,
		width: 'auto',
		maxWidth: '100%'
	})),

	Tabs: styled(Tabs)<ITabs>(({ theme, sysTextColor, sysIndicatorColor }) => ({
		...(sysTextColor === 'neutral' && {
			'& .MuiTab-root': {
				color: theme.palette.sysAction?.neutralIcon,
				'&.Mui-selected': {
					color: theme.palette.sysAction?.neutralIcon
				},
				'&:hover': {
					background: theme.palette.sysBackground?.bg2,
					color: theme.palette.sysAction?.neutralIcon
				}
			}
		}),
		...(sysIndicatorColor === 'neutral' && {
			'& .MuiTabs-indicator': {
				backgroundColor: theme.palette.sysAction?.neutralIcon
			}
		})
	})),

	Tab: styled(Tab)(({ theme }) => ({}))
};

export default SysTabsStyles;

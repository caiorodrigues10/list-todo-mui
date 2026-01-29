import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import SysMenu, { ISysMenuRef, ISysMenuItem } from './sysMenuProvider';

export interface ISysOptionMenuItem {
	key: string;
	label: string;
	startIcon?: React.ReactNode;
	onClick: (e: React.MouseEvent) => void;
}

interface ISysOptionMenuProps {
	children: React.ReactNode;
	options: ISysOptionMenuItem[];
}

const MenuContainer = styled(Box)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	minWidth: 'auto',
	padding: theme.spacing(0.5),
}));

export const SysOptionMenu: React.FC<ISysOptionMenuProps> = ({ children, options }) => {
	const menuRef = useRef<ISysMenuRef>(null);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		event.stopPropagation();
		menuRef.current?.openMenu(event);
	};

	const mappedOptions: ISysMenuItem[] = options.map(item => ({
		key: item.key,
		otherProps: {
			label: item.label,
			startIcon: item.startIcon,
			onClick: (e: React.MouseEvent) => {
				e?.stopPropagation?.();
				item.onClick(e);
				menuRef.current?.closeMenu();
			}
		}
	}));

	return (
		<>
			<Box onClick={handleOpen} sx={{ display: 'inline-block', cursor: 'pointer' }}>
				{children}
			</Box>
			<SysMenu
				ref={menuRef}
				options={mappedOptions}
				contentContainer={MenuContainer}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			/>
		</>
	);
};

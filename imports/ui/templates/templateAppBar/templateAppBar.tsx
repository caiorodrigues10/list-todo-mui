import React from 'react';
import {ISysTemplateProps} from '../getTemplate';
import {BoxProps, Typography} from '@mui/material';
import TemplateAppBarStyles from './templateAppBarStyles';
import SysAppBar from '../components/sysAppBar/sysAppBarController';

export interface ITemplateAppBar extends ISysTemplateProps {
  containerProps?: BoxProps;
  logo?: React.ReactNode;
}

export const TemplateAppBar: React.FC<ITemplateAppBar> = ({
  children,
  menuOptions,
  logo,
  containerProps
}) => {
  return (
    <TemplateAppBarStyles.container>
      <SysAppBar logo={logo ?? <ToDoLogo />} menuOptions={menuOptions} />
      <TemplateAppBarStyles.contentWrapper>
        <TemplateAppBarStyles.contentContainer {...containerProps}>
          {children}
        </TemplateAppBarStyles.contentContainer>
      </TemplateAppBarStyles.contentWrapper>
    </TemplateAppBarStyles.container>
  );
};

const ToDoLogo: React.FC = () => {
	return (
		<Typography
			variant="h3"
			color={(theme) => theme.palette.text.primary}
			sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700',textShadow: '0px 4px 4px rgba(0,0,0,0.25)'}}>
        ToDo List
		</Typography>
	);
};

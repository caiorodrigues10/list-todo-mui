import React, { ReactNode, useContext } from 'react';
import Context, { ISysAppBarContext } from './sysAppBarContext';
import Styles from './sysAppBarStyles';
import SysAvatar from '/imports/ui/components/sysAvatar/sysAvatar';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import SysMenu from '/imports/ui/components/sysMenu/sysMenuProvider';
import { IconButton } from '@mui/material';

interface ISysAppBar {
	logo?: ReactNode;
}

const SysAppBarView: React.FC<ISysAppBar> = ({ logo }) => {
	const controller = useContext<ISysAppBarContext>(Context);

	return (
		<Styles.wrapper>
			<Styles.container>
				{logo}
				{/* <Styles.navContainerDesktop>
          {controller.menuOptions.map(option => (
            <RenderWithPermission key={option?.name} resources={option?.resources}>
              <SysNavLink
                active={sysRoutes.checkIsActiveRoute(option?.path)}
                sysOptions={option!}
              />
            </RenderWithPermission>
          ))}
        </Styles.navContainerDesktop>
        <Styles.navContainerMobile>
          <Fragment>
            <Styles.iconButton onClick={controller.abrirMenuMobile}>
              <SysIcon name='menu' sx={{ width: '24px', height: '24px' }}/>
            </Styles.iconButton>
            <SysMenu
              ref={controller.menuMobileRef}
              options={controller.getOpcoesMenuMobile()}
              activeArrow
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            />

          </Fragment>
        </Styles.navContainerMobile> */}
				<Styles.containerMenu>
					<SysAvatar name={controller.userName} activateOutline onClick={controller.abrirMenuPerfil} size="large" />
					<IconButton onClick={controller.abrirMenuPerfil} sx={{ padding: 0 }}>
						<SysIcon name="arrowDropDown" sx={{ color: (theme) => theme.palette.grey[900] }} />
					</IconButton>
					<SysMenu
						ref={controller.menuPerfilRef}
						options={controller.getOpcoesMenuDeUsuario()}
						activeArrow
						anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
						transformOrigin={{ horizontal: 'right', vertical: 'top' }}
					/>

				</Styles.containerMenu>
			</Styles.container>
		</Styles.wrapper>
	);
};

export default SysAppBarView;

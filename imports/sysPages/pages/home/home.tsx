import { Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import React, { useContext } from 'react';
import HomeStyles from './homeStyle';
import AuthContext, { IAuthContext } from '/imports/app/authProvider/authContext';
import { EnumToDoStatus } from '/imports/modules/toDos/api/toDoEnum';
import ToDoDashboardControllerProvider, {
	ToDoDashboardControllerContext
} from '/imports/modules/toDos/pages/toDoDashboard/toDoDashboardController';
import SysCircleCheck from '/imports/ui/components/sysCircleCheck/sysCircleCheck';
import { SysFab } from '/imports/ui/components/sysFab/sysFab';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';
import SysList from '/imports/ui/components/sysList/sysList';
import { useNavigate } from 'react-router-dom';
import { ToDoItem } from '/imports/modules/toDos/components/ToDoItem';
import { ToDoStatsCards } from '/imports/modules/toDos/components/ToDoStatsCards';
import { ToDoDrawer } from '/imports/modules/toDos/components/ToDoDrawer';
import DeleteDialog from '/imports/ui/appComponents/showDialog/custom/deleteDialog/deleteDialog';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import ToDoDashboardView from '/imports/modules/toDos/pages/toDoDashboard/toDoDashboardView';

const Home: React.FC = () => {
	return (
		<Box sx={{ width: '100%' }}>
			<ToDoDashboardControllerProvider>
				<ToDoDashboardView />
			</ToDoDashboardControllerProvider>
		</Box>
	);
};

export default Home;

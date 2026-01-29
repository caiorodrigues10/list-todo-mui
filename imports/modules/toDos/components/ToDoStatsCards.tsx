import React, { FC, useContext } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { ToDoDashboardControllerContext } from '../pages/toDoDashboard/toDoDashboardController';
import SysIcon from '/imports/ui/components/sysIcon/sysIcon';

export const ToDoStatsCards: FC<{ team?: boolean }> = ({ team = false }) => {
	const { stats, loading } = useContext(ToDoDashboardControllerContext);

	console.log(stats);

	const items = [
		{ label: 'Últimos 7 dias', value: team ? stats.team.last7Days : stats.personal.last7Days, icon: 'event' },
		{ label: 'Último mês', value: team ? stats.team.lastMonth : stats.personal.lastMonth, icon: 'event' },
		{ label: 'Último ano', value: team ? stats.team.lastYear : stats.personal.lastYear, icon: 'event' }
	];

	return (
		<Grid container spacing={2} sx={{ mb: 2 }}>
			{items.map((item, index) => (
				<Grid item xs={12} sm={4} key={index}>
					<Card
						sx={{
							height: '100%',
							display: 'flex',
							flexDirection: 'column',
							borderRadius: '16px',
							boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
						}}
					>
						<CardContent sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box
								sx={{
									backgroundColor: (theme) => theme.palette.grey[200],
									color: 'black',
									borderRadius: '12px',
									p: 1.5,
									display: 'flex'
								}}
							>
								<SysIcon name={item.icon as any} />
							</Box>
							<Box>
								<Typography variant="h4" sx={{ fontWeight: 'bold', color: 'black' }}>
									{loading ? '...' : item.value}
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
									{item.label}
								</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			))}
		</Grid>
	);
};

import React from 'react';
import { ListProps } from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Styles from './sysListStyles';

export interface ISysList<T> extends ListProps {
  items?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  loading?: boolean;
}

const SysList = <T extends any>({
  items,
  renderItem,
  children,
  emptyMessage = 'Nenhum item encontrado',
  loading = false,
  ...props
}: ISysList<T>) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (items && items.length > 0 && renderItem) {
    return (
      <Styles.list {...props}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </Styles.list>
    );
  }

  if (children) {
    return <Styles.list {...props}>{children}</Styles.list>;
  }

  return (
      <Box p={2} display="flex" justifyContent="center">
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
  );
};

export default SysList;

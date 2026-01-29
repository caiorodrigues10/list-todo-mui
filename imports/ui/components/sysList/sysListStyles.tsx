import { ElementType } from 'react';
import List, { ListProps } from '@mui/material/List';
import styled from '@mui/material/styles/styled';

interface ISysListStyles {
  list: ElementType<ListProps>;
}

const SysListStyles: ISysListStyles = {
  list: styled(List)(({ theme }) => ({
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  })),
};

export default SysListStyles;

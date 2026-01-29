import React, { createContext, FC, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import AuthContext from '/imports/app/authProvider/authContext';
import { IToDo, toDoSch } from '../../api/toDoSch';
import { EnumToDoStatus } from '../../api/toDoEnum';
import { toDoApi } from '../../api/toDoApi';
import AppLayoutContext, { IAppLayoutContext } from '/imports/app/appLayoutProvider/appLayoutContext';
import { userprofileApi } from '/imports/modules/userprofile/api/userProfileApi';
import { ISchema } from '/imports/typings/ISchema';

interface IToDoDashboardControllerContext {
  userName: string;
  recentTasks: IToDo[];
  toggleTaskStatus: (task: IToDo, status: EnumToDoStatus) => void;
  onDeleteButtonClick: (task: IToDo) => void;
  schema: ISchema<any>;
  loading: boolean;
  userId?: string;
  stats: {
    personal: {
      last7Days: number;
      lastMonth: number;
      lastYear: number;
    };
    team: {
      last7Days: number;
      lastMonth: number;
      lastYear: number;
    };
  };
}

export const ToDoDashboardControllerContext = createContext<IToDoDashboardControllerContext>(
  {} as IToDoDashboardControllerContext
);

const ToDoDashboardControllerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useContext<IAppLayoutContext>(AppLayoutContext);
  const userId = user?._id;
  const recentFilter = userId ? { $or: [{ ownerId: userId }, { assigneeId: userId }] } : {};
  const sort = { lastupdate: -1, createdat: -1 };

  const [stats, setStats] = useState({
    personal: { last7Days: 0, lastMonth: 0, lastYear: 0 },
    team: { last7Days: 0, lastMonth: 0, lastYear: 0 },
  });

  useEffect(() => {
    if (userId) {
      toDoApi.callMethod('toDoListCompletedInPeriod', {}, {}, (err: any, res: any) => {
        if (!err && res) {
          setStats(res);
        }
      });
    }
  }, [userId]);

  const { recentTasks, userOptions, loading } = useTracker(() => {
    const subRecent = toDoApi.subscribe('toDoRecent', recentFilter, { sort, limit: 5 });
    const subUsers = userprofileApi.subscribe('userProfileList', {});

    const recentTasks = subRecent?.ready()
      ? toDoApi.find(recentFilter, { sort, limit: 5 }).fetch()
      : [];

    return {
      recentTasks,
      userOptions: subUsers.ready() ? userprofileApi.find({}).fetch().map(u => ({ value: (u._id || ''), label: u.username })) : [],
      loading: !!subRecent && !subRecent.ready()
    };
  }, [userId]);

  const dashboardSchema = useMemo(() => ({
    ...toDoSch,
    assigneeId: {
      ...toDoSch.assigneeId,
      options: () => userOptions,
      optional: true
    }
  }), [userOptions]);

  const toggleTaskStatus = (task: IToDo, newStatus: EnumToDoStatus) => {
    toDoApi.update({ ...task, status: newStatus, type: task.type || 'personal' } as IToDo, (e: any) => {
      if (e) {
        showNotification({
          type: 'error',
          title: 'Atenção',
          message: `Erro ao atualizar a tarefa: ${e.reason}`
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Concluído',
          message: `Tarefa ${newStatus === EnumToDoStatus.CONCLUDED ? 'concluída' : 'reaberta'} com sucesso!`
        });
      }
    });
  };

  const onDeleteButtonClick = (task: IToDo) => {
    toDoApi.remove(task, (e: any) => {
      if (e) {
        showNotification({
          type: 'error',
          title: 'Atenção',
          message: `Erro ao deletar a tarefa: ${e.reason}`
        });
      } else {
        showNotification({
          type: 'success',
          title: 'Concluído',
          message: 'Tarefa deletada com sucesso!'
        });
      }
    });
  };

  const providerValue = {
    userName: user?.username || 'Usuário',
    recentTasks,
    toggleTaskStatus,
    onDeleteButtonClick,
    schema: dashboardSchema,
    loading,
    userId,
    stats
  };

  return (
    <ToDoDashboardControllerContext.Provider value={providerValue}>
      {children}
    </ToDoDashboardControllerContext.Provider>
  );
};

export default ToDoDashboardControllerProvider;

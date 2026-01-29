import React, { useState, createContext, useContext } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { ToDoAddModalView } from './toDoAddModalView';

interface IToDoAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; type: 'personal' | 'shared'; assigneeId?: string }) => void;
  userOptions: { value: string; label: string }[];
}

interface IToDoAddModalControllerContext {
  open: boolean;
  onClose: () => void;
  fullScreen: boolean;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  assigneeId: string;
  setAssigneeId: (value: string) => void;
  userOptions: { value: string; label: string }[];
  errors: { title?: string };
  handleSave: () => void;
}

export const ToDoAddModalControllerContext = createContext<IToDoAddModalControllerContext>(
  {} as IToDoAddModalControllerContext
);

export const ToDoAddModalController: React.FC<IToDoAddModalProps> = ({ open, onClose, onSave, userOptions }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('personal');
  const [assigneeId, setAssigneeId] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validate = () => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) newErrors.title = 'Título é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('personal');
    setAssigneeId('');
    setErrors({});
  };

  const handleSaveInternal = () => {
    if (validate()) {
      onSave({
        title,
        description,
        type: type as 'personal' | 'shared',
        assigneeId: type === 'shared' ? assigneeId : undefined
      });
      resetForm();
    }
  };

  const handleCloseInternal = () => {
    onClose();
    resetForm();
  };

  const providerValue = {
    open,
    onClose: handleCloseInternal,
    fullScreen,
    title,
    setTitle,
    description,
    setDescription,
    type,
    setType,
    assigneeId,
    setAssigneeId,
    userOptions,
    errors,
    handleSave: handleSaveInternal,
  };

  return (
    <ToDoAddModalControllerContext.Provider value={providerValue}>
      <ToDoAddModalView />
    </ToDoAddModalControllerContext.Provider>
  );
};

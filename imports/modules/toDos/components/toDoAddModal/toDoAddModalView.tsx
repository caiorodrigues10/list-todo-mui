import React, { useContext } from 'react';
import {
  Dialog,
  TextField,
  Box,
  Typography,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SysSwitch from '/imports/ui/components/sysFormFields/sysSwitch/sysSwitch';
import { ToDoAddModalControllerContext } from './toDoAddModalController';
import { ToDoAddModalStyles } from './toDoAddModalStyles';

export const ToDoAddModalView: React.FC = () => {
  const {
    open,
    onClose,
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
    handleSave
  } = useContext(ToDoAddModalControllerContext);

  const {
    Title,
    CloseButton,
    Content,
    FormContainer,
    Label,
    Actions,
    SaveButton
  } = ToDoAddModalStyles;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        sx: { width: '100%', maxWidth: '600px' }
      }}
    >
      <Title id="todo-add-modal-title">
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Adicionar Tarefa
        </Typography>
        <CloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </Title>

      <Content dividers>
        <FormContainer noValidate autoComplete="off">
          <Box>
            <Label variant="subtitle2">Título</Label>
            <TextField
              fullWidth
              placeholder="Dê um título para sua tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              variant="outlined"
              inputProps={{ 'aria-label': 'Título da tarefa' }}
            />
          </Box>

          <Box>
            <Label variant="subtitle2">Descrição</Label>
             <TextField
              fullWidth
              placeholder="Adicione aqui, a descrição da tarefa"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              inputProps={{ 'aria-label': 'Descrição da tarefa' }}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <SysSwitch
              name="type"
              label="Tarefa Compartilhada?"
              value={type}
              trueValue="shared"
              falseValue="personal"
              onChange={(e: any) => setType(e.target.value)}
            />
          </Box>

          {type === 'shared' && (
            <Box>
              <Label variant="subtitle2">Responsável</Label>
              <TextField
                select
                fullWidth
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                variant="outlined"
                inputProps={{ 'aria-label': 'Responsável pela tarefa' }}
              >
                {userOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </FormContainer>
      </Content>

      <Actions>
        <SaveButton onClick={handleSave} variant="contained">
          Salvar
        </SaveButton>
      </Actions>
    </Dialog>
  );
};

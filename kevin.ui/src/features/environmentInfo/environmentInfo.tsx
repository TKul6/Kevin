
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './environmentInfo.module.css';
import * as React from 'react';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { openCreateKeyDialog, selectEditedKevinValue, selectEnvironmentInfo, selectKeyValueForEdit, setKeyValue } from './environmentInfoSlice';
import { IKevinValue } from '@kevin-infra/core/interfaces';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, DialogActions, DialogContent, DialogContentText, TextField } from '@mui/material';
import { selectEnvironments } from '../environments/environmentsSlice';
import { Header } from '../../app/components/header/header';
import { CreateKeyDialog } from './dialogs/create-key-dialog';





export function EnvironmentInfo() {


  let newValue = '';
  const dispatch = useAppDispatch();
  function closeSetValueModal() {
    newValue = '';
    setOpen(false);
  }

  function openSetValueModal(info: IKevinValue) {
    dispatch(selectKeyValueForEdit(info));
    setOpen(true);
  }

  function setValue() {

    dispatch(setKeyValue({ newValue: newValue, existingValue: environmentInfo.editedKevinValue, environmentId: environmentInfo.selectedEnvironmentId }));
    closeSetValueModal();
  }

  function getEnvironmentName(environmentId: string) {


    const environment = environments.find((env) => env.id === environmentId);
    return environment ? environment.name : '';
  }

  const [open, setOpen] = React.useState(false);

  const environmentInfo = useAppSelector(selectEnvironmentInfo);
  const editedKevinValue = useAppSelector(selectEditedKevinValue);
  const environments = useAppSelector(selectEnvironments);


  if (environmentInfo.status !== 'loaded') {
    return (<div>Empty State</div>)
  }

  return (
    <div className={styles.contentContainer}>
<Header title='Environment Info' commands={[{name: 'Create', tooltip:'Create new key', action: openCreateKeyDialog()}]}  />
      <Divider></Divider>
      <div className={styles.item}>

        <TableContainer component={Paper}>
          <Table aria-label="Keys table">
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell className={styles.actionsColumn}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {environmentInfo.environmentKeys.map((kvInfo: IKevinValue) => (
                <TableRow>
                  <TableCell className={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? styles.inheritItem : ''}>{kvInfo.key}</TableCell>
                  <TableCell className={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? styles.inheritItem : ''}>{kvInfo.value}</TableCell>
                  <TableCell className={styles.actionsColumn} align="right">

                    <Tooltip title={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? 'Stop inherit and set value' : 'Set value'} placement="top">
                      <IconButton aria-label="set value" size='small' onClick={() => openSetValueModal(kvInfo)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Dialog open={open} onClose={closeSetValueModal}>
        <DialogTitle>Edit key: '{editedKevinValue?.key}'</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <div className='dialog-container'>
              <div>Set a new value.</div>
              <div className={styles.item}>Environment: '{getEnvironmentName(environmentInfo.selectedEnvironmentId)}'</div>
            </div>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="newValue"
            label="Value"
            type="text"
            onChange={(e) => { newValue = e.target.value }}
            fullWidth
            variant="standard"
          />
          {editedKevinValue?.environmentInfo.id !== environmentInfo.selectedEnvironmentId && <div className="warnLabel">Setting a new value will immediately stop the value inheritance.</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={setValue} variant="contained">Let's go Kevin</Button>
          <Button onClick={closeSetValueModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <CreateKeyDialog />
    </div>


  );

}


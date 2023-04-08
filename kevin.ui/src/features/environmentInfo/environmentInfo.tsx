
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
import { openAddKeyDialog, openSetKeyValueDialog, selectEditedKevinValue, selectEnvironmentInfo, selectKeyValueForEdit, setKeyValue } from './environmentInfoSlice';
import { IKevinValue } from '@kevin-infra/core/interfaces';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, DialogActions, DialogContent, DialogContentText, TextField } from '@mui/material';
import { selectEnvironments } from '../environments/environmentsSlice';
import { Header } from '../../app/components/header/header';
import { AddKeyDialog } from './dialogs/addKeyDialog';
import { SetKeyDialog } from './dialogs/setKeyDialog';





export function EnvironmentInfo() {

  const environmentInfo = useAppSelector(selectEnvironmentInfo);

const dispatch = useAppDispatch();
  if (environmentInfo.status !== 'loaded') {
    return (<div>Empty State</div>)
  }

  return (
    <div className={styles.contentContainer}>
      <Header title='Environment Info' commands={[{ name: 'Create', tooltip: 'Create new key', action: openAddKeyDialog() }]} />
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
                      <IconButton aria-label="set value" size='small' onClick={() => dispatch(openSetKeyValueDialog(kvInfo))}>
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
      <SetKeyDialog />
      <AddKeyDialog />
    </div>


  );

}


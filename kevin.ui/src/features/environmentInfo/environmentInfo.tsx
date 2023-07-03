import { useAppDispatch, useAppSelector } from '../../app/hooks';
import styles from './environmentInfo.module.css';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import EditIcon from '@mui/icons-material/Edit';
import { openAddKeyDialog, openInheritKeyDialog, openSetKeyValueDialog, selectEnvironmentInfo, selectLoadingStatus } from './state';
import { IKevinValue } from '@kevin-infra/core/interfaces';
import { Header } from '../../app/components/header/header';
import { AddKeyDialog } from './dialogs/addKeyDialog';
import { SetKeyDialog } from './dialogs/setKeyDialog';
import { Loader } from '../../app/components/loader/loader';
import { LoadingStatus } from '../../app/types';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import { ChangeEvent } from 'react';
import React from 'react';
import { IconCommand } from '../../app/components/icon-command/icon-command';
import { InheritKeyDialog } from './dialogs/inheritKeyDialog';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TextField from '@mui/material/TextField';
import { Button, FormControlLabel, Switch, Tooltip } from '@mui/material';
import { StaticDatePicker } from '@mui/lab';

export function EnvironmentInfo() {

const dispatch = useAppDispatch();

  const environmentInfo = useAppSelector(selectEnvironmentInfo);
  const status = useAppSelector(selectLoadingStatus);
  const [showAll, setShowAll] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(14);
  const [keyFilterValue, setKeyFilterValue] = React.useState('');
  const [valueFilterValue, setValueFilterValue] = React.useState('');

  function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  }

  function handleChangePage(event: any, page: number): void {
    setPage(page);
  }

  function getFilteredKeys() {
    const keys =  environmentInfo.environmentKeys
      .filter((kv: IKevinValue) => keyFilterValue === '' || kv.key.includes(keyFilterValue))
      .filter((kv: IKevinValue) => valueFilterValue === '' || kv.value.includes(valueFilterValue));

      if(showAll) {
        return keys;
      } else {
        return keys.filter((kv: IKevinValue) => kv.environmentInfo.id === environmentInfo.selectedEnvironmentId);
      }
  }

  return (
    <div className={styles.contentContainer}>
      <Header
        title="Environment Info"
      >
        <div className={styles.flexContainer}>
          <Tooltip title="Create new key">
            <Button variant="contained" onClick={() => dispatch(openAddKeyDialog())} disabled={status != LoadingStatus.Loaded}>Create</Button>
        </Tooltip>
        <FormControlLabel control={<Switch  checked={showAll} onChange={(e) => setShowAll(e.target.checked)}  />} 
        disabled={status != LoadingStatus.Loaded || environmentInfo.selectedEnvironmentId === 'root'}
        label="Show all value" className={styles.headerCommand}/>

        </div>
        </Header>
      <Divider></Divider>
      <div className={styles.item}>
        <Loader
          status={status}
          loadingMessage="Loading environment keys ... Don't worry, they're out there!"
          errorMessage="Failed to load Environment Keys"
          notLoadedMessage="Select an environment to revel it's keys"
        >
          <TableContainer component={Paper}>
            <Table aria-label="Keys table">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell className={styles.actionsColumn}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <TextField fullWidth id="standard-basic" label="Filter" variant="standard" onChange={(e) => setKeyFilterValue(e.target.value)} />
                  </TableCell>
                  <TableCell>
                    <TextField fullWidth className="flex-grow" id="standard-basic" label="Filter" variant="standard" onChange={(e) => setValueFilterValue(e.target.value)} />
                  </TableCell>
                  <TableCell className={styles.actionsColumn}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0 ? getFilteredKeys().slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage) : getFilteredKeys().slice(0, rowsPerPage)).map(
                  (kvInfo: IKevinValue) => (
                    <TableRow key={kvInfo.key}>
                      <TableCell className={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? styles.inheritItem : ''}>{kvInfo.key}</TableCell>
                      <TableCell className={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? styles.inheritItem : ''}>{kvInfo.value}</TableCell>
                      <TableCell className={styles.actionsColumn} align="right">
                        <IconCommand
                          tooltip={kvInfo.environmentInfo.id !== environmentInfo.selectedEnvironmentId ? 'Stop inherit and set value' : 'Set value'}
                          tooltipPlacement="top"
                          ariaLabel="set value"
                          fontSize="small"
                          action={openSetKeyValueDialog(kvInfo)}
                        >
                          <EditIcon fontSize="small" />
                        </IconCommand>

                        {environmentInfo.selectedEnvironmentId !== 'root' && kvInfo.environmentInfo.id === environmentInfo.selectedEnvironmentId && (
                          <IconCommand
                            tooltip="Inherit value from parent environment"
                            tooltipPlacement="top"
                            ariaLabel="inherit value"
                            fontSize="small"
                            action={openInheritKeyDialog(kvInfo)}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconCommand>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    colSpan={3}
                    rowsPerPageOptions={[5, 10, 14]}
                    count={getFilteredKeys().length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      inputProps: {
                        'aria-label': 'rows per page',
                      },
                      native: true,
                    }}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
          <SetKeyDialog />
          <AddKeyDialog />
          <InheritKeyDialog />
        </Loader>
      </div>
    </div>
  );
}

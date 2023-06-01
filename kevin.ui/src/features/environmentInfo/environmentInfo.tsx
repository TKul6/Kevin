
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
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { openAddKeyDialog, openSetKeyValueDialog, selectEnvironmentInfo, selectLoadingStatus} from './environmentInfoSlice';
import { IKevinValue } from '@kevin-infra/core/interfaces';
import Tooltip from '@mui/material/Tooltip';
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





export function EnvironmentInfo() {

  const environmentInfo = useAppSelector(selectEnvironmentInfo);
  const status = useAppSelector(selectLoadingStatus);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

const dispatch = useAppDispatch();

  function handleChangeRowsPerPage(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
    
  }

  function handleChangePage(event: any, page: number): void {
    setPage(page);

  }

  return (
    <div className={styles.contentContainer}>
      <Header title='Environment Info' commands={[{ name: 'Create', tooltip: 'Create new key', action: openAddKeyDialog(), hidden: status !== LoadingStatus.Loaded }]} />
      <Divider></Divider>
      <div className={styles.item}>

<Loader status={status} loadingMessage="Loading environment keys ... Don't worry, they're out there!" errorMessage="Failed to load Environment Keys"
notLoadedMessage="Select an environment to revel it's keys">
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
              {(rowsPerPage > 0 ?   environmentInfo.environmentKeys.slice(rowsPerPage * page,rowsPerPage * page + rowsPerPage): environmentInfo.environmentKeys.slice(0, rowsPerPage)).map((kvInfo: IKevinValue) => (
                <TableRow key={kvInfo.key}>
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
      <TableFooter>
          <TableRow>
                    <TablePagination
              colSpan={3}
              rowsPerPageOptions={[5, 10]}
              count={environmentInfo.environmentKeys.length}
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
        </Loader>
      </div>
      
    </div>


  );

}


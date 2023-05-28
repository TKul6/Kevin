
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import styles from './environmentsTree.module.css';
import { IEnvironmentMetaData } from '@kevin-infra/core/interfaces';
import Divider from '@mui/material/Divider';
import { openCreateEnvironmentDialog, selectEnvironment } from './environmentsSlice';
import AddIcon from '@mui/icons-material/Add';
import CopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { CreateEnvironmentDialog } from './dialogs/createEnvironmentDialog';
import { Header } from '../../app/components/header/header';
import { openToast } from '../system/systemSlice';
import { Loader } from '../../app/components/loader/loader';



export function EnvironmentsTree() {
  const environments = useAppSelector((state) => state.environments.environments);
  const environmentStatus = useAppSelector((state) => state.environments.status);
  const dispatch = useAppDispatch();


  function openCreateModal(e, environmentId: string) {
    e.stopPropagation();
    dispatch(openCreateEnvironmentDialog(environmentId));
  }

  function copyEnvironmentIdToClipboard(e, environmentId: string) {
    e.stopPropagation();
    navigator.clipboard.writeText(environmentId);
    dispatch(openToast({ text: 'Copied environment id to clipboard', level: 'success' }))
  }

  function renderBranch(allEnvironments: Array<IEnvironmentMetaData>, currentEnvironment?: IEnvironmentMetaData) {

    if (!currentEnvironment) {
      return (<div>Failed to find root node!</div>)
    }
    return (
      <TreeItem key={currentEnvironment.id} nodeId={currentEnvironment.id} label={<div className={styles.treeItemContainer}>
        <div className='treeItemText'>{currentEnvironment.name}</div>
        <div className={styles.commandsContainer}>
          <Tooltip title="Create environment under this node" placement="top">
            <IconButton size="small" aria-label="create environment" onClick={(e) => openCreateModal(e, currentEnvironment.id)}>
              <AddIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy environment id" placement="top">
            <IconButton size="small" aria-label="Copy environment id" onClick={(e) => copyEnvironmentIdToClipboard(e, currentEnvironment.id)}>
              <CopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div></div>}>
        {allEnvironments.filter((childEnvironment) => childEnvironment.parentEnvironmentId === currentEnvironment.id)
          .map((childEnvironment) => { return renderBranch(allEnvironments, childEnvironment) })}
      </TreeItem>
    )
  }


  const tree = (<TreeView
    onNodeSelect={(_: any, nodeId: string) => dispatch(selectEnvironment(nodeId))}
    aria-label="Environments"
    defaultCollapseIcon={<ExpandMoreIcon />}
    defaultExpandIcon={<ChevronRightIcon />}
    sx={{ height: 300, flexGrow: 1 }}
  >
    {renderBranch(environments, environments.find((environment) => !environment.parentEnvironmentId))}
  </TreeView>)


  return (
    <div className="treeComponentContainer">
      <div className={styles.contentContainer}>
        <Header title='Environments' />
        <Divider></Divider>
        <div className={styles.item}>
           <Loader status={environmentStatus} errorMessage="Failed to load environments" loadingMessage="Loading Environments ...">
          {tree}
          </Loader>
          <div>
          </div>
        </div>
      </div>
      <CreateEnvironmentDialog />
    </div>
  )


}

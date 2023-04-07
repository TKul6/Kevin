
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
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { CreateEnvironmentModel } from './createEnvironmentModal';



export function EnvironmentsTree() {
  const environments = useAppSelector((state) => state.environments.environments);
  const dispatch = useAppDispatch();


function openCreateModal(e, environmentId: string) {
  e.stopPropagation();
    dispatch(openCreateEnvironmentDialog(environmentId));
}

function renderBranch(allEnvironments: Array<IEnvironmentMetaData>, currentEnvironment?: IEnvironmentMetaData) {

  if (!currentEnvironment) {
    return (<div>Failed to find root node!</div>)
  }
  return (
    <TreeItem nodeId={currentEnvironment.id} label={<div className={styles.treeItemContainer}>
      <div className='treeItemText'>{currentEnvironment.name}</div>
      <div className={styles.commandsContainer}>
        <Tooltip title="Create environment under this node" placement="top">
        <IconButton size="small" aria-label="create environment" onClick={(e) =>  openCreateModal(e, currentEnvironment.id)}>
          <AddIcon fontSize="inherit" />
          </IconButton>
          </Tooltip>
        </div></div>}>
      {allEnvironments.filter((childEnvironment) => childEnvironment.parentEnvironmentId === currentEnvironment.id)
        .map((childEnvironment) => { return renderBranch(allEnvironments, childEnvironment) })}
    </TreeItem>
  )
}


const tree  = (<TreeView
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
        <div className="header"><div className="headerText">Environments Tree</div></div>
        <Divider></Divider>
        <div className={styles.item}>
          {environments.length > 0 ? tree : <div>Empty State</div>}
          <div>
            </div>
        </div>
      </div>
      <CreateEnvironmentModel />
     </div>
      )
     

}

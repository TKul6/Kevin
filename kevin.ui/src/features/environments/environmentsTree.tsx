
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import styles from './environmentsTree.module.css';
import { loadEnvironments } from './environmentsSlice';
import { IEnvironmentMetaData } from '@kevin-infra/core/interfaces';
import Divider from '@mui/material/Divider';

export function renderBranch(allEnvironments: Array<IEnvironmentMetaData>, currentEnvironment?: IEnvironmentMetaData) {

  if(!currentEnvironment) {
    return (<div></div>)
  }
  return (
    <TreeItem nodeId={currentEnvironment.id} label={currentEnvironment.name}>
      {allEnvironments.filter((childEnvironment) => childEnvironment.parentEnvironmentId === currentEnvironment.id).map((childEnvironment) => {return renderBranch(allEnvironments, childEnvironment)})}
    </TreeItem>
  )
}

export function EnvironmentsTree() {
  const environments = useAppSelector((state) => state.environments.environments);
  const dispatch = useAppDispatch();


if(environments.length > 0) {
  
  return (
    <div className={styles.contentContainer}>
      <div className="header">Environments Tree</div>
      <Divider></Divider>
      <div className={styles.item}>
        <div>
          <TreeView 
          aria-label="Environments"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          sx={{ height: 300, flexGrow: 1 }}
        >
          {renderBranch(environments, environments.find((environment) => !environment.parentEnvironmentId))}
        </TreeView></div>
      </div>
    </div>);
      } else {
        return (<div className={styles.row}>

        <button
          className={styles.asyncButton}
          onClick={() => dispatch(loadEnvironments())}
        >
          Load environments
        </button>

      </div>
    )
      }
      
  
}

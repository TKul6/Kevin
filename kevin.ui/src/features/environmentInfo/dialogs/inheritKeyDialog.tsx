import { Button,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Loader } from "../../../app/components/loader/loader";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { closeInheritKeyDialog, selectKeyToInherit, inheritKey as InheritKeyAction, selectParentKey, selectParentKeyStatus } from "../state";
import styles from './dialog.module.css'
export function InheritKeyDialog() {

const parentKey = useAppSelector(selectParentKey);
const parentKeyStatus = useAppSelector(selectParentKeyStatus);

  const dispatch = useAppDispatch();
  function closeDialog() {
    dispatch(closeInheritKeyDialog());
  }

  const keyToInherit = useAppSelector(selectKeyToInherit);
  //  const environments = useAppSelector(selectEnvironments);
  //  const environmentId = useAppSelector(selectSelectedEnvironmentId);
  
  function inheritKey() {
    dispatch(InheritKeyAction(keyToInherit))
  }
 

return (<Dialog open={keyToInherit != null} onClose={closeDialog}>
        <DialogTitle>Inherit key: '{keyToInherit?.key}'</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <div className='dialog-container'>
              <Loader status={parentKeyStatus} >
              <div>Are you sure you want to inherit key '{keyToInherit?.key}'?</div>
            
              <div className={styles.item}>new Value will be '<b>{parentKey?.value}</b>' from the environment '{parentKey?.environmentInfo.name}'</div>
            
            </Loader></div>
            
  
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button onClick={inheritKey} variant="contained">I'm sure Kevin</Button>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>)
}
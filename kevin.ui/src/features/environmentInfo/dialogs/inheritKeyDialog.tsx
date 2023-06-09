import { Button,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { getEnvironment } from "../../../app/helpers/environment-helpers";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectEnvironments } from "../../environments/environmentsSlice";
import { closeInheritKeyDialog, selectKeyToInherit, selectSelectedEnvironmentId, inheritKey as InheritKeyAction } from "../environmentInfoSlice";
import styles from './dialog.module.css'
export function InheritKeyDialog() {


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
              <div>Are you sure you want to inherit key '{keyToInherit?.key}'?</div>
              <div className={styles.item}>new Value will be '<b>NEW VALUE</b>' from the environment 'ENVIRONMENT'</div>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={inheritKey} variant="contained">I'm sure Kevin</Button>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>)
}
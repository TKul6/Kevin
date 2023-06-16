import { Button,  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import React from "react";
import { getEnvironment } from "../../../app/helpers/environment-helpers";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectEnvironments } from "../../environments/environmentsSlice";
import { closeSetValueDialog, selectEditedKevinValue, selectSelectedEnvironmentId, setKeyValue } from "../state";
import styles from './dialog.module.css'
export function SetKeyDialog() {


  const [newValue, setNewValue] = React.useState("");
  const dispatch = useAppDispatch();
  function closeDialog() {
    dispatch(closeSetValueDialog());
    setNewValue("");
  }

  const editedKevinValue = useAppSelector(selectEditedKevinValue);
    const environments = useAppSelector(selectEnvironments);
    const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);
  
  function setValue() {

    dispatch(setKeyValue({ newValue: newValue, existingValue: editedKevinValue, environmentId: selectedEnvironmentId }));
    closeDialog();
  }
 

return (<Dialog open={editedKevinValue != null} onClose={closeDialog}>
        <DialogTitle>Edit key: '{editedKevinValue?.key}'</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <div className='dialog-container'>
              <div>Set a new value.</div>
              <div className={styles.item}>Environment: '{getEnvironment(environments, selectedEnvironmentId).name}'</div>
            </div>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="newValue"
            label="Value"
            type="text"
            onChange={(e) => setNewValue(e.target.value)}
            fullWidth
            variant="standard"
          />
          {editedKevinValue?.environmentInfo.id !== selectedEnvironmentId && <div className="warnLabel">Setting a new value will immediately stop the value inheritance.</div>}
        </DialogContent>
        <DialogActions>
          <Button onClick={setValue} disabled={newValue.length < 2} variant="contained">Let's go Kevin</Button>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>)
}
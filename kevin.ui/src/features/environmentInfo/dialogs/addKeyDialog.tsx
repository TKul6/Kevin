
import { Button, Dialog, DialogActions, DialogContentText, DialogTitle, TextField, DialogContent, FormControlLabel, Checkbox, Tooltip, Typography } from "@mui/material"
import { isModalVisible } from "../../../app/helpers/dialog-helpers";
import { getEnvironment } from "../../../app/helpers/environment-helpers";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectEnvironments } from "../../environments/environmentsSlice";
import { closeAddKeyDialog, selectAddKeyStatus, selectSelectedEnvironmentId, addKey as addKeyAction, selectEnvironmentInfo } from "../state";
import styles from "./dialog.module.css"
import InfoIcon from '@mui/icons-material/Info';
import React from "react";


export interface AddKeyModel {
  key: string;
  value: string;
  defaultValue: string;
  environmentId: string;
}

export function AddKeyDialog() {

  const dispatch = useAppDispatch();

  const [key, setKey] = React.useState("");
  const [value, setValue] = React.useState("");
  const [defaultValue, setDefaultValue] = React.useState("");
  const [useValueAsDefaultValue, setUseValueAsDefaultValue] = React.useState(true);
  const [keyErrorText, setKeyErrorText] = React.useState("");

  const addKeyStatus = useAppSelector(selectAddKeyStatus);
  const environments = useAppSelector(selectEnvironments);
  const selectedEnvironmentId = useAppSelector(selectSelectedEnvironmentId);
  const siblingKeys = useAppSelector(selectEnvironmentInfo).environmentKeys;

  function renderDefaultValueSection() {
    if (selectedEnvironmentId === "root") {
      return (<div></div>)
    } else {
      return <div className={styles.bottomSection + " dialog-container"} >
        <div className={styles.flexCenter}>
          <FormControlLabel control={<Checkbox defaultChecked size="small" onChange={(e) => setUseValueAsDefaultValue(e.target.checked)} />} label="Use the value as default value." />
          <Tooltip
            title={<React.Fragment><Typography fontSize={14}>The default value will be used when different environments will try to get this key. if no default value is provided, Kevin will use empty string as the default value</Typography></React.Fragment>}>
            <InfoIcon fontSize="small" />
          </Tooltip>

        </div>
        <div>
          <TextField
            autoFocus
            disabled={useValueAsDefaultValue}
            margin="dense"
            id="defaultValue"
            label="Default Value"
            type="text"
            onChange={(e) => { setDefaultValue(e.target.value) }}
            fullWidth
            variant="standard"
          />
        </div>
      </div>
    }
  }

  function closeModal() {
    setKey("");
    setValue("");
    setDefaultValue("");
    setUseValueAsDefaultValue(true);
    setKeyErrorText("");
    dispatch(closeAddKeyDialog())
  }


  function addKey() {
    dispatch(addKeyAction({ environmentId: selectedEnvironmentId, key: key, value: value, defaultValue: useValueAsDefaultValue ? value : defaultValue } as AddKeyModel))

  }

  function verifyAndSetKey(value: string) {
    setKey(value);

    const loweredKey = value.toLowerCase();
    if (value.length < 2) {
      setKeyErrorText("Key must be at least 2 characters");
    } else if (siblingKeys.some(sibling => sibling.key === loweredKey)) {
      setKeyErrorText("Opps, It seems like this key already exists in this environment.");
    } else {
      setKeyErrorText("");
    }
  }

  return (
    <Dialog open={isModalVisible(addKeyStatus)} onClose={closeModal}>
      <DialogTitle>Add new key ('{getEnvironment(environments, selectedEnvironmentId).name}')</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          <div className='dialog-container'>
            <div>The Key will be added under the environment  <b>'{getEnvironment(environments, selectedEnvironmentId).name}'</b>.</div>
            <div>Please provide the <b>Key</b> & <b>Value</b>.</div>
          </div>
          {keyErrorText.length > 0}
          <div className="flex-row">
            <div className="flex-grow">
              <TextField
                autoFocus
                margin="dense"
                id="key"
                label="Key"
                type="text"
                error={keyErrorText.length > 0}
                helperText={keyErrorText}
                onChange={(e) => { verifyAndSetKey(e.target.value) }}
                fullWidth
                variant="standard"
              />
            </div>

            <div style={{ paddingLeft: "16px" }} className="flex-grow">
              <TextField
                autoFocus
                margin="dense"
                id="value"
                label="Value"
                type="text"
                onChange={(e) => { setValue(e.target.value) }}
                fullWidth
                variant="standard"
              />
            </div>
          </div>
          {renderDefaultValueSection()}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={addKey} variant="contained" disabled={keyErrorText.length > 0 || value.length === 0}>Add it Kevin!</Button>
        <Button onClick={closeModal}>Cancel</Button>
      </DialogActions>
    </Dialog>
  )

}
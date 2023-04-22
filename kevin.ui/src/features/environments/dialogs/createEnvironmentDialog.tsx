import { Button, Dialog, DialogActions, DialogContentText, DialogTitle, TextField, DialogContent } from "@mui/material"
import React from "react";
import { getEnvironment } from "../../../app/helpers/environment-helpers";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { closeCreateEnvironmentDialog, selectCreateEnvironmentModel, selectEnvironments, createEnvironment as createEnvironmentAction } from "../environmentsSlice";

export function CreateEnvironmentDialog() {

const dispatch = useAppDispatch();

const[newValue, setNewValue] = React.useState("");
const [errorMessage, setErrorMessage] = React.useState("");
const createEnvModal = useAppSelector(selectCreateEnvironmentModel);
const environments = useAppSelector(selectEnvironments);
function closeModal() {
    dispatch(closeCreateEnvironmentDialog())
    setNewValue("");
    setErrorMessage("");
}


function createEnvironment() {
    dispatch(createEnvironmentAction({name: newValue, parentId: createEnvModal.parentId}));
}

  function setName(value: string) {
    setNewValue(value);

    const loweredKey = value.toLowerCase();
    if (value.length === 1) {
      setErrorMessage("Environment name should be at least 2 characters long");
    } else if (environments.some((env) => env.name.toLowerCase() === loweredKey && env.parentEnvironmentId === createEnvModal.parentId)) {
      setErrorMessage("Opps, It seems like this name is already taken by a sibling environment.");
    } else {
      setErrorMessage("");
    }
  }

return  ( createEnvModal &&
    <Dialog open={createEnvModal !== null} onClose={closeModal}>
        <DialogTitle>Create new environment</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <div className='dialog-container'>
           <div>The environment will be created under the node  <b>'{getEnvironment(environments, createEnvModal.parentId)?.name}'</b>.</div>
            <div>Please provide a name for the environment (The name should be unique among all sibling environments)</div>
            </div>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="environmentName"
            label="Name"
            type="text"
           onChange={(e) => {setName(e.target.value)}}
           required={true}
            fullWidth
            error={errorMessage.length > 0}
            helperText={errorMessage}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={createEnvironment} variant="contained" disabled={errorMessage.length > 0 || newValue.length === 0 }>Create</Button>
          <Button onClick={closeModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
)

}
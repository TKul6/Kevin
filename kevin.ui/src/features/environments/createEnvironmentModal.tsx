import { IEnvironmentMetaData } from "@kevin-infra/core/interfaces";
import { Button, Dialog, DialogActions, DialogContentText, DialogTitle, TextField, DialogContent } from "@mui/material"
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeCreateEnvironmentDialog, selectCreateEnvironmentModel, selectEnvironments, createEnvironment as createEnvironmentAction } from "./environmentsSlice";

export function CreateEnvironmentModel() {

const dispatch = useAppDispatch();

let newValue = "";
const createEnvModal = useAppSelector(selectCreateEnvironmentModel);
const environments = useAppSelector(selectEnvironments);
function closeModal() {
    dispatch(closeCreateEnvironmentDialog())
}

// TODO: move it to some more generic area.
function getEnvironment(id: string): IEnvironmentMetaData {
    return environments.find(env => env.id === id);
}

function createEnvironment() {
    dispatch(createEnvironmentAction({name: newValue, parentId: createEnvModal.parentId}));
}

return  ( createEnvModal &&
    <Dialog open={createEnvModal !== null} onClose={closeModal}>
        <DialogTitle>Create new environment</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            <div className='dialog-container'>
           <div>The environment will be created under the node  <b>'{getEnvironment(createEnvModal.parentId)?.name}'</b>.</div>
            <div>Please provide a name for the environment (The name should be unique among all sibling environments)</div>
            </div>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="environmentName"
            label="Name"
            type="text"
           onChange={(e) => {newValue = e.target.value}}
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={createEnvironment} variant="contained">Create</Button>
          <Button onClick={closeModal}>Cancel</Button>
        </DialogActions>
      </Dialog>
)

}
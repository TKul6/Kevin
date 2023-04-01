import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closeToast, selectToast, selectToastOpen } from "./systemSlice";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export interface ToastInfo {
    text: string;
    level: 'info' | 'success' | 'warning' | 'error';
}

export function AppToast() {

    const open = useAppSelector(selectToastOpen);
    const toastInfo = useAppSelector(selectToast);
    const dispatch = useAppDispatch();

    function handleCloseToast() {
        dispatch(closeToast());
    }

        return (
            <Snackbar open={open} autoHideDuration={6000} onClose={handleCloseToast} >
                <Alert variant="filled" onClose={handleCloseToast} severity={toastInfo.level} sx={{ width: '100%' }}>
                    <div>{toastInfo.text}</div>
                </Alert>
            </Snackbar>

        )
    

}

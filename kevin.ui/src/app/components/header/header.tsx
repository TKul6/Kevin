import { Button, Tooltip } from "@mui/material";
import { Action } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../hooks";
import styles from "./header.module.css";


export interface HeaderInfo {
    title: string;
    commands?: Array<HeaderCommand>;
}

export interface HeaderCommand {
    name: string;
    tooltip: String;
    action: Action
}

const DEFAULT_PROPS: Partial<HeaderInfo> = {
    commands: []
}

export function Header(props: HeaderInfo) {

const componentProps = {...DEFAULT_PROPS, ...props}

    const dispatch = useAppDispatch();

    function renderCommand(command: HeaderCommand) {
        return (<Tooltip title={command.tooltip}>
            <Button variant="contained" onClick={() => dispatch(command.action)}>{command.name}</Button>
        </Tooltip>)
    }

    return (
        <div className={styles.header}>
            <div className={styles.headerText}>{componentProps.title}
            </div>
            <div className="headerCommands">
                {componentProps.commands.map((command) => renderCommand(command))}

            </div>
        </div>
    )
}
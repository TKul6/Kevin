import { Action } from "@reduxjs/toolkit";
import styles from "./header.module.css";


export interface HeaderInfo {
    title: string;
    children?: any;
}

export interface HeaderCommand {
    name: string;
    tooltip: String;
    action: Action;
    hidden: boolean;
}



export function Header(props: HeaderInfo) {


    return (
        <div className={styles.header}>
            <div className={styles.headerText}>{props.title}
            </div>
            <div className="headerCommands">
                {props.children}

            </div>
        </div>
    )
}
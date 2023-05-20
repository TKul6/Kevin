import styles from "./loader.module.css";
import { LoadingStatus } from "../../types";
import { BallTriangle } from '@agney/react-loading';

export interface LoaderInfo {
    status: LoadingStatus;
    notLoadedMessage?: string;
    errorMessage?: string;
    noDataMessage?: string;
    loadingMessage?: string;
    children?: any;

}

const DEFAULT_PROPS: Partial<LoaderInfo> = {
    notLoadedMessage: "Data is not loaded yet...",
    loadingMessage: "Loading",
    errorMessage: "Error",
    noDataMessage: "No Data"
}


export function Loader(props: LoaderInfo) {



    const componentProps = { ...DEFAULT_PROPS, ...props }

    let inner = <div>Unhandled error</div>;
    switch (componentProps.status) {
        case LoadingStatus.NotLoaded:
            inner = (<div className={styles.text}>{componentProps.notLoadedMessage}</div>);
            break;
        case LoadingStatus.Loaded:
            return (<div>{props.children}</div>);
        case LoadingStatus.Failed:
            inner = (<div className={[styles.text, styles.error].join(" ")}>{componentProps.errorMessage}</div>);
            break;
        case LoadingStatus.NoData:
            inner = (<div className={styles.text}>{componentProps.noDataMessage}</div>);
            break;
        case LoadingStatus.Loading:
            inner = (<div className={styles.container}><div className={styles.loaderContainer}>
                <BallTriangle /></div> 
                <div className={styles.text}>{componentProps.loadingMessage}</div></div>);
            break;
    }

    return (
        <div className={styles.container}>{inner}</div>
    )
}
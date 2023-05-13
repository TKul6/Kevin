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
    notLoadedMessage: "No Data",
    loadingMessage: "Loading",
    errorMessage: "Error",
    noDataMessage: "No Data"
}


export function Loader(props: LoaderInfo) {



    const componentProps = { ...DEFAULT_PROPS, ...props }


switch (componentProps.status) {
    case LoadingStatus.NotLoaded:
        return (<div>{componentProps.notLoadedMessage}</div>);
    case LoadingStatus.Loaded:
        return (<div>{props.children}</div>);
    case LoadingStatus.Failed:
        return (<div className={styles.container}><div className={[styles.text, styles.error].join(" ")}>{componentProps.errorMessage}</div></div>);
    case LoadingStatus.NoData:
        return (<div>{componentProps.noDataMessage}</div>);
    case LoadingStatus.Loading:
        return (<div className={styles.container}>
            <div className={styles.loaderContainer}>
            <BallTriangle />
            </div>
            <div className={styles.text}>{componentProps.loadingMessage}</div></div>);
}

    return (
        <div>Unhandled error
        </div>
    )
}
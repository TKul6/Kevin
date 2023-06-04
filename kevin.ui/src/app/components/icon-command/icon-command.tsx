import { IconButton, Tooltip, TooltipProps } from "@mui/material";
import { Action } from "@reduxjs/toolkit";
import { useAppDispatch } from "../../hooks";



export interface IconCommandInfo {
    tooltip?: string;
    tooltipPlacement?: TooltipProps["placement"];
    fontSize?: "small" | "medium" | "large";
    ariaLabel?: string;
    action: Action;
    children: any;
    
}


const DEFAULT_PROPS: Partial<IconCommandInfo> = {
    tooltipPlacement: "top",
    tooltip: "",
    fontSize: "small",
    ariaLabel: ""

}

export function IconCommand(props: IconCommandInfo) {

const componentProps = {...DEFAULT_PROPS, ...props}

    const dispatch = useAppDispatch();

    
    return (<Tooltip title={componentProps.tooltip} placement={componentProps.tooltipPlacement}>
                      <IconButton aria-label={componentProps.ariaLabel} size={componentProps.fontSize} onClick={() => dispatch(componentProps.action)}>
                        {props.children}
                        </IconButton>
                    </Tooltip>
    )
}
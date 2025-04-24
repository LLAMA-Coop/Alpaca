"use client";

import styles from "./Tooltip.module.css";
import {
    useInteractions,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    useDismiss,
    autoUpdate,
    useHover,
    useFocus,
    useRole,
    offset,
    arrow,
    shift,
    flip,
    FloatingArrow,
    useTransitionStyles,
} from "@floating-ui/react";
import {
    isValidElement,
    createContext,
    cloneElement,
    useContext,
    forwardRef,
    useState,
    useMemo,
    useRef,
} from "react";

export function useTooltip({
    initialOpen = false,
    placement = "top",
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    gap = 4,
} = {}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const arrowRef = useRef(null);
    const ARROW_HEIGHT = 5;
    const GAP = gap || 4;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(ARROW_HEIGHT + GAP),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "start",
                padding: 10,
            }),
            shift({ padding: 10 }),
            arrow({ element: arrowRef }),
        ],
    });

    const context = data.context;

    const hover = useHover(context, {
        move: false,
        enabled: controlledOpen == null,
    });
    const focus = useFocus(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "tooltip" });

    const interactions = useInteractions([hover, focus, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            arrowRef,
            ...interactions,
            ...data,
        }),
        [open, setOpen, arrowRef, interactions, data]
    );
}

const TooltipContext = createContext(null);

export const useTooltipContext = () => {
    const context = useContext(TooltipContext);

    if (context == null) {
        throw new Error("Tooltip components must be wrapped in <Tooltip />");
    }

    return context;
};

export function Tooltip({ children, ...options }) {
    // This can accept any props as options, e.g. `placement`,
    // or other positioning options.
    const tooltip = useTooltip(options);
    return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>;
}

export const TooltipTrigger = forwardRef(function TooltipTrigger(
    { children, asChild = true, ...props },
    propRef
) {
    const context = useTooltipContext();
    const childrenRef = children.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    // `asChild` allows the user to pass any element as the anchor
    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...children.props,
                "data-state": context.open ? "open" : "closed",
            })
        );
    }

    return (
        <button
            ref={ref}
            // The user can style the trigger based on the state
            data-state={context.open ? "open" : "closed"}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const TooltipContent = forwardRef(function TooltipContent(
    { noStyle, style, big, maxWidth, ...props },
    propRef
) {
    const context = useTooltipContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    const { isMounted, styles: tStyles } = useTransitionStyles(context, {
        duration: 100,
        initial: {
            transform: "scale(0.95)",
            opacity: 0,
        },
        close: {
            transform: "scale(0.98)",
            opacity: 0,
        },
    });

    if (!isMounted) return null;

    return (
        <FloatingPortal>
            <div
                ref={ref}
                style={{
                    ...context.floatingStyles,
                    ...style,
                    zIndex: 100000,
                }}
                {...context.getFloatingProps(props)}
            >
                <div style={{ ...tStyles }}>
                    {!noStyle && (
                        <FloatingArrow
                            width={10}
                            height={5}
                            context={context}
                            fill="var(--bg-4)"
                            ref={context.arrowRef}
                        />
                    )}

                    <div
                        className={`${!noStyle && styles.container}`}
                        style={{
                            maxWidth: maxWidth || undefined,
                            fontSize: big ? "14px" : undefined,
                        }}
                    >
                        {props.children}
                    </div>
                </div>
            </div>
        </FloatingPortal>
    );
});

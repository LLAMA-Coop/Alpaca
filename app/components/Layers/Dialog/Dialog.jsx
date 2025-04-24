"use client";

import styles from "./Dialog.module.css";
import {
    FloatingFocusManager,
    useInteractions,
    FloatingOverlay,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    useDismiss,
    useClick,
    useRole,
    useId,
} from "@floating-ui/react";
import {
    useLayoutEffect,
    isValidElement,
    createContext,
    cloneElement,
    forwardRef,
    useContext,
    useState,
    useMemo,
} from "react";

export function useDialog({
    initialOpen = false,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState();
    const [descriptionId, setDescriptionId] = useState();

    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        open,
        onOpenChange: setOpen,
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, labelId, descriptionId]
    );
}

const DialogContext = createContext(null);

export const useDialogContext = () => {
    const context = useContext(DialogContext);

    if (context == null) {
        throw new Error("Dialog components must be wrapped in <Dialog />");
    }

    return context;
};

export function Dialog({ children, ...options }) {
    const dialog = useDialog(options);

    return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
}

export const DialogTrigger = forwardRef(function DialogTrigger(
    { children, asChild = false, ...props },
    propRef
) {
    const context = useDialogContext();
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

export const DialogContent = forwardRef(function DialogContent(props, propRef) {
    const { context: floatingContext, ...context } = useDialogContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);

    if (!floatingContext.open) return null;

    return (
        <FloatingPortal>
            <FloatingOverlay
                className={styles.container}
                lockScroll
            >
                <FloatingFocusManager context={floatingContext}>
                    <div
                        ref={ref}
                        className={`${styles.dialog} scrollbar`}
                        aria-labelledby={context.labelId}
                        {...context.getFloatingProps(props)}
                        aria-describedby={context.descriptionId}
                        onClick={(event) => event.stopPropagation()}
                    >
                        {props.children}
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
});

export const DialogHeading = forwardRef(function DialogHeading({ children, ...props }, ref) {
    const { setLabelId } = useDialogContext();
    const id = useId();

    // Only sets `aria-labelledby` on the Dialog root element
    // if this component is mounted inside it.
    useLayoutEffect(() => {
        setLabelId(id);
        return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
        <header className={styles.header}>
            <h2
                {...props}
                ref={ref}
                id={id}
            >
                {children}
            </h2>

            <DialogClose className={styles.close} />
        </header>
    );
});

export const DialogDescription = forwardRef(function DialogDescription(
    { children, ...props },
    ref
) {
    const { setDescriptionId } = useDialogContext();
    const id = useId();

    // Only sets `aria-describedby` on the Dialog root element
    // if this component is mounted inside it.
    useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
        <p
            {...props}
            ref={ref}
            id={id}
            className={styles.description}
        >
            {children}
        </p>
    );
});

export const DialogClose = forwardRef(function DialogClose(props, ref) {
    const { setOpen } = useDialogContext();

    return (
        <button
            type="button"
            {...props}
            ref={ref}
            onClick={() => setOpen(false)}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512.021 512.021"
                fill="currentColor"
                height="14"
                width="14"
                x="0px"
                y="0px"
            >
                <g>
                    <path d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0   L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376   c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387   c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z" />
                </g>
            </svg>
        </button>
    );
});

export const DialogButtons = forwardRef(function DialogButtons({ children, ...props }, ref) {
    return (
        <footer
            {...props}
            ref={ref}
            className={styles.buttons}
        >
            {children}
        </footer>
    );
});

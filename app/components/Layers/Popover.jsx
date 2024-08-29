"use client";

import {
    isValidElement,
    createContext,
    cloneElement,
    useContext,
    forwardRef,
    useState,
    useMemo,
} from "react";
import {
    FloatingFocusManager,
    useInteractions,
    FloatingPortal,
    useMergeRefs,
    useFloating,
    autoUpdate,
    useDismiss,
    useClick,
    useRole,
    offset,
    shift,
    flip,
} from "@floating-ui/react";

import { Menu } from "./Menu";

export function usePopover({
    initialOpen = false,
    placement = "bottom-end",
    modal,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    show,
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
    const [labelId, setLabelId] = useState();
    const [descriptionId, setDescriptionId] = useState();

    const open = (controlledOpen ?? uncontrolledOpen) && (show ?? true);
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const data = useFloating({
        placement,
        open,
        onOpenChange: setOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(10),
            flip({
                crossAxis: placement.includes("-"),
                fallbackAxisSideDirection: "end",
                padding: 5,
            }),
            shift({ padding: 10 }),
        ],
    });

    const context = data.context;

    const click = useClick(context, {
        enabled: controlledOpen == null,
    });
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const interactions = useInteractions([click, dismiss, role]);

    return useMemo(
        () => ({
            open,
            setOpen,
            ...interactions,
            ...data,
            modal,
            labelId,
            descriptionId,
            setLabelId,
            setDescriptionId,
        }),
        [open, setOpen, interactions, data, modal, labelId, descriptionId],
    );
}

const PopoverContext = createContext(null);

export const usePopoverContext = () => {
    const context = useContext(PopoverContext);

    if (context == null) {
        throw new Error("Popover components must be wrapped in <Popover />");
    }

    return context;
};

export function Popover({ children, modal = false, ...restOptions }) {
    const popover = usePopover({ modal, ...restOptions });
    return (
        <PopoverContext.Provider value={popover}>
            {children}
        </PopoverContext.Provider>
    );
}

export const PopoverTrigger = forwardRef(function PopoverTrigger(
    { children, asChild = true, ...props },
    propRef,
) {
    const context = usePopoverContext();
    const childrenRef = children.ref;
    const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

    if (asChild && isValidElement(children)) {
        return cloneElement(
            children,
            context.getReferenceProps({
                ref,
                ...props,
                ...children.props,
                "data-state": context.open ? "open" : "closed",
            }),
        );
    }

    return (
        <button
            ref={ref}
            type="button"
            data-state={context.open ? "open" : "closed"}
            {...context.getReferenceProps(props)}
        >
            {children}
        </button>
    );
});

export const PopoverContent = forwardRef(function PopoverContent(
    { style, ...props },
    propRef,
) {
    const { context: floatingContext, ...context } = usePopoverContext();
    const ref = useMergeRefs([context.refs.setFloating, propRef]);
    const { setOpen } = usePopoverContext();

    if (!floatingContext.open) return null;

    const elProps = { ...context.getFloatingProps(props) };

    if (elProps.isMenu || elProps.items) {
        delete elProps.isMenu;
        delete elProps.items;
    }

    return (
        <FloatingPortal>
            <FloatingFocusManager
                context={floatingContext}
                modal={context.modal}
            >
                <div
                    ref={ref}
                    style={{ ...context.floatingStyles, ...style }}
                    aria-labelledby={context.labelId}
                    aria-describedby={context.descriptionId}
                    {...elProps}
                >
                    {props.isMenu ? (
                        <Menu
                            items={props.items || []}
                            close={() => setOpen(false)}
                        />
                    ) : (
                        props.children
                    )}
                </div>
            </FloatingFocusManager>
        </FloatingPortal>
    );
});

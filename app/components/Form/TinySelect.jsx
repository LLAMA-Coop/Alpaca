"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    FloatingFocusManager,
    useListNavigation,
    useInteractions,
    useTypeahead,
    FloatingList,
    useListItem,
    useFloating,
    autoUpdate,
    useDismiss,
    useClick,
    useRole,
    flip,
} from "@floating-ui/react";
import styles from "./TinySelect.module.css";

const SelectContext = createContext({});

export function TinySelect({ options, value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(options.indexOf(value));
    const [selectedLabel, setSelectedLabel] = useState(selectedIndex);

    useEffect(() => {
        setSelectedIndex(options.indexOf(value));
        setSelectedLabel(value);
    }, [value]);

    const { refs, floatingStyles, context } = useFloating({
        placement: "bottom",
        open: isOpen,
        strategy: "absolute",
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        middleware: [flip()],
    });

    const elementsRef = useRef([]);
    const labelsRef = useRef([]);

    const handleSelect = useCallback((index) => {
        setSelectedIndex(index);
        setIsOpen(false);

        if (index !== null) {
            setSelectedLabel(labelsRef.current[index]);
            onChange(labelsRef.current[index]);
        }
    }, []);

    function handleTypeaheadMatch(index) {
        if (isOpen) {
            setActiveIndex(index);
        } else {
            handleSelect(index);
        }
    }

    const listNav = useListNavigation(context, {
        listRef: elementsRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
    });

    const typeahead = useTypeahead(context, {
        listRef: labelsRef,
        activeIndex,
        selectedIndex,
        onMatch: handleTypeaheadMatch,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "listbox" });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        listNav,
        typeahead,
        click,
        dismiss,
        role,
    ]);

    const selectContext = useMemo(
        () => ({
            activeIndex,
            selectedIndex,
            getItemProps,
            handleSelect,
        }),
        [activeIndex, selectedIndex, getItemProps, handleSelect]
    );

    return (
        <>
            <div
                tabIndex={0}
                ref={refs.setReference}
                {...getReferenceProps()}
                className={styles.select}
            >
                {selectedLabel}
            </div>

            <SelectContext.Provider value={selectContext}>
                {isOpen && (
                    <FloatingFocusManager
                        modal={false}
                        context={context}
                    >
                        <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            {...getFloatingProps()}
                            className={styles.list}
                        >
                            <FloatingList
                                labelsRef={labelsRef}
                                elementsRef={elementsRef}
                            >
                                {options.map((label) => (
                                    <Option
                                        key={label}
                                        label={label}
                                    />
                                ))}
                            </FloatingList>
                        </div>
                    </FloatingFocusManager>
                )}
            </SelectContext.Provider>
        </>
    );
}

function Option({ label }) {
    const { activeIndex, selectedIndex, getItemProps, handleSelect } = useContext(SelectContext);

    const { ref, index } = useListItem({ label });

    const isActive = activeIndex === index;
    const isSelected = selectedIndex === index;

    return (
        <button
            ref={ref}
            role="option"
            className={styles.option}
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive && isSelected}
            {...getItemProps({
                onClick: () => handleSelect(index),
            })}
        >
            {label}
        </button>
    );
}

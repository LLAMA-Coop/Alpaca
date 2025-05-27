"use client";

import { getNanoId } from "@/lib/random";
import styles from "./Input.module.css";
import { Input } from "./Input";
import {
  FloatingFocusManager,
  useListNavigation,
  useInteractions,
  FloatingList,
  useTypeahead,
  useListItem,
  useFloating,
  autoUpdate,
  useDismiss,
  useClick,
  useRole,
  offset,
  flip,
} from "@floating-ui/react";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useMemo,
  useRef,
} from "react";

//

// TO FIX:
// 1. Floating UI hook expects options layer to be closed once an option has been selected.
//    But if the select is a multiple select, the enter key should still work to select an option.
//    Instead it keeps the layer open but doesn't do anything.

//

/**
 *
 * @param {Object} props The props for the Select component.
 * @param {string} label The label for the input field.
 * @param {string} value The current value of the input field.
 * @param {Array} data Tue current value of the input if it is a multiple select.
 * @param {boolean} multiple If the input is a multiple select.
 * @param {Array} options The options for the select component.
 * @param {string} error The error message to display.
 * @param {string} description The description to display.
 * @param {boolean} skeleton If the input should be rendered as a skeleton.
 * @param {string} itemValue The field of the option object that is the value.
 * @param {string} itemLabel The field of the option object that is the label.
 * @param {Function} setter The function to set the value of the input.
 * @returns
 *
 * @description The Select component is a wrapper around the Input component that provides a dropdown list of options.
 *
 * @example The Select component can be used for a single select.
 *
 * <Select
 *    value={type}
 *    setter={setTypes}
 *    label="Select Type"
 *    options={typeOptions}
 *    placeholder="Select a type"
 * />
 *
 * @example But it can also be used for a multiple select.
 *
 * <Select
 *    multiple
 *    data={types}
 *    setter={setTypes}
 *    label="Select Type"
 *    options={typeOptions}
 *    placeholder="Select a type"
 * />
 */
export function Select({ ...props }) {
  return <Input {...props} select />;
}

const SelectContext = createContext({});

export function SelectElement({
  id,
  children,
  value,
  options,
  props,
  label,
  multiple,
  data,
  error,
  itemValue,
  itemLabel,
  notObject,
  setter,
  description,
  success,
  disabled,
  darker,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(
    multiple
      ? []
      : options.findIndex((o) => (notObject ? o === label : o.value === label))
  );
  const [selectedLabel, setSelectedLabel] = useState(multiple ? [] : value);

  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [flip(), offset(8)],
  });

  const elementsRef = useRef([]);
  const labelsRef = useRef([]);

  const handleSelect = useCallback(
    (index) => {
      setSelectedIndex(index);

      if (!multiple) {
        setIsOpen(false);
      }

      if (index !== null) {
        setSelectedLabel(labelsRef.current[index]);

        if (multiple) {
          if (
            data.find((t) => {
              if (!t) return false;
              return notObject
                ? t === options[index]
                : options[index] && t[itemValue] === options[index][itemValue];
            })
          ) {
            setter(
              data.filter((t) => {
                if (!t) return false;
                return notObject
                  ? t !== options[index]
                  : options[index] && t[itemValue] !== options[index][itemValue];
              })
            );
          } else {
            setter([...data, options[index]]);
          }
        } else {
          props.onChange(
            notObject ? options[index] : options[index][itemValue]
          );
        }
      }
    },
    [data, options, multiple, setter, props, itemValue, notObject]
  );

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

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [listNav, typeahead, click, dismiss, role]
  );

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
    <div
      className={`${styles.container} ${disabled ? styles.disabled : ""}`}
      style={{ opacity: success ? 0.8 : "" }}
    >
      <label htmlFor={id} className={styles.label}>
        {label}

        {(props.required || error) && (
          <span className={styles.required}>*</span>
        )}

        {error && (
          <span id={`${id}-error`} className={styles.error}>
            {" "}
            {error}
          </span>
        )}

        {success && <span className={styles.success}>{success}</span>}
      </label>

      <div
        tabIndex={0}
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`${styles.wrapper} ${multiple ? styles.multiple : ""} ${styles.select} ${isOpen ? styles.active : ""}`}
        style={{
          backgroundColor: darker ? "var(--bg-1)" : "",
          borderColor: success
            ? "var(--success-50)"
            : error
              ? "var(--danger-50)"
              : "",
          "--bs-1": success
            ? "var(--success)"
            : error
              ? "var(--danger-20)"
              : "",
          "--bs-2": success
            ? "var(--success)"
            : error
              ? "var(--danger-08)"
              : "",
        }}
      >
        {multiple &&
          !!data.length &&
          data.map((item) => (
            <span
              key={getNanoId()}
              className={styles.chip}
              onClick={(e) => {
                e.stopPropagation();
                setter(
                  data.filter((t) => {
                    if (!t) return false;
                    return notObject
                      ? t !== item
                      : t[itemValue] !== item[itemValue];
                  })
                );
              }}
            >
              <span>{notObject || !item ? item : item[itemValue]}</span>

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                height="12"
                width="12"
              >
                <rect x="6" y="11" width="12" height="2" rx="1" />
              </svg>
            </span>
          ))}

        <div
          className={`${styles.selected} ${!multiple ? styles.isValue : ""}`}
        >
          {multiple
            ? props.placeholder
            : notObject
              ? options.find((o) => o[itemValue] === value)
              : options.find((o) => o[itemValue] === value)?.[itemLabel] ||
                props.placeholder}
        </div>

        <div className={styles.selectButton}>
          <svg viewBox="0 0 24 24" fill="currentColor" height="12" width="12">
            <path d="m2.772,9.567c-.589-.583-.595-1.532-.012-2.122L8.812,1.324c.855-.856,1.985-1.324,3.188-1.324s2.332.468,3.182,1.318l6.058,6.127c.583.589.577,1.539-.012,2.122-.292.289-.674.433-1.055.433-.387,0-.773-.148-1.066-.445l-6.052-6.121c-.555-.555-1.549-.561-2.115.006l-6.046,6.115c-.582.589-1.533.594-2.121.012Zm16.334,4.878l-6.046,6.115c-.566.566-1.561.561-2.115.006l-6.052-6.121c-.582-.59-1.533-.594-2.121-.012-.589.582-.595,1.532-.012,2.121l6.058,6.127c.85.851,1.979,1.318,3.182,1.318s2.332-.468,3.188-1.324l6.052-6.121c.583-.589.577-1.539-.012-2.121s-1.539-.578-2.121.012Z" />
          </svg>
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      {!disabled && (
        <SelectContext.Provider value={selectContext}>
          {isOpen && (
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={{
                  ...floatingStyles,
                  // Needs to be width of the reference element
                  width: refs.reference?.current?.offsetWidth,
                }}
                {...getFloatingProps()}
                className={styles.options}
              >
                <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
                  {children}
                </FloatingList>
              </div>
            </FloatingFocusManager>
          )}
        </SelectContext.Provider>
      )}
    </div>
  );
}

export function Option({ label, active, multiple }) {
  const { activeIndex, selectedIndex, getItemProps, handleSelect } =
    useContext(SelectContext);

  const { ref, index } = useListItem({ label });

  const isActive = activeIndex === index;
  const isSelected = selectedIndex === index;

  return (
    <button
      ref={ref}
      role="option"
      tabIndex={isActive ? 0 : -1}
      aria-selected={isActive && isSelected}
      className={`${styles.option} ${isActive ? styles.active : ""} ${isSelected ? styles.selected : ""}`}
      {...getItemProps({
        onClick: () => handleSelect(index),
      })}
    >
      <p>{label}</p>

      {((isSelected && !multiple) || active) && (
        <svg
          viewBox="0 0 507.506 507.506"
          fill="currentColor"
          height="14"
          width="14"
          x="0px"
          y="0px"
        >
          <g>
            <path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0   c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0   c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z" />
          </g>
        </svg>
      )}
    </button>
  );
}

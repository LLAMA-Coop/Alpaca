"use client";
import {
  faAdd,
  faArrowRight,
  faSubtract,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Form.module.css";
import Link from "next/link";
import { useState } from "react";

export const Label = ({ required, error, label, htmlFor }) => {
  return (
    <div className={styles.labelContainer}>
      <label htmlFor={htmlFor}>
        {label} {required && <span>*</span>}
      </label>
      {error && <span>{error}</span>}
    </div>
  );
};

export const Input = ({
  id,
  type,
  choices,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
  onSubmit,
  onKeyUp,
  onEnter,
  disabled,
  outlineColor,
}) => {
  return (
    <div
      className={styles.inputContainer}
      style={{
        opacity: disabled ? "0.3" : "",
        cursor: disabled ? "not-allowed" : "",
      }}
    >
      {label && (
        <Label
          required={required}
          error={error}
          label={label}
          htmlFor={id ?? label}
        />
      )}

      <div
        style={{
          pointerEvents: disabled ? "none" : "",
        }}
      >
        {type === "select" && choices ? (
          <select
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            value={value || ""}
            style={{
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          >
            {choices.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id ?? label}
            type={type || "text"}
            required={required}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyUp={onKeyUp}
            value={value || ""}
            style={{
              paddingRight: onSubmit ? "44px" : "",
              outlineColor: outlineColor || "",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSubmit) onSubmit(e);
              if (e.key === "Enter" && onEnter) onEnter(e);
            }}
          />
        )}

        {onSubmit && (
          <button
            className={styles.submitButton}
            onClick={(e) => onSubmit(e)}
            title={label}
          >
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </div>
  );
};

export const TextArea = ({
  id,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
}) => {
  return (
    <div className={styles.inputContainer}>
      {label && (
        <Label
          required={required}
          error={error}
          htmlFor={id ?? label}
          label={label}
        />
      )}

      <textarea
        id={id ?? label}
        className="thinScroller"
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value || ""}
      />
    </div>
  );
};

export const ListItem = ({ item, action, actionType, link }) => {
  let label;
  if (actionType === "add") {
    label = "Add item";
  }
  if (actionType === "delete") {
    label = "Delete item";
  }
  if (!action && link) {
    label = item;
  }

  const content = (
    <div className={styles.itemContent}>
      <span>{item}</span>

      {action && (
        <button
          className={styles.action}
          title={label}
          onClick={(e) => {
            e.preventDefault();
            action();
          }}
        >
          <FontAwesomeIcon icon={actionType === "add" ? faAdd : faSubtract} />
        </button>
      )}

      {link && !action && (
        <button className={styles.action} title={label} onClick={action}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
    </div>
  );

  if (link)
    return (
      <li>
        <Link href={link} target="_blank" className={styles.listItem}>
          {content}
        </Link>
      </li>
    );

  return <li className={styles.listItem}>{content}</li>;
};

export const Details = ({ summary, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={isOpen ? "open" : ""}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        {summary}
      </button>
      <div>{isOpen && children}</div>
    </div>
  );
};

export const Select = ({
  listChosen,
  listChoices,
  listProperty,
  listSetter,
}) => {
  console.log("In Select");
  return (
    <div
      className={`${styles.picker} thinScroller`}
      onClick={(e) => e.stopPropagation()}
    >
      {console.log("It is returning", listChoices)}
      {listChoices.map((choice) => (
        <div
          key={choice._id}
          className={
            listChosen.find((x) => x._id === choice._id) ? styles.selected : ""
          }
          onClick={() => {
            if (!listChosen.find((x) => x._id === choice._id)) {
              listSetter([...listChosen, choice]);
            } else {
              listSetter(listChosen.filter((x) => x._id !== choice._id));
            }
          }}
        >
          {choice[listProperty]}
        </div>
      ))}

      {listChoices.length === 0 && (
        <div className={styles.emptyList}>No choices available</div>
      )}
    </div>
  );
};

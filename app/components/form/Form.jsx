import {
  faAdd,
  faArrowRight,
  faSubtract,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Form.module.css";
import Link from "next/link";

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
      className={styles.container}
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
        className={styles.inputContainer}
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
    <div className={styles.container}>
      {label && (
        <Label
          required={required}
          error={error}
          htmlFor={id ?? label}
          label={label}
        />
      )}

      <div className={styles.inputContainer}>
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

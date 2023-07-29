import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Input.module.css";
import { faAdd, faSubtract } from "@fortawesome/free-solid-svg-icons";

export const Label = ({ required, error, label }) => {
  return (
    <div className={styles.labelContainer}>
      <label>
        {label} {required && <span>*</span>}
      </label>
      {error && <span>{error}</span>}
    </div>
  );
};

export const Input = ({
  type,
  required,
  onChange,
  value,
  error,
  label,
  onFocus,
  onBlur,
  onSubmit,
  onKeyUp,
}) => {
  return (
    <div className={styles.inputContainer}>
      {label && <Label required={required} error={error} label={label} />}

      <div>
        <input
          type={type || "text"}
          required={required}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          value={value || ""}
          style={{
            paddingRight: onSubmit ? "44px" : "",
          }}
        />

        {onSubmit && (
          <button className={styles.submitButton} onClick={(e) => onSubmit(e)}>
            <FontAwesomeIcon icon={faAdd} />
          </button>
        )}
      </div>
    </div>
  );
};

export const ListItem = ({ item, onDelete }) => {
  return (
    <li className={styles.inputContainer}>
      <div>
        <span 
          style={{
            padding: onDelete ? "0 44px 0 4px" : "",
          }}>{item}</span>
        {onDelete && (
          <button className={styles.submitButton} onClick={onDelete}>
            <FontAwesomeIcon icon={faSubtract}></FontAwesomeIcon>
          </button>
        )}
      </div>
    </li>
  );
};

export const TextArea = ({
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
      {label && <Label required={required} error={error} label={label} />}

      <textarea
        required={required}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value || ""}
      />
    </div>
  );
};

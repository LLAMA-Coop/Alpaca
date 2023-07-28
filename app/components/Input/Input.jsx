import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Input.module.css';
import { faAdd } from '@fortawesome/free-solid-svg-icons';

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

export const Input = ({ type, required, onChange, value, error, label, onFocus, onBlur, onSubmit }) => {
    return (
        <div className={styles.inputContainer}>
            {label && (
                <Label required={required} error={error} label={label} />
            )}

            <div>
                <input
                    type={type || "text"}
                    required={required}
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    value={value || ''}
                    style={{
                        paddingRight: onSubmit ? '44px' : ''
                    }}
                />

                {onSubmit && (
                    <div className={styles.submitButton} onClick={(e) => onSubmit(e)}>
                        <div>
                            <FontAwesomeIcon icon={faAdd} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const TextArea = ({ required, onChange, value, error, label, onFocus, onBlur }) => {
    return (
        <div className={styles.inputContainer}>
            {label && (
                <Label required={required} error={error} label={label} />
            )}

            <textarea
                required={required}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                value={value || ''}
            />
        </div>
    );
};

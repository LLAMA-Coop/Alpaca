import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Card.module.css";

export const Card = ({
  title,
  description,
  image,
  url,
  urlLabel,
  buttons,
  children,
  border,
}) => {
  return (
    <div className={styles.container}>
      <div
        style={{
          background:
            border === "green"
              ? `linear-gradient(
        var(--gradient-angle),
        var(--accent-tertiary-outline),
        hsla(0, 0%, 100%, 0.1),
        var(--accent-tertiary-1),
        hsla(0, 0%, 100%, 0.3)
      )`
              : border === "red"
              ? `linear-gradient(
        var(--gradient-angle),
        var(--accent-secondary-outline),
        hsla(0, 0%, 100%, 0.1),
        var(--accent-secondary-1),
        hsla(0, 0%, 100%, 0.3)
      )`
              : "",
        }}
      />

      <div className={styles.content}>
        {image && (
          <div>
            <img src={image} alt={title} />
          </div>
        )}

        {(title || description) && (
          <div className={styles.textContent}>
            {title && <header>{title}</header>}
            {description && <p>{description}</p>}
          </div>
        )}

        <div className={styles.childrenContent}>{children}</div>

        {buttons?.length > 0 && (
          <div className={styles.buttonContainer}>
            {buttons.map((button) => {
              if (button.link) {
                return (
                  <a
                    href={button.link}
                    target="_blank"
                    rel="noreferrer"
                    className={button.color}
                  >
                    {button.label}

                    {button.icon && <FontAwesomeIcon icon={button.icon} />}
                  </a>
                );
              } else {
                return (
                  <button onClick={button.onClick} className={button.color}>
                    {button.label}{" "}
                    {button.icon && <FontAwesomeIcon icon={button.icon} />}
                  </button>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

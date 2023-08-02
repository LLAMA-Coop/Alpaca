"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./Select.module.css";

export function Select({ listChosen, listChoices, listProperty, listSetter }) {
  return (
    <div
      className={`${styles.picker} thinScroller`}
      onClick={(e) => e.stopPropagation()}
    >
      {listChoices.map((choice) => {
        const isChosen = listChosen.find((x) => x._id === choice._id);
        return (
          <div
            className={`${isChosen && styles.chosen}`}
            key={choice._id}
            onClick={() => {
              if (!listChosen.find((x) => x._id === choice._id)) {
                listSetter([...listChosen, choice]);
              } else {
                listSetter(listChosen.filter((x) => x._id !== choice._id));
              }
            }}
          >
            <span title={choice[listProperty]}>{choice[listProperty]}</span>

            <div className={styles.checkbox}>
              {isChosen && <FontAwesomeIcon icon={faCheck} />}
            </div>
          </div>
        );
      })}

      {listChoices.length === 0 && (
        <div className={styles.emptyList}>No choices available</div>
      )}
    </div>
  );
}

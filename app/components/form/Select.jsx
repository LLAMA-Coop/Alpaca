"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "./Select.module.css";
import { useEffect } from "react";

export function Select({
    listChosen,
    listChoices,
    listProperty,
    listSetter,
    disabled,
    setSelectState,
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setSelectState(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const clickEvent = (choice) => {
        if (!listChosen.find((x) => x._id === choice._id)) {
            listSetter([...listChosen, choice]);
        } else {
            listSetter(listChosen.filter((x) => x._id !== choice._id));
        }
    };

    if (disabled) return;

    return (
        <div
            aria-modal="true"
            className={`${styles.picker} thinScroller`}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                role="listbox"
                aria-multiselectable="true"
                aria-orientation="vertical"
            >
                {listChoices &&
                    listChoices.map((choice, index) => {
                        if(!choice) return;
                        const isChosen =
                            listChosen.find((x) => {
                                if (!x) return false;
                                return x._id === choice._id;
                            }) != undefined;

                        let prop;
                        if (Array.isArray(listProperty)) {
                            prop = listProperty.find((p) => choice[p]);
                            if (!prop) prop = "_id";
                        } else {
                            prop = listProperty;
                        }

                        return (
                            <div
                                key={choice._id}
                                tabIndex={0}
                                role="option"
                                aria-selected={isChosen}
                                aria-setsize={listChoices.length}
                                aria-posinset={index + 1}
                                className={styles.item}
                                onClick={() => clickEvent(choice)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        clickEvent(choice);
                                    }
                                }}
                            >
                                <span title={choice[prop]}>{choice[prop]}</span>

                                <div
                                    role="checkbox"
                                    aria-checked={isChosen}
                                    className={styles.checkbox}
                                >
                                    {isChosen && (
                                        <FontAwesomeIcon icon={faCheck} />
                                    )}
                                </div>
                            </div>
                        );
                    })}

                {(!listChoices || listChoices.length === 0) && (
                    <div
                        aria-labelledby="emptyList"
                        className={styles.item + " " + styles.disabled}
                    >
                        No choices available
                    </div>
                )}
            </div>
        </div>
    );
}

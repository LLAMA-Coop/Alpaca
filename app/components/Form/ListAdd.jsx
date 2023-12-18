"use client";

import { ListItem, Select, Input } from "@client";
import { useState, useEffect, useRef } from "react";

export function ListAdd({
    item,
    listChoices,
    listChosen,
    listProperty,
    listSetter,
    createNew,
    type,
    disabled,
    messageIfNone
}) {
    const [filter, setFilter] = useState("");
    const [filteredChoices, setFilteredChoices] = useState(listChoices);
    const [showSelect, setShowSelect] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        if (!listChoices || !listChoices.length) return;
        setFilteredChoices(
            listChoices.filter((choice) => {
                const pattern = new RegExp(filter, "i");
                return pattern.test(choice[listProperty]);
            }),
        );
    }, [filter, listChoices]);

    useEffect(() => {
        if (!selectRef.current) return;
        const handleClickOutside = (e) => {
            if (!selectRef.current.contains(e.target)) {
                setShowSelect(false);
            }
        };

        const handleBlur = (e) => {
            setTimeout(() => {
                if (!selectRef.current.contains(document.activeElement)) {
                    setShowSelect(false);
                }
            }, 0);
        };

        document.addEventListener("mousedown", handleClickOutside);
        selectRef.current.addEventListener("focusout", handleBlur);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if(selectRef && selectRef.current) selectRef.current.removeEventListener("focusout", handleBlur);
        };
    }, [showSelect]);

    if (type === "datalist")
        return (
            <div style={{ position: "relative" }} ref={selectRef}>
                <ol
                    className={`chipList ${disabled ? "disabled" : ""}`}
                    style={{
                        opacity: disabled ? "0.3" : "",
                        cursor: disabled ? "not-allowed" : "",
                    }}
                >
                    {messageIfNone && listChosen.length === 0 && <ListItem item={messageIfNone} />}

                    {listChosen.length > 0 &&
                        listChosen.map((choice) => {
                            if (!choice) return;

                            let prop;
                            if (Array.isArray(listProperty)) {
                                prop = listProperty.find((p) => choice[p]);
                                if (!prop) prop = "_id";
                            } else {
                                prop = listProperty;
                            }

                            return (
                                <ListItem
                                    key={choice._id}
                                    link={choice.url ? choice.url : undefined}
                                    item={choice[prop]}
                                    action={() => {
                                        listSetter(
                                            listChosen.filter(
                                                (x) => x._id !== choice._id,
                                            ),
                                        );
                                    }}
                                    actionType={"delete"}
                                />
                            );
                        })}
                </ol>

                <Input
                    label={item}
                    value={filter}
                    autoComplete="off"
                    onChange={(e) => {
                        setFilter(e.target.value);
                        if (e.target.value.length) {
                            setShowSelect(true);
                        } else {
                            setShowSelect(false);
                        }
                    }}
                    action="Add Tag"
                    onFocus={() => setShowSelect(true)}
                    onActionTrigger={() => {
                        if (
                            filteredChoices.length === 1 &&
                            !listChosen.includes(filteredChoices[0])
                        ) {
                            listSetter([...listChosen, filteredChoices[0]]);
                        }
                    }}
                />

                {showSelect && (
                    <Select
                        listChoices={filteredChoices}
                        listChosen={listChosen}
                        listProperty={listProperty}
                        listSetter={listSetter}
                        createNew={createNew}
                        disabled={disabled}
                        onBlur={() => setShowSelect(false)}
                    />
                )}
            </div>
        );

    return (
        <ol
            className={`chipList ${disabled ? "disabled" : ""}`}
            style={{
                opacity: disabled ? "0.3" : "",
                cursor: disabled ? "not-allowed" : "",
            }}
        >
            <ListItem
                item={item}
                actionType={"add"}
                select={
                    <Select
                        listChoices={listChoices}
                        listChosen={listChosen}
                        listProperty={listProperty}
                        listSetter={listSetter}
                        createNew={createNew}
                        disabled={disabled}
                    />
                }
                disabled={disabled}
            />

            {listChosen.length > 0 &&
                listChosen.map((choice) => {
                    if (!choice) return;

                    let prop;
                    if (Array.isArray(listProperty)) {
                        prop = listProperty.find((p) => choice[p]);
                        if (!prop) prop = "_id";
                    } else {
                        prop = listProperty;
                    }

                    return (
                        <ListItem
                            key={choice._id}
                            link={choice.url ? choice.url : undefined}
                            item={choice[prop]}
                            action={() => {
                                listSetter(
                                    listChosen.filter(
                                        (x) => x._id !== choice._id,
                                    ),
                                );
                            }}
                            actionType={"delete"}
                        />
                    );
                })}
        </ol>
    );
}

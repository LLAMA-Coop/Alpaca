"use client";

import { ListItem, Select } from "@client";

export function ListAdd({
    item,
    listChoices,
    listChosen,
    listProperty,
    listSetter,
    disabled,
}) {
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

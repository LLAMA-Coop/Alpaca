"use client";

import { ListItem, Select } from "@/app/components/client";

export default function ListAdd({
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
                    return (
                        <ListItem
                            key={choice._id}
                            link={choice.url ? choice.url : undefined}
                            item={choice[listProperty]}
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

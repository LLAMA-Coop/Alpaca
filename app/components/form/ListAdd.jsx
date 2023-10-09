"use client";

import { ListItem, Select } from "@/app/components/client";
// import { useState } from "react";

export default function ListAdd({
    item,
    listChoices,
    listChosen,
    listProperty,
    listSetter,
    disabled,
}) {
    // const [isSelectOpen, setIsSelectOpen] = useState(false);

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
                // action={() => setIsSelectOpen((prev) => !prev)}
                actionType={"add"}
                select={
                    <Select
                        listChoices={listChoices}
                        listChosen={listChosen}
                        listProperty={listProperty}
                        listSetter={listSetter}
                        disabled={disabled}
                        // setSelectState={setIsSelectOpen}
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
                                        (x) => x.id !== choice.id,
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

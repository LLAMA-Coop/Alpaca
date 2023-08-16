"use client";

import { ListItem, Select } from "@/app/components/client";
import { useState, useEffect, useRef } from "react";

export default function ListAdd({
    item,
    listChoices,
    listChosen,
    listProperty,
    listSetter,
}) {
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const listAddRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isSelectOpen && !listAddRef.current?.contains(e.target)) {
                setIsSelectOpen(false);
            }
        };

        document.addEventListener("click", handleOutsideClick);
    }, [isSelectOpen]);

    return (
        <ol className="chipList">
            <ListItem
                item={item}
                action={() => setIsSelectOpen((prev) => !prev)}
                actionType={"add"}
                select={
                    <Select
                        ref={listAddRef}
                        listChoices={listChoices}
                        listChosen={listChosen}
                        listProperty={listProperty}
                        listSetter={listSetter}
                        setSelectState={setIsSelectOpen}
                    />
                }
            />

            {listChosen.length > 0 &&
                listChosen.map((choice) => (
                    <ListItem
                        key={choice.id}
                        link={choice.url ? choice.url : undefined}
                        item={choice[listProperty]}
                        action={() => {
                            listSetter(
                                listChosen.filter((x) => x.id !== choice.id),
                            );
                        }}
                        actionType={"delete"}
                    />
                ))}
        </ol>
    );
}

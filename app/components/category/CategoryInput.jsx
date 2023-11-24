"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { DeletePopup } from "../delete-popup/DeletePopup";
import MAX from "@/lib/max";
import { serializeOne } from "@/lib/db";

export function CategoryInput({ category }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [permissions, setPermissions] = useState("");

    const [subcategoryOf, setSubcategoryOf] = useState([]);
    const [prerequisites, setPrerequisites] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const availableCategories = useStore((state) => state.categoryStore);

    useEffect(() => {
        if (!category) return;
        setName(category.name);
        setDescription(category.description);

        setSubcategoryOf(
            category.subcategoryOf.map((catId) =>
                availableCategories.find((x) => x._id === catId),
            ),
        );

        setPrerequisites(
            category.prerequisites.map((catId) =>
                availableCategories.find((x) => x._id === catId),
            ),
        );

        if (category.permissions)
            setPermissions(serializeOne(category.permissions));
    }, []);

    return (
        <div className="formGrid">
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <Input
                required={true}
                onChange={(e) => {
                    setName(e.target.value);
                }}
                value={name}
                label={"Name"}
                maxLength={MAX.title}
            />
        </div>
    );
}

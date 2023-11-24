"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/store";
import { DeletePopup } from "../delete-popup/DeletePopup";
import MAX from "@/lib/max";
import { serializeOne } from "@/lib/db";
import { Input, InputPopup, Label, Spinner, Alert } from "../client";
import ListAdd from "../form/ListAdd";
import PermissionsInput from "../form/PermissionsInput";

export function CategoryInput({ category }) {
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [description, setDescription] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const [permissions, setPermissions] = useState("");

    const [subcategoryOf, setSubcategoryOf] = useState([]);
    const [prerequisites, setPrerequisites] = useState([]);

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const availableCategories = useStore((state) => state.categoryStore);
    const user = useStore((state) => state.user);
    const canDelete = category && user && category.createdBy === user._id;

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

    async function handleSubmit(e) {
        e.preventDefault();

        if (name.length === 0) {
            setNameError(
                `Category name must be between 1 and ${MAX.name} characters`,
            );
        }
        if (description.length === 0) {
            setDescriptionError(
                `Category description must be between 1 and ${MAX.description} characters`,
            );
        }
        if (name.length === 0 || description.length === 0) {
            return;
        }

        const catPayload = {
            name,
            description,
            subcategoryOf: subcategoryOf.map((cat) => cat._id),
            prerequisites: prerequisites.map((cat) => cat._id),
        };
        catPayload.permissions = permissions;
        if (category) {
            // this will change to implement PATCH in /[id]/route.js
            catPayload._id = category._id;
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/category`,
            {
                method: category ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(catPayload),
            },
        );

        setLoading(false);

        if (response.status === 201) {
            setName("");
            setDescription("");

            setRequestStatus({
                success: true,
                message: "Category added successfully",
            });
            setShowAlert(true);
        } else if (response.status === 200) {
            setRequestStatus({
                success: true,
                message: "Category edited successfully",
            });
            setShowAlert(true);
        } else {
            // need to add alert if not signed in
            // later add signin popup
            setRequestStatus({
                success: false,
                message: "Something went wrong",
            });
            setShowAlert(true);
        }
    }

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
                error={nameError}
                label={"Name"}
                maxLength={MAX.title}
            />

            <Input
                type="textarea"
                required={true}
                onChange={(e) => {
                    setDescription(e.target.value);
                }}
                value={description}
                error={descriptionError}
                label={"Description"}
                maxLength={MAX.description}
            />

            <div>
                <Label
                    required={false}
                    label="This is a subcategory of which categories?"
                />

                <ListAdd
                    item="Add a category for which this is a subcategory"
                    listChoices={availableCategories}
                    listChosen={subcategoryOf}
                    listProperty={"name"}
                    listSetter={setSubcategoryOf}
                />

                <InputPopup type="category" />
            </div>

            <div>
                <Label
                    required={false}
                    label="Prerequisite categories (to be studied before this category)"
                />

                <ListAdd
                    item="Add a category required before learning this one"
                    listChoices={availableCategories}
                    listChosen={prerequisites}
                    listProperty={"name"}
                    listSetter={setPrerequisites}
                />

                <InputPopup type="category" />
            </div>

            {(!category || category.createdBy === user._id) && (
                <PermissionsInput
                    permissions={category ? category.permissions : {}}
                    setter={setPermissions}
                />
            )}

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Category"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="category" resourceId={category.id} />
            )}
        </div>
    );
}

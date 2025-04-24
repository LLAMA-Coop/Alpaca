"use client";

import { UserInput } from "@client";
import { useState } from "react";

export function DeletePopup({ resourceType, resourceId }) {
    const [isDeleted, setIsDeleted] = useState(false);
    // const addModal = useModals((state) => state.addModal);
    // const removeModal = useModals((state) => state.removeModal);
    // const addAlert = useAlerts((state) => state.addAlert);

    function askDelete() {
        // addModal({
        //     title: "Confirm your choice",
        //     content: `Are you sure you want to delete this ${resourceType}?`,
        //     buttonTexts: ["Cancel", "Delete"],
        //     isActionDangerous: true,
        //     onSave: handleDelete,
        // });
    }

    // async function handleDelete() {
    //     const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

    //     const response = await fetch(
    //         `${basePath}/api/${resourceType}/${resourceId}`,
    //         {
    //             method: "DELETE",
    //         },
    //     );

    //     if (response.status === 204) {
    //         addAlert({
    //             success: true,
    //             message: `The ${resourceType} has been deleted`,
    //         });
    //         setIsDeleted(true);
    //     } else if (response.status === 401) {
    //         addAlert({
    //             success: false,
    //             message: "You have been signed out. Please sign in again.",
    //         });
    //         addModal({
    //             title: "Sign back in",
    //             content: <UserInput onSubmit={removeModal} />,
    //         });
    //     } else if (response.status === 404) {
    //         addAlert({
    //             success: true,
    //             message: `This ${resourceType} could not be found, so it is likely already deleted`,
    //         });
    //         setIsDeleted(true);
    //     } else {
    //         addAlert({
    //             success: false,
    //             message: "Something went wrong.",
    //         });
    //     }
    // }

    return (
        <>
            {isDeleted && <h4>This {resourceType} is now deleted</h4>}

            {!isDeleted && (
                <button
                    type="button"
                    onClick={askDelete}
                    className="button red"
                >
                    Delete
                </button>
            )}
        </>
    );
}

"use client";

import { Input } from "./client";
import { useState } from "react";

export default function InviteAssociate() {
    const [associateId, setAssociateId] = useState("");

    async function sendInvitation() {
        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_BASEPATH ?? ""
            }/api/users/${associateId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "associate" }),
            },
        );
        console.log(await response.json());
    }

    return (
        <>
            <p>
                Enter the user ID of someone you would like to list as an
                associate.
            </p>
            <p>
                A notification will be sent to them which will include your user
                ID and username.
            </p>
            <p>
                If they accept your association, you will be able to see their
                user name.
            </p>
            <Input
                type="text"
                label="Associate ID"
                description="Enter user ID of desired associate"
                value={associateId}
                onChange={(e) => setAssociateId(e.target.value)}
            />
            <button onClick={sendInvitation}>Send Invitation</button>
        </>
    );
}

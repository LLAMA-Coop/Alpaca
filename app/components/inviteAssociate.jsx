"use client";

import { Input } from "./client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";

export default function InviteAssociate() {
    const [associateId, setAssociateId] = useState("");

    const user = useStore((state) => state.user);
    const publicUsers = useStore((state) => state.userStore);
    const availableUsers = publicUsers.filter(
        (x) => user.associates.find((y) => y._id == x._id) === undefined,
    );

    useEffect(() => {
        setAssociateId(availableUsers[0]?._id);
    }, [availableUsers]);

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
            <Input
                type="select"
                label="Select from Public Users"
                description="This is a menu of all users which have public profiles"
                choices={availableUsers.map((x) => {
                    return { key: x._id, value: x._id, label: x.username };
                })}
                value={associateId}
                onChange={(e) => setAssociateId(e.target.value)}
            />
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

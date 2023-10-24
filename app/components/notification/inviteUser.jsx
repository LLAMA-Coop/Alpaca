"use client";

import { Input } from "../client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";

export default function InviteUser({ groupId }) {
    const [userId, setUserId] = useState("");

    const user = useStore((state) => state.user);
    const publicUsers = useStore((state) => state.userStore);
    const group = useStore((state) => state.groupStore).find(
        (x) =>
            x._id === groupId &&
            (x.owner === user._id || x.admins.includes(user._id)),
    );
    const availableUsers = publicUsers.filter(
        (x) => user?.associates.find((y) => y._id == x._id) === undefined,
    );

    useEffect(() => {
        setUserId(availableUsers[0]?._id);
    }, []);

    async function sendInvitation() {
        let action = "associate";
        if (groupId) {
            action = "groupInvitation";
            if (!group) {
                console.error(
                    "I'm sorry, but you need to be the owner of the group or an administrator",
                );
                return;
            }
        }
        const payload = { action };
        if (groupId) {
            payload.groupId = groupId;
        }
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/users/${userId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
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
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <p>
                If the associate you want to invite has a private profile, you
                will need to get their user ID then enter the user ID in the
                input below.
            </p>
            <Input
                type="text"
                label="User ID"
                description="Enter user ID of desired user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <button onClick={sendInvitation}>Send Invitation</button>
            <p>
                A notification will be sent to them which will include your user
                ID and username.
            </p>
            <p>
                If they accept your user, you will be able to see their user
                name.
            </p>
        </>
    );
}

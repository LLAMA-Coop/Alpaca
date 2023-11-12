"use client";

import { Input, Alert } from "../client";
import { useState, useEffect } from "react";
import { useStore } from "@/store/store";

export default function InviteUser({ groupId }) {
    const [userId, setUserId] = useState("");

    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});

    const user = useStore((state) => state.user);
    const publicUsers = useStore((state) => state.userStore);
    const availableUsers = publicUsers.filter(
        (x) => user?.associates.find((y) => y._id == x._id) === undefined,
    );

    useEffect(() => {
        setUserId(availableUsers[0]?._id);
    }, []);

    async function sendInvitation() {
        let action = "request association";
        if (groupId) {
            action = "invite to group";
        }
        const payload = { action, recipientId: userId };
        if (groupId) {
            payload.groupId = groupId;
        }
        console.log("Payload", payload);
        const request = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/notifications`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            },
        );

        if (request.status === 200) {
            setRequestStatus({
                success: true,
                message: `You succeeded in the task "${action}"`,
            });
            setShowAlert(true);
            setUserId("");
        } else {
            setRequestStatus({
                success: false,
                message: `Could not complete task "${action}"`,
            });
            setShowAlert(true);
        }
    }

    return (
        <>
            <Alert
                timeAlive={5000}
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />
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
            <button className="button" onClick={sendInvitation}>
                Send Invitation
            </button>
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

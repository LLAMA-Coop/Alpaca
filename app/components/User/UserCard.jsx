"use client";

import { useAlerts, useStore } from "@/store/store";
import { Validator } from "@/lib/validation";
import { useRouter } from "next/navigation";
import styles from "./UserCard.module.css";
import { useState } from "react";
import Link from "next/link";
import {
    DialogDescription,
    PopoverContent,
    PopoverTrigger,
    DialogButtons,
    DialogContent,
    DialogHeading,
    TextArea,
    Popover,
    Spinner,
    Select,
    Avatar,
    Dialog,
    Input,
    Form,
} from "@client";

const basePath = process.env.NEXT_PUBLIC_BASEPATH ?? "";

export function UserCard({ user, group, isOwner, isAdmin }) {
    const [reportLoading, setReportLoading] = useState(false);
    const [reportMessage, setReportMessage] = useState("");
    const [reportType, setReportType] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportLink, setReportLink] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const [blockLoading, setBlockLoading] = useState(false);
    const [blockOpen, setBlockOpen] = useState(false);

    const [removeLoading, setRemoveLoading] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    const [messageLoading, setMessageLoading] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [messageOpen, setMessageOpen] = useState(false);
    const [messageTitle, setMessageTitle] = useState("");

    const [errors, setErrors] = useState({});

    const removeItem = useStore((state) => state.removeItem);
    const associates = useStore((state) => state.associates);
    const addAlert = useAlerts((state) => state.addAlert);
    const addItem = useStore((state) => state.addItem);
    const myself = useStore((state) => state.user);

    const isAssociate = associates.map((a) => a.id).includes(user.id);
    const isMe = user.id === myself.id;
    const router = useRouter();

    const reportTypes = [
        { value: "spam", label: "Spam" },
        { value: "harassment", label: "Harassment" },
        { value: "hate speech", label: "Hate Speech" },
        { value: "violence", label: "Violence" },
        { value: "nudity", label: "Nudity" },
        { value: "other", label: "Other" },
    ];

    async function requestAssociate(userId) {
        const response = await fetch(`${basePath}/api/me/associates`, {
            method: "POST",
            body: JSON.stringify({ userId }),
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        if (data?.content?.associate) {
            addItem("associate", data.content.associate);
        }

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });
    }

    async function removeAssociate(userId) {
        setRemoveLoading(true);

        const response = await fetch(`${basePath}/api/me/associates/${userId}`, {
            method: "DELETE",
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        if (response.ok) {
            removeItem("associate", userId);
        }

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });

        if (response.ok) {
            setRemoveOpen(false);
        }

        setRemoveLoading(false);
    }

    async function submitReport(e) {
        e.preventDefault();
        if (reportLoading) return;

        const validator = new Validator();

        validator.validateAll(
            [
                ["type", reportType],
                ["reason", reportMessage],
                ["link", reportLink],
            ].map(([field, value]) => ({ field, value })),
            "report"
        );

        if (!validator.isValid) {
            return setErrors(validator.errors);
        }

        setReportLoading(true);

        const response = await fetch(`${basePath}/api/me/users/${user.id}/report`, {
            method: "POST",
            body: JSON.stringify({
                type: reportType,
                reason: reportMessage,
                link: reportLink,
            }),
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });

        if (response.ok) {
            setReportMessage("");
            setReportType(null);
            setReportLink("");
            setReportOpen(false);
        }

        setReportLoading(false);
    }

    async function submitMessage(e) {
        e.preventDefault();
        if (messageLoading) return;

        const validator = new Validator();

        validator.validateAll(
            [
                ["title", messageTitle],
                ["message", messageContent],
            ].map(([field, value]) => ({ field, value })),
            "message"
        );

        if (!validator.isValid) {
            return setErrors(validator.errors);
        }

        setMessageLoading(true);

        const response = await fetch(`${basePath}/api/me/users/${user.id}/message`, {
            method: "POST",
            body: JSON.stringify({
                title: messageTitle,
                message: messageContent,
            }),
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });

        if (response.ok) {
            setMessageTitle("");
            setMessageContent("");
            setMessageOpen(false);
        }

        setMessageLoading(false);
    }

    async function submitBlock() {
        if (blockLoading) return;

        setBlockLoading(true);

        const response = await fetch(`${basePath}/api/me/users/${user.id}/block`, {
            method: "POST",
        });

        let data = null;
        try {
            data = await response.json();
        } catch (e) {}

        addAlert({
            success: response.ok,
            message: data?.message || "Something went wrong",
        });

        if (response.ok) {
            setBlockOpen(false);
        }

        setBlockLoading(false);
    }

    return (
        <div className={styles.wrapper}>
            <Link
                className={`${styles.container} ${menuOpen && styles.active}`}
                href={`/users/${user.username}`}
            >
                <div className={styles.avatar}>
                    <Avatar
                        src={user.avatar}
                        username={user.username}
                        size={80}
                        background="var(--bg-2)"
                    />
                </div>

                <div>
                    <h3>
                        {user.username}

                        {(isOwner || isAdmin) && (
                            <span
                                className={styles.owner}
                                title={isOwner ? "Group Owner" : "Group Admin"}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                >
                                    {isOwner && (
                                        <path
                                            className="fill"
                                            d="M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z"
                                        />
                                    )}

                                    {isAdmin && !isOwner && (
                                        <path
                                            d="M11.884 2.007l.114 -.007l.118 .007l.059 .008l.061 .013l.111 .034a.993 .993 0 0 1 .217 .112l.104 .082l.255 .218a11 11 0 0 0 7.189 2.537l.342 -.01a1 1 0 0 1 1.005 .717a13 13 0 0 1 -9.208 16.25a1 1 0 0 1 -.502 0a13 13 0 0 1 -9.209 -16.25a1 1 0 0 1 1.005 -.717a11 11 0 0 0 7.531 -2.527l.263 -.225l.096 -.075a.993 .993 0 0 1 .217 -.112l.112 -.034a.97 .97 0 0 1 .119 -.021z"
                                            strokeWidth="0"
                                            fill="currentColor"
                                        />
                                    )}
                                </svg>
                            </span>
                        )}
                    </h3>

                    <p title={user.description || "No description provided."}>
                        {user.description || "No description provided."}
                    </p>
                </div>

                <Popover
                    open={menuOpen}
                    placement="bottom-start"
                    onOpenChange={(val) => setMenuOpen(val)}
                >
                    <PopoverTrigger>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMenuOpen((prev) => !prev);
                            }}
                            className={`${styles.menuButton} ${menuOpen ? styles.open : ""}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                height="14"
                                width="14"
                            >
                                <circle
                                    cx="12"
                                    cy="2"
                                    r="2.5"
                                />
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="2.5"
                                />
                                <circle
                                    cx="12"
                                    cy="22"
                                    r="2.5"
                                />
                            </svg>
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        isMenu
                        items={[
                            {
                                name: "View Profile",
                                onClick: () => {
                                    router.push(`/users/${user.username}`);
                                },
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        fill="currentColor"
                                        x="0px"
                                        y="0px"
                                    >
                                        <g>
                                            <circle
                                                cx="256"
                                                cy="128"
                                                r="128"
                                            />
                                            <path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z" />
                                        </g>
                                    </svg>
                                ),
                                show: !isMe,
                            },
                            {
                                name: "Send Message",
                                onClick: () => setMessageOpen(true),
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M8.7,18H3c-1.493,0-3-1.134-3-3.666V9.294A9.418,9.418,0,0,1,8.349.023a9,9,0,0,1,9.628,9.628A9.419,9.419,0,0,1,8.7,18ZM20,9.08h-.012c0,.237,0,.474-.012.712C19.59,15.2,14.647,19.778,9.084,19.981l0,.015A8,8,0,0,0,16,24h5a3,3,0,0,0,3-3V16A8,8,0,0,0,20,9.08Z" />
                                    </svg>
                                ),
                                show: !isMe,
                            },
                            {
                                name: "hr",
                                show: !isMe,
                            },
                            {
                                name: isAssociate ? "Remove Associate" : "Add As Associate",
                                onClick: () => {
                                    if (isAssociate) {
                                        setRemoveOpen(true);
                                    } else {
                                        requestAssociate(user.id);
                                    }
                                },
                                icon: isAssociate ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="m24 12a1 1 0 0 1 -1 1h-6a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1zm-15 0a6 6 0 1 0 -6-6 6.006 6.006 0 0 0 6 6zm0 2a9.01 9.01 0 0 0 -9 9 1 1 0 0 0 1 1h16a1 1 0 0 0 1-1 9.01 9.01 0 0 0 -9-9z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        fill="currentColor"
                                        x="0px"
                                        y="0px"
                                    >
                                        <g>
                                            <path d="M490.667,234.667H448V192c0-11.782-9.551-21.333-21.333-21.333c-11.782,0-21.333,9.551-21.333,21.333v42.667h-42.667   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h42.667V320c0,11.782,9.551,21.333,21.333,21.333   c11.782,0,21.333-9.551,21.333-21.333v-42.667h42.667c11.782,0,21.333-9.551,21.333-21.333   C512,244.218,502.449,234.667,490.667,234.667z" />
                                            <circle
                                                cx="192"
                                                cy="128"
                                                r="128"
                                            />
                                            <path d="M192,298.667c-105.99,0.118-191.882,86.01-192,192C0,502.449,9.551,512,21.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C383.882,384.677,297.99,298.784,192,298.667z" />
                                        </g>
                                    </svg>
                                ),
                                show: !isMe,
                            },
                            {
                                name: "Remove From Group",
                                onClick: () => {},
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="m18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm2.5,7h-5c-.553,0-1-.447-1-1s.447-1,1-1h5c.553,0,1,.447,1,1s-.447,1-1,1ZM4.5,2.5c0-1.381,1.119-2.5,2.5-2.5s2.5,1.119,2.5,2.5-1.119,2.5-2.5,2.5-2.5-1.119-2.5-2.5Zm7.5,7.5c0-2.206-1.794-4-4-4h-2c-2.206,0-4,1.794-4,4v3c0,1.478.805,2.771,2,3.463v6.537c0,.553.447,1,1,1s1-.447,1-1v-6h2v6c0,.553.447,1,1,1s1-.447,1-1v-5c0-2.029.755-3.881,2-5.291v-2.709Z" />
                                    </svg>
                                ),
                                show: !!group || !isMe,
                                disabled: true,
                            },
                            {
                                name: "Block User",
                                onClick: () => setBlockOpen(true),
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M18,12c-3.309,0-6,2.691-6,6s2.691,6,6,6,6-2.691,6-6-2.691-6-6-6Zm4,6c0,.74-.216,1.424-.567,2.019l-5.452-5.453c.595-.351,1.279-.567,2.019-.567,2.206,0,4,1.794,4,4Zm-8,0c0-.74,.216-1.424,.567-2.019l5.452,5.453c-.595,.351-1.279,.567-2.019,.567-2.206,0-4-1.794-4-4Zm-5-6c3.309,0,6-2.691,6-6S12.309,0,9,0,3,2.691,3,6s2.691,6,6,6Zm3.721,12H1c-.553,0-1-.448-1-1,0-4.962,4.037-9,9-9,.67,0,1.321,.079,1.95,.219-.605,1.126-.95,2.413-.95,3.781,0,2.393,1.056,4.534,2.721,6Z" />
                                    </svg>
                                ),
                                danger: true,
                                show: !isMe,
                            },
                            {
                                name: "hr",
                                show: !isMe,
                            },
                            {
                                name: "Copy Profile Link",
                                onClick: async () => {
                                    try {
                                        await navigator.clipboard.writeText(
                                            `${window.location.origin}/users/${user.username}`
                                        );

                                        addAlert({
                                            success: true,
                                            message: "Profile link copied to clipboard",
                                        });
                                    } catch (e) {
                                        addAlert({
                                            success: false,
                                            message: "Failed to copy profile link",
                                        });
                                    }
                                },
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 511.904 511.904"
                                        fill="currentColor"
                                        x="0px"
                                        y="0px"
                                    >
                                        <g>
                                            <path d="M222.025,417.764c-33.872,35.124-89.034,38.364-126.784,7.445c-22.482-19.465-33.966-48.733-30.72-78.293   c2.811-21.794,12.997-41.97,28.864-57.173l61.355-61.397c12.492-12.496,12.492-32.752,0-45.248l0,0   c-12.496-12.492-32.752-12.492-45.248,0l-60.053,60.075C22.065,269.57,4.802,304.721,0.649,342.521   c-7.757,85.138,54.972,160.445,140.11,168.202c45.721,4.166,90.933-12.179,123.42-44.618l64.171-64.149   c12.492-12.496,12.492-32.752,0-45.248l0,0c-12.496-12.492-32.752-12.492-45.248,0L222.025,417.764z" />
                                            <path d="M451.358,31.289C387.651-15.517,299.186-8.179,244.062,48.484L183.667,108.9c-12.492,12.496-12.492,32.752,0,45.248l0,0   c12.496,12.492,32.752,12.492,45.248,0l61.355-61.291c33.132-34.267,86.738-38.127,124.437-8.96   c38.803,31.818,44.466,89.067,12.648,127.87c-1.862,2.271-3.833,4.45-5.907,6.53l-64.171,64.171   c-12.492,12.496-12.492,32.752,0,45.248l0,0c12.496,12.492,32.752,12.492,45.248,0l64.171-64.171   c60.413-60.606,60.257-158.711-0.349-219.124C461.638,39.727,456.631,35.341,451.358,31.289z" />
                                            <path d="M183.667,282.525l99.425-99.425c12.497-12.497,32.758-12.497,45.255,0l0,0c12.497,12.497,12.497,32.758,0,45.255   l-99.425,99.425c-12.497,12.497-32.758,12.497-45.255,0l0,0C171.17,315.283,171.17,295.022,183.667,282.525z" />
                                        </g>
                                    </svg>
                                ),
                            },
                            {
                                name: "hr",
                                show: !isMe,
                            },
                            {
                                name: "Report User",
                                onClick: () => setReportOpen(true),
                                icon: (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="m1 24a1 1 0 0 1 -1-1v-19a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v5a4 4 0 0 1 -4 4h-9v10a1 1 0 0 1 -1 1zm19-20h-3v5a6.006 6.006 0 0 1 -6 6h-.444a3.987 3.987 0 0 0 3.444 2h6a4 4 0 0 0 4-4v-5a4 4 0 0 0 -4-4z" />
                                    </svg>
                                ),
                                danger: true,
                                show: !isMe,
                            },
                        ]}
                    />
                </Popover>
            </Link>

            <Dialog
                open={reportOpen}
                onOpenChange={() => setReportOpen(false)}
            >
                <DialogContent>
                    <DialogHeading>Report User</DialogHeading>

                    <DialogDescription>
                        Please provide a reason for reporting this user.
                    </DialogDescription>

                    <Form
                        singleColumn
                        onSubmit={submitReport}
                    >
                        <Select
                            required
                            value={reportType}
                            label="Report Type"
                            options={reportTypes}
                            error={errors.reportType}
                            placeholder="What are you reporting this user for?"
                            onChange={(val) => {
                                setReportType(val);
                                setErrors((prev) => ({ ...prev, reportType: "" }));
                            }}
                        />

                        <TextArea
                            label="Reason"
                            value={reportMessage}
                            error={errors.reportMessage}
                            placeholder="Explain further why you are reporting this user."
                            onChange={(e) => {
                                setReportMessage(e.target.value);
                                setErrors((prev) => ({ ...prev, reportMessage: "" }));
                            }}
                        />

                        <Input
                            value={reportLink}
                            error={errors.reportLink}
                            label="Link to offending content"
                            placeholder="Link to offending content"
                            onChange={(e) => {
                                setReportLink(e.target.value);
                                setErrors((prev) => ({ ...prev, reportLink: "" }));
                            }}
                        />

                        <DialogButtons>
                            <button
                                type="button"
                                className="button"
                                onClick={() => setReportOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="button danger"
                                disabled={reportLoading || !reportType}
                            >
                                Report
                                {reportLoading && (
                                    <Spinner
                                        size={16}
                                        margin={0}
                                    />
                                )}
                            </button>
                        </DialogButtons>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={blockOpen}
                onOpenChange={() => setBlockOpen(false)}
            >
                <DialogContent>
                    <DialogHeading>Block User</DialogHeading>

                    <DialogDescription>
                        Are you sure you want to block this user?
                        <br />
                        You will no longer receive messages or notifications from them.
                    </DialogDescription>

                    <DialogButtons>
                        <button
                            type="button"
                            className="button"
                            onClick={() => setBlockOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="button danger"
                            onClick={submitBlock}
                            disabled={blockLoading}
                        >
                            Block
                            {blockLoading && (
                                <Spinner
                                    size={16}
                                    margin={0}
                                />
                            )}
                        </button>
                    </DialogButtons>
                </DialogContent>
            </Dialog>

            <Dialog
                open={messageOpen}
                onOpenChange={() => setMessageOpen(false)}
            >
                <DialogContent>
                    <DialogHeading>Send Message</DialogHeading>

                    <DialogDescription>Send a message to {user.username}.</DialogDescription>

                    <Form
                        singleColumn
                        onSubmit={submitMessage}
                    >
                        <Input
                            label="Title"
                            maxLength={100}
                            value={messageTitle}
                            error={errors.messageTitle}
                            placeholder="Message Title"
                            onChange={(e) => {
                                setMessageTitle(e.target.value);
                                setErrors((prev) => ({ ...prev, messageTitle: "" }));
                            }}
                        />

                        <TextArea
                            required
                            label="Message"
                            maxLength={1024}
                            value={messageContent}
                            error={errors.messageContent}
                            placeholder="Message Content"
                            onChange={(e) => {
                                setMessageContent(e.target.value);
                                setErrors((prev) => ({ ...prev, messageContent: "" }));
                            }}
                        />

                        <DialogButtons>
                            <button
                                type="button"
                                className="button"
                                onClick={() => setMessageOpen(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={messageLoading}
                                className="button primary"
                            >
                                Send
                                {messageLoading && (
                                    <Spinner
                                        size={16}
                                        margin={0}
                                    />
                                )}
                            </button>
                        </DialogButtons>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={removeOpen}
                onOpenChange={() => setRemoveOpen(false)}
            >
                <DialogContent>
                    <DialogHeading>Remove Associate</DialogHeading>

                    <DialogDescription>
                        Are you sure you want to remove {user.username} as an associate?
                    </DialogDescription>

                    <DialogButtons>
                        <button
                            type="button"
                            className="button"
                            onClick={() => setRemoveOpen(false)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            disabled={removeLoading}
                            className="button danger"
                            onClick={() => removeAssociate(user.id)}
                        >
                            Remove
                            {removeLoading && (
                                <Spinner
                                    size={16}
                                    margin={0}
                                />
                            )}
                        </button>
                    </DialogButtons>
                </DialogContent>
            </Dialog>
        </div>
    );
}

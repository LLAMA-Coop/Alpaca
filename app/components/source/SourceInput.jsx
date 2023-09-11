"use client";

import { useStore } from "@/store/store";
import { Alert, Input, Label, ListItem, Spinner } from "@components/client";
import { useState, useEffect } from "react";
import PermissionsInput from "../form/PermissionsInput";
import { DeletePopup } from "../delete-popup/DeletePopup";
import { serializeOne } from "@/lib/db";

export function SourceInput({ source }) {
    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState("");

    const [medium, setMedium] = useState("article");
    const [mediumError, setMediumError] = useState("");

    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState("");

    const [lastAccessed, setLastAccessed] = useState();
    const [lastAccessedError, setLastAccessedError] = useState("");

    const [publishDate, setPublishDate] = useState();
    const [publishDateError, setPublishDateError] = useState("");

    const [authors, setAuthors] = useState([]);
    const [newAuthor, setNewAuthor] = useState("");

    const [loading, setLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});
    const [permissions, setPermissions] = useState({});

    const urlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    const accessedRegex = /^\d{4}-\d{2}-\d{2}$/;
    const publishRegex = /^\d{4}-\d{2}-\d{2}$/;

    const user = useStore((state) => state.user);
    const canDelete = source && source.createdBy === user._id;

    useEffect(() => {
        if (!source) {
            setLastAccessed(new Date().toISOString().split("T")[0]);
            return;
        }

        setTitle(source.title);
        if (source.authors.length > 0) setAuthors([...source.authors]);
        if (source.medium) setMedium(source.medium);
        if (source.url) setUrl(source.url);
        if (source.publishedAt) setPublishDate(htmlDate(source.publishedAt));
        if (source.lastAccessed) setLastAccessed(htmlDate(source.lastAccessed));
        if (source.permissions)
            setPermissions(serializeOne(source.permissions));
    }, []);

    function htmlDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear().toString().padStart(4, "0")}-${(
            date.getMonth() + 1
        )
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }

    function handleAddAuthor(e) {
        e.preventDefault();
        if (!newAuthor || authors.includes(newAuthor)) return;
        setAuthors([...authors, newAuthor]);
        setNewAuthor("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        if (!title) {
            setTitleError("Title is required");
        } else if (title.length > 100) {
            setTitleError("Title must be less than 100 characters");
        }

        if (!urlRegex.test(url)) {
            setUrlError("Invalid URL");
        }

        if (!accessedRegex.test(lastAccessed)) {
            setLastAccessedError("Invalid Date");
        }

        if (publishDate && !publishRegex.test(publishDate)) {
            setPublishDateError("Invalid Date");
        }

        if (
            !title ||
            title.length > 100 ||
            !urlRegex.test(url) ||
            !accessedRegex.test(lastAccessed) ||
            (publishDate && !publishRegex.test(publishDate))
        ) {
            return;
        }

        function formatDate(htmlDate) {
            if (!htmlDate) return undefined;
            const ymd = htmlDate.split("-");
            return new Date(ymd[0], ymd[1] - 1, ymd[2]);
        }

        const sourcePayload = {
            title,
            medium,
            url,
            publishDate: formatDate(publishDate),
            lastAccessed: formatDate(lastAccessed),
            authors,
        };
        sourcePayload.permissions = setPermissions(permissions);
        if (source) {
            sourcePayload._id = source._id;
        }

        setLoading(true);

        const response = await fetch("/api/source", {
            method: source ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(sourcePayload),
        });

        setLoading(false);

        if (response.status === 201) {
            setRequestStatus({
                success: true,
                message: "Source added successfully",
            });

            setTitle("");
            setUrl("");
            setLastAccessed(new Date().toISOString().split("T")[0]);
            setPublishDate("");
            setNewAuthor("");
            setAuthors([]);
            setTitleError("");
            setMediumError("");
            setUrlError("");
            setLastAccessedError("");
            setPublishDateError("");
        } else {
            setRequestStatus({
                success: false,
                message: "Failed to add source",
            });
        }

        setShowAlert(true);
    }

    const mediumChoices = [
        { value: "article", label: "Article" },
        { value: "book", label: "Book" },
        { value: "website", label: "Website" },
        { value: "video", label: "Video" },
        { value: "podcast", label: "Podcast" },
    ];

    return (
        <div className="formGrid">
            <Alert
                show={showAlert}
                setShow={setShowAlert}
                success={requestStatus.success}
                message={requestStatus.message}
            />

            <Input
                label={"Title"}
                value={title}
                maxLength={100}
                description="The title of the source"
                autoComplete="off"
                required={true}
                error={titleError}
                onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError("");
                }}
            />

            <Input
                type={"select"}
                choices={mediumChoices}
                description="The medium of the source"
                required={true}
                label={"Medium"}
                value={medium}
                error={mediumError}
                onChange={(e) => {
                    setMedium(e.target.value);
                    setMediumError("");
                }}
            />

            <Input
                description="The URL of the source"
                autoComplete="off"
                required={true}
                label={"URL of Source"}
                value={url}
                error={urlError}
                minLength={8}
                maxLength={200}
                onChange={(e) => {
                    setUrl(e.target.value);
                    setUrlError("");
                }}
            />

            <Input
                type="date"
                label={"Publication Date"}
                value={publishDate}
                description="The date the source was published"
                error={publishDateError}
                onChange={(e) => {
                    setPublishDate(e.target.value);
                    setPublishDateError("");
                }}
            />

            <Input
                type="date"
                label={"Last Accessed"}
                value={lastAccessed}
                description="The date you last accessed the source"
                error={lastAccessedError}
                onChange={(e) => {
                    setLastAccessed(e.target.value);
                    setLastAccessedError("");
                }}
            />

            <div>
                <Input
                    label={"Add Author"}
                    value={newAuthor}
                    maxLength={100}
                    description="People who contributed to the source"
                    autoComplete="off"
                    onChange={(e) => setNewAuthor(e.target.value)}
                    action="Add author"
                    onActionTrigger={handleAddAuthor}
                />

                <div style={{ marginTop: "24px" }}>
                    <Label label="Authors" />

                    <ul className="chipList">
                        {authors.length === 0 && (
                            <ListItem item="No authors added" />
                        )}

                        {authors.map((cont) => (
                            <ListItem
                                key={cont}
                                item={cont}
                                action={() => {
                                    setAuthors(
                                        authors.filter((name) => cont !== name),
                                    );
                                }}
                                actionType={"delete"}
                            />
                        ))}
                    </ul>
                </div>
            </div>

            <PermissionsInput
                permissions={permissions}
                setter={setPermissions}
            />

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Source"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="source" resourceId={source._id} />
            )}
        </div>
    );
}

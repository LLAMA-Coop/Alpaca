"use client";

import { useStore, useModals, useAlerts } from "@/store/store";
import { buildPermissions, permissionsListToObject } from "@/lib/permissions";
import { Validator } from "@/lib/validation";
import { useState, useEffect } from "react";
import { htmlDate } from "@/lib/date";
import { validation } from "@/lib/validation";
import {
    Input,
    Label,
    ListItem,
    Spinner,
    DeletePopup,
    ListAdd,
    UserInput,
    InputPopup,
} from "@client";
import { PermissionsDisplay } from "../Form/PermissionsDisplay";

export function SourceInput({ source }) {
    const [errors, setErrors] = useState({});

    const [title, setTitle] = useState("");
    const [medium, setMedium] = useState("article");
    const [url, setUrl] = useState("");
    const [lastAccessed, setLastAccessed] = useState();
    const [publishDate, setPublishDate] = useState();

    const [authors, setAuthors] = useState([]);
    const [newAuthor, setNewAuthor] = useState("");
    const [courses, setCourses] = useState([]);
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState("");

    const [loading, setLoading] = useState(false);
    const [permissions, setPermissions] = useState({});

    const urlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;
    const accessedRegex = /^\d{4}-\d{2}-\d{2}$/;
    const publishRegex = /^\d{4}-\d{2}-\d{2}$/;

    const user = useStore((state) => state.user);
    const availableCourses = useStore((state) => state.courses);
    const availableTags = useStore((state) => state.tags);
    const addTags = useStore((state) => state.addTags);

    const canDelete = source && user && source.createdBy === user.id;
    const canChangePermissions =
        !source ||
        (user &&
            (source.createdBy === user.id || source.creator?.id === user.id));

    const addModal = useModals((state) => state.addModal);
    const removeModal = useModals((state) => state.removeModal);
    const addAlert = useAlerts((state) => state.addAlert);

    useEffect(() => {
        if (!source) {
            setLastAccessed(new Date().toISOString().split("T")[0]);
            return;
        }

        if (source.title) setTitle(source.title);
        if (source.authors && source.authors.length > 0)
            setAuthors([...source.authors]);
        if (source.tags && source.tags.length > 0) setTags([...source.tags]);
        if (source.medium) setMedium(source.medium);
        if (source.url) setUrl(source.url);
        if (source.publishedUpdated)
            setPublishDate(htmlDate(source.publishedUpdated));
        if (source.lastAccessed) setLastAccessed(htmlDate(source.lastAccessed));
        if (source.courses && source.courses.length > 0) {
            setCourses(
                source.courses.map((courseId) =>
                    availableCourses.find((x) => x.id === courseId),
                ),
            );
        }
        if (source.permissions) {
            setPermissions(permissionsListToObject(source.permissions));
        }
    }, []);

    function handleAddAuthor(e) {
        e.preventDefault();
        if (!newAuthor || authors.includes(newAuthor)) return;
        setAuthors([...authors, newAuthor]);
        setNewAuthor("");
    }

    function handleAddTag(e) {
        e.preventDefault();
        if (!newTag || tags.includes(newTag)) return;
        setTags([...tags, newTag]);
        if (!availableTags || !availableTags.includes(newTag)) {
            addTags(newTag);
        }
        setNewTag("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) return;

        const validator = new Validator();

        validator.validateAll([
            {
                field: "title",
                value: title,
                type: "source",
            },
            {
                field: "medium",
                value: medium,
                type: "source",
            },
        ]);

        if (medium === "website" && !urlRegex.test(url)) {
            validator.addError({
                field: "url",
                message: "Invalid URL",
            });
        }

        if (lastAccessed && !accessedRegex.test(lastAccessed)) {
            validator.addError({
                field: "lastAccessed",
                message: "Invalid date",
            });
        }

        if (publishDate && !publishRegex.test(publishDate)) {
            validator.addError({
                field: "publishDate",
                message: "Invalid date",
            });
        }

        if (!validator.isValid) {
            return addAlert({
                success: false,
                message: validator.getErrorsAsString(),
            });
        }

        function formatDate(htmlDate) {
            if (!htmlDate) return undefined;
            const ymd = htmlDate.split("-");
            return new Date(ymd[0], ymd[1] - 1, ymd[2]);
        }

        const sourcePayload = {
            title: title.trim(),
            medium,
            url,
            publishDate: formatDate(publishDate),
            lastAccessed: formatDate(lastAccessed),
            authors,
            courses: courses.map((course) => course.id),
            tags,
        };

        sourcePayload.permissions = buildPermissions(
            permissions,
            source ? source.id : null,
            "source",
        );

        if (source && source.id) {
            sourcePayload.id = source.id;
        }

        setLoading(true);

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/source`,
            {
                method: source && source.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sourcePayload),
            },
        );

        setLoading(false);

        if (response.status === 200) {
            addAlert({
                success: true,
                message: "Source updated successfully",
            });
        } else if (response.status === 201) {
            addAlert({
                success: true,
                message: "Source added successfully",
            });

            setTitle("");
            setUrl("");
            setLastAccessed(new Date().toISOString().split("T")[0]);
            setPublishDate("");
            setNewAuthor("");
            setAuthors([]);
            setErrors({});
        } else if (response.status === 401) {
            addAlert({
                success: false,
                message: "You have been signed out. Please sign in again.",
            });
            addModal({
                title: "Sign back in",
                content: <UserInput onSubmit={removeModal} />,
            });
        } else {
            const json = await response.json();
            addAlert({
                success: false,
                message: json.message,
            });
        }
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
            <Input
                label={"Title"}
                value={title}
                maxLength={validation.source.title.maxLength}
                description="The title of the source"
                autoComplete="off"
                required={true}
                error={errors.title}
                onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((prev) => ({ ...prev, title: "" }));
                }}
            />

            <Input
                type={"select"}
                choices={mediumChoices}
                description="The medium of the source"
                required={true}
                label={"Medium"}
                value={medium}
                error={errors.medium}
                onChange={(e) => {
                    setMedium(e.target.value);
                    setErrors((prev) => ({ ...prev, medium: "" }));
                }}
            />

            <Input
                description="The URL of the source"
                autoComplete="off"
                required={medium === "website"}
                label={"URL of Source"}
                value={url}
                error={errors.url}
                minLength={8}
                onChange={(e) => {
                    setUrl(e.target.value);
                    setErrors((prev) => ({ ...prev, url: "" }));
                }}
            />

            <Input
                type="date"
                label={"Publication Date"}
                value={publishDate}
                description="The date the source was published"
                error={errors.publishDate}
                onChange={(e) => {
                    setPublishDate(e.target.value);
                    setErrors((prev) => ({ ...prev, publishDate: "" }));
                }}
            />

            <Input
                type="date"
                label={"Last Accessed"}
                value={lastAccessed}
                description="The date you last accessed the source"
                error={errors.lastAccessed}
                onChange={(e) => {
                    setLastAccessed(e.target.value);
                    setErrors((prev) => ({ ...prev, lastAccessed: "" }));
                }}
            />

            <div>
                <Input
                    label={"Add Author"}
                    value={newAuthor}
                    maxLength={validation.source.author.maxLength}
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

            <div>
                <Label required={false} label="Courses" />

                <ListAdd
                    item="Add to a course"
                    listChoices={availableCourses}
                    listChosen={courses}
                    listProperty={"name"}
                    listSetter={setCourses}
                    type="datalist"
                    messageIfNone="Not added to any course"
                />
            </div>

            <div>
                <Label label="Tags" />

                <ul className="chipList">
                    {tags.length === 0 && <ListItem item="No tags added" />}

                    {tags.map((tag, index) => (
                        <ListItem
                            key={`${tag}_${index}`}
                            item={tag}
                            action={() => {
                                setTags(tags.filter((t) => t !== tag));
                            }}
                            actionType={"delete"}
                        />
                    ))}
                </ul>

                <Input
                    type="datalist"
                    choices={availableTags}
                    label={"Add Tag"}
                    value={newTag}
                    maxLength={validation.tag.maxLength}
                    description="A word or phrase that could be used to search for this source"
                    autoComplete="off"
                    onChange={(e) => setNewTag(e.target.value)}
                    action="Add tag"
                    onActionTrigger={handleAddTag}
                />
            </div>

            {/* <div>
                <Input
                    type={"select"}
                    label={"Location Type Default"}
                    choices={[
                        { label: "Page", value: "page" },
                        {
                            label: "ID Reference on Website",
                            value: "id reference",
                        },
                        {
                            label: "Section Header in Document",
                            value: "section",
                        },
                        {
                            label: "Timestamp",
                            value: "timestamp",
                        },
                    ]}
                    description={
                        "When you cite this source, what would you use to identify a specific location in this source, such as a page number for a book, id tag in a webpage, or a section heading in a document?"
                    }
                    required={false}
                    value={locationTypeDefault}
                    onChange={(e) => setLocationTypeDefault(e.target.value)}
                />
            </div> */}

            <div>
                <PermissionsDisplay permissions={permissions} />

                {canChangePermissions && (
                    <InputPopup
                        type="permissions"
                        resource={permissions}
                        setter={setPermissions}
                    />
                )}
            </div>

            <button onClick={handleSubmit} className="button submit">
                {loading ? <Spinner /> : "Submit Source"}
            </button>

            {canDelete && (
                <DeletePopup resourceType="source" resourceId={source.id} />
            )}
        </div>
    );
}

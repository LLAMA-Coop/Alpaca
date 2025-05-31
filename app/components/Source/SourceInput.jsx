"use client";

import { Permissions, Spinner, Select, Input, Form } from "@client";
import { useStore, useAlerts } from "@/store/store";
import { getChangedFields } from "@/lib/objects";
import { validation } from "@/lib/validation";
import { useEffect, useReducer } from "react";
import { Validator } from "@/lib/validation";
import { htmlDate } from "@/lib/date";

const defaultState = {
  title: "",
  medium: "article",
  url: "",
  publishedAt: new Date(),
  lastAccessed: new Date(),
  locationType: "page",
  author: "",
  authors: [],
  tag: "",
  tags: [],
  courses: [],
  permissions: {
    allRead: false,
    allWrite: false,
    read: [],
    write: [],
    groupId: null,
    groupLocked: false,
  },
  loading: false,
  errors: {},
};

function stateReducer(state, action) {
  switch (action.type) {
    case "title":
      return { ...state, title: action.value };
    case "medium":
      return { ...state, medium: action.value };
    case "url":
      return { ...state, url: action.value };
    case "publishedAt":
      return { ...state, publishedAt: action.value };
    case "lastAccessed":
      return { ...state, lastAccessed: action.value };
    case "locationType":
      return { ...state, locationType: action.value };
    case "author":
      return { ...state, author: action.value };
    case "addAuthor":
      return {
        ...state,
        authors: [...state.authors, action.value],
      };
    case "removeAuthor":
      return {
        ...state,
        authors: state.authors.filter((a) => a !== action.value),
      };
    case "courses":
      return { ...state, courses: action.value };
    case "tag":
      return { ...state, tag: action.value };
    case "tags":
      return { ...state, tags: action.value };
    case "addTag":
      return { ...state, tags: [...state.tags, action.value] };
    case "removeTag":
      return {
        ...state,
        tags: state.tags.filter((t) => t !== action.value),
      };
    case "permissions":
      return { ...state, permissions: action.value };
    case "errors":
      return { ...state, errors: { ...state.errors, ...action.value } };
    case "loading":
      return { ...state, loading: action.value };
    case "editing":
      return {
        ...state,
        ...action.value,
        courses: action.value.courses || [],
      };
    case "reset":
      return { ...defaultState, ...action.default };
    default:
      return state;
  }
}

export function SourceInput({ source, close }) {
  if (source) {
    source = {
      ...source,
      permissions: {
        ...source.permissions,
        allRead: source.permissions.allRead === 1,
        allWrite: source.permissions.allWrite === 1,
        groupLocked: source.permissions.groupLocked === 1,
      },
    };
  }

  const [state, dispatch] = useReducer(stateReducer, defaultState);

  const addAlert = useAlerts((state) => state.addAlert);
  const courses = useStore((state) => state.courses);
  const user = useStore((state) => state.user);
  const inputDefaults = useStore((state) => state.inputDefaults);

  const isOwner = source && user && source.creator.id === user.id;
  const canChangePermissions = isOwner || !source;

  useEffect(() => {
    if (!source) {
      dispatch({ type: "courses", value: inputDefaults.courses });
      dispatch({ type: "tags", value: inputDefaults.tags });
      dispatch({ type: "permissions", value: inputDefaults.permissions });
      return;
    }
    dispatch({
      type: "editing",
      value: {
        ...source,
        courses: courses.filter((x) =>
          source.courses ? source.courses.includes(x.id) : false
        ),
      },
    });
  }, [courses, inputDefaults]);

  const sourceData = {
    title: state.title.trim(),
    medium: state.medium,
    url: state.url.trim(),
    publishedAt: state.publishedAt,
    lastAccessed: state.lastAccessed,
    locationType: state.locationType,
    authors: state.authors,
    courses: state.courses.map((c) => c.id),
    tags: state.tags,
    permissions: state.permissions,
  };

  const canSubmitChange = () => {
    if (!source) return true;

    const changedFields = getChangedFields(
      {
        ...source,
        courses: source.courses.map((c) => c.id),
      },
      sourceData
    );

    return Object.keys(changedFields).length > 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (state.loading) return;
    if (!canSubmitChange()) return;

    const validator = new Validator();

    validator.validateAll(
      [
        ["title", state.title.trim()],
        ["medium", state.medium],
        ["url", state.url.trim()],
        ["publishedAt", state.publishedAt],
        ["lastAccessed", state.lastAccessed],
        ["authors", state.authors],
        ["courses", state.courses],
        ["locationType", state.locationType],
      ].map(([field, value]) => ({ field, value })),
      "source"
    );

    if (state.medium === "website" && !state.url) {
      validator.addError({
        field: "url",
        message: "Website sources must have a URL",
      });
    }

    if (!validator.isValid) {
      return dispatch({ type: "errors", value: validator.errors });
    }

    dispatch({ type: "loading", value: true });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/source${source ? `/${source.id}` : ""}`,
      {
        method: source ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: source
          ? JSON.stringify(
              getChangedFields(
                {
                  ...source,
                  courses: source.courses.map((c) => c.id),
                },
                sourceData,
                true
              )
            )
          : JSON.stringify({
              title: state.title.trim(),
              medium: state.medium,
              url: state.url.trim(),
              publishedAt: state.publishedAt,
              lastAccessed: state.lastAccessed,
              locationType: state.locationType,
              authors: state.authors,
              courses: state.courses,
              tags: state.tags,
              permissions: state.permissions,
            }),
      }
    );

    dispatch({ type: "loading", value: false });

    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      console.error(`Error parsing response: ${e}`);
    }

    if (response.status === 201) {
      dispatch({ type: "reset", default: inputDefaults });

      addAlert({
        success: true,
        message: data.message || "Successfully created source.",
      });
    } else if (response.status === 200) {
      addAlert({
        success: true,
        message: data.message || "Successfully updated source.",
      });

      if (close) close();
    } else {
      addAlert({
        success: false,
        message: data.errors.server || "Something went wrong.",
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
    <Form onSubmit={handleSubmit} singleColumn={!!source}>
      <Input
        required
        label="Title"
        autoComplete="off"
        value={state.title || ""}
        error={state.errors.title}
        placeholder="George Washington's Teeth"
        maxLength={validation.source.title.maxLength}
        onChange={(e) => {
          dispatch({ type: "title", value: e.target.value });
          dispatch({ type: "errors", value: { title: "" } });
        }}
      />

      <Select
        noObject
        label="Medium"
        options={mediumChoices}
        error={state.errors.medium}
        value={state.medium || "article"}
        onChange={(value) => {
          dispatch({ type: "medium", value: value });
          dispatch({ type: "errors", value: { medium: "" } });
        }}
      />

      <Input
        autoComplete="off"
        pattern="https?://.+"
        label="URL of Source"
        value={state.url || ""}
        error={state.errors.url}
        placeholder="https://example.com"
        required={state.medium === "website"}
        onChange={(e) => {
          dispatch({ type: "url", value: e.target.value });
          dispatch({ type: "errors", value: { url: "" } });
        }}
      />

      <Input
        type="date"
        label="Publication Date"
        value={htmlDate(state.publishedAt) || ""}
        error={state.errors.publishedAt}
        description="The date at which the source was published"
        onChange={(e) => {
          dispatch({ type: "publishedAt", value: e.target.value });
          dispatch({ type: "errors", value: { publishedAt: "" } });
        }}
      />

      <Input
        type="date"
        label="Last Accessed"
        value={htmlDate(state.lastAccessed) || ""}
        error={state.errors.lastAccessed}
        description="The date at which you last accessed the source"
        onChange={(e) => {
          dispatch({ type: "lastAccessed", value: e.target.value });
          dispatch({ type: "errors", value: { lastAccessed: "" } });
        }}
      />

      <Input
        multiple
        label="Authors"
        autoComplete="off"
        data={state.authors}
        value={state.author || ""}
        error={state.errors.authors}
        description="The author(s) of the source"
        placeholder="Enter an author and press enter"
        maxLength={validation.source.author.maxLength}
        removeItem={(item) => {
          dispatch({ type: "removeAuthor", value: item });
        }}
        addItem={(item) => {
          dispatch({ type: "addAuthor", value: item });
          dispatch({ type: "author", value: "" });
        }}
        onChange={(e) => {
          dispatch({ type: "author", value: e.target.value });
          dispatch({ type: "errors", value: { author: "" } });
        }}
      />

      <Select
        multiple
        itemValue="name"
        label="Courses"
        itemLabel="name"
        options={courses}
        data={state.courses}
        placeholder="Select courses"
        error={state.errors.courses}
        description="The courses this note is related to"
        setter={(value) => {
          dispatch({ type: "courses", value });
          dispatch({ type: "errors", value: { courses: "" } });
        }}
      />

      <Input
        multiple
        label="Tags"
        data={state.tags}
        autoComplete="off"
        value={state.tag || ""}
        error={state.errors.tags}
        placeholder="Enter a tag and press enter"
        maxLength={validation.misc.tag.maxLength}
        description="A word or phrase that could be used to search for this note"
        removeItem={(item) => {
          dispatch({ type: "removeTag", value: item });
        }}
        addItem={(item) => {
          dispatch({ type: "addTag", value: item });
          dispatch({ type: "tag", value: "" });
        }}
        onChange={(e) => {
          dispatch({ type: "tag", value: e.target.value });
          dispatch({ type: "errors", value: { tag: "" } });
        }}
      />

      <Select
        label="Location Type"
        value={state.locationType || "page"}
        options={[
          { label: "Page", value: "page" },
          {
            label: "ID Reference on Website",
            value: "id",
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
        onChange={(value) => {
          dispatch({ type: "locationType", value });
          dispatch({ type: "errors", value: { locationType: "" } });
        }}
      />

      {canChangePermissions ? (
        <Permissions
          disabled={state.loading}
          permissions={state.permissions}
          error={state.errors.permissions}
          setPermissions={(value) => {
            dispatch({ type: "permissions", value });
            dispatch({
              type: "errors",
              value: { permissions: "" },
            });
          }}
        />
      ) : (
        <div />
      )}

      <button
        type="submit"
        className="button submit primary"
        disabled={state.loading || !canSubmitChange()}
      >
        Submit Source {state.loading && <Spinner />}
      </button>
    </Form>
  );
}

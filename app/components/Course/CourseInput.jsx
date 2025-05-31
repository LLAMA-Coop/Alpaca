"use client";

import { useStore, useAlerts } from "@/store/store";
import { useEffect, useReducer } from "react";
import { validation } from "@/lib/validation";
import { Validator } from "@/lib/validation";
import {
  Permissions,
  Checkbox,
  TextArea,
  Spinner,
  Column,
  Select,
  Input,
  Form,
} from "@client";
import { getChangedFields } from "@/lib/objects";

const defaultState = {
  name: "",
  description: "",
  enrollment: "open",
  parents: [],
  prerequisites: [],
  sources: [],
  notes: [],
  quizzes: [],
  addAllFromSources: false,
  addAllFromNotes: false,
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
    case "name":
      return { ...state, name: action.value };
    case "description":
      return { ...state, description: action.value };
    case "enrollment":
      return { ...state, enrollment: action.value };
    case "parents":
      return { ...state, parents: action.value };
    case "prerequisites":
      return { ...state, prerequisites: action.value };
    case "sources":
      return { ...state, sources: action.value };
    case "notes":
      return { ...state, notes: action.value };
    case "quizzes":
      return { ...state, quizzes: action.value };
    case "addAllFromSources":
      return { ...state, addAllFromSources: action.value };
    case "addAllFromNotes":
      return { ...state, addAllFromNotes: action.value };
    case "permissions":
      return { ...state, permissions: action.value };
    case "loading":
      return { ...state, loading: action.value };
    case "errors":
      return { ...state, errors: { ...state.errors, ...action.value } };
    case "reset":
      return defaultState;
    case "editing":
      return {
        ...state,
        ...action.value,
        parents: action.value.parents || [],
        prerequisites: action.value.prerequisites || [],
        sources: action.value.sources || [],
        notes: action.value.notes || [],
        quizzes: action.value.quizzes || [],
      };
    default:
      return state;
  }
}

export function CourseInput({ course, close }) {
  if (course) {
    course = {
      ...course,
      permissions: {
        ...course.permissions,
        allRead: course.permissions.allRead === 1,
        allWrite: course.permissions.allWrite === 1,
        groupLocked: course.permissions.groupLocked === 1,
      },
    };
  }

  const [state, dispatch] = useReducer(stateReducer, defaultState);

  const addAlert = useAlerts((state) => state.addAlert);
  const courses = useStore((state) => state.courses);
  const sources = useStore((state) => state.sources);
  const quizzes = useStore((state) => state.quizzes);
  const notes = useStore((state) => state.notes);
  const user = useStore((state) => state.user);

  const isOwner = course && user && course.creator.id === user.id;
  const canChangePermissions = isOwner || !course;

  useEffect(() => {
    if (!course) return;
    dispatch({
      type: "editing",
      value: {
        ...course,
        sources: sources.filter((x) =>
          course.sources ? course.sources.includes(x.id) : false
        ),
        notes: notes.filter((x) =>
          course.notes ? course.notes.includes(x.id) : false
        ),
        quizzes: quizzes.filter((x) =>
          course.quizzes ? course.quizzes.includes(x.id) : false
        ),
      },
    });
  }, [courses, sources, notes, quizzes]);

  const courseData = {
    name: state.name,
    description: state.description,
    enrollment: state.enrollment,
    parents: state.parents?.map((c) => c.id),
    prerequisites: state.prerequisites?.map((c) => c.id),
    sources: state.sources?.map((s) => s.id),
    notes: state.notes?.map((n) => n.id),
    quizzes: state.quizzes?.map((q) => q.id),
    addAllFromSources: state.addAllFromSources,
    addAllFromNotes: state.addAllFromNotes,
    permissions: state.permissions,
  };

  const canSubmitChange = () => {
    if (!course) return true;

    const changedFields = getChangedFields(
      {
        ...course,
        parents: course.parents?.map((c) => c.id),
        prerequisites: course.prerequisites?.map((c) => c.id),
        sources: course.sources?.map((s) => s.id),
        notes: course.notes?.map((n) => n.id),
        quizzes: course.quizzes?.map((q) => q.id),
      },
      courseData
    );

    return Object.keys(changedFields).length > 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (state.loading) return;

    const validator = new Validator();

    validator.validateAll(
      [
        ["name", state.name.trim()],
        ["description", state.description.trim()],
        ["enrollment", state.enrollment],
        ["parents", state.parents],
        ["prerequisites", state.prerequisites],
        ["sources", state.sources],
        ["notes", state.notes],
        ["quizzes", state.quizzes],
      ].map(([field, value]) => ({ field, value })),
      "course"
    );

    const permissions = validator.validatePermissions(state.permissions);

    if (!validator.isValid) {
      return dispatch({ type: "errors", value: validator.errors });
    }

    dispatch({ type: "loading", value: true });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/course${course ? `/${course.id}` : ""}`,
      {
        method: course ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: course
          ? JSON.stringify(
              getChangedFields(
                {
                  ...course,
                  parents: course.parents?.map((c) => c.id),
                  prerequisites: course.prerequisites?.map((c) => c.id),
                  sources: course.sources?.map((s) => s.id),
                  notes: course.notes?.map((n) => n.id),
                  quizzes: course.quizzes?.map((q) => q.id),
                },
                courseData,
                true
              )
            )
          : JSON.stringify({
              name: state.name.trim(),
              description: state.description.trim(),
              enrollment: state.enrollment,
              parents: state.parents.map((c) => c.id),
              prerequisites: state.prerequisites.map((c) => c.id),
              sources: state.sources.map((s) => s.id),
              notes: state.notes.map((n) => n.id),
              quizzes: state.quizzes.map((q) => q.id),
              addAllFromSources: state.addAllFromSources,
              addAllFromNotes: state.addAllFromNotes,
              permissions,
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
      dispatch({ type: "reset" });

      addAlert({
        success: true,
        message: data.message || "Successfully created course.",
      });
    } else if (response.status === 200) {
      addAlert({
        success: true,
        message: data.message || "Successfully updated course.",
      });

      if (close) close();
    } else {
      addAlert({
        success: false,
        message: data.errors.server || "Something went wrong.",
      });
    }
  }

  return (
    <Form singleColumn={course} onSubmit={handleSubmit}>
      <Column gap={course ? 40 : null}>
        <Input
          required
          label="Name"
          value={state.name}
          error={state.errors.name}
          placeholder="Learn to code"
          maxLength={validation.course.name.maxLength}
          onChange={(e) => {
            dispatch({ type: "name", value: e.target.value });
            dispatch({ type: "errors", errors: { name: "" } });
          }}
        />

        <Select
          label="Enrollment Type"
          value={state.enrollment}
          error={state.errors.enrollment}
          options={[
            { value: "open", label: "Open" },
            { value: "paid", label: "Paid" },
            { value: "private", label: "Private" },
          ]}
          onChange={(e) => {
            dispatch({ type: "enrollment", value: e });
          }}
        />
      </Column>

      <TextArea
        required
        label="Description"
        value={state.description}
        error={state.errors.description}
        maxLength={validation.course.description.maxLength}
        placeholder="This course will teach you how to code in JavaScript."
        onChange={(e) => {
          dispatch({ type: "description", value: e.target.value });
          dispatch({ type: "errors", errors: { description: "" } });
        }}
      />

      <Select
        multiple
        itemValue="name"
        itemLabel="name"
        options={courses}
        data={state.parents}
        label="Parent Courses"
        placeholder="Select courses"
        error={state.errors.parents}
        description="Courses that this course is a part of"
        setter={(value) => {
          dispatch({ type: "parents", value });
          dispatch({ type: "errors", value: { parents: "" } });
        }}
      />

      <Select
        multiple
        itemValue="name"
        itemLabel="name"
        options={courses}
        data={state.prerequisites}
        label="Prerequisite Courses"
        placeholder="Select courses"
        error={state.errors.prerequisites}
        description="Courses that must be taken before this course"
        setter={(value) => {
          dispatch({ type: "prerequisites", value });
          dispatch({ type: "errors", value: { prerequisites: "" } });
        }}
      />

      <Select
        multiple
        itemValue="title"
        label="Sources"
        itemLabel="title"
        options={sources}
        data={state.sources}
        placeholder="Select sources"
        error={state.errors.sources}
        description="The sources used by this course"
        setter={(value) => {
          dispatch({ type: "sources", value });
          dispatch({ type: "errors", value: { sources: "" } });
        }}
      />

      <Checkbox
        value={state.addAllFromSources}
        label="Add all notes and quizzes linked to these sources"
        onChange={(value) =>
          dispatch({
            type: "addAllFromSources",
            value: value,
          })
        }
      />

      <Select
        multiple
        itemValue="title"
        label="Notes"
        options={notes}
        itemLabel="title"
        data={state.notes}
        placeholder="Select notes"
        error={state.errors.notes}
        description="The notes used by this course"
        setter={(value) => {
          dispatch({ type: "notes", value });
          dispatch({ type: "errors", value: { notes: "" } });
        }}
      />

      <Checkbox
        value={state.addAllFromNotes}
        label="Add all quizzes linked to these notes"
        onChange={(value) =>
          dispatch({
            type: "addAllFromNotes",
            value: value,
          })
        }
      />

      <Select
        multiple
        itemValue="prompt"
        label="Quizzes"
        options={quizzes}
        itemLabel="prompt"
        data={state.quizzes}
        placeholder="Select quizzes"
        error={state.errors.quizzes}
        description="The quizzes used by this course"
        setter={(value) => {
          dispatch({ type: "quizzes", value });
          dispatch({ type: "errors", value: { quizzes: "" } });
        }}
      />

      {canChangePermissions && (
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
      )}

      <button
        type="submit"
        className="button submit primary"
        disabled={state.loading || !canSubmitChange()}
      >
        Submit Course {state.loading && <Spinner />}
      </button>
    </Form>
  );
}

"use client";

import { useStore } from "@/store/store";
import {
  Select,
  Input,
  Permissions,
  Dialog,
  DialogContent,
  DialogHeading,
} from "@client";
import styles from "@app/components/Train/DailyTrain.module.css";
import { useState, useEffect } from "react";
import { validation } from "@/lib/validation";

export default function InputDefaults() {
  const [show, setShow] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [tag, setTag] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [permissions, setPermissions] = useState({});

  const inputDefaults = useStore((state) => state.inputDefaults);
  const setInputDefaults = useStore((state) => state.setInputDefaults);
  const sources = useStore((state) => state.sources);
  const courses = useStore((state) => state.courses);
  const notes = useStore((state) => state.notes);

  useEffect(() => {
    setSelectedSources(inputDefaults.sources);
    setSelectedCourses(inputDefaults.courses);
    setSelectedTags(inputDefaults.tags);
    setSelectedNotes(inputDefaults.notes);
    setPermissions(inputDefaults.permissions);
  }, [inputDefaults]);

  function setDefaultSettings(type) {
    switch (type) {
      case "source":
      case "sources":
        return (selections) => setInputDefaults({ sources: selections });
      case "course":
      case "courses":
        return (selections) => setInputDefaults({ courses: selections });
      case "note":
      case "notes":
        return (selections) => setInputDefaults({ notes: selections });
      case "tag":
      case "tags":
        return (selections) => setInputDefaults({ tags: selections });
      default:
        throw new Error(`Invalid type, ${type}, for setDefaultSettings`);
    }
  }

  return (
    <div className={styles.settings}>
      <button onClick={() => setShow(true)} className="button">
        <svg viewBox="0 0 512 512" fill="currentColor" height="18" width="18">
          <g>
            <path d="M21.359,101.359h58.368c11.52,42.386,55.219,67.408,97.605,55.888c27.223-7.399,48.489-28.665,55.888-55.888h257.472   c11.782,0,21.333-9.551,21.333-21.333s-9.551-21.333-21.333-21.333H233.22C221.7,16.306,178.001-8.716,135.615,2.804   c-27.223,7.399-48.489,28.665-55.888,55.888H21.359c-11.782,0-21.333,9.551-21.333,21.333S9.577,101.359,21.359,101.359z" />
            <path d="M490.692,234.692h-58.368c-11.497-42.38-55.172-67.416-97.552-55.92c-27.245,7.391-48.529,28.674-55.92,55.92H21.359   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h257.493c11.497,42.38,55.172,67.416,97.552,55.92   c27.245-7.391,48.529-28.674,55.92-55.92h58.368c11.782,0,21.333-9.551,21.333-21.333   C512.025,244.243,502.474,234.692,490.692,234.692z" />
            <path d="M490.692,410.692H233.22c-11.52-42.386-55.219-67.408-97.605-55.888c-27.223,7.399-48.489,28.665-55.888,55.888H21.359   c-11.782,0-21.333,9.551-21.333,21.333c0,11.782,9.551,21.333,21.333,21.333h58.368c11.52,42.386,55.219,67.408,97.605,55.888   c27.223-7.399,48.489-28.665,55.888-55.888h257.472c11.782,0,21.333-9.551,21.333-21.333   C512.025,420.243,502.474,410.692,490.692,410.692z" />
          </g>
        </svg>
        Default Settings
      </button>
      <Dialog open={show} onOpenChange={() => setShow(false)}>
        <DialogContent>
          <DialogHeading>Default Settings</DialogHeading>
          <p>
            Use this form to add defaults to new resource inputs. You can change
            these in the form later if they do not apply.
          </p>
          <Select
            multiple
            label="Sources"
            data={selectedSources}
            options={sources}
            itemValue="title"
            itemLabel="title"
            setter={setDefaultSettings("sources")}
            description="For Notes and Quizzes"
          />
          <Select
            multiple
            label="Courses"
            data={selectedCourses}
            options={courses}
            itemValue="name"
            itemLabel="name"
            setter={setDefaultSettings("courses")}
            description="For Notes, Quizzes, and Sources"
          />
          <Select
            multiple
            label="Notes"
            data={selectedNotes}
            options={notes}
            itemValue="title"
            itemLabel="title"
            setter={setDefaultSettings("notes")}
            description="For Quizzes"
          />
          <Input
            multiple
            label="Tags"
            value={tag}
            data={selectedTags}
            maxLength={validation.misc.tag.maxLength}
            removeItem={(item) => {
              setDefaultSettings("tags")([
                ...selectedTags.filter((x) => x !== item),
              ]);
            }}
            addItem={() => {
              setDefaultSettings("tags")([...selectedTags, tag]);
              setTag("");
            }}
            onChange={(e) => {
              setTag(e.target.value);
            }}
            description="For Notes, Quizzes, and Sources"
          />
          <Permissions
            permissions={permissions}
            setPermissions={(value) => {
              setInputDefaults({ permissions: value });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useDailyTrain, useStore } from "@/store/store";
import styles from "./DailyTrain.module.css";
import { useState, useEffect } from "react";
import { Input, Select } from "@client";

export function TrainSettings({ tags, courses }) {
  const settings = useDailyTrain((state) => state.settings);
  const setSettings = useDailyTrain((state) => state.setSettings);
  const availableCourses = useStore((state) => state.courses);

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");

  useEffect(() => {
    let time = settings.timeLimit;
    if (isNaN(time) || time < 0) time = 0;
    if (time > 3600) time = 3600;
    let minutes = String(Math.floor(time / 60)).padStart(2, "0");
    let seconds = String(time % 60).padStart(2, "0");
    setMinutes(minutes);
    setSeconds(seconds);
    setSelectedTags(settings.tags.length > 0 ? settings.tags : []);
    setSelectedCourses(
      settings.courses.length > 0
        ? settings.courses
        : []
    );
  }, [settings]);

  const tagOptions = tags.map((tag, index) => ({ tag, id: index }));
  const courseOptions = courses.map((c_id) => {
    const course = availableCourses.find((c) => c.id === c_id);
    return course;
  });

  function updateTime(denomination, value) {
    let timeLimit;
    if (denomination === "minutes") {
      timeLimit = value * 60 + Number(seconds);
    }
    if (denomination === "seconds") {
      timeLimit = Number(minutes) * 60 + value;
    }
    setSettings({ timeLimit });
  }

  function setSettingTags(tagsChosen) {
    setSettings({ tags: tagsChosen });
  }

  function setSettingCourses(coursesChosen) {
    setSettings({ courses: coursesChosen });
  }

  return (
    <div className={styles.settings}>
      <div>
        <h3>Time Limit</h3>
        {/* <Input
                    inline
                    label={"Minutes"}
                    type="number"
                    min={0}
                    max={60}
                    value={minutes}
                    onChange={(e) =>
                        updateTime("minutes", Number(e.target.value))
                    }
                />
                :
                <Input
                    inline
                    label={"Seconds"}
                    type="number"
                    min={-10}
                    max={60}
                    value={seconds}
                    onChange={(e) =>
                        updateTime("seconds", Number(e.target.value))
                    }
                /> */}
      </div>

      <div>
        <h3>Filter by Tags</h3>

        <Select
          multiple
          label="Tags"
          data={selectedTags}
          options={tagOptions}
          itemValue="tag"
          itemLabel="tag"
          setter={setSettingTags}
        />
      </div>

      <div>
        <h3>Filter by Courses</h3>

        <Select
          multiple
          label="Courses"
          data={selectedCourses}
          options={courseOptions}
          itemValue="name"
          itemLabel="name"
          setter={setSettingCourses}
        />
      </div>
    </div>
  );
}

"use client";

import { useDailyTrain, useStore } from "@/store/store";
import { Input, Label } from "../client";
import { useState } from "react";
import ListAdd from "../form/ListAdd";

export default function TrainSettings({ tags, courses }) {
    const settings = useDailyTrain((state) => state.settings);
    const setSettings = useDailyTrain((state) => state.setSettings);
    const availableCourses = useStore((state) => state.courseStore);

    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const tagOptions = tags.map((t, index) => ({ tag: t, _id: index }));
    const courseOptions = courses.map((c_id) => {
        const course = availableCourses.find((c) => c._id === c_id);
        return course;
    });

    function updateTime(denomination, value) {
        if (denomination === "minutes") {
            setSettings({ timeLimit: value * 60 + seconds });
            setMinutes(value);
        }
        if (denomination === "seconds") {
            setSettings({ timeLimit: minutes * 60 + value });
            if (value < 59) {
                setSeconds(value);
            } else {
                setMinutes(minutes + Math.floor(value / 60));
                setSeconds(value % 60);
            }
        }
    }

    function setSettingTags(tagsChosen) {
        setSelectedTags(tagsChosen);
        setSettings({ tags: tagsChosen.map((t) => t.tag) });
    }

    function setSettingCourses(coursesChosen) {
        setSelectedCourses(coursesChosen);
        setSettings({ courses: coursesChosen.map((c) => c._id) });
    }

    return (
        <>
            {/* <Input
                type="number"
                label={`Time Limit`}
                value={settings.timeLimit}
                onChange={(e) => {
                    setSettings({ timeLimit: Number(e.target.value) });
                }}
            /> */}
            <Label label={"Time Limit"} />
            <Input
                inline
                label={"Minutes"}
                type="number"
                pattern="\d{2}"
                min={0}
                max={60}
                value={minutes}
                onChange={(e) => updateTime("minutes", Number(e.target.value))}
            />
            :
            <Input
                inline
                label={"Seconds"}
                type="number"
                pattern="\d{2}"
                min={0}
                max={60}
                value={seconds}
                onChange={(e) => updateTime("seconds", Number(e.target.value))}
            />
            <ListAdd
                item="Filter by Tags"
                listChosen={selectedTags}
                listChoices={tagOptions}
                listProperty={"tag"}
                listSetter={setSettingTags}
            />
            <ListAdd
                item="Filter by Course"
                listChosen={selectedCourses}
                listChoices={courseOptions}
                listProperty={"name"}
                listSetter={setSettingCourses}
            />
        </>
    );
}

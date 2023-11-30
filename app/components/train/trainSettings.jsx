"use client";

import { useDailyTrain, useStore } from "@/store/store";
import { Input } from "../client";
import { useState } from "react";
import ListAdd from "../form/ListAdd";

export default function TrainSettings({ tags, courses }) {
    const settings = useDailyTrain((state) => state.settings);
    const setSettings = useDailyTrain((state) => state.setSettings);
    const availableCourses = useStore((state) => state.courseStore);

    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]);

    const tagOptions = tags.map((t, index) => ({ tag: t, _id: index }));
    const courseOptions = courses.map((c_id) => {
        const course = availableCourses.find((c) => c._id === c_id);
        return course;
    });

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
            <Input
                type="number"
                label={`Time Limit`}
                value={settings.timeLimit}
                onChange={(e) => {
                    setSettings({ timeLimit: Number(e.target.value) });
                }}
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

"use client";

import styles from "@/app/(dashboard)/me/dashboard/Dash.module.css";
import { useStore } from "@/store/store";
import { useEffect, useState } from "react";
import {
  CourseTabInfo,
  CourseTabMain,
  NotesTabInfo,
  NotesTabMain,
  QuizzesTabInfo,
  QuizzesTabMain,
  SourcesInfoTab,
  SourcesMainTab,
} from "./CourseDashComponents";

export function CourseDash({ course, isLogged }) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const courses = useStore((state) => state.courses);
  const user = useStore((state) => state.user);

  useEffect(() => {
    setCurrentTab(
      parseInt(
        typeof window != "undefined"
          ? localStorage?.getItem("currentTab") || 0
          : 0
      )
    );
  }, []);

  const isEnrolled = courses.find((c) => c.id === course.id);

  const tabs = [
    {
      name: "Course Info",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m18,12c-3.314,0-6,2.686-6,6s2.686,6,6,6,6-2.686,6-6-2.686-6-6-6Zm1,2v2h-2v-2h2Zm0,8h-2v-5h2v5ZM2,18c-.738-.001-1.451.271-2,.765V3C0,1.343,1.343,0,3,0h1v18h-2Zm8,0h-4V0h12c1.105,0,2,.895,2,2v8.252c-.639-.165-1.309-.252-2-.252-4.418,0-8,3.582-8,8Zm2.709,6H2c-1.105,0-2-.895-2-2s.895-2,2-2h8.252c.405,1.573,1.276,2.958,2.457,4Z" />
        </svg>
      ),
      info: (
        <CourseTabInfo
          course={course}
          isLogged={isLogged}
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ),
      main: (
        <CourseTabMain
          user={user}
          course={course}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      ),
    },
    {
      name: "Quizzes",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m21.999,22.941c.032.552-.389,1.024-.94,1.057-.02,0-.04.002-.059.002-.525,0-.966-.41-.998-.941-.069-1.184-.831-2.217-1.942-2.634l-5.404-2.026c-.39-.146-.649-.52-.649-.937v-5.354c0-.538-.362-1.018-.825-1.093-.302-.053-.596.029-.823.224-.224.19-.353.468-.353.762v8.455c0,.607-.34,1.149-.888,1.414-.547.263-1.183.194-1.66-.185l-1.712-1.363c-.012-.009-.016-.023-.027-.032-.01-.009-.023-.011-.033-.02-.402-.373-1.034-.354-1.41.048-.377.403-.356,1.038.046,1.416l.568.548c.648.624.206,1.72-.694,1.72-.259,0-.508-.1-.694-.28l-.558-.538c-1.196-1.12-1.26-3.022-.13-4.23,1.104-1.183,2.945-1.261,4.155-.205.006.005.014.006.021.011l1.015.808v-7.564c0-.881.385-1.714,1.056-2.285.671-.571,1.558-.816,2.44-.675,1.428.232,2.504,1.552,2.504,3.067v4.661l4.755,1.783c1.851.695,3.121,2.418,3.236,4.39ZM5.16,3.416c-.018-.036-.103-.083-.16-.083-.055,0-.145.055-.167.102l-.725,2.121h1.784l-.732-2.139ZM0,5C0,2.239,2.239,0,5,0s5,2.239,5,5-2.239,5-5,5S0,7.761,0,5Zm2.959,2.778c.232,0,.439-.148.515-.368l.254-.743h2.544l.254.743c.075.22.282.368.514.368h0c.372,0,.634-.365.515-.717l-1.362-4.055c-.286-.647-.685-.784-1.194-.784-.509,0-.909.137-1.202.804l-1.354,4.034c-.118.352.144.717.515.717Zm13.485-1.111h1.643c.29,0,.549-.211.577-.499.033-.331-.228-.612-.553-.612h-2.222v.556c0,.307.248.556.555.556Zm1.664-2.834c-.029-.288-.288-.499-.578-.499h-1.086c-.307,0-.556.249-.556.556v.556h1.667c.325,0,.586-.281.553-.612Zm-6.108,1.167c0-2.761,2.239-5,5-5s5,2.239,5,5-2.239,5-5,5-5-2.239-5-5Zm2.778,1c0,.982.796,1.778,1.778,1.778h1.512c.876,0,1.635-.657,1.705-1.53.052-.645-.267-1.222-.765-1.541.144-.254.223-.549.214-.863-.024-.911-.801-1.622-1.713-1.622h-.848c-1.088,0-1.883.796-1.883,1.778v2Z" />
        </svg>
      ),
      info: <QuizzesTabInfo course={course} />,
      main: <QuizzesTabMain course={course} />,
    },
    {
      name: "Notes",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m16,2.172v-1.172c0-.553-.448-1-1-1s-1,.447-1,1v1h-2v-1c0-.553-.448-1-1-1s-1,.447-1,1v1h-2v-1c0-.553-.448-1-1-1s-1,.447-1,1v1h-2v-1c0-.553-.448-1-1-1s-1,.447-1,1v1.172c-1.164.413-2,1.524-2,2.828v14c0,2.757,2.243,5,5,5h8c2.757,0,5-2.243,5-5V5c0-1.304-.836-2.415-2-2.828Zm-6,14.828h-5c-.552,0-1-.447-1-1s.448-1,1-1h5c.552,0,1,.447,1,1s-.448,1-1,1Zm3-4H5c-.552,0-1-.447-1-1s.448-1,1-1h8c.552,0,1,.447,1,1s-.448,1-1,1Zm0-4H5c-.552,0-1-.447-1-1s.448-1,1-1h8c.552,0,1,.447,1,1s-.448,1-1,1Zm9,15l-1.121-1.121c-.563-.563-.879-1.326-.879-2.121V2c0-1.105.895-2,2-2h0c1.105,0,2,.895,2,2v18.757c0,.796-.316,1.559-.879,2.121l-1.121,1.121" />
        </svg>
      ),
      info: <NotesTabInfo course={course} />,
      main: <NotesTabMain course={course} />,
    },
    {
      name: "Sources",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m14 7v-6.54a6.977 6.977 0 0 1 2.465 1.59l3.484 3.486a6.954 6.954 0 0 1 1.591 2.464h-6.54a1 1 0 0 1 -1-1zm8 3.485v8.515a5.006 5.006 0 0 1 -5 5h-10a5.006 5.006 0 0 1 -5-5v-14a5.006 5.006 0 0 1 5-5h4.515c.163 0 .324.013.485.024v6.976a3 3 0 0 0 3 3h6.976c.011.161.024.322.024.485zm-8 8.515a1 1 0 0 0 -1-1h-5a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1zm3-4a1 1 0 0 0 -1-1h-8a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1z" />
        </svg>
      ),
      info: <SourcesInfoTab course={course} />,
      main: <SourcesMainTab course={course} />,
    },
  ];

  return (
    <main className={styles.main}>
      <section>
        <nav>
          <ul className={styles.tabList}>
            {tabs.map((tab, index) => (
              <li
                key={tab.name}
                tabIndex={0}
                className={currentTab === index ? styles.active : ""}
                onClick={() => {
                  setCurrentTab(index);
                  localStorage.setItem("currentTab", index);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCurrentTab(index);
                    localStorage.setItem("currentTab", index);
                  }
                }}
              >
                <div>{tab.icon}</div>

                <span>{tab.name}</span>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className={styles.content}>
        <div className={styles.courseHead}>
          <h1>{course.name}</h1>
        </div>

        <header className={`${styles.tabHeader} ${styles.course}`}>
          <h2>
            {tabs[currentTab].name}
            {tabs[currentTab].icon}
          </h2>

          {tabs[currentTab].info}
        </header>

        <main className="scrollbar">
          <header className={styles.mobileHeader}>
            {tabs[currentTab].info}
          </header>
          {tabs[currentTab].main}
        </main>
      </section>
    </main>
  );
}

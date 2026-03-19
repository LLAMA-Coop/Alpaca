"use client";

import { useState, useEffect } from "react";
import styles from "./CourseSelector.module.css";

export function CourseSelector({ selectedCourse, onSelectCourse }) {
    const [courses, setCourses] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/course/public", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch courses");
            }

            const data = await response.json();
            const courseArray = Array.isArray(data) ? data : data.courses || [];
            setCourses(courseArray);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching courses:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCourses = courses.filter(
        (course) =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.id && course.id.toString().includes(searchTerm))
    );

    const handleSelect = (course) => {
        onSelectCourse(course);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={styles.container}>
            <div className={styles.selectorBox}>
                <label className={styles.label}>Select a Course</label>

                <div className={styles.selector}>
                    <button
                        className={`${styles.button} ${isOpen ? styles.open : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            "Loading courses..."
                        ) : selectedCourse ? (
                            <>
                                <span className={styles.selected}>{selectedCourse.name}</span>
                                <span className={styles.id}>ID: {selectedCourse.id}</span>
                            </>
                        ) : (
                            <span className={styles.placeholder}>Choose a course...</span>
                        )}
                        <span className={styles.arrow}>▼</span>
                    </button>

                    {isOpen && (
                        <div className={styles.dropdown}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />

                            {error && (
                                <div className={styles.error}>
                                    <p>❌ Error loading courses: {error}</p>
                                    <button
                                        className={styles.retryButton}
                                        onClick={fetchCourses}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!error && filteredCourses.length === 0 ? (
                                <div className={styles.empty}>
                                    <p>
                                        {searchTerm ? "No courses match your search" : "No courses available"}
                                    </p>
                                </div>
                            ) : (
                                <ul className={styles.list}>
                                    {filteredCourses.map((course) => (
                                        <li
                                            key={course.id}
                                            className={`${styles.item} ${selectedCourse?.id === course.id ? styles.active : ""
                                                }`}
                                            onClick={() => handleSelect(course)}
                                        >
                                            <div className={styles.courseName}>{course.name}</div>
                                            <div className={styles.courseId}>ID: {course.id}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {selectedCourse && !isOpen && (
                    <button
                        className={styles.clearButton}
                        onClick={() => {
                            onSelectCourse(null);
                            setSearchTerm("");
                        }}
                    >
                        Clear Selection
                    </button>
                )}
            </div>
        </div>
    );
}

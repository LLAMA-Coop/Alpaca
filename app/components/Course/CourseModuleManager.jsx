"use client";

import { useState, useEffect } from "react";
import { useAlerts } from "@/store/store";
import styles from "./CourseModule.module.css";

export function CourseModuleManager({ courseId, onModulesUpdate }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newModule, setNewModule] = useState({
        title: "",
        description: "",
    });
    const [editingModule, setEditingModule] = useState(null);
    const addAlert = useAlerts((state) => state.addAlert);

    // Fetch modules on mount
    useEffect(() => {
        if (courseId) {
            fetchModules();
        }
    }, [courseId]);

    async function fetchModules() {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/course/${courseId}/modules`
            );
            if (response.ok) {
                const data = await response.json();
                setModules(data.modules || []);
            }
        } catch (error) {
            console.error("Failed to fetch modules:", error);
        }
    }

    async function handleAddModule(e) {
        e.preventDefault();
        if (!newModule.title.trim()) {
            addAlert({
                success: false,
                message: "Module title is required",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/course/${courseId}/modules`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: newModule.title,
                        description: newModule.description,
                        orderIndex: modules.length,
                    }),
                }
            );

            if (response.ok) {
                addAlert({
                    success: true,
                    message: "Module created successfully",
                });
                setNewModule({ title: "", description: "" });
                await fetchModules();
                if (onModulesUpdate) onModulesUpdate();
            } else {
                throw new Error("Failed to create module");
            }
        } catch (error) {
            addAlert({
                success: false,
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateModule(e) {
        e.preventDefault();
        if (!editingModule.title.trim()) {
            addAlert({
                success: false,
                message: "Module title is required",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/course/${courseId}/modules/${editingId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editingModule.title,
                        description: editingModule.description,
                    }),
                }
            );

            if (response.ok) {
                addAlert({
                    success: true,
                    message: "Module updated successfully",
                });
                setEditingId(null);
                setEditingModule(null);
                await fetchModules();
                if (onModulesUpdate) onModulesUpdate();
            } else {
                throw new Error("Failed to update module");
            }
        } catch (error) {
            addAlert({
                success: false,
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteModule(moduleId) {
        if (!confirm("Are you sure you want to delete this module?")) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASEPATH ?? ""}/api/course/${courseId}/modules/${moduleId}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                addAlert({
                    success: true,
                    message: "Module deleted successfully",
                });
                await fetchModules();
                if (onModulesUpdate) onModulesUpdate();
            } else {
                throw new Error("Failed to delete module");
            }
        } catch (error) {
            addAlert({
                success: false,
                message: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.moduleManager}>
            <div className={styles.header}>
                <h3>Course Modules</h3>
                <p className={styles.subtitle}>
                    Organize your course into modules or chapters for better learning structure
                </p>
            </div>

            {/* Module List */}
            {modules.length > 0 && (
                <div className={styles.moduleList}>
                    <h4>Existing Modules</h4>
                    {modules.map((module, idx) => (
                        <div key={module.id} className={styles.moduleItem}>
                            {editingId === module.id ? (
                                <form onSubmit={handleUpdateModule} className={styles.editForm}>
                                    <input
                                        type="text"
                                        value={editingModule.title}
                                        onChange={(e) =>
                                            setEditingModule({
                                                ...editingModule,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Module title"
                                        className={styles.titleInput}
                                    />
                                    <textarea
                                        value={editingModule.description || ""}
                                        onChange={(e) =>
                                            setEditingModule({
                                                ...editingModule,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Module description (optional)"
                                        className={styles.descInput}
                                    />
                                    <div className={styles.actions}>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="button small success"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditingModule(null);
                                            }}
                                            className="button small border"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className={styles.moduleInfo}>
                                        <span className={styles.order}>{idx + 1}</span>
                                        <div className={styles.details}>
                                            <h5>{module.title}</h5>
                                            {module.description && (
                                                <p className={styles.description}>{module.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            onClick={() => {
                                                setEditingId(module.id);
                                                setEditingModule({
                                                    title: module.title,
                                                    description: module.description,
                                                });
                                            }}
                                            className="button small"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteModule(module.id)}
                                            disabled={loading}
                                            className="button small danger"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Module Form */}
            <div className={styles.addForm}>
                <h4>Add New Module</h4>
                <form onSubmit={handleAddModule}>
                    <input
                        type="text"
                        value={newModule.title}
                        onChange={(e) =>
                            setNewModule({ ...newModule, title: e.target.value })
                        }
                        placeholder="Module title (e.g., 'Chapter 1: Fundamentals')"
                        className={styles.titleInput}
                        maxLength={256}
                    />
                    <textarea
                        value={newModule.description}
                        onChange={(e) =>
                            setNewModule({ ...newModule, description: e.target.value })
                        }
                        placeholder="Module description (optional)"
                        className={styles.descInput}
                        maxLength={1024}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="button primary"
                    >
                        Add Module
                    </button>
                </form>
            </div>

            {modules.length === 0 && (
                <div className={styles.empty}>
                    <p>No modules yet. Create your first module to get started!</p>
                </div>
            )}
        </div>
    );
}

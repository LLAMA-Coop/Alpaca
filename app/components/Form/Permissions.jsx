"use client";

import styles from "./Permissions.module.css";
import { Checkbox, Select } from "@client";
import { useStore } from "@/store/store";
import { useState } from "react";

export function Permissions({ permissions, setPermissions, disabled, error }) {
    const [show, setShow] = useState(false);

    const {
        allRead = false,
        allWrite = false,
        read = [],
        write = [],
        groupId = null,
        groupLocked = false,
    } = permissions;

    const groups = useStore((state) => state.groups);
    const associates = useStore((state) => state.associates);

    if (disabled) {
        setPermissions = () => {};
    }

    return (
        <section
            className={`${styles.permissions} ${!show ? styles.hidden : ""}`}
        >
            <header>
                <p>Permissions</p>

                {show && (
                    <button
                        type="button"
                        className={styles.hide}
                        onClick={() => setShow(false)}
                    >
                        Hide
                    </button>
                )}

                {error && (
                    <span className={styles.error}>
                        * {JSON.stringify(error, null, 4)}
                    </span>
                )}
            </header>

            <div>
                <div>
                    <Checkbox
                        label="Everyone can read"
                        value={allRead || allWrite}
                        onChange={(value) => {
                            setPermissions({
                                ...permissions,
                                allRead: value,
                            });
                        }}
                    />

                    <Select
                        multiple
                        data={read}
                        error={false}
                        itemValue="id"
                        itemLabel="username"
                        placeholder="Select groups and users"
                        label="Groups and users allowed to read"
                        options={[
                            ...groups.map((g) => ({
                                username: g.name,
                                ...g,
                            })),
                            ...associates,
                        ]}
                        setter={(value) => {
                            setPermissions({
                                ...permissions,
                                read: value,
                            });
                        }}
                    />
                </div>

                <hr />

                <div>
                    <Checkbox
                        label="Everyone can edit"
                        value={allWrite}
                        onChange={(value) => {
                            setPermissions({
                                ...permissions,
                                allWrite: value,
                            });
                        }}
                    />

                    <Select
                        multiple
                        data={write}
                        error={false}
                        itemValue="id"
                        itemLabel="username"
                        placeholder="Select groups and users"
                        label="Groups and users allowed to edit"
                        options={[
                            ...groups.map((g) => ({
                                username: g.name,
                                ...g,
                            })),
                            ...associates,
                        ]}
                        setter={(value) => {
                            setPermissions({
                                ...permissions,
                                write: value,
                                edit: [...permissions.edit, ...value],
                            });
                        }}
                    />
                </div>

                {!show && (
                    <button
                        type="button"
                        className={styles.show}
                        onClick={() => setShow(true)}
                    >
                        Change permissions
                    </button>
                )}
            </div>
        </section>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Input, Label } from "@/app/components/client";
// add this to client/index.js
import ListAdd from "./ListAdd";
import { useStore } from "@/store/store";

export default function PermissionsInput({
    permissions,
    setter,
}) {
    const [allWrite, setAllWrite] = useState(false);
    const [allRead, setAllRead] = useState(false);
    const [usersWrite, setUsersWrite] = useState([]);
    const [usersRead, setUsersRead] = useState([]);
    const [groupsWrite, setGroupsWrite] = useState([]);
    const [groupsRead, setGroupsRead] = useState([]);

    const availableUsers = useStore((state) => state.userStore);
    const availableGroups = useStore((state) => state.groupStore);

    useEffect(() => {
        if (!permissions) {
            return;
        }

        if (permissions.allWrite) {
            setAllWrite(permissions.allWrite);
        }
        if (permissions.allRead) {
            setAllRead(permissions.allRead);
        }

        if (permissions.usersWrite) {
            setUsersWrite([...permissions.usersWrite]);
        }
        if (permissions.usersRead) {
            setUsersRead([...permissions.usersRead]);
        }

        if (permissions.groupsWrite) {
            setGroupsWrite([...permissions.groupsWrite]);
        }
        if (permissions.groupsRead) {
            setGroupsRead([...permissions.groupsRead]);
        }
    }, []);

    useEffect(() => {
        let permissions = {};

        if (allWrite) {
            permissions.allWrite = true;
            setter(permissions);
            return;
        }

        if (allRead) {
            permissions.allRead = true;
        }
        if (usersWrite.length > 0) {
            permissions.usersWrite = [...usersWrite];
        }
        if (usersRead.length > 0 && !allRead) {
            permissions.usersRead = [...usersRead];
        }
        if (groupsWrite.length > 0) {
            permissions.groupsWrite = [...groupsWrite];
        }
        if (groupsRead && !allRead) {
            permissions.groupsRead = [...groupsRead];
        }

        setter(permissions);
    }, [allWrite, allRead, usersWrite, usersRead, groupsWrite, groupsRead]);

    return (
        <details className="formGrid">
            <summary>Edit Permissions</summary>
            <Input
                type="checkbox"
                label="Allow All Users to Edit?"
                value={allWrite}
            />
            <Input
                type="checkbox"
                label="Allow All Users to Read?"
                disabled={allWrite}
                value={allRead}
            />

            <div>
                <Label label="Users with Permission to Edit" />

                {/* Need to add a disable */}
                <ListAdd
                    item="User"
                    listChoices={availableUsers}
                    listChosen={usersWrite}
                    listProperty={"username"}
                    listSetter={setUsersWrite}
                />
            </div>
            <div>
                <Label label="Users with Permission to View" />

                {/* Need to add a disable */}
                <ListAdd
                    item="User"
                    listChoices={availableUsers}
                    listChosen={usersRead}
                    listProperty={"username"}
                    listSetter={setUsersRead}
                />
            </div>

            <div>
                <Label label="Groups with Permission to Edit" />

                {/* Need to add a disable */}
                <ListAdd
                    item="Group"
                    listChoices={availableGroups}
                    listChosen={groupsWrite}
                    listProperty={"name"}
                    listSetter={setGroupsWrite}
                />
            </div>
            <div>
                <Label label="Groups with Permission to View" />

                {/* Need to add a disable */}
                <ListAdd
                    item="Group"
                    listChoices={availableGroups}
                    listChosen={groupsRead}
                    listProperty={"name"}
                    listSetter={setGroupsRead}
                />
            </div>
        </details>
    );
}

"use client";

import { Input, Label, ListAdd } from "@client";
import { useState, useEffect } from "react";
import { useStore, useModals } from "@/store/store";

export function PermissionsInput({ permissions, setter }) {
    const [allWrite, setAllWrite] = useState(
        permissions ? permissions.allWrite || false : false,
    );
    const [allRead, setAllRead] = useState(
        permissions ? permissions.allRead || false : false,
    );
    const [usersWrite, setUsersWrite] = useState([]);
    const [usersRead, setUsersRead] = useState([]);
    const [groupsWrite, setGroupsWrite] = useState([]);
    const [groupsRead, setGroupsRead] = useState([]);

    const user = useStore((state) => state.user);
    const availableGroups = useStore((state) => state.groups);
    const availableUsers = useStore((state) => state.users);
    const addModal = useModals((state) => state.addModal);

    useEffect(() => {
        if (!permissions) return;

        if (permissions.usersWrite) {
            setUsersWrite(
                permissions.usersWrite.map((userId) => {
                    let thisUser = user.associates.find((x) => x.id === userId);
                    if (!thisUser) {
                        thisUser = {
                            id: userId,
                            username: "unknown",
                        };
                    }
                    return thisUser;
                }),
            );
            // setUsersWrite(permissions.usersWrite);
        }

        if (permissions.usersRead) {
            setUsersRead(
                permissions.usersRead.map((userId) => {
                    let thisUser = user.associates.find((x) => x.id === userId);
                    if (!thisUser) {
                        thisUser = {
                            id: userId,
                            username: "unknown",
                        };
                    }
                    return thisUser;
                }),
            );
            // setUsersRead(permissions.usersRead);
        }

        if (permissions.groupsWrite) {
            setGroupsWrite(
                permissions.groupsWrite.map((groupId) => {
                    let group = availableGroups.find((x) => x.id === groupId);
                    if (!group) {
                        group = {
                            id: groupId,
                            name: "Unknown",
                        };
                    }
                    return group;
                }),
            );
            // setGroupsWrite(permissions.groupsWrite);
        }
        if (permissions.groupsRead) {
            setGroupsRead(
                permissions.groupsRead.map((groupId) => {
                    let group = availableGroups.find((x) => x.id === groupId);
                    if (!group) {
                        group = {
                            id: groupId,
                            name: "Unknown",
                        };
                    }
                    return group;
                }),
            );
            // setGroupsRead(permissions.groupsRead);
        }
    }, []);

    useEffect(() => {
        let localPerm = {};

        if (allWrite) {
            localPerm.allWrite = true;
            setter(localPerm);
            return;
        }

        if (allRead) {
            localPerm.allRead = true;
        }
        if (usersWrite.length > 0) {
            localPerm.usersWrite = [...usersWrite];
        }
        if (usersRead.length > 0 && !allRead) {
            localPerm.usersRead = [...usersRead];
        }
        if (groupsWrite.length > 0) {
            localPerm.groupsWrite = [...groupsWrite];
        }
        if (groupsRead.length > 0 && !allRead) {
            localPerm.groupsRead = [...groupsRead];
        }

        setter(localPerm);
    }, [allWrite, allRead, usersWrite, usersRead, groupsWrite, groupsRead]);

    return (
        <div className="formGrid">
            <Input
                type="checkbox"
                label="Allow All Users to Edit?"
                value={allWrite}
                onChange={() => setAllWrite(!allWrite)}
            />

            <Input
                type="checkbox"
                label="Allow All Users to Read?"
                disabled={allWrite}
                value={allRead}
                onChange={() => setAllRead(!allRead)}
            />

            <div>
                <Label label="Associates with Permission to Edit" />

                <ListAdd
                    item="Associate"
                    listChoices={user?.associates}
                    listChosen={usersWrite}
                    listProperty={"username"}
                    listSetter={setUsersWrite}
                    disabled={allWrite}
                    type="datalist"
                    messageIfNone="No associate to edit"
                />
            </div>

            <div>
                <Label label="Associates with Permission to View" />

                <ListAdd
                    item="Associate"
                    listChoices={user?.associates}
                    listChosen={usersRead}
                    listProperty={"username"}
                    listSetter={setUsersRead}
                    disabled={allRead || allWrite}
                    type="datalist"
                    messageIfNone="No associate to read"
                />
            </div>

            <div>
                <Label label="Groups with Permission to Edit" />

                <ListAdd
                    item="Group"
                    listChoices={availableGroups}
                    listChosen={groupsWrite}
                    listProperty={"name"}
                    listSetter={setGroupsWrite}
                    disabled={allWrite}
                    type="datalist"
                    messageIfNone="No group to edit"
                />
            </div>
            <div>
                <Label label="Groups with Permission to View" />

                <ListAdd
                    item="Group"
                    listChoices={availableGroups}
                    listChosen={groupsRead}
                    listProperty={"name"}
                    listSetter={setGroupsRead}
                    disabled={allRead || allWrite}
                    type="datalist"
                    messageIfNone="No group to read"
                />
            </div>
        </div>
    );
}

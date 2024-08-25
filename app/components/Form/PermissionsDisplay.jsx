"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import styles from "./Permissions.module.css";
import { useStore } from "@/store/store";

export function PermissionsDisplay({ permissions }) {
    const user = useStore((state) => state.user);
    const availableGroups = useStore((state) => state.groups);
    if (!permissions) permissions = { allWrite: [], allRead: [] };
    const { allWrite, allRead } = permissions;
    const usersWrite = permissions.usersWrite
        ? permissions.usersWrite.map((userId) => {
              if (typeof userId === "object") return userId;
              let thisUser = user.associates.find((x) => x.id == userId);
              if (!thisUser) {
                  thisUser = {
                      id: userId,
                      username: "unknown",
                  };
              }
              return thisUser;
          })
        : [];
    const usersRead = permissions.usersRead
        ? permissions.usersRead.map((userId) => {
              if (typeof userId === "object") return userId;
              let thisUser = user.associates.find((x) => x.id == userId);
              if (!thisUser) {
                  thisUser = {
                      id: userId,
                      username: "unknown",
                  };
              }
              return thisUser;
          })
        : [];
    const groupsWrite = permissions.groupsWrite
        ? permissions.groupsWrite.map((groupId) => {
              if (typeof groupId === "object") return groupId;
              let group = availableGroups.find((x) => x.id == groupId);
              if (!group) {
                  group = {
                      id: groupId,
                      name: "unknown",
                  };
              }
              return group;
          })
        : [];
    const groupsRead = permissions.groupsRead
        ? permissions.groupsRead.map((groupId) => {
              if (typeof groupId === "object") return groupId;
              let group = availableGroups.find((x) => x.id == groupId);
              if (!group) {
                  group = {
                      id: groupId,
                      name: "unknown",
                  };
              }
              return group;
          })
        : [];

    return (
        <div className={styles.permissions}>
            <h4>Permissions</h4>
            <div>
                <h5>Edit</h5>
                {allWrite && <p>All</p>}

                {!allWrite &&
                    (!permissions.usersWrite ||
                        permissions.usersWrite.length === 0) &&
                    (!permissions.groupsWrite ||
                        permissions.groupsWrite.length === 0) && <p>None</p>}

                {!allWrite && (
                    <ul className="chipList">
                        {usersWrite.map((user, idx) => {
                            if (!user) return <li key={idx}>Unavailable</li>;
                            return (
                                <li key={user.id + "_write"}>
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>
                                        {user.displayName
                                            ? `${user.displayName} (${user.username})`
                                            : user.username}
                                    </span>
                                </li>
                            );
                        })}

                        {groupsWrite.map((group, idx) => {
                            if (!group) return <li key={idx}>Unavailable</li>;
                            return (
                                <li key={group.id + "_write"}>
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    <span>{group.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div>
                <h5>Read</h5>
                {allRead && <p>All</p>}

                {!allRead &&
                    usersRead.length === 0 &&
                    groupsRead.length === 0 && <p>None</p>}

                {!allRead && (
                    <ul className="chipList">
                        {usersRead.map((user, idx) => {
                            if (!user) return <li key={idx}>Unavailable</li>;
                            return (
                                <li key={user.id + "_read"}>
                                    <FontAwesomeIcon icon={faUser} />
                                    <span>
                                        {user.displayName
                                            ? `${user.displayName} (${user.username})`
                                            : user.username}
                                    </span>
                                </li>
                            );
                        })}
                        {groupsRead.map((group, idx) => {
                            if (!group) return <li key={idx}>Unavailable</li>;
                            return (
                                <li key={group.id + "_read"}>
                                    <FontAwesomeIcon icon={faUserGroup} />
                                    <span>{group.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import styles from "./Permissions.module.css";
import { Label } from "./Input";

export function PermissionsDisplay({ permissions, setter }) {
    return (
        <div className={styles.permissions}>
            <h4>Permissions</h4>
            <div>
                <h5>Edit</h5>
                {permissions && permissions.allWrite && <p>All</p>}

                {permissions &&
                    !permissions.allWrite &&
                    (!permissions.usersWrite ||
                        permissions.usersWrite.length === 0) &&
                    (!permissions.groupsWrite ||
                        permissions.groupsWrite.length === 0) && <p>None</p>}

                {permissions &&
                    !permissions.allWrite &&
                    permissions.usersWrite && (
                        <ul className="chipList">
                            {permissions.usersWrite &&
                                permissions.usersWrite.map((user) => {
                                    if (!user)
                                        return <li key={user}>Unavailable</li>;
                                    return (
                                        <li key={user._id + "_write"}>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span>
                                                {user.displayName
                                                    ? `${user.displayName} (${user.username})`
                                                    : user.username}
                                            </span>
                                        </li>
                                    );
                                })}
                            {permissions &&
                                permissions.groupsWrite &&
                                permissions.groupsWrite.map((group) => {
                                    if (!group)
                                        return <li key={group}>Unavailable</li>;
                                    return (
                                        <li key={group._id + "_write"}>
                                            <FontAwesomeIcon
                                                icon={faUserGroup}
                                            />
                                            <span>{group.name}</span>
                                        </li>
                                    );
                                })}
                        </ul>
                    )}
            </div>

            <div>
                <h5>Read</h5>
                {permissions && permissions.allRead && <p>All</p>}

                {permissions &&
                    !permissions.allRead &&
                    (!permissions.usersRead ||
                        permissions.usersRead.length === 0) &&
                    (!permissions.groupsRead ||
                        permissions.groupsRead.length === 0) && <p>None</p>}

                {permissions &&
                    !permissions.allRead &&
                    permissions.usersRead && (
                        <ul className="chipList">
                            {permissions.usersRead &&
                                permissions.usersRead.map((user) => {
                                    if (!user)
                                        return <li key={user}>Unavailable</li>;
                                    return (
                                        <li key={user._id + "_read"}>
                                            <FontAwesomeIcon icon={faUser} />
                                            <span>
                                                {user.displayName
                                                    ? `${user.displayName} (${user.username})`
                                                    : user.username}
                                            </span>
                                        </li>
                                    );
                                })}
                            {permissions.groupsRead &&
                                permissions.groupsRead.map((group) => {
                                    if (!group)
                                        return <li key={group}>Unavailable</li>;
                                    return (
                                        <li key={group._id + "_read"}>
                                            <FontAwesomeIcon
                                                icon={faUserGroup}
                                            />
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

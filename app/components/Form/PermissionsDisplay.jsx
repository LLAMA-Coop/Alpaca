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
                {permissions && permissions.allWrite ? (
                    <p>All</p>
                ) : (
                    <ul className="chipList">
                        {permissions &&
                            permissions.usersWrite &&
                            permissions.usersWrite.map((user) => {
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
                                return (
                                    <li key={group._id + "_write"}>
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
                {permissions && permissions.allRead ? (
                    <p>All</p>
                ) : (
                    <ul className="chipList">
                        {permissions &&
                            permissions.usersRead &&
                            permissions.usersRead.map((user) => {
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
                        {permissions &&
                            permissions.groupsRead &&
                            permissions.groupsRead.map((group) => {
                                return (
                                    <li key={group._id + "_read"}>
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

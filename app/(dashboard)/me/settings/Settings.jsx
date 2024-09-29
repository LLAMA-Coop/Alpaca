"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/app/components/client";
import { useEffect, useState } from "react";
import styles from "./Settings.module.css";
import { useAlerts } from "@/store/store";
import { Appearance } from "./Appearance";
import { Security } from "./Security";
import { Profile } from "./Profile";
import { Account } from "./Account";

export function Settings({ user }) {
    const [currentTab, setCurrentTab] = useState(0);

    useEffect(() => {
        const tab = localStorage.getItem("settings-tab");
        if (tab) {
            setCurrentTab(parseInt(tab));
        }
    }, []);

    const addAlert = useAlerts((state) => state.addAlert);

    const tabs = [
        {
            name: "Profile",
            component: <Profile user={user} />,
        },
        {
            name: "Account",
            component: <Account user={user} />,
        },
        {
            name: "Appearance",
            component: <Appearance user={user} />,
        },
        {
            name: "Security",
            component: <Security user={user} />,
        },
        {
            name: "Notifications",
            component: "Notifications",
        },
        {
            name: "Billing",
            component: "Billing",
        },
        {
            name: "Integrations",
            component: "Integrations",
        },
        {
            name: "API",
            component: "API",
        },
        {
            name: "Advanced",
            component: "Advanced",
        },
    ];

    return (
        <div className={styles.wrapper}>
            <div>
                <aside>
                    <nav>
                        <ul className={styles.tabs}>
                            {tabs.map((tab, index) => (
                                <li
                                    key={index}
                                    tabIndex={0}
                                    className={index === currentTab ? styles.active : ""}
                                    onClick={() => {
                                        setCurrentTab(index);
                                        localStorage.setItem("settings-tab", index);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            setCurrentTab(index);
                                            localStorage.setItem("settings-tab", index);
                                        }
                                    }}
                                >
                                    {tab.name}
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                <main className={styles.main}>
                    <h1>
                        {tabs[currentTab].name}

                        {tabs[currentTab].name === "Profile" && (
                            <Tooltip placement="right">
                                <TooltipTrigger>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await navigator.clipboard.writeText(user.id);
                                                addAlert({
                                                    success: true,
                                                    message: "Copied User ID to clipboard",
                                                });
                                            } catch (error) {
                                                addAlert({
                                                    success: false,
                                                    message: "Failed to copy User ID to clipboard",
                                                });
                                            }
                                        }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            height="18"
                                            width="18"
                                        >
                                            <g>
                                                <path d="M8.253,5.381c1.149-.559,2.64-.831,4.555-.831,4.917,0,8.192,1.6,8.192,9.41,0,.552,.448,1,1,1s1-.448,1-1c0-7.891-3.143-11.41-10.192-11.41-2.225,0-4.001,.338-5.43,1.032-.497,.242-.703,.84-.462,1.337,.242,.496,.839,.704,1.337,.462Z" />
                                                <path d="M17.738,11.133c.529-.157,.831-.714,.673-1.244-.944-3.175-3.527-3.175-5.604-3.175-3.541,0-6.046,.52-6.046,7.246,0,.552,.448,1,1,1s1-.448,1-1c0-5.246,1.268-5.246,4.046-5.246,2.493,0,3.232,.217,3.687,1.746,.157,.529,.714,.831,1.244,.673Z" />
                                            </g>
                                            <g>
                                                <path d="M5.044,6.95c-.506-.221-1.095,.007-1.318,.513-.747,1.698-1.11,3.823-1.11,6.498,0,3.741-1.428,5.906-1.439,5.923-.313,.455-.209,1.094,.257,1.391,.636,.404,1.197,.025,1.391-.257,.073-.106,1.792-2.654,1.792-7.057,0-2.358,.316-4.273,.941-5.692,.222-.506-.007-1.096-.513-1.318Z" />
                                                <path d="M21.935,17.239c-.554-.053-1.034,.364-1.079,.915-.073,.884-.17,1.576-.289,2.057-.132,.537,.195,1.083,.732,1.21,.591,.14,1.098-.276,1.21-.732,.144-.584,.258-1.381,.339-2.371,.045-.55-.364-1.033-.915-1.079Z" />
                                                <path d="M7.427,17.507c-.527-.159-1.086,.142-1.245,.671-.339,1.132-.708,1.736-.708,1.737-.295,.467-.166,1.101,.311,1.379,.659,.384,1.189-.01,1.379-.311,.052-.082,.516-.837,.934-2.231,.158-.529-.142-1.086-.671-1.245Z" />
                                                <path d="M17.854,12.96c-.552,0-1,.448-1,1,0,3.584-.303,5.51-.562,6.069-.232,.501-.012,1.089,.486,1.328,.625,.3,1.159-.122,1.328-.486,.618-1.333,.748-4.494,.748-6.911,0-.552-.448-1-1-1Z" />
                                                <path d="M12.888,12.359c-.552,0-1,.448-1,1,0,4.349-1.414,6.506-1.424,6.521-.314,.454-.213,1.095,.253,1.392,.634,.403,1.182,.054,1.392-.253,.072-.106,1.78-2.629,1.78-7.66,0-.552-.448-1-1-1Z" />
                                            </g>
                                        </svg>
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>Copy User ID</TooltipContent>
                            </Tooltip>
                        )}
                    </h1>

                    {tabs[currentTab].component}
                </main>
            </div>
        </div>
    );
}

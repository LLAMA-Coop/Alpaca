"use client";

import { Input, TinySelect, Tooltip, TooltipContent, TooltipTrigger } from "@client";
import { useRouter } from "next/navigation";
import styles from "./Resources.module.css";
import { useState } from "react";

export function SearchOptions({ name, tag, page, maxPage, amount, noTags = false }) {
    const [tagSearch, setTagSearch] = useState(tag ?? "");
    const router = useRouter();

    return (
        <div className={styles.container}>
            <form
                className={styles.options}
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                <Tooltip>
                    <TooltipTrigger>
                        <div>
                            <TinySelect
                                value={amount}
                                label="Items per page"
                                options={[5, 10, 20, 50, 100].filter((v) => v !== amount)}
                                onChange={(v) => {
                                    router.push(
                                        `/${name}?amount=${v}&page=1${tag ? `&tag=${tag}` : ""}`
                                    );
                                }}
                            />
                        </div>
                    </TooltipTrigger>

                    <TooltipContent>Change the number of items displayed per page</TooltipContent>
                </Tooltip>

                <hr />

                <Tooltip>
                    <TooltipTrigger>
                        <div>
                            <TinySelect
                                label="Page"
                                value={page}
                                options={[...Array(maxPage)]
                                    .map((_, i) => i + 1)
                                    .filter((v) => v !== page)}
                                onChange={(v) => {
                                    router.push(
                                        `/${name}?amount=${amount}&page=${v}${
                                            tag ? `&tag=${tag}` : ""
                                        }`
                                    );
                                }}
                            />
                        </div>
                    </TooltipTrigger>

                    <TooltipContent>Change the page number</TooltipContent>
                </Tooltip>
            </form>

            {!noTags && (
                <form
                    className={styles.search}
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.push(`/${name}?amount=${amount}&tag=${tagSearch}`);
                    }}
                >
                    <Input
                        hideLabel
                        maxLength={32}
                        value={tagSearch}
                        label="Search by tag"
                        placeholder="Search by tag"
                        onChange={(e) => setTagSearch(e.target.value)}
                    />

                    <button type="submit">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 513.749 513.749"
                            fill="currentColor"
                            height="12"
                            width="12"
                            x="0px"
                            y="0px"
                        >
                            <g>
                                <path d="M504.352,459.061l-99.435-99.477c74.402-99.427,54.115-240.344-45.312-314.746S119.261-9.277,44.859,90.15   S-9.256,330.494,90.171,404.896c79.868,59.766,189.565,59.766,269.434,0l99.477,99.477c12.501,12.501,32.769,12.501,45.269,0   c12.501-12.501,12.501-32.769,0-45.269L504.352,459.061z M225.717,385.696c-88.366,0-160-71.634-160-160s71.634-160,160-160   s160,71.634,160,160C385.623,314.022,314.044,385.602,225.717,385.696z" />
                            </g>
                        </svg>
                    </button>
                </form>
            )}
        </div>
    );
}

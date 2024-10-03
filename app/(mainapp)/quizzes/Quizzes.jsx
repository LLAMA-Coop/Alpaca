"use client";

import {
    Input,
    MasoneryList,
    QuizDisplay,
    Spinner,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@client";
import { getQuizzes } from "@/app/actions/getQuizzes";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@main/page.module.css";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NUMBER_OF_QUIZZES_TO_FETCH = 2;

export default function Quizzes({ user, initialQuizzes, more }) {
    const [offset, setOffset] = useState(NUMBER_OF_QUIZZES_TO_FETCH);
    const [quizzes, setQuizzes] = useState(initialQuizzes);
    const [tagSearch, setTagSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(more);

    const searchParams = useSearchParams();
    const tag = searchParams?.get("tag");
    const router = useRouter();

    async function loadMoreQuizzes() {
        if (loading) return;
        setLoading(true);

        const { quizzes, hasMore } = await getQuizzes({
            tag,
            user,
            offset,
            limit: NUMBER_OF_QUIZZES_TO_FETCH,
        });

        setHasMore(hasMore);
        setQuizzes((prev) => [...prev, ...quizzes]);
        setOffset((prev) => prev + NUMBER_OF_QUIZZES_TO_FETCH);
        setLoading(false);
    }

    console.log("Has more quizzes", hasMore);

    return (
        <section>
            {quizzes.length > 0 ? (
                <>
                    <header>
                        <h2>Available Quiz Questions</h2>

                        <div className={styles.search}>
                            <Input
                                hideLabel
                                maxLength={32}
                                value={tagSearch}
                                label="Search by tag"
                                placeholder="Search by tag"
                                onChange={(e) => setTagSearch(e.target.value)}
                            />

                            <button
                                onClick={() => {
                                    if (tagSearch) {
                                        router.push(`/quizzes?tag=${tagSearch}`);
                                    } else {
                                        router.push("/quizzes");
                                    }

                                    router.refresh();
                                }}
                            >
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
                        </div>
                    </header>

                    <MasoneryList>
                        {quizzes.map((quiz) => (
                            <QuizDisplay
                                key={quiz.id}
                                quiz={quiz}
                            />
                        ))}
                    </MasoneryList>

                    <div className={styles.loadMore}>
                        <Tooltip>
                            <TooltipTrigger>
                                <button
                                    disabled={!hasMore}
                                    onClick={loadMoreQuizzes}
                                    className="button primary round"
                                >
                                    Load more quizzes {loading && <Spinner size={16} />}
                                </button>
                            </TooltipTrigger>

                            {!hasMore && <TooltipContent>No more quizzes to load</TooltipContent>}
                        </Tooltip>
                    </div>
                </>
            ) : (
                <div className={styles.noResults}>
                    <Image
                        src="/assets/no-results.svg"
                        alt="No quizzes"
                        height={400}
                        width={400}
                    />

                    <p>
                        Hey, we searched high and low, but we couldn't find any quizzes.
                        <br />
                        {user ? (
                            "Maybe you should try again later or create your own quizzes."
                        ) : (
                            <>
                                You may find more when you
                                <Link
                                    className="link"
                                    href="/login?next=/quizzes"
                                >
                                    log in
                                </Link>
                                or
                                <Link
                                    className="link"
                                    href="/register"
                                >
                                    register
                                </Link>
                            </>
                        )}
                    </p>

                    <Link
                        className="button primary"
                        href="/create"
                    >
                        Create a quiz
                    </Link>
                </div>
            )}
        </section>
    );
}

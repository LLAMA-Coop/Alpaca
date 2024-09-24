"use client";

import { CardChip, CardCreatedAt, CardList, CardListItem } from "../Card/Card";
import { Card } from "@client";

export function SourceDisplay({ source }) {
    if (!source) return null;

    return (
        <Card fullWidth link={`/sources/${source.publicId}`}>
            <header>
                <h4 title={source.title}>{source.title}</h4>
                <CardChip>{source.medium}</CardChip>
            </header>

            {!!source.tags.length && (
                <section>
                    <h5>
                        Tags
                        <CardChip>{source.tags.length}</CardChip>
                    </h5>

                    <CardList>
                        {source.tags.map((tag) => (
                            <CardListItem key={tag}>{tag}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            {!!source.credits.length && (
                <section>
                    <h5>
                        Credits
                        <CardChip>{source.credits.length}</CardChip>
                    </h5>

                    <CardList>
                        {source.credits.map((credit) => (
                            <CardListItem key={credit}>{credit}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            {!!source.courses.length && (
                <section>
                    <h5>
                        Courses
                        <CardChip>{source.courses.length}</CardChip>
                    </h5>

                    <p>This source has been used in the following courses.</p>

                    <CardList>
                        {source.courses.map((c) => (
                            <CardListItem key={c.id}>{c.name}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            <footer>
                <p>Created by {source.creator.username}</p>
                <CardCreatedAt>
                    {new Date(source.createdAt).toLocaleDateString()}
                </CardCreatedAt>
            </footer>
        </Card>
    );
}

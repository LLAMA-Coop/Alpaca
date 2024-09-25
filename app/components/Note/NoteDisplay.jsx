"use client";

import { Card, CardChip, CardCreatedAt, CardList, CardListItem } from "@client";

export function NoteDisplay({ note }) {
    return (
        <Card fullWidth>
            <header>
                <h4 title={note.title}>{note.title}</h4>
            </header>

            <p>
                {note.text.length > 200
                    ? note.text.substring(0, 200) + "..."
                    : note.text}
            </p>

            {!!note.tags.length && (
                <section>
                    <h5>
                        Tags
                        <CardChip>{note.tags.length}</CardChip>
                    </h5>

                    <CardList>
                        {note.tags.map((tag) => (
                            <CardListItem key={tag}>{tag}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            {!!note.courses.length && (
                <section>
                    <h5>
                        Courses
                        <CardChip>{note.courses.length}</CardChip>
                    </h5>

                    <p>This note has been used in the following courses.</p>

                    <CardList>
                        {note.courses.map((c) => (
                            <CardListItem key={c.id}>{c.name}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            {!!note.sources.length && (
                <section>
                    <h5>
                        Sources Used
                        <CardChip>{note.sources.length}</CardChip>
                    </h5>

                    <p>
                        This note has been created using the following sources.
                    </p>

                    <CardList>
                        {note.sources.map((s) => (
                            <CardListItem key={s.id}>{s.name}</CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            <footer>
                <p>Created by {note.creator.username}</p>
                <CardCreatedAt>
                    {new Date(note.createdAt).toLocaleDateString()}
                </CardCreatedAt>
            </footer>
        </Card>
    );
}

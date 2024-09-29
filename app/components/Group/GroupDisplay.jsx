"use client";

import { Avatar, Card, CardChip, CardCreatedAt } from "@client";

export function GroupDisplay({ group, lighter, darker }) {
    return (
        <Card
            fullWidth
            darker={darker}
            lighter={lighter}
            link={`/groups/${group.publicId}`}
        >
            <header>
                {group.icon && (
                    <Avatar
                        size={28}
                        src={group.icon}
                        alt={group.name}
                        username={group.name}
                    />
                )}

                <h4>{group.name}</h4>

                <CardChip>
                    {group.members.length} member
                    {group.members.length > 1 ? "s" : ""}
                </CardChip>
            </header>

            <p>{group.description}</p>

            <footer>
                <p>Created by {group.creator?.displayName}</p>
                <CardCreatedAt>
                    {group.createdAt.toLocaleDateString()}
                </CardCreatedAt>
            </footer>
        </Card>
    );
}

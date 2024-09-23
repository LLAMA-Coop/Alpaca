"use client";

import {
    CardDescription,
    CardListItem,
    CardList,
    CardChip,
    Card,
} from "@client";

export function CourseDisplay({ lighter = false, darker = false, course }) {
    return (
        <Card
            fullWidth
            darker={darker}
            lighter={lighter}
            link={`/courses/${course.name}`}
        >
            <header>
                <h4>{course.name}</h4>
                <CardChip>Level {course.level || 0}</CardChip>
            </header>

            <CardDescription>{course.description}</CardDescription>

            {course.parents.length > 0 && (
                <section>
                    <h5>Parent Courses</h5>

                    <CardList>
                        {course.parents.map((course) => (
                            <CardListItem key={course.id}>
                                {course.name}
                            </CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            {course.prerequisites.length > 0 && (
                <section>
                    <h5>Prerequisites</h5>

                    <CardList>
                        {course.prerequisites.map((course) => (
                            <CardListItem key={course.id}>
                                {course.name}
                            </CardListItem>
                        ))}
                    </CardList>
                </section>
            )}

            <footer>
                <p>Created by {course.creator.username}</p>
                <p>{new Date(course.createdAt).toLocaleDateString()}</p>
            </footer>
        </Card>
    );
}

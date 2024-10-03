"use client";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styles from "../Quiz/QuizInput.module.css";
import { Children, useState } from "react";

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function Item({ item, index }) {
    return (
        <Draggable
            index={index}
            draggableId={item.id}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={styles.dragContainer}
                >
                    <div
                        className={styles.dragHandle}
                        {...provided.dragHandleProps}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            height="14"
                            width="14"
                        >
                            <path d="m17,6c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Zm0,18c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Zm0-9c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3ZM7,6c-1.654,0-3-1.346-3-3S5.346,0,7,0s3,1.346,3,3-1.346,3-3,3Zm0,18c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Zm0-9c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Z" />
                        </svg>
                    </div>

                    {item.content}
                </div>
            )}
        </Draggable>
    );
}

function List({ list }) {
    return list.map((item, index) => (
        <Item
            item={item}
            index={index}
            key={item.id}
        />
    ));
}

export function DraggableList({ quizId, children, setNewIndexes }) {
    const [items, setItems] = useState(
        Children.map(children, (child, i) => ({
            id: `${quizId}-answer-${i}`,
            content: child,
        }))
    );

    function onDragEnd(result) {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const newItems = reorder(items, result.source.index, result.destination.index);

        setItems(newItems);
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`${quizId}-answers`}>
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        <List list={items} />
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

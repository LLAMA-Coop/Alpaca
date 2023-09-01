"use client";

import { useState, useEffect } from "react";

export default function SocketPage() {
    const [messages, setMessages] = useState(["greetings"]);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => {
            console.log("connected");
            ws.send("hello");
        };

        ws.onmessage = (event) => {
            console.log(event.data);
            setMessages([...messages, event.data]);
        };

        ws.onclose = () => {
            console.log("closed");
        };
    }, []);

    return (
        <>
            <ol>
                {messages.map((message, index) => (
                    <li key={index}>{message}</li>
                ))}
            </ol>
        </>
    );
}

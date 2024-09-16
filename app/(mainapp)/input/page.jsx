"use client";

import { Checkbox, Form, Input, Select, TextArea } from "@client";
import styles from "../page.module.css";
import { useEffect, useState } from "react";

export default function InputPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [color, setColor] = useState("");
    const [favoriteColors, setFavoriteColors] = useState([
        "Red",
        "Green",
        "Blue",
        "Brown",
        "White",
        "Yellowish",
    ]);
    const [type, setType] = useState("");
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState("");
    const [shouldSave, setShouldSave] = useState(false);
    const [errors, setErrors] = useState({});

    const typeOptions = [
        { value: "winter", label: "Winter" },
        { value: "spring", label: "Spring" },
        { value: "summer", label: "Summer" },
        { value: "fall", label: "Fall" },
    ];

    // useEffect(() => {
    //     alert("Type changed to: " + type);
    // }, [type]);

    return (
        <main className={styles.main}>
            <section>
                <Form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await new Promise((resolve) => {
                            setLoading(true);
                            setTimeout(() => {
                                setLoading(false);
                                resolve();
                            }, 2000);
                        });
                        alert("Form submitted!");
                    }}
                >
                    <Input
                        required
                        label="Name"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <Input
                        error={"You can't do that!"}
                        label="Email"
                        type="email"
                        value={email}
                        placeholder="johndoe@email.com"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        placeholder="Your password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Input
                        label="Phone Number"
                        type="tel"
                        value={phoneNumber}
                        placeholder="123-456-7890"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    <Input
                        label="Address"
                        skeleton
                        value={address}
                        placeholder="1234 Elm St."
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <Input
                        label="Favorite Colors"
                        multiple
                        data={favoriteColors}
                        removeItem={(item) => {
                            setFavoriteColors(
                                favoriteColors.filter(
                                    (color) => color !== item,
                                ),
                            );
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Backspace" && color === "") {
                                setFavoriteColors(
                                    favoriteColors.slice(
                                        0,
                                        favoriteColors.length - 1,
                                    ),
                                );
                            } else if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                const contains = favoriteColors.includes(color);

                                if (contains) {
                                    return;
                                }

                                setFavoriteColors([...favoriteColors, color]);
                                setColor("");
                            }
                        }}
                        onChange={(e) => {
                            setColor(e.target.value);
                        }}
                        value={color}
                        maxLength={32}
                        placeholder="Enter a color"
                        description="Select all that apply."
                    />

                    <Select
                        multiple
                        data={types}
                        setter={setTypes}
                        label="Select Type"
                        options={typeOptions}
                        placeholder="Select a type"
                    />

                    <TextArea
                        value={description}
                        label="Description"
                        placeholder="Enter a description"
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <Checkbox
                        value={shouldSave}
                        label="Save this information"
                        onChange={(value) => setShouldSave(value)}
                    />

                    <div></div>

                    <button className="button submit primary">
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </Form>
            </section>
        </main>
    );
}

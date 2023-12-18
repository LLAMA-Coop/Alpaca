import { useModals } from "@/store/store";
import styles from "../page.module.css";
import { InputPopup } from "../components/client";
import { Quiz } from "@/app/api/models";
import { serializeOne } from "@/lib/db";

export default async function Test() {
    // const addModal = useModals((state) => state.addModal);

    const quizzes = await Quiz.find();

    return (
        <main className={styles.main}>
            {/* <button
                onClick={() =>
                    addModal({
                        title: "Add a new modal",
                        content: (
                            <div>
                                <h3>
                                    This is testing how much we can put into the
                                    modal and scroll
                                </h3>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                                <div>Blah blha blha</div>
                            </div>
                        ),
                    })
                }
            >
                Add modal
            </button> */}
            {quizzes.map((q) => (
                <InputPopup type={"quiz"} resource={serializeOne(q)} />
            ))}
        </main>
    );
}

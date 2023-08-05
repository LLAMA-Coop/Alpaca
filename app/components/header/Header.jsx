import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Header.module.css";
import { cookies } from "next/headers";
import User from "@models/User";
import Link from "next/link";
import {
    faBook,
    faClipboardQuestion,
    faHome,
    faInfoCircle,
    faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";

const getUser = async () => {
    const token = cookies().get("token")?.value;
    if (!token) return null;

    const user = await User.findOne({
        refreshTokens: token,
    });

    return user;
};

export async function Header() {
    const user = await getUser();

    return (
        <header className={styles.header}>
            <h1>Mneme</h1>
            {!!user && (
                <p>
                    Welcome, <span>{user.username}</span>
                </p>
            )}

            <nav>
                <menu>
                    <li>
                        <Link href="/">
                            <span>Home</span>
                            <FontAwesomeIcon icon={faHome} />
                        </Link>
                    </li>
                    <li>
                        <Link href="/about">
                            <span>About</span>
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </Link>
                    </li>
                    <li>
                        <Link href="/sources">
                            <span>Sources</span>
                            <FontAwesomeIcon icon={faBook} />
                        </Link>
                    </li>
                    <li>
                        <Link href="/notes">
                            <span>Notes</span>
                            <FontAwesomeIcon icon={faNoteSticky} />
                        </Link>
                    </li>
                    <li>
                        <Link href="/quizzes">
                            <span>Quizzes</span>
                            <FontAwesomeIcon icon={faClipboardQuestion} />
                        </Link>
                    </li>
                </menu>
            </nav>
        </header>
    );
}

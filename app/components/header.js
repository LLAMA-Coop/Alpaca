import Link from "next/link";
import styles from "./header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClipboardQuestion,
  faHome,
  faInfoCircle,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>Mneme</h1>
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

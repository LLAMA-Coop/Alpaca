import Link from "next/link";
import styles from "./header.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>Mneme</h1>
      <nav>
        <menu>
          <li>
            <Link href="/">
              <span>Home</span>
              <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <span>About</span>
              <FontAwesomeIcon icon={faInfoCircle}></FontAwesomeIcon>
            </Link>
          </li>
        </menu>
      </nav>
    </header>
  );
}

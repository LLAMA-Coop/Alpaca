import styles from "@/app/Page.module.css";

export default function page({ params: { username } }) {
    return (
        <main className={styles.main}>
            <section>
                <h2>{username}</h2>

                <div className={styles.description}>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec aliquam, velit vitae tincidunt ultricies, elit
                        nisi ultrices urna, eget ultrices velit elit nec ipsum.
                        Donec euismod tincidunt felis, sit amet aliquet nunc.
                        Donec euismod sollicitudin nunc, sed aliquam nisl.
                    </p>
                </div>
            </section>
        </main>
    );
}

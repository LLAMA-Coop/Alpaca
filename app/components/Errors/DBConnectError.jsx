import styles from "@/app/page.module.css";

export function DBConnectError() {
    return (
        <main className={styles.main}>
            <h2>Could not connect to database</h2>

            <section>
                <div className="paragraph">
                    <p>
                        I'm sorry, but this application was not able to connect
                        to a database.
                    </p>
                    <p>Contact the developer about this issue.</p>
                    <p>
                        If you are the developer, check the `.env` file and make
                        sure the <em>DATABASE_URL</em> value is the correct URL
                        to the database.
                    </p>
                    <p>
                        If you do not have a `.env` file, look for a
                        `sample.env` file and follow the instructions there.
                    </p>
                    <p>
                        You have many options for setting up a database for this
                        project. This project uses MongoDB. You can{" "}
                        <a href="https://www.mongodb.com/atlas">
                            use MongoDB Atlas
                        </a>{" "}
                        or{" "}
                        <a href="https://www.freecodecamp.org/news/learn-mongodb-a4ce205e7739/">
                            set up your own MongoDB server
                        </a>
                        .
                    </p>
                </div>
            </section>
        </main>
    );
}

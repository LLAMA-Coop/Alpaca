import styles from "@/app/page.module.css";
import DailyTrain from "../components/train/dailyTrain";

export default function DailyPage({ searchParams }) {
    return (
        <main className={styles.main}>
            <h2>Ready to test your knowledge?</h2>
            <DailyTrain />
        </main>
    );
}

import styles from "./home.module.css";

export default function Home() {
    return (
        <div className={styles.homeCt}>
            <h1 className={styles.mainTitle}>Rapidfire</h1>
            <div className={styles.subTitle}>
                <p>powered by</p>
                <h2>DROVE</h2>
            </div>
        </div>
    );
}

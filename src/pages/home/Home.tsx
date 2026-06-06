import { useEffect, useState } from "react";
import styles from "./home.module.css";
import { Link } from "react-router";

const titleCarousel = ["Answer.", "Guess.", "Learn.", "Play.", "Win."];

export default function Home() {
    const [carouselCounter, setCarouselCounter] = useState(0);

    useEffect(() => {
        setInterval(() => {
            setCarouselCounter((prev) => (prev + 1) % titleCarousel.length);
        }, 2000);
    }, [setCarouselCounter]);

    // TODO: Carousel animation

    return (
        <div className={styles.homeCt}>
            <div className={styles.titleCt}>
                <h1 className={styles.mainTitle}>Rapidfire</h1>
                <div className={styles.titleCarousel}>
                    <div className={styles.left}>
                        {titleCarousel[carouselCounter]}
                    </div>
                    <div className={styles.right}>Fast.</div>
                </div>
            </div>
            <div className={styles.buttonsCt}>
                <Link to="/login" className={styles.button}>
                    Login
                </Link>
                {/* <Link to="/solo" className={styles.button}>
                    Solo play
                </Link> */}
            </div>
            <div className={styles.subTitle}>
                <p>powered by</p>
                <h3>
                    <a href="https://drove.hu">DROVE</a>
                </h3>
            </div>
        </div>
    );
}

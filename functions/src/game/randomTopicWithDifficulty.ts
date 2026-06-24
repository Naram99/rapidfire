import { Database } from "firebase-admin/database";

type TopicWithDifficulty = {
    [topic: string]: {
        difficulty: string;
        questions: {
            question: string;
            options: string[];
            correct: string;
        }[];
    };
};

export async function randomTopicWithDifficulty(
    db: Database,
): Promise<TopicWithDifficulty> {
    const topicsRef = db.ref(`topics`);
    const snapshot = await topicsRef.get();

    if (!snapshot.exists()) {
        throw new Error("Topics not found.");
    }

    const topicsData = snapshot.val();
    const allTopicNames = Object.keys(topicsData);
    const topicNames = allTopicNames.filter((name) => topicsData[name]);

    const randomTopic =
        topicNames[Math.floor(Math.random() * topicNames.length)];

    const allowedDifficulties = Object.keys(topicsData[randomTopic].difficulty);
    const randomDifficulty =
        allowedDifficulties[
            Math.floor(Math.random() * allowedDifficulties.length)
        ];

    return {
        [randomTopic]: {
            difficulty: randomDifficulty,
            questions: [],
        },
    };
}

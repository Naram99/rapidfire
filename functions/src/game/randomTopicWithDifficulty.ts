import { Database } from "firebase-admin/database";
import randomQuestionsForTopic, { Question } from "./randomQuestionsForTopic";

export type Round = {
    [topic: string]: {
        difficulty: string;
        questions: Question[];
    };
};

export type Topic = {
    name: string;
    collection: string;
    subjects: string;
    text: string;
    difficulty: {
        [d: string]: {
            allowedQuestionTypes: {
                [index: number | string]: string;
            };
            percentMinDifference?: number;
            percentMaxDifference?: number;
            allowedModifications?: {
                [index: number | string]: string;
            };
            modificationsCount?: number;
        };
    };
    allowedStatTypes:
        | {
              [index: number | string]: {
                  stat: string;
                  text: string;
              };
          }
        | string;
};

type Topics = {
    [name: string]: Topic;
};

export async function randomTopicWithDifficulty(db: Database): Promise<Round> {
    const topicsRef = db.ref(`topics`);
    const snapshot = await topicsRef.get();

    if (!snapshot.exists()) {
        throw new Error("Topics not found.");
    }

    const topicsData = snapshot.val() as Topics;
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
            questions: await randomQuestionsForTopic(
                db,
                topicsData[randomTopic],
            ),
        },
    };
}

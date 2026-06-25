import { Database } from "firebase-admin/database";
import type { Topic } from "./randomTopicWithDifficulty";

export type Question = {
    question: string;
    options: string[];
    correct: string;
};

export default async function randomQuestionsForTopic(
    db: Database,
    topic: Topic,
): Promise<Question[]> {
    // TODO
    return [];
}

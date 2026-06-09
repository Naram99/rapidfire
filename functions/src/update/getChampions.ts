import { logger } from "firebase-functions/logger";
import UpdateError from "./updateError";

export default async function getChampions(version: string): Promise<string[]> {
    const championsResp = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    );

    if (!championsResp.ok) {
        logger.error("Failed to fetch champions", {
            status: championsResp.status,
        });
        throw new UpdateError("Failed to fetch champions", 500);
    }

    const championsData = await championsResp.json();
    const champions = Object.keys(championsData.data);

    return champions;
}

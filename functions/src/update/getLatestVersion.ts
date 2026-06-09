import { logger } from "firebase-functions/logger";
import UpdateError from "./updateError";

export default async function getLatestVersion(): Promise<string> {
    const versionsResp = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json",
    );

    if (!versionsResp.ok) {
        logger.error("Failed to fetch versions", {
            status: versionsResp.status,
        });
        throw new UpdateError("Failed to fetch versions", 500);
    }

    const versions = await versionsResp.json();
    if (!Array.isArray(versions) || versions.length === 0) {
        logger.error("Invalid versions response", { versions });
        throw new UpdateError("Invalid versions response", 500);
    }
    return versions[0];
}

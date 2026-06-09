import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import getLatestVersion from "./update/getLatestVersion";
import getChampions from "./update/getChampions";
import updateChampions from "./update/updateChampions";

admin.initializeApp();

const db = admin.database();

export const updateCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Update request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const latestVersion = await getLatestVersion();

        const currentVersion = await db.ref(`version/patch`).get();

        if (currentVersion.val() === latestVersion) {
            logger.info("Already up to date", {
                currentVersion: currentVersion.val(),
            });
            return { status: 200, message: "Already up to date" };
        }

        const champions = await getChampions(latestVersion);

        const championsData = await updateChampions(champions, latestVersion);

        await db.ref(`version/patch`).set(latestVersion);
        await db
            .ref(`version/lastUpdate`)
            .set(admin.database.ServerValue.TIMESTAMP);
        await db.ref(`champions`).set(championsData);

        logger.info("Update successful", { latestVersion });
        return { status: 200, message: "Update successful", latestVersion };
    },
);

import UpdateError from "./updateError";

export default async function updateChampions(
    champions: string[],
    version: string,
) {
    const championsData: Record<string, unknown> = {};

    for (const champion of champions) {
        const championResp = await fetch(
            `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${champion}.json`,
        );

        if (!championResp.ok) {
            throw new UpdateError(
                `Failed to fetch champion data for ${champion}`,
                500,
            );
        }

        const championData = await championResp.json();

        if (
            !championData ||
            !championData.data ||
            !championData.data[champion]
        ) {
            throw new UpdateError(`Invalid champion data for ${champion}`, 500);
        }
        championsData[champion] = championData.data[champion];
    }

    return championsData;
}

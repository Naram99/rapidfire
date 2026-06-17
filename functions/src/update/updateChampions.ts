import { ChampionData } from "./championData.type";
import { DenormalizedChampionsData } from "./denormalizedChampionsData.type";
import UpdateError from "./updateError";

export default async function updateChampions(
    champions: string[],
    version: string,
): Promise<DenormalizedChampionsData> {
    const championsData: DenormalizedChampionsData = {
        champions: {},
        skins: {},
        chromas: {},
        stats: {},
        spells: {},
        passive: {},
        tags: {},
        title: {},
    };

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

        const championData = (await championResp.json()) as ChampionData;

        if (
            !championData ||
            !championData.data ||
            !championData.data[champion]
        ) {
            throw new UpdateError(`Invalid champion data for ${champion}`, 500);
        }
        const data = championData.data[champion];
        const championId = data.id;

        championsData.champions[championId] = {
            key: data.key,
            name: data.name,
            title: data.title,
        };

        championsData.skins[championId] = {};
        championsData.chromas[championId] = {};

        data.skins.forEach((skin) => {
            if (skin.parentSkin)
                championsData.chromas[championId][skin.num] = {
                    name: skin.name,
                    parentNum: skin.parentSkin,
                };
            else championsData.skins[championId][skin.num] = skin.name;
        });

        championsData.stats[championId] = data.stats;

        championsData.spells[championId] = {};
        data.spells.forEach((spell) => {
            championsData.spells[championId][spell.id] = {
                name: spell.name,
                cooldown: spell.cooldownBurn,
                cost: spell.costBurn,
                range: spell.rangeBurn,
                damage: {},
                icon: spell.image.full,
            };
        });

        championsData.passive[championId] = {
            name: data.passive.name,
            icon: data.passive.image.full,
        };

        championsData.tags[championId] = {};
        data.tags.forEach((tag) => {
            championsData.tags[championId][tag] = true;
        });

        championsData.title[championId] = data.title;
    }

    return championsData;
}

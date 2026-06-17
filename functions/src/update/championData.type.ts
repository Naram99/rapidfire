export type ChampionData = {
    data: {
        [championId: string]: {
            id: string;
            key: string;
            name: string;
            title: string;
            image: {
                full: string;
            };
            skins: {
                id: string;
                num: number;
                name: string;
                chromas: boolean;
                parentSkin?: number;
            }[];
            tags: string[];
            stats: {
                hp: number;
                hpperlevel: number;
                mp: number;
                mpperlevel: number;
                movespeed: number;
                armor: number;
                armorperlevel: number;
                spellblock: number;
                spellblockperlevel: number;
                attackrange: number;
                hpregen: number;
                hpregenperlevel: number;
                mpregen: number;
                mpregenperlevel: number;
                crit: number;
                critperlevel: number;
                attackdamage: number;
                attackdamageperlevel: number;
                attackspeedperlevel: number;
                attackspeed: number;
            };
            spells: {
                id: string;
                name: string;
                cooldownBurn: string;
                costBurn: string;
                rangeBurn: string;
                effectBurn: (null | string)[];
                image: {
                    full: string;
                };
            }[];
            passive: {
                name: string;
                image: {
                    full: string;
                };
            };
        };
    };
};

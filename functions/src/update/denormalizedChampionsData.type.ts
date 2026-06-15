export type DenormalizedChampionsData = {
    champions: { [id: string]: { key: string; name: string; title: string } };
    skins: {
        [championId: string]: {
            [skinId: number]: string; // skin name
        };
    };
    chromas: {
        [championId: string]: {
            [chromaId: number]: {
                name: string;
                parentNum: number;
            };
        };
    };
    stats: {
        [championId: string]: {
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
    };
    spells: {
        [championId: string]: {};
    };
    passive: {
        [championId: string]: {};
    };
    tags: {
        [championId: string]: { [tag: string]: boolean };
    };
    title: {
        [championId: string]: string;
    };
};

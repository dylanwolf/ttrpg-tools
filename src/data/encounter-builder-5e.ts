import { clamp, isNumeric } from "../helpers/mathHelpers";

type EncounterDifficulty = "Easy" | "Medium" | "Hard" | "Deadly" | "N/A";

export interface EncounterBuilder5eData {
	Title: string | undefined;
	CharacterMode: "individual" | "party" | undefined;
	CharacterCount: number | undefined;
	CharacterLevel: number | undefined;
	Characters: Encounter5eCharacter[] | undefined;
	Monsters: Encounter5eMonster[] | undefined;
	DifficultyThresholds: DifficultyThreshold | undefined;
	EncounterMultiplier: number | undefined;
	TotalMonsterXP: number | undefined;
	ExpectedDifficulty: EncounterDifficulty | undefined;
}

export function getInitialState(): EncounterBuilder5eData {
	return {
		Title: "New Encounter",
		CharacterMode: "individual",
		CharacterCount: 4,
		CharacterLevel: 1,
		Characters: [],
		Monsters: [{ Count: 1, CR: "1", XP: calculateXPFromCR("1") }],
		DifficultyThresholds: undefined,
		EncounterMultiplier: undefined,
		TotalMonsterXP: undefined,
		ExpectedDifficulty: undefined,
	};
}

export function updateEncounterState(state: EncounterBuilder5eData) {
	state.EncounterMultiplier = undefined;
	state.TotalMonsterXP = undefined;
	state.ExpectedDifficulty = undefined;

	// Calculate monster XP
	if (state.Monsters && state.Monsters.length >= 1) {
		// Convert CR to XP or vice versa
		state.Monsters.forEach((m) => {
			if (m.CR === undefined && m.XP !== undefined) m.CR = getMonsterCR(m);
			if (m.XP === undefined && m.CR !== undefined) m.XP = getMonsterXP(m);
		});

		state.EncounterMultiplier = getEncounterMultiplier(state.Monsters.length);
		state.TotalMonsterXP =
			(state.Monsters.sum((m) => getMonsterXP(m)) || 0) *
			state.EncounterMultiplier;
	}

	// Calculate difficulty thresholds
	switch (state.CharacterMode) {
		case "individual":
			state.DifficultyThresholds = getDifficultyThresholdByIndividual(
				state.Characters || []
			);
			break;

		case "party":
			state.DifficultyThresholds = getDifficultyThreshold(
				state.CharacterLevel || 1,
				state.CharacterCount || 0
			);
	}

	if (state.DifficultyThresholds && state.TotalMonsterXP) {
		if (state.TotalMonsterXP >= state.DifficultyThresholds.Deadly)
			state.ExpectedDifficulty = "Deadly";
		else if (state.TotalMonsterXP >= state.DifficultyThresholds.Hard)
			state.ExpectedDifficulty = "Hard";
		else if (state.TotalMonsterXP >= state.DifficultyThresholds.Medium)
			state.ExpectedDifficulty = "Medium";
		else if (state.TotalMonsterXP >= state.DifficultyThresholds.Easy)
			state.ExpectedDifficulty = "Easy";
		else state.ExpectedDifficulty = "N/A";
	}
}

export interface Encounter5eCharacter {
	Name?: string | undefined;
	Level: number;
}

export interface Encounter5eMonster {
	Name?: string | undefined;
	Count: number | undefined;
	CR?: string | undefined;
	XP?: number | undefined;
}

interface DifficultyThreshold {
	Easy: number;
	Medium: number;
	Hard: number;
	Deadly: number;
}

const EASY_XP = [
	25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 110, 1250, 1400,
	1600, 2000, 2100, 2400, 2800,
];
const MEDIUM_XP = [
	50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500,
	2800, 3200, 3900, 4200, 4900, 5700,
];
const HARD_XP = [
	75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800,
	4300, 4800, 5900, 6300, 7300, 8500,
];
const DEADLY_XP = [
	100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100,
	5700, 6400, 7200, 8800, 9500, 10900, 12700,
];
const CR_XP = [
	10, 25, 50, 100, 200, 450, 700, 1100, 1800, 2300, 2900, 3900, 5000, 5900,
	7200, 8400, 10000, 11500, 13000, 15000, 18000, 20000, 22000, 25000, 33000,
	41000, 50000, 62000, 75000, 90000, 105000, 135000, 155000,
];

export function getMonsterXP(monster: Encounter5eMonster): number | undefined {
	if (monster.XP !== undefined) return monster.XP * (monster.Count || 0);
	if (monster.CR === undefined) return undefined;

	var xpFromCr = calculateXPFromCR(monster.CR);
	if (xpFromCr === undefined) return undefined;

	return xpFromCr * (monster.Count || 0);
}

function calculateXPFromCR(cr: string): number | undefined {
	if (cr === "0") return CR_XP[0];
	else if (cr === "1/8") return CR_XP[1];
	else if (cr === "1/4") return CR_XP[2];
	else if (cr === "1/2") return CR_XP[3];
	else if (isNumeric(cr)) {
		var idx = clamp(Number(cr), 1, 30) + 3;
		return CR_XP[idx];
	} else return undefined;
}

export function getMonsterCR(monster: Encounter5eMonster): string | undefined {
	if (monster.CR !== undefined) return monster.CR;
	if (monster.XP === undefined) return undefined;
	return calculateCRFromXP(monster.XP);
}

function calculateCRFromXP(xp: number): string | undefined {
	if (xp <= CR_XP[0]) return "0";
	for (var idx = 1; idx < CR_XP.length; idx++) {
		if (xp < CR_XP[idx]) {
			switch (idx) {
				case 1:
					return "0";
				case 2:
					return "1/8";
				case 3:
					return "1/4";
				case 4:
					return "1/2";
				default:
					return (idx - 4).toString();
			}
		}
	}
	return "30";
}

function getDifficultyThreshold(
	level: number,
	count?: number | undefined
): DifficultyThreshold {
	level = clamp(level, 1, EASY_XP.length);
	if (count === undefined) count = 1;
	return {
		Easy: EASY_XP[level - 1] * count,
		Medium: MEDIUM_XP[level - 1] * count,
		Hard: HARD_XP[level - 1] * count,
		Deadly: DEADLY_XP[level - 1] * count,
	};
}

function getDifficultyThresholdByIndividual(
	characters: Encounter5eCharacter[]
): DifficultyThreshold {
	var thresholds = characters.map((x) => getDifficultyThreshold(x.Level));
	return {
		Easy: thresholds.sum((x) => x.Easy) || 0,
		Medium: thresholds.sum((x) => x.Medium) || 0,
		Hard: thresholds.sum((x) => x.Hard) || 0,
		Deadly: thresholds.sum((x) => x.Deadly) || 0,
	};
}

function getEncounterMultiplier(count: number) {
	if (count >= 15) return 4;
	else if (count >= 11) return 3;
	else if (count >= 7) return 2.5;
	else if (count >= 3) return 2;
	else if (count >= 2) return 1.5;
	else return 1;
}

import { SourceData } from "./SourceData";

export interface CharacterState {
	AdditionalSources: string[];
	Level: number;
	CharacterTemplate?: string | undefined;
	StartingAbilityScores?: string | undefined;
	AbilityScoreAssignments: { [name: string]: number | undefined };
	HPMPAssignments?: { [name: string]: number } | undefined;
	StatIncreases?: { [name: string]: number } | undefined;
	Level1WeaponMastery?: string | undefined;
	Level1Class?: string | undefined;
	Level1SideJob?: string | undefined;
	Level1WeaponGrace?: string | undefined;
	Level1Type?: string | undefined;
	Level1WeaponFocus?: string | undefined;
	Level1SeasonalMagic?: string | undefined;
	Level7Type?: string | undefined;
	Level7WeaponFocus?: string | undefined;
	Level7SeasonalMagic?: string | undefined;
	SelectedSpells?: string[];
}

const initialCharacterData: CharacterState = {
	AdditionalSources: [],
	Level: 10,
	AbilityScoreAssignments: {},
};

export function getInitialCharacterData() {
	return structuredClone(initialCharacterData);
}

export function getCharacterTemplate(source: SourceData, data: CharacterState) {
	return (
		source.CharacterTemplates.filter(
			(x) => x.Name === data.CharacterTemplate
		)[0] || undefined
	);
}

export function getStartingAbilityScores(
	source: SourceData,
	data: CharacterState
) {
	return (
		source.StartingAbilityScores.filter(
			(x) => x.Name === data.StartingAbilityScores
		)[0] || undefined
	);
}

export function getLevel1Class(source: SourceData, data: CharacterState) {
	return (
		source.Classes.filter((x) => x.Name === data.Level1Class)[0] || undefined
	);
}

export function getLevel1BaseSkills(source: SourceData, data: CharacterState) {
	var l1class = getLevel1Class(source, data);
	if (!l1class) return [];

	return source.Skills.filter((x) => l1class.Skills.includes(x.Name));
}

export function getLevel1Skills(source: SourceData, data: CharacterState) {
	var l1class = getLevel1Class(source, data);
	if (!l1class) return [];

	return source.Skills.filter(
		(x) => l1class.Skills.includes(x.Name) || data.Level1SideJob === x.Name
	);
}

export function getLevel1Type(source: SourceData, data: CharacterState) {
	return source.Types.filter((x) => x.Name === data.Level1Type)[0];
}

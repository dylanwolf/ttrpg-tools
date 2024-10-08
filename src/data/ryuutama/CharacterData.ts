import { CharacterDataBase } from "../../state/BuilderSessionSlice";
import { SourceData } from "./SourceData";

export interface CharacterState extends CharacterDataBase {
	AdditionalSources: string[];
	Version: string;
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
	Level3WeatherTerrainSpecialty?: string | undefined;
	Level4StatusEffectImmunity?: string | undefined;
	Level5Class?: string | undefined;
	Level5SideJob?: string | undefined;
	Level5WeaponGrace?: string | undefined;
	Level6Type?: string | undefined;
	Level6WeaponFocus?: string | undefined;
	Level7WeatherTerrainSpecialty?: string | undefined;
	Level6SeasonalMagic?: string | undefined;
	Level9SeasonalDragon?: string | undefined;
	SelectedSpells?: string[];
}

const initialCharacterData: CharacterState = {
	Title: "New Character",
	AdditionalSources: [],
	Version: "",
	Level: 1,
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

export function getTemplateSkills(source: SourceData, data: CharacterState) {
	var tpl = getCharacterTemplate(source, data);
	if (!tpl || !tpl.Skills) return [];

	return source.Skills.filter((x) => tpl.Skills.includes(x.Name));
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

export function getLevel5Class(source: SourceData, data: CharacterState) {
	return (
		source.Classes.filter((x) => x.Name === data.Level5Class)[0] || undefined
	);
}

export function getLevel5BaseSkills(source: SourceData, data: CharacterState) {
	var l1class = getLevel5Class(source, data);
	if (!l1class) return [];

	return source.Skills.filter((x) => l1class.Skills.includes(x.Name));
}

export function getLevel5Skills(source: SourceData, data: CharacterState) {
	var l1class = getLevel5Class(source, data);
	if (!l1class) return [];

	return source.Skills.filter(
		(x) => l1class.Skills.includes(x.Name) || data.Level5SideJob === x.Name
	);
}

export function getLevel1Type(source: SourceData, data: CharacterState) {
	return source.Types.filter((x) => x.Name === data.Level1Type)[0];
}

export function getLevel6Type(source: SourceData, data: CharacterState) {
	return source.Types.filter((x) => x.Name === data.Level6Type)[0] || undefined;
}

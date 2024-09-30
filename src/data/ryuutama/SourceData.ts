import { isNumeric } from "../../builderHelpers";

export const BUILDER_KEY = "ryuutama";

export interface IFromSource {
	DataSource?: string | undefined;
}

export interface IProvidesBonus {
	Bonuses?: { [stat: string]: number | (number | string)[] } | undefined;
}

export function getNumericBonus(value: number | string | undefined) {
	return (isNumeric(value) && (value as number)) || 0;
}

export function collectBonuses(
	value: number | (number | string)[],
	count: number,
	existingValue: number | string | undefined
) {
	if (Array.isArray(value)) {
		return value[count - 1];
	} else {
		return getNumericBonus(existingValue) + value * count;
	}
}

export interface SourceData {
	AdditionalSources: string[];
	CharacterTemplates: CharacterTemplate[];
	StartingAbilityScores: StartingAbilityScore[];
	Classes: CharacterClass[];
	Skills: CharacterSkill[];
	Weapons: Weapon[];
	Types: CharacterType[];
	SeasonalMagic: SeasonalMagic[];
	IncantationSpells: IncantationSpell[];
	TerrainWeatherSpecialty: string[];
	StatusEffects: string[];
	SeasonalDragons: string[];
}

export interface CharacterTemplate extends IFromSource {
	Name: string;
	DisplayValue: string | undefined | null;
	StartingAbilityScoreFilter: string[];
}

export interface StartingAbilityScore {
	Name: string;
	Dice: StartingDice[];
}

export interface StartingDice {
	Value: number;
	Attribute?: string | undefined;
}

export interface CharacterClass extends IFromSource {
	Name: string;
	Description: string;
	Skills: string[];
}

export interface CharacterSkill extends IFromSource, IProvidesBonus {
	Name: string;
	Description: string;
	RelevantRoll?: string | undefined;
	SelectSkill?: boolean | undefined;
	ExtraMasteredWeapon?: string[] | undefined;
	Specialization?: string[] | undefined;
	RestrictedFromSideJob?: boolean | undefined;
}

export interface Weapon extends IFromSource {
	Name: string;
	Description: string;
	Examples: string;
	Accuracy: string;
	Damage: string;
}

export interface CharacterType extends IFromSource, IProvidesBonus {
	Name: string;
	SeasonalMagic?: boolean | undefined;
	SpellsPerLevel?: number | undefined;
	ExtraMasteredWeapon?: boolean | undefined;
}

export interface SeasonalMagic extends IFromSource {
	Name: string;
}

export enum SpellGrouping {
	Low = "Low",
	Mid = "Mid",
	High = "High",
}

export interface IncantationSpell extends IFromSource {
	Name: string;
	Level: SpellGrouping;
	SpellType: string;
}

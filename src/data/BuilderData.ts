export async function getBuilderData(): Promise<BuilderData> {
	return fetch("/builder.json").then((data) => data.json());
}

export interface BuilderData {
	CharacterTemplates: CharacterTemplate[];
	StartingAbilityScores: StartingAbilityScore[];
	Classes: CharacterClass[];
	Skills: ClassSkill[];
	Weapons: Weapon[];
}

export interface CharacterTemplate {
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

export interface CharacterClass {
	Name: string;
	Description: string;
	Skills: string[];
}

export interface ClassSkill {
	Name: string;
	Description: string;
	RelevantRoll: string | null;
	SelectSkill: boolean;
	ExtraMasteredWeapon: string[];
}

export interface Weapon {
	Name: string;
	Description: string;
	Examples: string;
	Accuracy: string;
	Damage: string;
}

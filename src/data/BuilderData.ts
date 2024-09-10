export async function getBuilderData(): Promise<BuilderData> {
	return fetch("/builder.json").then((data) => data.json());
}

export interface BuilderData {
	CharacterTemplates: CharacterTemplate[];
	StartingAbilityScores: StartingAbilityScore[];
}

export interface CharacterTemplate {
	Name: string;
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
}

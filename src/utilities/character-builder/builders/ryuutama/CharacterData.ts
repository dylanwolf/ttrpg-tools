import { ICharacterData } from "../../BuilderFactory";
import { collectCharacterSheetData } from "./CharacterSheet";
import { SourceData } from "./SourceData";

export interface CharacterState extends ICharacterData {
	AdditionalSources: string[] | undefined;
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
	Level1Specialization?: string | undefined;
	Level1Type?: string | undefined;
	Level1WeaponFocus?: string | undefined;
	Level1SeasonalMagic?: string | undefined;
	Level3WeatherTerrainSpecialty?: string | undefined;
	Level4StatusEffectImmunity?: string | undefined;
	Level5Class?: string | undefined;
	Level5SideJob?: string | undefined;
	Level5WeaponGrace?: string | undefined;
	Level5Specialization?: string | undefined;
	Level6Type?: string | undefined;
	Level6WeaponFocus?: string | undefined;
	Level7WeatherTerrainSpecialty?: string | undefined;
	Level6SeasonalMagic?: string | undefined;
	Level9SeasonalDragon?: string | undefined;
	SelectedSpells?: string[];
}

const initialCharacterData: CharacterState = {
	Title: "New Character",
	AdditionalSources: undefined,
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

export function toPdfFormFillArgs(source: SourceData, data: CharacterState) {
	var cs = collectCharacterSheetData(source, data);

	var obj: any = {
		CharacterName: data.Title,
		Level: data.Level?.toString(),
		Class1: data.Level1Class,
		Class2: data.Level5Class,
		Type1:
			data.Level1Type &&
			(data.Level1SeasonalMagic
				? `${data.Level1Type} (${data.Level1SeasonalMagic})`
				: data.Level1Type),
		Type2:
			data.Level6Type &&
			(data.Level6SeasonalMagic
				? `${data.Level6Type} (${data.Level6SeasonalMagic})`
				: data.Level6Type),
		MasteredWeapon: cs.WeaponMasteries.map((w) => w.Name).join(", "),
		SpecializedTerrain: cs.TerrainWeatherSpecialties.join(", "),
		STR: cs.AbilityScores.STR?.toString(),
		DEX: cs.AbilityScores.DEX?.toString(),
		INT: cs.AbilityScores.INT?.toString(),
		SPI: cs.AbilityScores.SPI?.toString(),
		HP: cs.Derived.HP?.toString(),
		MaxHP: cs.Derived.HP?.toString(),
		MP: cs.Derived.MP?.toString(),
		MaxMP: cs.Derived.MP?.toString(),
	};

	cs.Skills.forEach((skill, idx) => {
		obj[`ClassSkill${idx + 1}`] = skill.Name;
		obj[`ClassSkill${idx + 1}Die`] = skill.RelevantRoll;
		obj[`ClassSkill${idx + 1}Effect`] = skill.Description;
	});

	cs.WeaponMasteries.forEach((wpn, idx) => {
		obj[`Weapon${idx + 1}Name`] = wpn.Name;
		obj[`Weapon${idx + 1}Accuracy`] = wpn.Accuracy;
		obj[`Weapon${idx + 1}Damage`] = wpn.Damage;
		obj[`Weapon${idx + 1}Description`] = wpn.Description;
	});

	const expectedSpecialties = [
		"Rain",
		"Strong Wind",
		"Fog",
		"Hot",
		"Cold",
		"Hard Rain",
		"Snow",
		"Deep Fog",
		"Dark",
		"Hurricane",
		"Blizzard",
		"Grassland",
		"Wasteland",
		"Woods",
		"Highlands",
		"Rocky",
		"Deep Forest",
		"Swamp",
		"Mountain",
		"Desert",
		"Jungle",
		"Alpine",
	];

	var otherBonuses: { key: string; value: string }[] = [];

	Object.keys(cs.OtherBonuses).forEach((key) => {
		otherBonuses.push({ key: key, value: cs.OtherBonuses[key] });
	});

	cs.TerrainWeatherSpecialties.forEach((specialty) => {
		if (expectedSpecialties.includes(specialty)) {
			var specialtyKey = specialty.replace(" ", "");
			obj[`Terrain${specialtyKey}`] = "+2";
			obj[`Weather${specialtyKey}`] = "+2";
		} else {
			otherBonuses.push({ key: specialty, value: "+2" });
		}
	});

	otherBonuses.forEach((bns, idx) => {
		obj[`OtherBonus${idx + 1}Description`] = bns.key;
		obj[`OtherBonus${idx + 1}Bonus`] = bns.value;
	});

	var notes = [];

	if (cs.CharacterTemplateDisplayName)
		notes.push(cs.CharacterTemplateDisplayName);
	if (cs.WeaponMasteries.length > 2) {
		var additionalWeapons = cs.WeaponMasteries.slice(2, -1)
			.map(
				(wpn) =>
					`${wpn.Name} Accuracy: ${wpn.Accuracy} Damage: ${wpn.Damage} ${wpn.Description}`
			)
			.join("; ");
		notes.push(`Additional Weapon Masteries: ${additionalWeapons}`);
	}

	if (cs.CraftingSpecializations?.length > 0)
		notes.push(
			`Crafting Specializations: ${cs.CraftingSpecializations.join(", ")}`
		);
	if (cs.IncantationSpells?.length > 0)
		notes.push(
			`Incantation Spells: ${cs.IncantationSpells.map((s) => s.Name).join(
				", "
			)}`
		);
	if (cs.StatusEffectImmunity)
		notes.push(`Status Effect Immunity: ${cs.StatusEffectImmunity}`);
	if (data.Level9SeasonalDragon)
		notes.push(`Favor of the Seasonal Dragons: ${data.Level9SeasonalDragon}`);

	obj.AppendedInfo = notes.join("\n\n");

	return obj;
}

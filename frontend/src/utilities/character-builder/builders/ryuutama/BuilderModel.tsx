import { valueIfInList } from "../../../../helpers/builderHelpers";
import { AssignPoolStep } from "../../steps/AssignPoolStep";
import { AssignStatsStep } from "../../steps/AssignStatsStep";
import { ChecklistStringStep } from "../../steps/ChecklistStringStep";
import { ContainerStep } from "../../steps/ContainerStep";
import { NumericStep } from "../../steps/NumericStep";
import { StaticTextStep } from "../../steps/StaticTextStep";
import { StringDropDownStep } from "../../steps/StringDropDownStep";
import { StringEntryStep } from "../../steps/StringEntryStep";
import { registerBuilderModel } from "../../BuilderFactory";
import { RootStepCollection } from "../../StepModel";
import {
	CharacterState,
	getCharacterTemplate,
	getInitialCharacterData,
	getLevel1BaseSkills,
	getLevel1Skills,
	getLevel1Type,
	getLevel5BaseSkills,
	getLevel5Skills,
	getLevel6Type,
	getStartingAbilityScores,
	toPdfFormFillArgs,
} from "./CharacterData";
import {
	AdditionalSource,
	BUILDER_KEY,
	CharacterClass,
	CharacterSkill,
	CharacterTemplate,
	CharacterType,
	IFromSource,
	SeasonalMagic,
	SourceData,
	StartingAbilityScore,
	StartingDice,
	Weapon,
} from "./SourceData";
import { RyuutamaSpellSelectorStep } from "./SpellSelector";
import "./ryuutama.css";
import { removeNullValues } from "../../../../helpers/dictHelpers";

export function isInSelectedSource<TItem extends IFromSource>(
	data: CharacterState,
	items: TItem[]
) {
	var values = data.AdditionalSources || [];
	return items.filter((x) => !x.DataSource || values.includes(x.DataSource));
}

function getMaxStatIncreases(currentDie: number) {
	switch (currentDie) {
		case 12:
			return 0;
		case 10:
			return 1;
		case 8:
			return 2;
		case 6:
			return 3;
		case 4:
			return 4;
	}
	return 0;
}

registerBuilderModel(
	new RootStepCollection<SourceData, CharacterState>(
		BUILDER_KEY,
		[
			new StaticTextStep<SourceData, CharacterState>(
				"Credits",
				(src, data) => src.__CREDITS__
			)
				.withLabel("Credits / Legal")
				.useMarkdown(true),
			new StaticTextStep<SourceData, CharacterState>(
				"Version",
				(src, data) => src.Version
			)
				.withLabel("Character Builder Data Version")
				.onCharacterUpdate(
					(src, state, newData) => (newData.Version = src.Version)
				),
			new ChecklistStringStep<SourceData, CharacterState, AdditionalSource>(
				"AdditionalSources"
			)
				.withLabel("Include Sources")
				.withSelectList((src, data) => src.AdditionalSources)
				.withItemText((itm) => itm.DisplayText)
				.withItemValue((itm) => itm.Key)
				.withDefaultValue((src, data, lst) =>
					data.AdditionalSources !== undefined
						? data.AdditionalSources
						: src.AdditionalSources.map((x) => x.Key) || []
				)
				.onCharacterUpdate(
					(src, state, data) => (data.AdditionalSources = state.Values || [])
				)
				.withHelp(
					"Allows you to use content from books other than the core rulebook."
				)
				.useMarkdown(true),
			new StringEntryStep<SourceData, CharacterState>("Name")
				.withLabel("Name")
				.withDefaultValue((src, data) => data.Title || "")
				.onCharacterUpdate(
					(src, state, newData) => (newData.Title = state.Value || "")
				),
			new NumericStep<SourceData, CharacterState>("Level")
				.withLabel("Level")
				.withDefaultValue((src, data) => data.Level || 1)
				.onCharacterUpdate(
					(src, state, data) => (data.Level = state.Value || 1)
				)
				.clampInputField(true)
				.withMinValue(() => 1)
				.withMaxValue(() => 10),
			new StringDropDownStep<SourceData, CharacterState, CharacterTemplate>(
				"CharacterTemplate"
			)
				.withLabel("Character Template")
				.withSelectList((src, data) =>
					isInSelectedSource(data, src.CharacterTemplates)
				)
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.CharacterTemplate, lst)
				)
				.onCharacterUpdate(
					(src, state, newData) =>
						(newData.CharacterTemplate = state.Value || "")
				)
				.withHelp(
					"Determines what options for starting stat dice you have, and may grant additional abilities."
				)
				.withDetailText((itm) => itm.Description),
			new StringDropDownStep<SourceData, CharacterState, StartingAbilityScore>(
				"StartingAbilityScores"
			)
				.withLabel("Starting Stat Dice")
				.withSelectList((src, data) => {
					var filter =
						getCharacterTemplate(src, data)?.StartingAbilityScoreFilter || [];
					return src.StartingAbilityScores.filter((x) =>
						filter.includes(x.Name)
					);
				})
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue(
					(src, data, lst) =>
						valueIfInList(data.StartingAbilityScores, lst) || ""
				)
				.onCharacterUpdate(
					(src, state, newData) =>
						(newData.StartingAbilityScores = state.Value || "")
				)
				.withHelp("Determines the dice you get to assign to stats at level 1.")
				.withDetailText((itm) => itm.Description),
			new AssignStatsStep<SourceData, CharacterState, StartingDice>(
				"AssignAbilityScores"
			)
				.withLabel("Assign Stat Dice")
				.withChoicesList(
					(src, data) => getStartingAbilityScores(src, data).Dice
				)
				.withChoiceEqualsFunction((us, them) => us.Value === them.Value)
				.withStatTargets((src, data, lst) =>
					["STR", "DEX", "INT", "SPI"].map((attr) => {
						var fixedMatch = lst.filter((x) => x.Attribute === attr)[0];

						return {
							Name: attr,
							Locked: fixedMatch ? true : false,
							FixedValue: fixedMatch || undefined,
						};
					})
				)
				.withDefaultValue((src, data, lst) => {
					var defaultValue: { [name: string]: StartingDice } = {};
					var remaining = [...lst];

					Object.keys(data.AbilityScoreAssignments || []).forEach((key) => {
						var match = remaining.filter(
							(x) => x.Value === data.AbilityScoreAssignments[key]
						)[0];
						if (match) {
							defaultValue[key] = match;
							remaining.splice(remaining.indexOf(match), 1);
						}
					});

					return defaultValue;
				})
				.withChoiceText((choice) => "d" + choice.Value)
				.onCharacterUpdate((src, state, data) => {
					var value: { [name: string]: number } = {};
					var stateValue = state.Value || {};

					Object.keys(stateValue).forEach((key) => {
						var die = stateValue[key];
						if (die) value[key] = die.Value;
					});

					data.AbilityScoreAssignments = value;
				}),
			new StringDropDownStep<SourceData, CharacterState, Weapon>(
				"Level1WeaponMastery"
			)
				.withLabel("Level 1 Weapon Mastery")
				.withSelectList((src, data) => isInSelectedSource(data, src.Weapons))
				.withItemText((itm) => itm.Name)
				.withItemValue((itm) => itm.Name)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level1WeaponMastery, lst)
				)
				.onCharacterUpdate(
					(src, state, data) => (data.Level1WeaponMastery = state.Value || "")
				)
				.withHelp(
					"Determines your character's starting mastered weapon. You get this weapon for free, and you do not take HP penalties for attacking with it."
				)
				.withDetailText(
					(itm) =>
						[
							itm.Description,
							`Accuracy: ${itm.Accuracy}`,
							`Damage: ${itm.Damage}`,
						]
							.filter((x) => x)
							.join(" / "),
					{ OnlyShowOnMobile: true }
				),
			new ContainerStep<SourceData, CharacterState>("Level1TypeContainer", "", [
				new StringDropDownStep<SourceData, CharacterState, CharacterType>(
					"Level1Type"
				)
					.withLabel("Level 1 Type")
					.withSelectList((src, data) => isInSelectedSource(data, src.Types))
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level1Type, lst)
					)
					.onCharacterUpdate(
						(src, state, data) => (data.Level1Type = state.Value || "")
					),
				new StringDropDownStep<SourceData, CharacterState, Weapon>(
					"Level1WeaponFocus"
				)
					.withLabel("Weapon Focus")
					.withSelectList((src, data) => isInSelectedSource(data, src.Weapons))
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level1WeaponFocus, lst)
					)
					.onCharacterUpdate((src, state, data) => {
						data.Level1WeaponFocus = state.Value || "";
					})
					.onlyShowWhen((src, data) =>
						getLevel1Type(src, data).ExtraMasteredWeapon ? true : false
					)
					.withHelp(
						"Gives you an extra mastered weapon. You do not take HP penalties for attacking with a mastered weapon."
					)
					.withDetailText(
						(itm) =>
							[
								itm.Description,
								`Accuracy: ${itm.Accuracy}`,
								`Damage: ${itm.Damage}`,
							]
								.filter((x) => x)
								.join(" / "),
						{ OnlyShowOnMobile: true }
					),
				new StringDropDownStep<SourceData, CharacterState, SeasonalMagic>(
					"Level1SeasonalMagic"
				)
					.withLabel("Seasonal Magic")
					.withSelectList((src, data) =>
						isInSelectedSource(data, src.SeasonalMagic)
					)
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level1SeasonalMagic, lst)
					)
					.onCharacterUpdate((src, state, data) => {
						data.Level1SeasonalMagic = state.Value || "";
					})
					.onlyShowWhen((src, data) =>
						getLevel1Type(src, data).SeasonalMagic ? true : false
					)
					.withHelp(
						"Determines your seasonal magic. You gain access to all of this season's spells available at your level."
					),
			]),
			new ContainerStep<SourceData, CharacterState>(
				"Level1ClassContainer",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, CharacterClass>(
						"Level1Class"
					)
						.withLabel("Level 1 Class")
						.withSelectList((src, data) =>
							isInSelectedSource(data, src.Classes)
						)
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level1Class, lst)
						)
						.onCharacterUpdate((src, state, data) => {
							data.Level1Class = state.Value || "";
						})
						.withDetailText((itm) => `Skills: ${itm.Skills.join(", ")}`, {
							OnlyShowOnMobile: true,
						}),
					new StringDropDownStep<SourceData, CharacterState, CharacterSkill>(
						"Level1SideJob"
					)
						.withLabel("Side-Job")
						.withSelectList((src, data) => {
							var existingSkills = getLevel1BaseSkills(src, data).map(
								(s) => s.Name
							);
							return isInSelectedSource(
								data,
								src.Skills.filter(
									(s) =>
										!existingSkills.includes(s.Name) && !s.RestrictedFromSideJob
								)
							).orderBy((x) => x.Name);
						})
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level1SideJob, lst)
						)
						.onCharacterUpdate(
							(src, state, data) => (data.Level1SideJob = state.Value || "")
						)
						.onlyShowWhen((src, data) => {
							return getLevel1Skills(src, data).any((x) =>
								x.SelectSkill ? true : false
							);
						})
						.withHelp(
							"Gain a Skill from another class. You take a -1 penalty to the associated roll (if there is one), which will be figured in on your character sheet."
						),
					new StringDropDownStep<SourceData, CharacterState, Weapon>(
						"Level1WeaponGrace"
					)
						.withLabel("Weapon Grace")
						.withSelectList((src, data) =>
							src.Weapons.filter((w) =>
								getLevel1Skills(src, data)
									.map((s) => s.ExtraMasteredWeapon || [])
									.flat()
									.includes(w.Name)
							)
						)
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level1WeaponGrace, lst)
						)
						.onCharacterUpdate(
							(src, state, data) => (data.Level1WeaponGrace = state.Value || "")
						)
						.onlyShowWhen((src, data) => {
							return getLevel1Skills(src, data).any(
								(x) => (x.ExtraMasteredWeapon || []).length > 0
							);
						})
						.withHelp(
							"Gives you an extra mastered weapon. You do not take HP penalties for attacking with a mastered weapon."
						)
						.withDetailText(
							(itm) =>
								[
									itm.Description,
									`Accuracy: ${itm.Accuracy}`,
									`Damage: ${itm.Damage}`,
								]
									.filter((x) => x)
									.join(" / "),
							{ OnlyShowOnMobile: true }
						),
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level1Specialization"
					)
						.withLabel("Crafting Specialization")
						.withSelectList((src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat()
								.distinct()
								.orderBy((x) => x)
						)
						.withItemText((itm) => itm)
						.withItemValue((itm) => itm)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level1Specialization, lst)
						)
						.onCharacterUpdate(
							(src, state, data) =>
								(data.Level1Specialization = state.Value || "")
						)
						.onlyShowWhen(
							(src, data) =>
								getLevel1Skills(src, data)
									.map((s) => s.Specialization || [])
									.flat().length > 0
						),
				]
			),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level3WeatherTerrainSpecialty"
			)
				.withLabel("Level 3 Weather/Terrain Specialty")
				.withSelectList((src, data) =>
					src.TerrainWeatherSpecialty.filter(
						(x) => x !== data.Level7WeatherTerrainSpecialty
					).orderBy((x) => x)
				)
				.withItemText((itm) => itm)
				.withItemValue((itm) => itm)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level3WeatherTerrainSpecialty, lst)
				)
				.onCharacterUpdate(
					(src, state, data) =>
						(data.Level3WeatherTerrainSpecialty = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 3)
				.withHelp(
					"Grants a bonus to rolls involving the selected Weather or Terrain."
				),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level4StatusEffectImmunity"
			)
				.withLabel("Level 4 Status Effect Immunity")
				.withSelectList((src, data) => src.StatusEffects)
				.withItemText((itm) => itm)
				.withItemValue((itm) => itm)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level4StatusEffectImmunity, lst)
				)
				.onCharacterUpdate(
					(src, state, data) => (data.Level4StatusEffectImmunity = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withHelp("Grants immunity to the selected status effect."),
			new ContainerStep<SourceData, CharacterState>(
				"Level5ClassContainer",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, CharacterClass>(
						"Level5Class"
					)
						.withLabel("Level 5 Class")
						.withSelectList((src, data) =>
							isInSelectedSource(data, src.Classes)
						)
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level5Class, lst)
						)
						.onCharacterUpdate((src, state, data) => {
							data.Level5Class = state.Value || "";
						})
						.withDetailText((itm) => `Skills: ${itm.Skills.join(", ")}`, {
							OnlyShowOnMobile: true,
						}),
					new StringDropDownStep<SourceData, CharacterState, CharacterSkill>(
						"Level5SideJob"
					)
						.withLabel("Side-Job")
						.withSelectList((src, data) => {
							var existingSkills = getLevel5BaseSkills(src, data).map(
								(s) => s.Name
							);
							return isInSelectedSource(
								data,
								src.Skills.filter(
									(s) =>
										!existingSkills.includes(s.Name) && !s.RestrictedFromSideJob
								)
							).orderBy((x) => x.Name);
						})
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level5SideJob, lst)
						)
						.onCharacterUpdate(
							(src, state, data) => (data.Level5SideJob = state.Value || "")
						)
						.onlyShowWhen((src, data) => {
							return getLevel5Skills(src, data).any((x) =>
								x.SelectSkill ? true : false
							);
						})
						.withHelp(
							"Gain a Skill from another class. You take a -1 penalty to the associated roll (if there is one), which will be figured in on your character sheet."
						),
					new StringDropDownStep<SourceData, CharacterState, Weapon>(
						"Level5WeaponGrace"
					)
						.withLabel("Weapon Grace")
						.withSelectList((src, data) =>
							src.Weapons.filter((w) =>
								getLevel5Skills(src, data)
									.map((s) => s.ExtraMasteredWeapon || [])
									.flat()
									.includes(w.Name)
							)
						)
						.withItemText((itm) => itm.Name)
						.withItemValue((itm) => itm.Name)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level5WeaponGrace, lst)
						)
						.onCharacterUpdate(
							(src, state, data) => (data.Level5WeaponGrace = state.Value || "")
						)
						.onlyShowWhen((src, data) => {
							return getLevel5Skills(src, data).any(
								(x) => (x.ExtraMasteredWeapon || []).length > 0
							);
						})
						.withHelp(
							"Gives you an extra mastered weapon. You do not take HP penalties for attacking with a mastered weapon."
						)
						.withDetailText(
							(itm) =>
								[
									itm.Description,
									`Accuracy: ${itm.Accuracy}`,
									`Damage: ${itm.Damage}`,
								]
									.filter((x) => x)
									.join(" / "),
							{ OnlyShowOnMobile: true }
						),
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level5Specialization"
					)
						.withLabel("Crafting Specialization")
						.withSelectList((src, data) =>
							getLevel5Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat()
								.distinct()
								.filter((x) => x != data.Level1Specialization)
								.orderBy((x) => x)
						)
						.withItemText((itm) => itm)
						.withItemValue((itm) => itm)
						.withDefaultValue((src, data, lst) =>
							valueIfInList(data.Level5Specialization, lst)
						)
						.onCharacterUpdate(
							(src, state, data) =>
								(data.Level5Specialization = state.Value || "")
						)
						.onlyShowWhen(
							(src, data) =>
								getLevel5Skills(src, data)
									.map((s) => s.Specialization || [])
									.flat().length > 0
						),
				]
			).onlyShowWhen((src, data) => data.Level >= 5),
			new ContainerStep<SourceData, CharacterState>("Level6TypeContainer", "", [
				new StringDropDownStep<SourceData, CharacterState, CharacterType>(
					"Level6Type"
				)
					.withLabel("Level 6 Type")
					.withSelectList((src, data) => isInSelectedSource(data, src.Types))
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level6Type, lst)
					)
					.onCharacterUpdate(
						(src, state, data) => (data.Level6Type = state.Value || "")
					),
				new StringDropDownStep<SourceData, CharacterState, Weapon>(
					"Level6WeaponFocus"
				)
					.withLabel("Weapon Focus")
					.withSelectList((src, data) => isInSelectedSource(data, src.Weapons))
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level6WeaponFocus, lst)
					)
					.onCharacterUpdate((src, state, data) => {
						data.Level6WeaponFocus = state.Value || "";
					})
					.onlyShowWhen((src, data) =>
						getLevel6Type(src, data).ExtraMasteredWeapon ? true : false
					)
					.withHelp(
						"Gives you an extra mastered weapon. You do not take HP penalties for attacking with a mastered weapon."
					)
					.withDetailText(
						(itm) =>
							[
								itm.Description,
								`Accuracy: ${itm.Accuracy}`,
								`Damage: ${itm.Damage}`,
							]
								.filter((x) => x)
								.join(" / "),
						{ OnlyShowOnMobile: true }
					),
				new StringDropDownStep<SourceData, CharacterState, SeasonalMagic>(
					"Level6SeasonalMagic"
				)
					.withLabel("Seasonal Magic")
					.withSelectList((src, data) =>
						isInSelectedSource(
							data,
							src.SeasonalMagic.filter(
								(x) => x.Name !== data.Level1SeasonalMagic
							)
						)
					)
					.withItemText((itm) => itm.Name)
					.withItemValue((itm) => itm.Name)
					.withDefaultValue((src, data, lst) =>
						valueIfInList(data.Level6SeasonalMagic, lst)
					)
					.onCharacterUpdate((src, state, data) => {
						data.Level6SeasonalMagic = state.Value || "";
					})
					.onlyShowWhen((src, data) =>
						getLevel6Type(src, data).SeasonalMagic ? true : false
					)
					.withHelp(
						"Determines your seasonal magic. You gain access to all of this season's spells available at your level."
					),
			]).onlyShowWhen((src, data) => data.Level >= 6),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level7WeatherTerrainSpecialty"
			)
				.withLabel("Level 7 Weather/Terrain Specialty")
				.withSelectList((src, data) =>
					src.TerrainWeatherSpecialty.filter(
						(x) => x !== data.Level3WeatherTerrainSpecialty
					).orderBy((x) => x)
				)
				.withItemText((itm) => itm)
				.withItemValue((itm) => itm)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level7WeatherTerrainSpecialty, lst)
				)
				.onCharacterUpdate(
					(src, state, data) =>
						(data.Level7WeatherTerrainSpecialty = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 7)
				.withHelp(
					"Grants a bonus to rolls involving the selected Weather or Terrain."
				),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level9SeasonalDragon"
			)
				.withLabel("Level 9 Favor of the Seasonal Dragon")
				.withSelectList((src, data) => src.SeasonalDragons)
				.withItemText((itm) => itm)
				.withItemValue((itm) => itm)
				.withDefaultValue((src, data, lst) =>
					valueIfInList(data.Level9SeasonalDragon, lst)
				)
				.onCharacterUpdate(
					(src, state, data) => (data.Level9SeasonalDragon = state.Value)
				)
				.onlyShowWhen((src, data) => data.Level >= 9)
				.withHelp(
					"During the selected season, you can automatically take a 10 on one check each day."
				),
			new ContainerStep<SourceData, CharacterState>("LevelUpContainer", "", [
				new AssignPoolStep<SourceData, CharacterState>("AssignHPMP")
					.withLabel("Assign Level-Up HP and MP")
					.withAvailablePoints((src, data) => (data.Level - 1) * 3)
					.withStatPools((src, data) =>
						["HP", "MP"].map((attr) => {
							return { Name: attr };
						})
					)
					.withDefaultValue((src, data) => data.HPMPAssignments || {})
					.onCharacterUpdate((src, state, newData) => {
						newData.HPMPAssignments = removeNullValues(state.Values || {});
					})
					.withHelp(
						"Apply HP/MP increases that you get from leveling up. You gain 3 points to assign between HP and MP each level after 1."
					),
				new AssignPoolStep<SourceData, CharacterState>("StatIncreases")
					.withLabel("Assign Level-Up Stat Increases")
					.withAvailablePoints((src, data) => Math.floor(data.Level / 2))
					.withStatPools((src, data) =>
						["STR", "DEX", "INT", "SPI"].map((attr) => {
							return {
								Name: attr,
								MaxValue: getMaxStatIncreases(
									data.AbilityScoreAssignments[attr] || 4
								),
							};
						})
					)
					.withDefaultValue((src, data) => data.StatIncreases || {})
					.onCharacterUpdate((src, state, data) => {
						data.StatIncreases = removeNullValues(state.Values || {});
					})
					.withHelp(
						"Apply stat die size increases you get form leveling up. You can increase stats at levels 2, 4, 6, 8, and 10. A stat cannot be raised above a d12."
					),
			]).onlyShowWhen((src, data) => data.Level > 1),
			new RyuutamaSpellSelectorStep("SelectedSpells").withHelp(
				"Select Incantation spells granted by the Magic Type. You gain 2 spells per level per type, with Mid Level spells unlocking at level 4 and High Level spells unlocking at level 7."
			),
		],
		() => getInitialCharacterData(),
		toPdfFormFillArgs
	)
);

import { valueIfInList } from "../../../../helpers/builderHelpers";
import { AssignPoolStep, removeNullValues } from "../../steps/AssignPoolStep";
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
				"Version",
				"Character Builder Data Version",
				false,
				(src, data) => src.Version,
				(src, state, newData) => (newData.Version = src.Version)
			),
			new ChecklistStringStep<SourceData, CharacterState, AdditionalSource>(
				"AdditionalSources",
				"Include Sources",
				(src, data) => src.AdditionalSources,
				(itm) => itm.Key,
				(itm) => itm.DisplayText,
				(src, data, lst) => src.AdditionalSources.map((s) => s.Key),
				(src, state, data) => (data.AdditionalSources = state.Values || [])
			)
				.withHelp(
					"Allows you to use content from books other than the core rulebook."
				)
				.useMarkdown(true),
			new StringEntryStep<SourceData, CharacterState>(
				"Name",
				"Name",
				(src, data) => data.Title || "",
				(src, state, newData) => (newData.Title = state.Value || "")
			),
			new NumericStep<SourceData, CharacterState>(
				"Level",
				"Level",
				(src, data) => data.Level || 1,
				(src, state, data) => (data.Level = state.Value || 1)
			)
				.withMinValue(() => 1)
				.withMaxValue(() => 10),
			new StringDropDownStep<SourceData, CharacterState, CharacterTemplate>(
				"CharacterTemplate",
				"Character Template",
				(src, data) => isInSelectedSource(data, src.CharacterTemplates),
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.CharacterTemplate, lst),
				(src, state, newData) => (newData.CharacterTemplate = state.Value || "")
			)
				.withHelp(
					"Determines what options for starting stat dice you have, and may grant additional abilities."
				)
				.withDetailText((itm) => itm.Description),
			new StringDropDownStep<SourceData, CharacterState, StartingAbilityScore>(
				"StartingAbilityScores",
				"Starting Stat Dice",
				(src, data) => {
					var filter =
						getCharacterTemplate(src, data)?.StartingAbilityScoreFilter || [];
					return src.StartingAbilityScores.filter((x) =>
						filter.includes(x.Name)
					);
				},
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) =>
					valueIfInList(data.StartingAbilityScores, lst) || "",
				(src, state, newData) =>
					(newData.StartingAbilityScores = state.Value || "")
			)
				.withHelp("Determines the dice you get to assign to stats at level 1.")
				.withDetailText((itm) => itm.Description),
			new AssignStatsStep<SourceData, CharacterState, StartingDice>(
				"AssignAbilityScores",
				"Assign Stat Dice",
				(src, data) => getStartingAbilityScores(src, data).Dice,
				(us, them) => us.Value === them.Value,
				(src, data, lst) =>
					["STR", "DEX", "INT", "SPI"].map((attr) => {
						var fixedMatch = lst.filter((x) => x.Attribute === attr)[0];

						return {
							Name: attr,
							Locked: fixedMatch ? true : false,
							FixedValue: fixedMatch || undefined,
						};
					}),
				(src, data, lst) => {
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
				},
				(choice) => "d" + choice.Value,
				(src, state, data) => {
					var value: { [name: string]: number } = {};
					var stateValue = state.Value || {};

					Object.keys(stateValue).forEach((key) => {
						var die = stateValue[key];
						if (die) value[key] = die.Value;
					});

					data.AbilityScoreAssignments = value;
				}
			),
			new StringDropDownStep<SourceData, CharacterState, Weapon>(
				"Level1WeaponMastery",
				"Level 1 Weapon Mastery",
				(src, data) => isInSelectedSource(data, src.Weapons),
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1WeaponMastery, lst),
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
					"Level1Type",
					"Level 1 Type",
					(src, data) => isInSelectedSource(data, src.Types),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level1Type, lst),
					(src, state, data) => (data.Level1Type = state.Value || "")
				),
				new StringDropDownStep<SourceData, CharacterState, Weapon>(
					"Level1WeaponFocus",
					"Weapon Focus",
					(src, data) => isInSelectedSource(data, src.Weapons),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level1WeaponFocus, lst),
					(src, state, data) => {
						data.Level1WeaponFocus = state.Value || "";
					}
				)
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
					"Level1SeasonalMagic",
					"Seasonal Magic",
					(src, data) => isInSelectedSource(data, src.SeasonalMagic),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level1SeasonalMagic, lst),
					(src, state, data) => {
						data.Level1SeasonalMagic = state.Value || "";
					}
				)
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
						"Level1Class",
						"Level 1 Class",
						(src, data) => isInSelectedSource(data, src.Classes),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level1Class, lst),
						(src, state, data) => {
							data.Level1Class = state.Value || "";
						}
					).withDetailText((itm) => `Skills: ${itm.Skills.join(", ")}`, {
						OnlyShowOnMobile: true,
					}),
					new StringDropDownStep<SourceData, CharacterState, CharacterSkill>(
						"Level1SideJob",
						"Side-Job",
						(src, data) => {
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
						},
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level1SideJob, lst),
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
						"Level1WeaponGrace",
						"Weapon Grace",
						(src, data) =>
							src.Weapons.filter((w) =>
								getLevel1Skills(src, data)
									.map((s) => s.ExtraMasteredWeapon || [])
									.flat()
									.includes(w.Name)
							),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level1WeaponGrace, lst),
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
						"Level1Specialization",
						"Crafting Specialization",
						(src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat()
								.distinct()
								.orderBy((x) => x),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Level1Specialization, lst),
						(src, state, data) =>
							(data.Level1Specialization = state.Value || "")
					).onlyShowWhen(
						(src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat().length > 0
					),
				]
			),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level3WeatherTerrainSpecialty",
				"Level 3 Weather/Terrain Specialty",
				(src, data) =>
					src.TerrainWeatherSpecialty.filter(
						(x) => x !== data.Level7WeatherTerrainSpecialty
					).orderBy((x) => x),
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) =>
					valueIfInList(data.Level3WeatherTerrainSpecialty, lst),
				(src, state, data) => (data.Level3WeatherTerrainSpecialty = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 3)
				.withHelp(
					"Grants a bonus to rolls involving the selected Weather or Terrain."
				),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level4StatusEffectImmunity",
				"Level 4 Status Effect Immunity",
				(src, data) => src.StatusEffects,
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) => valueIfInList(data.Level4StatusEffectImmunity, lst),
				(src, state, data) => (data.Level4StatusEffectImmunity = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 4)
				.withHelp("Grants immunity to the selected status effect."),
			new ContainerStep<SourceData, CharacterState>(
				"Level5ClassContainer",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, CharacterClass>(
						"Level5Class",
						"Level 5 Class",
						(src, data) => isInSelectedSource(data, src.Classes),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level5Class, lst),
						(src, state, data) => {
							data.Level5Class = state.Value || "";
						}
					).withDetailText((itm) => `Skills: ${itm.Skills.join(", ")}`, {
						OnlyShowOnMobile: true,
					}),
					new StringDropDownStep<SourceData, CharacterState, CharacterSkill>(
						"Level5SideJob",
						"Side-Job",
						(src, data) => {
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
						},
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level5SideJob, lst),
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
						"Level5WeaponGrace",
						"Weapon Grace",
						(src, data) =>
							src.Weapons.filter((w) =>
								getLevel5Skills(src, data)
									.map((s) => s.ExtraMasteredWeapon || [])
									.flat()
									.includes(w.Name)
							),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level5WeaponGrace, lst),
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
						"Level5Specialization",
						"Crafting Specialization",
						(src, data) =>
							getLevel5Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat()
								.distinct()
								.filter((x) => x != data.Level1Specialization)
								.orderBy((x) => x),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Level5Specialization, lst),
						(src, state, data) =>
							(data.Level5Specialization = state.Value || "")
					).onlyShowWhen(
						(src, data) =>
							getLevel5Skills(src, data)
								.map((s) => s.Specialization || [])
								.flat().length > 0
					),
				]
			).onlyShowWhen((src, data) => data.Level >= 5),
			new ContainerStep<SourceData, CharacterState>("Level6TypeContainer", "", [
				new StringDropDownStep<SourceData, CharacterState, CharacterType>(
					"Level6Type",
					"Level 6 Type",
					(src, data) => isInSelectedSource(data, src.Types),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level6Type, lst),
					(src, state, data) => (data.Level6Type = state.Value || "")
				),
				new StringDropDownStep<SourceData, CharacterState, Weapon>(
					"Level6WeaponFocus",
					"Weapon Focus",
					(src, data) => isInSelectedSource(data, src.Weapons),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level6WeaponFocus, lst),
					(src, state, data) => {
						data.Level6WeaponFocus = state.Value || "";
					}
				)
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
					"Level6SeasonalMagic",
					"Seasonal Magic",
					(src, data) =>
						isInSelectedSource(
							data,
							src.SeasonalMagic.filter(
								(x) => x.Name !== data.Level1SeasonalMagic
							)
						),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level6SeasonalMagic, lst),
					(src, state, data) => {
						data.Level6SeasonalMagic = state.Value || "";
					}
				)
					.onlyShowWhen((src, data) =>
						getLevel6Type(src, data).SeasonalMagic ? true : false
					)
					.withHelp(
						"Determines your seasonal magic. You gain access to all of this season's spells available at your level."
					),
			]).onlyShowWhen((src, data) => data.Level >= 6),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level7WeatherTerrainSpecialty",
				"Level 7 Weather/Terrain Specialty",
				(src, data) =>
					src.TerrainWeatherSpecialty.filter(
						(x) => x !== data.Level3WeatherTerrainSpecialty
					).orderBy((x) => x),
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) =>
					valueIfInList(data.Level7WeatherTerrainSpecialty, lst),
				(src, state, data) => (data.Level7WeatherTerrainSpecialty = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 7)
				.withHelp(
					"Grants a bonus to rolls involving the selected Weather or Terrain."
				),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level9SeasonalDragon",
				"Level 9 Favor of the Seasonal Dragon",
				(src, data) => src.SeasonalDragons,
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) => valueIfInList(data.Level9SeasonalDragon, lst),
				(src, state, data) => (data.Level9SeasonalDragon = state.Value)
			)
				.onlyShowWhen((src, data) => data.Level >= 9)
				.withHelp(
					"During the selected season, you can automatically take a 10 on one check each day."
				),
			new ContainerStep<SourceData, CharacterState>("LevelUpContainer", "", [
				new AssignPoolStep<SourceData, CharacterState>(
					"AssignHPMP",
					"Assign Level-Up HP and MP",
					(src, data) => (data.Level - 1) * 3,
					(src, data) =>
						["HP", "MP"].map((attr) => {
							return { Name: attr };
						}),
					(src, data) => data.HPMPAssignments || {},
					(src, state, newData) => {
						newData.HPMPAssignments = removeNullValues(state.Values || {});
					}
				).withHelp(
					"Apply HP/MP increases that you get from leveling up. You gain 3 points to assign between HP and MP each level after 1."
				),
				new AssignPoolStep<SourceData, CharacterState>(
					"StatIncreases",
					"Assign Level-Up Stat Increases",
					(src, data) => Math.floor(data.Level / 2),
					(src, data) =>
						["STR", "DEX", "INT", "SPI"].map((attr) => {
							return {
								Name: attr,
								MaxValue: getMaxStatIncreases(
									data.AbilityScoreAssignments[attr] || 4
								),
							};
						}),
					(src, data) => data.StatIncreases || {},
					(src, state, data) => {
						data.StatIncreases = removeNullValues(state.Values || {});
					}
				).withHelp(
					"Apply stat die size increases you get form leveling up. You can increase stats at levels 2, 4, 6, 8, and 10. A stat cannot be raised above a d12."
				),
			]).onlyShowWhen((src, data) => data.Level > 1),
			new RyuutamaSpellSelectorStep("SelectedSpells").withHelp(
				"Select Incantation spells granted by the Magic Type. You gain 2 spells per level per type, with Mid Level spells unlocking at level 4 and High Level spells unlocking at level 7."
			),
		],
		() => getInitialCharacterData()
	)
);

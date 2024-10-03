import { valueIfInList } from "../../builderHelpers";
import {
	AssignPoolStep,
	removeNullValues,
} from "../../components/steps/AssignPoolStep";
import { AssignStatsStep } from "../../components/steps/AssignStatsStep";
import { ChecklistStringStep } from "../../components/steps/ChecklistStringStep";
import { ContainerStep } from "../../components/steps/ContainerStep";
import { NumericStep } from "../../components/steps/NumericStep";
import { StaticTextStep } from "../../components/steps/StaticTextStep";
import { StringDropDownStep } from "../../components/steps/StringDropDownStep";
import { StringEntryStep } from "../../components/steps/StringEntryStep";
import { registerBuilderModel } from "../../state/BuilderFactory";
import { RootStepCollection } from "../../state/StepModel";
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
				"Character Builder Version",
				false,
				(src, data) => src.Version,
				(src, state, newData) => (newData.Version = src.Version)
			),
			new ChecklistStringStep<SourceData, CharacterState, string>(
				"AdditionalSources",
				"Include Sources",
				(src, data) => src.AdditionalSources,
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) => src.AdditionalSources,
				(src, data) => undefined,
				(src, data) => undefined,
				(src, state, data) => (data.AdditionalSources = state.Values || [])
			),
			new StringEntryStep<SourceData, CharacterState>(
				"Name",
				"Name",
				(src, data) => data.Title || "",
				(src, state, newData) => (newData.Title = state.Value || ""),
				false
			),
			new NumericStep<SourceData, CharacterState>(
				"Level",
				"Level",
				(src, data) => 1,
				(src, data) => 10,
				(src, data) => 1,
				(src, data) => data.Level || 1,
				(src, state, data) => (data.Level = state.Value || 1)
			),
			new StringDropDownStep<SourceData, CharacterState, CharacterTemplate>(
				"CharacterTemplate",
				"Character Template",
				(src, data) => isInSelectedSource(data, src.CharacterTemplates),
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.CharacterTemplate, lst),
				(src, state, newData) => (newData.CharacterTemplate = state.Value || "")
			),
			new StringDropDownStep<SourceData, CharacterState, StartingAbilityScore>(
				"StartingAbilityScores",
				"Starting Ability Scores",
				(src, data) => {
					//console.log(getCharacterTemplate(src, data.CharacterTemplate));
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
			),
			new AssignStatsStep<SourceData, CharacterState, StartingDice>(
				"AssignAbilityScores",
				"Assign Ability Scores",
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
				},
				false
			),
			// new AssignItemsStep<SourceData, CharacterState, StartingDice>(
			// 	"AssignAbilityScores",
			// 	(src, data) => getStartingAbilityScores(src, data).Dice,
			// 	(us, them) => us.Value === them.Value,
			// 	(src, data, lst) =>
			// 		["STR", "DEX", "INT", "SPI"].map((attr) => {
			// 			var fixedMatch = lst.filter((x) => x.Attribute === attr)[0];

			// 			return {
			// 				Name: attr,
			// 				Locked: fixedMatch ? true : false,
			// 				MaxCount: 1,
			// 				FixedValues: fixedMatch ? [fixedMatch] : undefined,
			// 			};
			// 		}),
			// 	(src, data, lst) => {
			// 		var defaultValue: { [name: string]: StartingDice[] } = {};
			// 		var remaining = [...lst];

			// 		Object.keys(data.AbilityScoreAssignments).forEach((key) => {
			// 			var match = remaining.filter(
			// 				(x) => x.Value === data.AbilityScoreAssignments[key]
			// 			)[0];
			// 			if (match) {
			// 				defaultValue[key] = [match];
			// 				remaining.splice(remaining.indexOf(match), 1);
			// 			}
			// 		});

			// 		return defaultValue;
			// 	},
			// 	(itm) => <span>d{itm.Value}</span>,
			// 	(src, state, data) => {
			// 		var value: { [name: string]: number } = {};
			// 		var stateValue = state.Value || {};

			// 		Object.keys(stateValue).forEach((key) => {
			// 			var die = stateValue[key][0];
			// 			if (die) value[key] = die.Value;
			// 		});

			// 		data.AbilityScoreAssignments = value;
			// 	},
			// 	false
			// ),
			new StringDropDownStep<SourceData, CharacterState, Weapon>(
				"Level1WeaponMastery",
				"Level 1 Weapon Mastery",
				(src, data) => isInSelectedSource(data, src.Weapons),
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1WeaponMastery, lst),
				(src, state, data) => (data.Level1WeaponMastery = state.Value || "")
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
				new StringDropDownStep<SourceData, CharacterState, SeasonalMagic>(
					"Level1WeaponFocus",
					"Weapon Focus",
					(src, data) => isInSelectedSource(data, src.Weapons),
					(itm) => itm.Name,
					(itm) => itm.Name,
					(src, data, lst) => valueIfInList(data.Level1WeaponFocus, lst),
					(src, state, data) => {
						data.Level1WeaponFocus = state.Value || "";
					},
					(src, data) =>
						getLevel1Type(src, data).ExtraMasteredWeapon ? true : false
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
					},
					(src, data) => (getLevel1Type(src, data).SeasonalMagic ? true : false)
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
					),
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
						(src, state, data) => (data.Level1SideJob = state.Value || ""),
						(src, data) => {
							return getLevel1Skills(src, data).any((x) =>
								x.SelectSkill ? true : false
							);
						}
					),
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level1WeaponGrace",
						"Weapon Grace",
						(src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.ExtraMasteredWeapon || [])
								.flat()
								.distinct(),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Level1WeaponGrace, lst),
						(src, state, data) => (data.Level1WeaponGrace = state.Value || ""),
						(src, data) => {
							return getLevel1Skills(src, data).any(
								(x) => (x.ExtraMasteredWeapon || []).length > 0
							);
						}
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
				(src, state, data) =>
					(data.Level3WeatherTerrainSpecialty = state.Value),
				(src, data) => data.Level >= 3
			),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level4StatusEffectImmunity",
				"Level 4 Status Effect Immunity",
				(src, data) => src.StatusEffects,
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) => valueIfInList(data.Level4StatusEffectImmunity, lst),
				(src, state, data) => (data.Level4StatusEffectImmunity = state.Value),
				(src, data) => data.Level >= 4
			),
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
					),
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
						(src, state, data) => (data.Level5SideJob = state.Value || ""),
						(src, data) => {
							return getLevel5Skills(src, data).any((x) =>
								x.SelectSkill ? true : false
							);
						}
					),
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level5WeaponGrace",
						"Weapon Grace",
						(src, data) =>
							getLevel5Skills(src, data)
								.map((s) => s.ExtraMasteredWeapon || [])
								.flat()
								.distinct(),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Level5WeaponGrace, lst),
						(src, state, data) => (data.Level5WeaponGrace = state.Value || ""),
						(src, data) => {
							return getLevel5Skills(src, data).any(
								(x) => (x.ExtraMasteredWeapon || []).length > 0
							);
						}
					),
				],
				(src, data) => data.Level >= 5
			),
			new ContainerStep<SourceData, CharacterState>(
				"Level6TypeContainer",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, CharacterType>(
						"Level6Type",
						"Level 6 Type",
						(src, data) => isInSelectedSource(data, src.Types),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level6Type, lst),
						(src, state, data) => (data.Level6Type = state.Value || "")
					),
					new StringDropDownStep<SourceData, CharacterState, SeasonalMagic>(
						"Level6WeaponFocus",
						"Weapon Focus",
						(src, data) => isInSelectedSource(data, src.Weapons),
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level6WeaponFocus, lst),
						(src, state, data) => {
							data.Level6WeaponFocus = state.Value || "";
						},
						(src, data) =>
							getLevel6Type(src, data).ExtraMasteredWeapon ? true : false
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
						},
						(src, data) =>
							getLevel6Type(src, data).SeasonalMagic ? true : false
					),
				],
				(src, data) => data.Level >= 6
			),
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
				(src, state, data) =>
					(data.Level7WeatherTerrainSpecialty = state.Value),
				(src, data) => data.Level >= 7
			),
			new StringDropDownStep<SourceData, CharacterState, string>(
				"Level9SeasonalDragon",
				"Level 9 Favor of the Seasonal Dragon",
				(src, data) => src.SeasonalDragons,
				(itm) => itm,
				(itm) => itm,
				(src, data, lst) => valueIfInList(data.Level9SeasonalDragon, lst),
				(src, state, data) => (data.Level9SeasonalDragon = state.Value),
				(src, data) => data.Level >= 9
			),
			new ContainerStep<SourceData, CharacterState>(
				"LevelUpContainer",
				"",
				[
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
						},
						false
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
						},
						false
					),
				],
				(src, data) => data.Level > 1
			),
			new RyuutamaSpellSelectorStep("SelectedSpells"),
		],
		() => getInitialCharacterData()
	)
);

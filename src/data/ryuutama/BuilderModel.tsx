import { valueIfInList } from "../../builderHelpers";
import { AssignItemsStep } from "../../components/steps/AssignItemsStep";
import { AssignPoolStep } from "../../components/steps/AssignPoolStep";
import { ChecklistStringStep } from "../../components/steps/ChecklistStringStep";
import { ContainerStep } from "../../components/steps/ContainerStep";
import { NumericStep } from "../../components/steps/NumericStep";
import { StringDropDownStep } from "../../components/steps/StringDropDownStep";
import { registerBuilderModel } from "../../models/BuilderFactory";
import { RootStepCollection } from "../../models/StepModel";
import {
	CharacterState,
	getCharacterTemplate,
	getInitialCharacterData,
	getLevel1BaseSkills,
	getLevel1Skills,
	getLevel1Type,
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
			new AssignItemsStep<SourceData, CharacterState, StartingDice>(
				"AssignAbilityScores",
				(src, data) => getStartingAbilityScores(src, data).Dice,
				(us, them) => us.Value === them.Value,
				(src, data, lst) =>
					["STR", "DEX", "INT", "SPI"].map((attr) => {
						var fixedMatch = lst.filter((x) => x.Attribute === attr)[0];

						return {
							Name: attr,
							Locked: fixedMatch ? true : false,
							MaxCount: 1,
							FixedValues: fixedMatch ? [fixedMatch] : undefined,
						};
					}),
				(src, data, lst) => {
					var defaultValue: { [name: string]: StartingDice[] } = {};
					var remaining = [...lst];

					Object.keys(data.AbilityScoreAssignments).forEach((key) => {
						var match = remaining.filter(
							(x) => x.Value === data.AbilityScoreAssignments[key]
						)[0];
						if (match) {
							defaultValue[key] = [match];
							remaining.splice(remaining.indexOf(match), 1);
						}
					});

					return defaultValue;
				},
				(itm) => <span>d{itm.Value}</span>,
				(src, state, data) => {
					var value: { [name: string]: number } = {};
					var stateValue = state.Value || {};

					Object.keys(stateValue).forEach((key) => {
						var die = stateValue[key][0];
						if (die) value[key] = die.Value;
					});

					data.AbilityScoreAssignments = value;
				},
				false
			),
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
						(src, state, data) => {
							data.HPMPAssignments = structuredClone(state.Values);
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
							data.StatIncreases = structuredClone(state.Values);
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

// TODO: Level 3 + 7 Terrain/Weather Specialty
// TODO: Level 4 Status Effect Immunity
// TODO: Level 5 Extra Class
// TODO: Level 6 Extra Type
// TODO: Level 9 Seasonal Dragon
// TODO: Spell Selection

import { AssignItemsStep } from "../components/steps/AssignItemsStep";
import { ContainerStep } from "../components/steps/ContainerStep";
import { NumericStep } from "../components/steps/NumericStep";
import { StringDropDownStep } from "../components/steps/StringDropDownStep";
import {
	registerBuilderModel,
	registerCharacterSheetRenderer,
} from "../models/BuilderFactory";
import { valueIfInList } from "../models/builderHelpers";
import { StepCollection } from "../models/StepModel";
import { adjustDiceRoll } from "./DiceRolls";

const BUILDER_KEY = "ryuutama";

export interface SourceData {
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
	RelevantRoll?: string | undefined;
	SelectSkill?: boolean | undefined;
	ExtraMasteredWeapon?: string[] | undefined;
	Specialization?: string[] | undefined;
}

export interface Weapon {
	Name: string;
	Description: string;
	Examples: string;
	Accuracy: string;
	Damage: string;
}

export interface CharacterState {
	Level: number;
	CharacterTemplate: string;
	StartingAbilityScores: string;
	AbilityScoreAssignments: { [name: string]: number | undefined };
	Level1WeaponMastery: string;
	Level1Class: string;
	Level1WeaponGrace: string;
}

const initialCharacterData: CharacterState = {
	Level: 1,
	CharacterTemplate: "",
	StartingAbilityScores: "",
	AbilityScoreAssignments: {},
	Level1WeaponMastery: "",
	Level1Class: "",
	Level1WeaponGrace: "",
};

function getCharacterTemplate(model: SourceData, data: CharacterState) {
	return (
		model.CharacterTemplates.filter(
			(x) => x.Name === data.CharacterTemplate
		)[0] || undefined
	);
}

function getStartingAbilityScores(model: SourceData, data: CharacterState) {
	return (
		model.StartingAbilityScores.filter(
			(x) => x.Name === data.StartingAbilityScores
		)[0] || undefined
	);
}

function getLevel1Class(model: SourceData, data: CharacterState) {
	return (
		model.Classes.filter((x) => x.Name === data.Level1Class)[0] || undefined
	);
}

function getLevel1Skills(model: SourceData, data: CharacterState) {
	var l1class = getLevel1Class(model, data);
	if (!l1class) return [];
	return model.Skills.filter((x) => l1class.Skills.includes(x.Name));
}

registerBuilderModel(
	new StepCollection<SourceData, CharacterState>(
		BUILDER_KEY,
		[
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
				(src, data) => src.CharacterTemplates,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) =>
					valueIfInList(data.CharacterTemplate, (x) => x.Name, lst) || "",
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
					valueIfInList(data.StartingAbilityScores, (x) => x.Name, lst) || "",
				(src, state, newData) =>
					(newData.StartingAbilityScores = state.Value || "")
			),
			new StringDropDownStep<SourceData, CharacterState, Weapon>(
				"Level1WeaponMastery",
				"Level 1 Weapon Mastery",
				(src, data) => src.Weapons,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) =>
					lst.any((x) => x.Name === data.Level1WeaponMastery)
						? data.Level1WeaponMastery
						: lst[0].Name,
				(src, state, data) => (data.Level1WeaponMastery = state.Value || "")
			),
			new StringDropDownStep<SourceData, CharacterState, CharacterClass>(
				"Level1Class",
				"Class",
				(src, data) => src.Classes,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) =>
					valueIfInList(data.Level1Class, (x) => x.Name, lst) || "",
				(src, state, data) => {
					data.Level1Class = state.Value || "";

					// Test to see if properties that are dependent on this selection are still valid
					// if (data.Level1WeaponGrace) {
					// 	if (
					// 		!getLevel1Skills(src, data).any((x) =>
					// 			x.ExtraMasteredWeapon.includes(data.Level1WeaponGrace)
					// 		)
					// 	)
					// 		data.Level1WeaponGrace = "";
					// }
				}
			),
			new ContainerStep<SourceData, CharacterState>(
				"Level1WeaponGrace",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level1WeaponGrace",
						"Level 1 Weapon Grace",
						(src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.ExtraMasteredWeapon || [])
								.flat()
								.distinct(),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) =>
							lst.any((x) => x === data.Level1WeaponGrace)
								? data.Level1WeaponGrace
								: lst[0],
						(src, state, data) => (data.Level1WeaponGrace = state.Value || "")
					),
				],
				(src, data) => {
					return getLevel1Skills(src, data).any(
						(x) => (x.ExtraMasteredWeapon || []).length > 0
					);
				}
			),
			// new AssignItemsStep<SourceData, CharacterState, StartingDice>(
			// 	"AssignAbilityScores",
			// 	(src, data) =>
			// 		getStartingAbilityScores(src, data.StartingAbilityScores).Dice,
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
			// 	}
			// ),
		],
		() => initialCharacterData
	)
);

function collectAbilityScores(data: CharacterState) {
	return {
		STR: data.AbilityScoreAssignments["STR"],
		DEX: data.AbilityScoreAssignments["DEX"],
		INT: data.AbilityScoreAssignments["INT"],
		SPI: data.AbilityScoreAssignments["SPI"],
	};
}

function collectWeaponMasteries(source: SourceData, data: CharacterState) {
	return [data.Level1WeaponMastery, data.Level1WeaponGrace]
		.filter((x) => x)
		.groupBy((x) => x)
		.map((grp) => {
			return {
				Count: grp.items.length,
				Mastery: source.Weapons.filter((x) => x.Name === grp.key)[0],
			};
		})
		.filter((x) => x.Mastery)
		.map((x) => {
			return {
				Name: x.Mastery.Name,
				Description: x.Mastery.Description,
				Examples: x.Mastery.Examples,
				Accuracy: adjustDiceRoll(x.Mastery.Accuracy, x.Count - 1),
				Damage: x.Mastery.Damage,
			};
		});
}

function collectSkills(source: SourceData, data: CharacterState) {
	return [getLevel1Skills(source, data)]
		.filter((x) => x)
		.flat()
		.groupBy((x) => x.Name)
		.map((grp) => {
			return {
				Count: grp.items.length,
				Skill: source.Skills.filter((x) => x.Name === grp.key)[0],
			};
		})
		.filter((x) => x.Skill)
		.map((x) => {
			return {
				Name: x.Skill.Name,
				Description: x.Skill.Description,
				RelevantRoll: x.Skill.RelevantRoll
					? adjustDiceRoll(x.Skill.RelevantRoll, x.Count - 1)
					: undefined,
			};
		});
}

function characterSheetRenderer(source: SourceData, data: CharacterState) {
	var characterTemplate = getCharacterTemplate(source, data);
	var abilityScores = collectAbilityScores(data);

	return (
		<div className="character-sheet">
			<div className="level">Level {data.Level}</div>
			<div className="classes">
				{[characterTemplate.DisplayValue, data.Level1Class]
					.filter((x) => x)
					.join(" ")}
			</div>
			<div className="ability-scores">
				STR: {abilityScores.STR}
				DEX: {abilityScores.DEX}
				INT: {abilityScores.INT}
				SPI: {abilityScores.SPI}
			</div>
			{renderSkills(collectSkills(source, data))}
			{renderWeaponMasteries(collectWeaponMasteries(source, data))}
		</div>
	);
}

function renderSkills(skills: ClassSkill[]) {
	if (skills && skills.length > 0) {
		return (
			<>
				<div className="title">Skills</div>
				<table>
					<thead>
						<th>Name</th>
						<th>Description</th>
						<th>Roll</th>
					</thead>
					<tbody>
						{skills.map((s) => (
							<tr key={`Ryuutama-Skill-${s.Name}`}>
								<td>{s.Name}</td>
								<td>{s.Description}</td>
								<td>{s.RelevantRoll || "-"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	}
}

function renderWeaponMasteries(weapons: Weapon[]) {
	if (weapons && weapons.length > 0) {
		return (
			<>
				<div className="title">Weapon Masteries</div>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Examples</th>
							<th>Accuracy</th>
							<th>Damage</th>
						</tr>
					</thead>
					<tbody>
						{weapons.map((w) => (
							<tr key={`Ryuutama-WeaponMastery-${w.Name}`}>
								<td>{w.Name}</td>
								<td>{w.Description}</td>
								<td>{w.Examples}</td>
								<td>{w.Accuracy}</td>
								<td>{w.Damage}</td>
							</tr>
						))}
					</tbody>
				</table>
			</>
		);
	} else {
		return <></>;
	}
}

registerCharacterSheetRenderer(BUILDER_KEY, characterSheetRenderer);

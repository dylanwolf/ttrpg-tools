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
import { adjustRyuutamaDiceRoll } from "./DiceRolls";

const BUILDER_KEY = "ryuutama";

export interface SourceData {
	CharacterTemplates: CharacterTemplate[];
	StartingAbilityScores: StartingAbilityScore[];
	Classes: CharacterClass[];
	Skills: CharacterSkill[];
	Weapons: Weapon[];
	Types: CharacterType[];
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

export interface CharacterSkill {
	Name: string;
	Description: string;
	RelevantRoll?: string | undefined;
	SelectSkill?: boolean | undefined;
	ExtraMasteredWeapon?: string[] | undefined;
	Specialization?: string[] | undefined;
	RestrictedFromSideJob?: boolean | undefined;
	Bonuses?: { [stat: string]: number } | undefined;
}

export interface Weapon {
	Name: string;
	Description: string;
	Examples: string;
	Accuracy: string;
	Damage: string;
}

export interface CharacterType {
	Name: string;
	Bonuses?: { [stat: string]: number } | undefined;
	SeasonalMagic?: number | undefined;
	SpellsPerLevel?: number | undefined;
	ExtraMasteredWeapon?: boolean | undefined;
}

export interface CharacterState {
	Level: number;
	CharacterTemplate: string;
	StartingAbilityScores: string;
	AbilityScoreAssignments: { [name: string]: number | undefined };
	Level1WeaponMastery: string;
	Level1Class: string;
	Level1SideJob: string;
	Level1WeaponGrace: string;
	Level1Type: string;
	Level1WeaponFocus: string;
}

const initialCharacterData: CharacterState = {
	Level: 1,
	CharacterTemplate: "",
	StartingAbilityScores: "",
	AbilityScoreAssignments: {},
	Level1WeaponMastery: "",
	Level1Class: "",
	Level1SideJob: "",
	Level1WeaponGrace: "",
	Level1Type: "",
	Level1WeaponFocus: "",
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

function getLevel1BaseSkills(model: SourceData, data: CharacterState) {
	var l1class = getLevel1Class(model, data);
	if (!l1class) return [];

	return model.Skills.filter((x) => l1class.Skills.includes(x.Name));
}

function getLevel1Skills(model: SourceData, data: CharacterState) {
	var l1class = getLevel1Class(model, data);
	if (!l1class) return [];

	return model.Skills.filter(
		(x) => l1class.Skills.includes(x.Name) || data.Level1SideJob === x.Name
	);
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
			new StringDropDownStep<SourceData, CharacterState, Weapon>(
				"Level1WeaponMastery",
				"Level 1 Weapon Mastery",
				(src, data) => src.Weapons,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1WeaponMastery, lst),
				(src, state, data) => (data.Level1WeaponMastery = state.Value || "")
			),
			new StringDropDownStep<SourceData, CharacterState, CharacterType>(
				"Level1Type",
				"Level 1 Type",
				(src, data) => src.Types,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1Type, lst),
				(src, state, data) => (data.Level1Type = state.Value || "")
			),
			new StringDropDownStep<SourceData, CharacterState, CharacterClass>(
				"Level1Class",
				"Level 1 Class",
				(src, data) => src.Classes,
				(itm) => itm.Name,
				(itm) => itm.Name,
				(src, data, lst) => valueIfInList(data.Level1Class, lst),
				(src, state, data) => {
					data.Level1Class = state.Value || "";
				}
			),
			new ContainerStep<SourceData, CharacterState>(
				"Level1SideJob",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, CharacterSkill>(
						"Level1SideJob",
						"Level 1 Farmer Side-Job",
						(src, data) => {
							var existingSkills = getLevel1BaseSkills(src, data).map(
								(s) => s.Name
							);
							return src.Skills.filter(
								(s) =>
									!existingSkills.includes(s.Name) && !s.RestrictedFromSideJob
							).orderBy((x) => x.Name);
						},
						(itm) => itm.Name,
						(itm) => itm.Name,
						(src, data, lst) => valueIfInList(data.Level1SideJob, lst),
						(src, state, data) => (data.Level1SideJob = state.Value || "")
					),
				],
				(src, data) => {
					return getLevel1Skills(src, data).any((x) =>
						x.SelectSkill ? true : false
					);
				}
			),
			new ContainerStep<SourceData, CharacterState>(
				"Level1WeaponGrace",
				"",
				[
					new StringDropDownStep<SourceData, CharacterState, string>(
						"Level1WeaponGrace",
						"Level 1 Noble Weapon Grace",
						(src, data) =>
							getLevel1Skills(src, data)
								.map((s) => s.ExtraMasteredWeapon || [])
								.flat()
								.distinct(),
						(itm) => itm,
						(itm) => itm,
						(src, data, lst) => valueIfInList(data.Level1WeaponGrace, lst),
						(src, state, data) => (data.Level1WeaponGrace = state.Value || "")
					),
				],
				(src, data) => {
					console.log(
						getLevel1Skills(src, data).any(
							(x) => (x.ExtraMasteredWeapon || []).length > 0
						)
					);
					return getLevel1Skills(src, data).any(
						(x) => (x.ExtraMasteredWeapon || []).length > 0
					);
				}
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
				}
			),
		],
		() => initialCharacterData
	)
);

interface CharacterSheetData {
	Level: number;
	CharacterTemplateDisplayName: string | undefined;
	Level1Class: string | undefined;
	Level1Type: string | undefined;
	AbilityScores: {
		STR: number | undefined;
		DEX: number | undefined;
		INT: number | undefined;
		SPI: number | undefined;
	};
	Derived: {
		CarryingCapacity: number;
		HP: number;
		MP: number;
	};
	OtherBonuses: { [stat: string]: string };
	Skills: CharacterSkill[];
	WeaponMasteries: Weapon[];
}

function collectCharacterSheetData(
	source: SourceData,
	data: CharacterState
): CharacterSheetData {
	var tpl = getCharacterTemplate(source, data);
	var level1Skills = getLevel1Skills(source, data);

	var attrStr = data.AbilityScoreAssignments["STR"];
	var attrDex = data.AbilityScoreAssignments["DEX"];
	var attrInt = data.AbilityScoreAssignments["INT"];
	var attrSpi = data.AbilityScoreAssignments["SPI"];

	var groupedTypes = [data.Level1Type]
		.groupBy((x) => x)
		.map((grp) => {
			return {
				Count: grp.items.length,
				Type: source.Types.filter((x) => x.Name === grp.key)[0],
			};
		})
		.filter((x) => x.Type);

	var groupedSkills = [level1Skills]
		.filter((x) => x)
		.flat()
		.groupBy((x) => x.Name)
		.map((grp) => {
			return {
				Count: grp.items.length,
				Skill: source.Skills.filter((x) => x.Name === grp.key)[0],
				IsSideJob: grp.key === data.Level1SideJob,
			};
		});

	var bonuses: { [stat: string]: number } = {};

	groupedTypes.forEach((x) => {
		if (!x.Type.Bonuses) return;

		Object.keys(x.Type.Bonuses).forEach((key) => {
			if (!x.Type.Bonuses) return;

			if (!bonuses[key]) bonuses[key] = 0;
			bonuses[key] += x.Type.Bonuses[key] * x.Count;
		});
	});

	groupedSkills.forEach((x) => {
		if (!x.Skill.Bonuses) return;

		Object.keys(x.Skill.Bonuses).forEach((key) => {
			if (!x.Skill.Bonuses) return;

			if (!bonuses[key]) bonuses[key] = 0;
			bonuses[key] += x.Skill.Bonuses[key] * x.Count;
		});
	});

	var carryCapacity = (attrStr || 0) + 3 + (bonuses["Carrying Capacity"] || 0);
	var hp = (attrStr || 0) * 2 + (bonuses["HP"] || 0);
	var mp = (attrSpi || 0) * 2 + (bonuses["MP"] || 0);
	var damage = bonuses["Damage"] || 0;

	var otherBonuses: { [stat: string]: string } = {};
	Object.keys(bonuses).forEach((key) => {
		if (["HP", "MP", "Damage", "Carrying Capacity"].includes(key)) return;
		otherBonuses[key] = adjustRyuutamaDiceRoll(bonuses[key]);
	});

	var weaponMasteries = [data.Level1WeaponMastery, data.Level1WeaponGrace]
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
				Accuracy: adjustRyuutamaDiceRoll(x.Mastery.Accuracy, x.Count - 1),
				Damage: adjustRyuutamaDiceRoll(x.Mastery.Damage, damage),
			};
		});

	return {
		Level: data.Level || 1,
		CharacterTemplateDisplayName: tpl?.DisplayValue || undefined,
		Level1Class: data.Level1Class,
		Level1Type: data.Level1Type,
		AbilityScores: {
			STR: attrStr,
			DEX: attrDex,
			INT: attrInt,
			SPI: attrSpi,
		},
		Derived: {
			CarryingCapacity: carryCapacity,
			HP: hp,
			MP: mp,
		},
		Skills: groupedSkills
			.map((x) => {
				return {
					Name: x.Skill.Name,
					Description: x.Skill.Description,
					RelevantRoll: x.Skill.RelevantRoll
						? adjustRyuutamaDiceRoll(
								x.Skill.RelevantRoll,
								x.Count - 1 + (x.IsSideJob ? -1 : 0)
						  )
						: undefined,
				};
			})
			.orderBy((x) => x.Name),
		WeaponMasteries: weaponMasteries,
		OtherBonuses: otherBonuses,
	};
}

function characterSheetRenderer(source: SourceData, data: CharacterState) {
	var cs = collectCharacterSheetData(source, data);

	return (
		<div className="character-sheet">
			<div className="level">Level {data.Level}</div>
			<div className="classes">
				{cs.CharacterTemplateDisplayName
					? `${cs.CharacterTemplateDisplayName} `
					: ""}
				{[cs.Level1Class].filter((x) => x).join(" / ")}
			</div>
			<div className="types">
				{[cs.Level1Type].filter((x) => x).join(" / ")}
			</div>
			<div className="ability-scores">
				<div className="score">STR: {cs.AbilityScores.STR}</div>
				<div className="score">DEX: {cs.AbilityScores.DEX}</div>
				<div className="score">INT: {cs.AbilityScores.INT}</div>
				<div className="score">SPI: {cs.AbilityScores.SPI}</div>
				<div className="score">HP: {cs.Derived.HP}</div>
				<div className="score">MP: {cs.Derived.MP}</div>
				<div className="score">
					Carrying Capacity: {cs.Derived.CarryingCapacity}
				</div>
			</div>
			{renderSkills(cs.Skills)}
			{renderWeaponMasteries(cs.WeaponMasteries)}
			{renderOtherBonuses(cs.OtherBonuses)}
		</div>
	);
}

function renderSkills(skills: CharacterSkill[]) {
	if (skills && skills.length > 0) {
		return (
			<>
				<div className="title">Skills</div>
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Roll</th>
						</tr>
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

function renderOtherBonuses(bonuses: { [stat: string]: string }) {
	var keys = Object.keys(bonuses).orderBy((x) => x);
	if (keys.length === 0) return <></>;

	return (
		<div className="other-bonuses">
			<div className="title">Other Bonuses</div>
			<table>
				<thead>
					<tr>
						<th>Roll or Stat</th>
						<th>Bonus</th>
					</tr>
				</thead>
				<tbody>
					{keys.map((k) => (
						<tr key={`Ryuutama-OtherBonus-${k}`}>
							<td>{k}</td>
							<td>{bonuses[k]}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

registerCharacterSheetRenderer(BUILDER_KEY, characterSheetRenderer);

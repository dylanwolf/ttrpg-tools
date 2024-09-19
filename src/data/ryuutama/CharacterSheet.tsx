import { isNumeric } from "../../builderHelpers";
import { registerCharacterSheetRenderer } from "../../models/BuilderFactory";
import {
	CharacterState,
	getCharacterTemplate,
	getLevel1Skills,
} from "./CharacterData";
import {
	BUILDER_KEY,
	CharacterSkill,
	collectBonuses,
	getNumericBonus,
	IncantationSpell,
	SourceData,
	Weapon,
} from "./SourceData";

interface CharacterSheetData {
	Level: number;
	CharacterTemplateDisplayName: string | undefined;
	Level1Class: string | undefined;
	Level1Type: string | undefined;
	SeasonalMagics: string[];
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
	IncantationSpells: IncantationSpell[];
}

function adjustDiceRoll(...args: (string | number)[]) {
	var diceParts: string[] = [];
	var modifiers = 0;

	args.forEach((arg) => {
		if (typeof arg === "number") {
			modifiers += arg;
			return;
		}

		var remaining = arg;

		var match = arg.match(/\[(.+?)\]/);
		if (match) {
			match[1].split(/\+/).forEach((die) => {
				diceParts.push(die);
			});

			remaining = arg.replace(match[0], "").replace(/-/g, "+-");
		}

		remaining.split(/\+/).forEach((mod) => {
			var value = parseInt(mod) || 0;
			modifiers += value;
		});
	});

	return `${diceParts.length > 0 ? `[${diceParts.join("+")}]` : ""}${
		modifiers > 0 ? "+" : ""
	}${modifiers !== 0 ? modifiers : ""}`;
}

function getAdjustedAbilityScore(data: CharacterState, name: string) {
	var baseValue = data.AbilityScoreAssignments[name] || 0;
	var increases = (data.StatIncreases && data.StatIncreases[name]) || 0;
	return baseValue + increases * 2;
}

function collectCharacterSheetData(
	source: SourceData,
	data: CharacterState
): CharacterSheetData {
	var tpl = getCharacterTemplate(source, data);
	var level1Skills = getLevel1Skills(source, data);

	var incantationSpells = data.SelectedSpells
		? source.IncantationSpells.filter((x) =>
				data.SelectedSpells?.includes(x.Name)
		  )
		: [];

	var originalStr = data.AbilityScoreAssignments["STR"];
	// var originalDex = data.AbilityScoreAssignments["DEX"];
	// var originalInt = data.AbilityScoreAssignments["INT"];
	var originalSpi = data.AbilityScoreAssignments["SPI"];

	var adjustedStr = getAdjustedAbilityScore(data, "STR");
	var adjustedDex = getAdjustedAbilityScore(data, "DEX");
	var adjustedInt = getAdjustedAbilityScore(data, "INT");
	var adjustedSpi = getAdjustedAbilityScore(data, "SPI");

	var groupedTypes = [data.Level1Type]
		.groupBy((x) => x || "")
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

	var bonuses: { [stat: string]: number | string } = {};

	groupedTypes.forEach((x) => {
		if (!x.Type.Bonuses) return;

		Object.keys(x.Type.Bonuses).forEach((key) => {
			if (!x.Type.Bonuses) return;
			bonuses[key] = collectBonuses(x.Type.Bonuses[key], x.Count, bonuses[key]);
		});
	});

	groupedSkills.forEach((x) => {
		if (!x.Skill.Bonuses) return;

		Object.keys(x.Skill.Bonuses).forEach((key) => {
			if (!x.Skill.Bonuses) return;
			bonuses[key] = collectBonuses(
				x.Skill.Bonuses[key],
				x.Count,
				bonuses[key]
			);
		});
	});

	var carryCapacity =
		(adjustedStr || 0) + 3 + getNumericBonus(bonuses["Carrying Capacity"]);
	var hp =
		(originalStr || 0) * 2 +
		getNumericBonus(bonuses["HP"]) +
		((data.HPMPAssignments && data.HPMPAssignments["HP"]) || 0);
	var mp =
		(originalSpi || 0) * 2 +
		getNumericBonus(bonuses["MP"]) +
		((data.HPMPAssignments && data.HPMPAssignments["MP"]) || 0);
	var damage = getNumericBonus(bonuses["Damage"]) || 0;

	var otherBonuses: { [stat: string]: string } = {};
	Object.keys(bonuses).forEach((key) => {
		if (["HP", "MP", "Damage", "Carrying Capacity"].includes(key)) return;
		otherBonuses[key] = isNumeric(bonuses[key])
			? adjustDiceRoll(bonuses[key])
			: bonuses[key].toString();
	});

	var weaponMasteries = [
		data.Level1WeaponMastery,
		data.Level1WeaponGrace,
		data.Level1WeaponFocus,
	]
		.filter((x) => x)
		.groupBy((x) => x || "")
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
				Damage: adjustDiceRoll(x.Mastery.Damage, damage),
			};
		});

	return {
		Level: data.Level || 1,
		CharacterTemplateDisplayName: tpl?.DisplayValue || undefined,
		SeasonalMagics: [data.Level1SeasonalMagic].filter((x) => x) as string[],
		Level1Class: data.Level1Class,
		Level1Type: data.Level1Type,
		AbilityScores: {
			STR: adjustedStr,
			DEX: adjustedDex,
			INT: adjustedInt,
			SPI: adjustedSpi,
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
						? adjustDiceRoll(
								x.Skill.RelevantRoll,
								x.Count - 1 + (x.IsSideJob ? -1 : 0)
						  )
						: undefined,
				};
			})
			.orderBy((x) => x.Name),
		WeaponMasteries: weaponMasteries,
		OtherBonuses: otherBonuses,
		IncantationSpells: incantationSpells,
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
				{[cs.Level1Class]
					.filter((x) => x)
					.distinct()
					.join(" / ")}
			</div>
			<div className="types">
				Type(s):{" "}
				{[cs.Level1Type]
					.filter((x) => x)
					.distinct()
					.join(" / ")}
			</div>
			{cs.SeasonalMagics.length > 0 ? (
				<div className="seasonal-magics">
					Seasonal Magic: {cs.SeasonalMagics.join(" / ")}
				</div>
			) : (
				<></>
			)}
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
			{renderSpells(cs.IncantationSpells)}
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

function renderSpells(spells: IncantationSpell[]) {
	if (spells.length === 0) return <></>;

	return (
		<div className="incantation-spells">
			<div className="title">Incantation Spells</div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Level</th>
						<th>Spell Type</th>
					</tr>
				</thead>
				<tbody>
					{spells
						.orderBy((s) => s.Name)
						.map((s) => (
							<tr key={`Ryuutama-IncantationSpells-${s.Name}`}>
								<td>{s.Name}</td>
								<td>{s.Level}</td>
								<td>{s.SpellType}</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}

registerCharacterSheetRenderer(BUILDER_KEY, characterSheetRenderer);

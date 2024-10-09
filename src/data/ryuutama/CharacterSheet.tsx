import { isNumeric } from "../../helpers/builderHelpers";
import { registerCharacterSheetRenderer } from "../../state/character-builder/BuilderFactory";
import {
	CharacterState,
	getCharacterTemplate,
	getLevel1Skills,
	getLevel5Skills,
	getTemplateSkills,
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
import "./CharacterSheet.css";

interface CharacterSheetData {
	Level: number;
	CharacterTemplateDisplayName: string | undefined;
	Level1Class: string | undefined;
	Level5Class: string | undefined;
	Types: string[];
	SeasonalMagics: string[];
	StatusEffectImmunity: string | undefined;
	SeasonalDragon: string | undefined;
	AbilityScores: {
		STR: number | undefined;
		DEX: number | undefined;
		INT: number | undefined;
		SPI: number | undefined;
	};
	Derived: {
		CarryingCapacity: number | undefined;
		HP: number | undefined;
		MP: number | undefined;
	};
	TerrainWeatherSpecialties: string[];
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
	var templateSkills = getTemplateSkills(source, data);
	var level1Skills = getLevel1Skills(source, data);
	var level5Skills = getLevel5Skills(source, data);

	var incantationSpells = data.SelectedSpells
		? source.IncantationSpells.filter((x) =>
				data.SelectedSpells?.includes(x.Name)
		  )
		: [];

	var originalStr = data.AbilityScoreAssignments["STR"];
	var originalDex = data.AbilityScoreAssignments["DEX"];
	var originalInt = data.AbilityScoreAssignments["INT"];
	var originalSpi = data.AbilityScoreAssignments["SPI"];

	var adjustedStr = getAdjustedAbilityScore(data, "STR");
	var adjustedDex = getAdjustedAbilityScore(data, "DEX");
	var adjustedInt = getAdjustedAbilityScore(data, "INT");
	var adjustedSpi = getAdjustedAbilityScore(data, "SPI");

	var groupedTypes = [data.Level1Type, data.Level6Type]
		.groupBy((x) => x || "")
		.map((grp) => {
			return {
				Count: grp.items.length,
				Type: source.Types.filter((x) => x.Name === grp.key)[0],
			};
		})
		.filter((x) => x.Type);

	var groupedSkills = [templateSkills, level1Skills, level5Skills]
		.filter((x) => x)
		.flat()
		.groupBy((x) => x.Name)
		.map((grp) => {
			return {
				Count: grp.items.length,
				Skill: source.Skills.filter((x) => x.Name === grp.key)[0],
				IsSideJob:
					grp.key === data.Level1SideJob || grp.key === data.Level5SideJob,
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
		data.Level5WeaponGrace,
		data.Level6WeaponFocus,
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
				DataSource: x.Mastery.DataSource,
			};
		});

	return {
		Level: data.Level || 1,
		CharacterTemplateDisplayName: tpl?.DisplayValue || undefined,
		SeasonalMagics: [data.Level1SeasonalMagic, data.Level6SeasonalMagic].filter(
			(x) => x
		) as string[],
		Level1Class: data.Level1Class,
		Level5Class: data.Level5Class,
		Types: groupedTypes.map((x) => x.Type.Name).distinct(),
		AbilityScores: {
			STR: originalStr && adjustedStr,
			DEX: originalDex && adjustedDex,
			INT: originalInt && adjustedInt,
			SPI: originalSpi && adjustedSpi,
		},
		Derived: {
			CarryingCapacity: carryCapacity,
			HP: originalStr && hp,
			MP: originalSpi && mp,
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
					DataSource: x.Skill.DataSource,
				};
			})
			.orderBy((x) => x.Name),
		WeaponMasteries: weaponMasteries,
		OtherBonuses: otherBonuses,
		IncantationSpells: incantationSpells,
		TerrainWeatherSpecialties: [
			data.Level3WeatherTerrainSpecialty || "",
			data.Level7WeatherTerrainSpecialty || "",
		].filter((x) => x !== ""),
		StatusEffectImmunity: data.Level4StatusEffectImmunity,
		SeasonalDragon: data.Level9SeasonalDragon,
	};
}

function characterSheetRenderer(source: SourceData, data: CharacterState) {
	var cs = collectCharacterSheetData(source, data);

	return (
		<div className="character-sheet ryuutama-character-sheet">
			<div className="character-name">{data.Title}</div>
			<div className="blocks">
				<div className="block level centered">
					<div className="title">Level</div>
					<div className="content">{data.Level}</div>
				</div>
				<div className="block class">
					<div className="title">Class</div>
					<div className="content">
						{cs.CharacterTemplateDisplayName
							? `${cs.CharacterTemplateDisplayName} `
							: ""}
						{[cs.Level1Class, cs.Level5Class]
							.filter((x) => x)
							.distinct()
							.join(" / ")}
					</div>
				</div>
				<div className="block type">
					<div className="title">Type</div>
					<div className="content">{cs.Types.join(" / ")}</div>
				</div>
				{cs.SeasonalMagics.length > 0 ? (
					<div className="block seasonal-magic">
						<div className="title">Seasonal Magic</div>
						<div className="content">{cs.SeasonalMagics.join(" / ")}</div>
					</div>
				) : (
					<></>
				)}
				{cs.TerrainWeatherSpecialties.length > 0 ? (
					<div className="block terrain-weather-specialties">
						<div className="title">Specialties</div>
						<div className="content">
							{cs.TerrainWeatherSpecialties.join(", ")}
						</div>
					</div>
				) : (
					<></>
				)}
				{cs.StatusEffectImmunity ? (
					<div className="block status-immunity">
						<div className="title">Status Effect Immunity</div>
						<div className="content">{cs.StatusEffectImmunity}</div>
					</div>
				) : (
					<></>
				)}
				{cs.SeasonalDragon ? (
					<div className="block seasonal-dragon">
						<div className="title">Favor of the Seasonal Dragon</div>
						<div className="content">{cs.SeasonalDragon}</div>
					</div>
				) : (
					<></>
				)}
			</div>
			<div className="blocks stats">
				<div className="block stat stat-str centered">
					<div className="title">STR</div>
					<div className="content">
						{cs.AbilityScores.STR ? `d${cs.AbilityScores.STR}` : ""}
					</div>
				</div>
				<div className="block stat stat-dex centered">
					<div className="title">DEX</div>
					<div className="content">
						{cs.AbilityScores.DEX ? `d${cs.AbilityScores.DEX}` : ""}
					</div>
				</div>
				<div className="block stat stat-int centered">
					<div className="title">INT</div>
					<div className="content">
						{cs.AbilityScores.INT ? `d${cs.AbilityScores.INT}` : ""}
					</div>
				</div>
				<div className="block stat stat-spi centered">
					<div className="title">SPI</div>
					<div className="content">
						{cs.AbilityScores.SPI ? `d${cs.AbilityScores.SPI}` : ""}
					</div>
				</div>
				<div className="block stat stat-hp centered">
					<div className="title">HP</div>
					<div className="content">
						{cs.Derived.HP ? cs.Derived.HP.toString() : ""}
					</div>
				</div>
				<div className="block stat stat-mp centered">
					<div className="title">MP</div>
					<div className="content">
						{cs.Derived.MP ? cs.Derived.MP.toString() : ""}
					</div>
				</div>
				<div className="block stat stat-carrying centered">
					<div className="title">Carrying Capacity</div>
					<div className="content">
						{cs.AbilityScores.STR && cs.Derived.CarryingCapacity
							? cs.Derived.CarryingCapacity.toString()
							: ""}
					</div>
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
			<div className="table-section skills">
				<div className="title">Skills</div>
				<table className="table table-striped table-dark">
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th className="text-center">Roll</th>
							<th className="text-center">Source</th>
						</tr>
					</thead>
					<tbody>
						{skills.map((s) => (
							<tr key={`Ryuutama-Skill-${s.Name}`}>
								<td>{s.Name}</td>
								<td>{s.Description}</td>
								<td className="text-center">{s.RelevantRoll || "-"}</td>
								<td className="text-center">{s.DataSource || "Ryuutama"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

function renderWeaponMasteries(weapons: Weapon[]) {
	if (weapons && weapons.length > 0) {
		return (
			<div className="table-section weapon-masteries">
				<div className="title">Weapon Masteries</div>
				<table className="table table-striped table-dark">
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
							<th>Examples</th>
							<th className="text-center">Accuracy</th>
							<th className="text-center">Damage</th>
							<th className="text-center">Source</th>
						</tr>
					</thead>
					<tbody>
						{weapons.map((w) => (
							<tr key={`Ryuutama-WeaponMastery-${w.Name}`}>
								<td>{w.Name}</td>
								<td>{w.Description}</td>
								<td>{w.Examples}</td>
								<td className="text-center">{w.Accuracy}</td>
								<td className="text-center">{w.Damage}</td>
								<td className="text-center">{w.DataSource || "Ryuutama"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	} else {
		return <></>;
	}
}

function renderOtherBonuses(bonuses: { [stat: string]: string }) {
	var keys = Object.keys(bonuses).orderBy((x) => x);
	if (keys.length === 0) return <></>;

	return (
		<div className="table-section other-bonuses">
			<div className="title">Other Bonuses</div>
			<table className="table table-striped table-dark">
				<thead>
					<tr>
						<th>Roll or Stat</th>
						<th className="text-center">Bonus</th>
					</tr>
				</thead>
				<tbody>
					{keys.map((k) => (
						<tr key={`Ryuutama-OtherBonus-${k}`}>
							<td>{k}</td>
							<td className="text-center">{bonuses[k]}</td>
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
		<div className="table-section incantation-spells">
			<div className="title">Incantation Spells</div>
			<table className="table table-striped table-dark">
				<thead>
					<tr>
						<th>Name</th>
						<th className="text-center">Level</th>
						<th className="text-center">Spell Type</th>
						<th className="text-center">Source</th>
					</tr>
				</thead>
				<tbody>
					{spells
						.orderBy((s) => s.Name)
						.map((s) => (
							<tr key={`Ryuutama-IncantationSpells-${s.Name}`}>
								<td>{s.Name}</td>
								<td className="text-center">{s.Level}</td>
								<td className="text-center">{s.SpellType}</td>
								<td className="text-center">{s.DataSource || "Ryuutama"}</td>
							</tr>
						))}
				</tbody>
			</table>
		</div>
	);
}

registerCharacterSheetRenderer(BUILDER_KEY, characterSheetRenderer);

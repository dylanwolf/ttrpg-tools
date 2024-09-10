import Markdown from "react-markdown";
import {
	CharacterClass,
	CharacterTemplate,
	ClassSkill,
	StartingDice,
	Weapon,
} from "../data/BuilderData";

export function abilityScoreDiceRenderer(dice: StartingDice | undefined) {
	return dice ? <>d{dice.Value}</> : <></>;
}

export function classDescriptionRenderer(
	template: CharacterTemplate,
	charClass: CharacterClass
) {
	return (
		<div className="character-class">
			<div className="title">
				{template.DisplayValue ? `${template.DisplayValue} ` : ""}
				{charClass.Name}
			</div>
			<Markdown>{charClass.Description}</Markdown>
		</div>
	);
}

export function classSkillsRenderer(items: ClassSkill[]) {
	return items ? (
		<table className="skills">
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Check</th>
				</tr>
			</thead>
			<tbody>
				{items.map((i) => (
					<tr key={`ClassSkill-${i.Name}`}>
						<td className="name">
							<strong>{i.Name}</strong>
						</td>
						<td className="description">{i.Description}</td>
						<td className="relevant-roll">{i.RelevantRoll}</td>
					</tr>
				))}
			</tbody>
		</table>
	) : (
		<></>
	);
}

export function weaponMasteriesRenderer(items: Weapon[]) {
	return items ? (
		<table className="skills">
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
				{items.map((i) => (
					<tr key={`WeaponMastery-${i.Name}`}>
						<td className="name">
							<strong>{i.Name}</strong>
						</td>
						<td className="description">{i.Description}</td>
						<td className="description">{i.Examples}</td>
						<td className="description">{i.Accuracy}</td>
						<td className="relevant-roll">{i.Damage}</td>
					</tr>
				))}
			</tbody>
		</table>
	) : (
		<></>
	);
}

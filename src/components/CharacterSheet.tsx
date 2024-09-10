import { observer } from "mobx-react-lite";
import { CharacterViewModel } from "../models/CharacterViewModel";
import Markdown from "react-markdown";
import {
	abilityScoreDiceRenderer,
	classSkillsRenderer,
	weaponMasteriesRenderer,
} from "./Renderers";
import "./CharacterSheet.css";

export const CharacterSheet = observer(
	(props: { characterModel: CharacterViewModel }) => {
		var mdl = props.characterModel;

		return (
			<div className="character-sheet">
				<div className="stats">
					{["STR", "DEX", "INT", "SPI"].map((attr) => (
						<div className="stat" key={`CharacterSheetStat-${attr}`}>
							<div className="title">{attr}</div>
							<div className="value">
								{abilityScoreDiceRenderer(
									mdl.abilityScores && mdl.abilityScores[attr]
										? mdl.abilityScores[attr][0]
										: undefined
								)}
							</div>
						</div>
					))}
				</div>
				<div className="title">
					{mdl.characterTemplate?.DisplayValue}
					{mdl.characterTemplate?.DisplayValue ? " " : ""}
					{mdl.firstClass?.Name}
				</div>
				<div className="description">
					<Markdown>{mdl.firstClass?.Description}</Markdown>
				</div>
				<div className="skills">{classSkillsRenderer(mdl.allSkills)}</div>
				<div className="weapons">
					{weaponMasteriesRenderer(mdl.weaponMasteries)}
				</div>
			</div>
		);
	}
);

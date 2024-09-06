import { observer } from "mobx-react-lite";
import { useContext, useState } from "react";
import {
	AppStep,
	CharacterViewModelContext,
} from "../../models/CharacterViewModel";

export const SelectStartingAbilityScores = observer(() => {
	const character = useContext(CharacterViewModelContext);

	if (character.Step < AppStep.StartingAbilityScores) return null;

	const [selectedValue, setSelectedValue] = useState(
		character.StartingAbilityScoreName
	);

	function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
		var field = evt.currentTarget;
		var newValue = field.value;

		setSelectedValue(newValue);
		character.setStartingAbilityScores(newValue);
	}

	return (
		<div className="step step-dropdown starting-ability-scores">
			<label>
				Starting Ability Scores:
				<select value={selectedValue} onChange={onChange}>
					{character.startingAbilityScores?.map((t) => (
						<option value={t.Name} key={`AbilityScoreSet-${t.Name}`}>
							{t.Name}
						</option>
					))}
				</select>
			</label>
		</div>
	);
});

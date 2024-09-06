import { observer } from "mobx-react-lite";
import { useContext, useState } from "react";
import { CharacterViewModelContext } from "../../models/CharacterViewModel";

export const SelectCharacterTemplate = observer(() => {
	const character = useContext(CharacterViewModelContext);
	const [selectedValue, setSelectedValue] = useState(
		character.CharacterTemplateName
	);

	function onChange(evt: React.ChangeEvent<HTMLSelectElement>) {
		var field = evt.currentTarget;
		var newValue = field.value;

		setSelectedValue(newValue);
		character.setCharacterTemplate(newValue);
	}

	return (
		<div className="step step-dropdown character-template">
			<label>
				Character Template:
				<select value={selectedValue} onChange={onChange}>
					{character.Builder?.CharacterTemplates.map((t) => (
						<option value={t.Name} key={`CharacterTemplate-${t.Name}`}>
							{t.Name}
						</option>
					))}
				</select>
			</label>
		</div>
	);
});

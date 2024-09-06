import { BusyIcon } from "./BusyIcon";
import { observer } from "mobx-react-lite";
import {
	CharacterViewModel,
	CharacterViewModelContext,
} from "../models/CharacterViewModel";
import { SelectCharacterTemplate } from "./steps/SelectCharacterTemplate";
import { SelectStartingAbilityScores } from "./steps/SelectStartingAbilityScores";
import { AssignAbilityScores } from "./steps/AssignAbilityScores";

export interface BuilderProcessProps {
	characterModel: CharacterViewModel;
}

export const BuilderProcess = observer((props: BuilderProcessProps) => {
	return props.characterModel.Builder ? (
		<CharacterViewModelContext.Provider value={props.characterModel}>
			<BuilderProcessInternal />
		</CharacterViewModelContext.Provider>
	) : (
		<div className="placeholder">
			<BusyIcon />
		</div>
	);
});

function BuilderProcessInternal() {
	return (
		<div>
			<SelectCharacterTemplate />
			<SelectStartingAbilityScores />
			<AssignAbilityScores />
		</div>
	);
}

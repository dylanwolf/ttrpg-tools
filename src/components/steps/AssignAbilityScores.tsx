import { observer } from "mobx-react-lite";
import {
	AppStep,
	CharacterViewModelContext,
} from "../../models/CharacterViewModel";
import { Fragment, useContext } from "react";
import { DragAndDropBucket } from "react-drag-drop-assignment";
import { StartingDice } from "../../data/BuilderData";
import {
	StatAssignmentBucketModel,
	StatAssignmentViewModel,
} from "../../models/StatAssignmentViewModel";

import "./AssignAbilityScores.css";

function abilityScoreDiceRenderer(dice: StartingDice) {
	return <>d{dice.Value}</>;
}

function AssignAbilityScores_Bucket(
	model: StatAssignmentViewModel,
	bucket: StatAssignmentBucketModel
) {
	return (
		<div className="ability-score">
			<div className="scoreName">{bucket.Name}</div>
			<DragAndDropBucket
				dragState={model.dragAndDropState}
				items={bucket.Dice}
				itemRenderer={abilityScoreDiceRenderer}
				maxCount={1}
				isLocked={() => bucket.IsLocked}
			/>
		</div>
	);
}

export const AssignAbilityScores = observer(() => {
	const character = useContext(CharacterViewModelContext);
	const model = character.StatAssignmentBuckets;

	if (character.Step < AppStep.AssignAbilityScores || !model) return null;

	return (
		<div className="step step-diceassignment assign-ability-scores">
			<div className="ability-scores">
				{model.Buckets.map((b) => (
					<Fragment key={`AbilityScore-${b.Name}`}>
						{AssignAbilityScores_Bucket(model, b)}
					</Fragment>
				))}
			</div>
			<div className="available-dice">
				<DragAndDropBucket
					dragState={model.dragAndDropState}
					items={model.Available}
					itemRenderer={abilityScoreDiceRenderer}
				/>
			</div>
			{model.isValid ? (
				<div className="continue-button">
					<a>Continue &gt;</a>
				</div>
			) : (
				<></>
			)}
		</div>
	);
});

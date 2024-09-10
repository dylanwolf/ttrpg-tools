import { StartingDice } from "../data/BuilderData";

export function abilityScoreDiceRenderer(dice: StartingDice) {
	return <>d{dice.Value}</>;
}

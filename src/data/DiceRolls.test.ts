import { adjustRyuutamaDiceRoll } from "./DiceRolls";

describe("adjustDiceRoll", () => {
	test("Modifiers can be added", () => {
		expect(adjustRyuutamaDiceRoll("[STR+DEX]", -1)).toBe("[STR+DEX]-1");
	});
	test("Modifiers can cancel each other out", () => {
		expect(adjustRyuutamaDiceRoll("[STR+DEX]+1", -1)).toBe("[STR+DEX]");
	});
	test("Dice can be added", () => {
		expect(adjustRyuutamaDiceRoll("[STR]", "[DEX]-1")).toBe("[STR+DEX]-1");
	});
});

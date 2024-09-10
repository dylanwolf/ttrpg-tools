import { adjustDiceRoll } from "./DiceRolls";

describe("adjustDiceRoll", () => {
	test("Modifiers can be added", () => {
		expect(adjustDiceRoll("[STR+DEX]", -1)).toBe("[STR+DEX]-1");
	});
	test("Modifiers can cancel each other out", () => {
		expect(adjustDiceRoll("[STR+DEX]+1", -1)).toBe("[STR+DEX]");
	});
	test("Dice can be added", () => {
		expect(adjustDiceRoll("[STR]", "[DEX]-1")).toBe("[STR+DEX]-1");
	});
});

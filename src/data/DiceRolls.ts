export function adjustRyuutamaDiceRoll(...args: (string | number)[]) {
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

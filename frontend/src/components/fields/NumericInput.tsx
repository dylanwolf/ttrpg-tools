import { useEffect, useState } from "react";
import {
	ensureIntegerEntry,
	ensureIntegerPaste,
	getNumericFieldValueFrom,
	toNumericFieldValue,
} from "../../helpers/fieldHelpers";
import { between, clamp } from "../../helpers/mathHelpers";

interface NumericInputProps {
	InitialValue: number | undefined | null;
	MinValue?: number | undefined;
	MaxValue?: number | undefined;
	NumericStep?: number | undefined;
	ClampInput?: boolean | undefined;
	Disabled?: boolean | undefined;
	OnChange: (value: number | undefined) => void;
}

export function NumericInput(props: NumericInputProps) {
	const [textValue, setTextValue] = useState<string>(
		toNumericFieldValue(props.InitialValue).toString()
	);
	const [isDisabled, setDisabled] = useState<boolean | undefined>(
		props.Disabled
	);

	useEffect(() => {
		setTextValue(toNumericFieldValue(props.InitialValue).toString());
		setDisabled(props.Disabled);
	}, [props.InitialValue, props.Disabled]);

	function onChange(evt: React.ChangeEvent<HTMLInputElement>) {
		var txt = evt.currentTarget.value;
		var hasSetTextValue = false;

		// Test that the number isn't over the right number of digits
		if (
			props.MaxValue !== undefined &&
			txt.replace("-", "").length >
				props.MaxValue.toString().replace("-", "").length
		) {
			evt.preventDefault();
			return;
		}

		// Get value as number
		var numericVal = getNumericFieldValueFrom(evt);

		// Handle values outside min/max
		if (numericVal !== undefined) {
			if (props.ClampInput) {
				numericVal = clamp(numericVal, props.MinValue, props.MaxValue);
				setTextValue(numericVal.toString());
				hasSetTextValue = true;
			} else if (!between(numericVal, props.MinValue, props.MaxValue)) {
				numericVal = undefined;
			}
		}

		if (!hasSetTextValue) setTextValue(txt);

		props.OnChange(numericVal);
	}

	return (
		<input
			type="number"
			inputMode="numeric"
			value={textValue}
			min={props.MinValue}
			max={props.MaxValue}
			disabled={isDisabled}
			step={props.NumericStep || 1}
			onChange={onChange}
			onKeyDown={ensureIntegerEntry}
			onPaste={ensureIntegerPaste}
		/>
	);
}

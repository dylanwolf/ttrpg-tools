import "./DumpObject.css";

/**
 * Returns the given property from an object.
 */
function getProperty<T>(obj: T, key: string) {
	return obj[key as keyof T];
}

/**
 * Displays the given value as a table of JSON values.
 * @param props
 * @returns JSX.Element
 */
function DumpObjectValue(props: { value: any }) {
	var seen: any[] = [];
	var jsonString = JSON.stringify(
		props.value,
		function (key, val) {
			if (val != null && typeof val == "object") {
				if (seen.indexOf(val) >= 0) {
					return;
				}
				seen.push(val);
			}
			return val;
		},
		2
	);

	return <>{jsonString}</>;
}

export function DumpObject(props: { object: any }) {
	return (
		<table className="debug-table">
			<tbody>
				{Object.keys(props.object).map((key: string) => {
					return (
						<tr key={`Key-${key}`}>
							<td>{key}</td>
							<td>
								<pre>
									<DumpObjectValue value={getProperty(props.object, key)} />
								</pre>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

import { observer } from "mobx-react-lite";
import "./DumpObject.css";

function getProperty<T>(obj: T, key: string) {
	return obj[key as keyof T];
}

export const DumpObject = observer((props: { object: any }) => {
	return (
		<table className="debug-table">
			<tbody>
				{Object.keys(props.object).map((key: string) => {
					return (
						<tr key={`Key-${key}`}>
							<td>{key}</td>
							<td>
								<pre>
									{JSON.stringify(getProperty(props.object, key), null, 2)}
								</pre>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
});

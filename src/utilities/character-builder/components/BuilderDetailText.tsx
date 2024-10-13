import Markdown from "react-markdown";
import "./BuilderDetailText.css";

export interface BuilderDetailTextProps {
	text: string | undefined | JSX.Element;
	useMarkdown: boolean | undefined;
	onlyOnMobile: boolean | undefined;
}

export function BuilderDetailText(props: BuilderDetailTextProps) {
	const isString = typeof props.text === "string";

	if (!props.text) return <></>;

	return (
		<div
			className={`builder-mobile-description${
				props.onlyOnMobile ? " d-lg-none" : ""
			}`}
		>
			{props.useMarkdown && typeof props.text === "string" ? (
				<Markdown>{props.text}</Markdown>
			) : (
				props.text
			)}
		</div>
	);
}

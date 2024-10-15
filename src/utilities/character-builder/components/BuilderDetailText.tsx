import "./BuilderDetailText.css";
import { MarkdownWrapper } from "../../../helpers/markdownHelpers";

export interface BuilderDetailTextProps {
	text: string | undefined | JSX.Element;
	useMarkdown: boolean | undefined;
	onlyOnMobile: boolean | undefined;
}

/**
 * Control to render text under a character builder step.
 * @param props If useMarkdown is true, the content will be rendered as markdown rather than plain text. If onlyOnMobile is true, a bootstrap CSS class will be applied to hide this control on wider views.
 * @returns
 */
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
				<MarkdownWrapper>{props.text}</MarkdownWrapper>
			) : (
				props.text
			)}
		</div>
	);
}

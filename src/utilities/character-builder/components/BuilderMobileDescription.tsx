import Markdown from "react-markdown";
import "./BuilderMobileDescription.css";

export interface BuilderMobileDescriptionProps {
	text: string | undefined;
	useMarkdown: boolean | undefined;
}

export function BuilderMobileDescription(props: BuilderMobileDescriptionProps) {
	if (!props.text?.trim()) return <></>;

	return (
		<div className="builder-mobile-description d-lg-none">
			{props.useMarkdown ? <Markdown>{props.text}</Markdown> : props.text}
		</div>
	);
}

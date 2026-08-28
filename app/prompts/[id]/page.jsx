import { PromptDetails } from "./prompt-details";
export default async function PromptDetailsPage({ params }) {
    const { id } = await params;
    return <PromptDetails id={id}/>;
}

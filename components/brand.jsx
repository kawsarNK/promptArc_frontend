import Link from "next/link";
export function Brand({ compact = false }) {
    return (<Link className="brand" href="/" aria-label="PromptArc home">
      <span className="brand-mark" aria-hidden="true"><i /><b /></span>
      {!compact && <span>Prompt<span>Arc</span></span>}
    </Link>);
}

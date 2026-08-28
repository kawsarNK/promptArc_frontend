export function SectionHeading({ eyebrow = "", title, copy = "", action = null }) {
    return (<div className="section-heading">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
      {action}
    </div>);
}

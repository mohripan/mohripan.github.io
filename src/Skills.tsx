import resume from "../data/resume.json";
import { resumeIcon } from "./resumeIcons";

export default function Skills() {
  return (
    <section id="skills" className="skills-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow section-eyebrow">The toolkit</span>
          <h2>
            Tools I reach for<span>.</span>
          </h2>
          <p>The stack behind the work, grouped by the problems it solves.</p>
        </div>
      </div>
      <div className="skills-grid">
        {resume.skills.map((group) => {
          const Icon = resumeIcon(group.icon);
          return (
            <article className="skill-group" key={group.title}>
              <div className="skill-group-head">
                <Icon size={17} strokeWidth={1.75} />
                <h3>{group.title}</h3>
              </div>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

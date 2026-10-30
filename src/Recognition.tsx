import { GraduationCap, Medal, Trophy } from "lucide-react";
import resume from "../data/resume.json";

export default function Recognition() {
  const { education } = resume;
  return (
    <section id="recognition" className="recognition-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow section-eyebrow">Education & awards</span>
          <h2>
            Recognition along the way<span>.</span>
          </h2>
          <p>
            National and ASEAN results, mostly for applied research projects I
            led.
          </p>
        </div>
      </div>
      <div className="recognition-grid">
        <ol className="award-list">
          {resume.awards.map((award) => (
            <li className="award-row" key={award.name}>
              <span className="award-year">{award.year}</span>
              <div className="award-copy">
                <strong>{award.name}</strong>
                <span>{award.detail}</span>
              </div>
              <div className="award-result">
                <span
                  className={`award-badge ${/^1st/.test(award.result) ? "first" : ""}`}
                >
                  {/^1st/.test(award.result) ? (
                    <Trophy size={12} />
                  ) : (
                    <Medal size={12} />
                  )}
                  {award.result}
                </span>
                <small>{award.scope}</small>
              </div>
            </li>
          ))}
        </ol>
        <article className="education-card">
          <span className="focus-icon">
            <GraduationCap size={21} strokeWidth={1.5} />
          </span>
          <span className="mono-label">Education</span>
          <h3>{education.degree}</h3>
          <p>
            {education.school}, {education.location}
          </p>
          <dl>
            <div>
              <dt className="mono-label">Years</dt>
              <dd>{education.years}</dd>
            </div>
            <div>
              <dt className="mono-label">GPA</dt>
              <dd>{education.gpa}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}

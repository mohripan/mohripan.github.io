import { MapPin } from "lucide-react";
import resume from "../data/resume.json";
import { resumeIcon } from "./resumeIcons";

export default function Experience() {
  return (
    <section id="experience" className="experience-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow section-eyebrow">Experience</span>
          <h2>
            Eight years of production systems<span>.</span>
          </h2>
          <p>
            From full-stack products and banking backends to robotics,
            scientific compute, and AI infrastructure.
          </p>
        </div>
      </div>
      <div className="focus-grid">
        {resume.focus.map((item, i) => {
          const Icon = resumeIcon(item.icon);
          return (
            <article className="focus-card" key={item.title}>
              <div className="focus-card-top">
                <span className="focus-icon">
                  <Icon size={21} strokeWidth={1.5} />
                </span>
                <span className="mono-label">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
      <ol className="timeline">
        {resume.experience.map((job) => (
          <li
            className={`timeline-role ${job.end === "Present" ? "current" : ""}`}
            key={job.company}
          >
            <div className="role-meta">
              <span className="role-period">
                {job.start} – {job.end}
              </span>
              <h3>{job.company}</h3>
              <span className="role-title">{job.title}</span>
              <span className="role-location">
                <MapPin size={13} />
                {job.location}
              </span>
            </div>
            <div className="role-body">
              <p className="role-focus">{job.focus}</p>
              {job.engagements.map((engagement) => (
                <article className="engagement" key={engagement.name}>
                  <div className="engagement-head">
                    <h4>{engagement.name}</h4>
                    <span>{engagement.role}</span>
                  </div>
                  <ul>
                    {engagement.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <div className="tags">
                    {engagement.stack.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

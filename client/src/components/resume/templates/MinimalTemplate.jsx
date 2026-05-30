// Minimal: clean single-column, subtle dividers, ATS-friendly

function fmt(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

const divider = { borderTop: '1px solid #E5E7EB', margin: '14px 0 10px' };

export default function MinimalTemplate({ content: c = {} }) {
  const info = c.personalInfo ?? {};
  const contactParts = [info.email, info.phone, info.location].filter(Boolean);
  const links = [info.linkedin, info.github, info.portfolio, info.website].filter(Boolean);

  const root = {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    fontSize: 12,
    color: '#111827',
    background: '#fff',
    padding: '40px 52px',
    minHeight: '297mm',
    width: '210mm',
    boxSizing: 'border-box',
  };

  return (
    <div style={root}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
          {info.fullName || 'Your Name'}
        </div>
        {info.jobTitle && (
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{info.jobTitle}</div>
        )}
        {contactParts.length > 0 && (
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{contactParts.join('  ·  ')}</div>
        )}
        {links.length > 0 && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{links.join('  ·  ')}</div>
        )}
      </div>

      {c.summary && (
        <>
          <div style={divider} />
          <Section title="Summary">
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, margin: 0 }}>{c.summary}</p>
          </Section>
        </>
      )}

      {c.experience?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Experience">
            {c.experience.map((e, i) => (
              <Entry key={i}
                title={e.title}
                sub={[e.company, e.location, `${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`].filter(Boolean).join('  ·  ')}
                body={e.description}
              />
            ))}
          </Section>
        </>
      )}

      {c.education?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Education">
            {c.education.map((e, i) => (
              <Entry key={i}
                title={[e.degree, e.fieldOfStudy].filter(Boolean).join(', ') || e.institution}
                sub={[e.institution, `${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`, e.grade].filter(Boolean).join('  ·  ')}
                body={e.description}
              />
            ))}
          </Section>
        </>
      )}

      {c.skills?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Skills">
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8, margin: 0 }}>{c.skills.join('  ·  ')}</p>
          </Section>
        </>
      )}

      {c.certifications?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Certifications">
            {c.certifications.map((cert, i) => (
              <Entry key={i}
                title={cert.name}
                sub={[cert.issuingOrganization, fmt(cert.issueDate), cert.credentialId].filter(Boolean).join('  ·  ')}
              />
            ))}
          </Section>
        </>
      )}

      {c.projects?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Projects">
            {c.projects.map((p, i) => (
              <Entry key={i}
                title={p.name}
                sub={p.technologies?.join(', ')}
                body={p.description}
              />
            ))}
          </Section>
        </>
      )}

      {c.achievements?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Achievements">
            {c.achievements.map((a, i) => (
              <Entry key={i} title={a.title} sub={a.date} body={a.description} />
            ))}
          </Section>
        </>
      )}

      {c.languages?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="Languages">
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8, margin: 0 }}>
              {c.languages.map(l => `${l.language} (${l.proficiency})`).join('  ·  ')}
            </p>
          </Section>
        </>
      )}

      {c.references?.length > 0 && (
        <>
          <div style={divider} />
          <Section title="References">
            {c.references.map((r, i) => (
              <Entry key={i}
                title={r.name}
                sub={[r.title, r.company, r.email, r.phone].filter(Boolean).join('  ·  ')}
              />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Entry({ title, sub, body }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {title && <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{title}</div>}
      {sub   && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{sub}</div>}
      {body  && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 3 }}>{body}</div>}
    </div>
  );
}

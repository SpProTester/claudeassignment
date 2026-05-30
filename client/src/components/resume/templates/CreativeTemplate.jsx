// Creative: bold gradient header, two-column body

function fmt(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

export default function CreativeTemplate({ content: c = {} }) {
  const info = c.personalInfo ?? {};
  const contactParts = [info.email, info.phone, info.location].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontSize: 12, background: '#fff', minHeight: '297mm', width: '210mm', color: '#1F2937' }}>
      {/* Header — gradient */}
      <div style={{ background: 'linear-gradient(135deg, #7600CF 0%, #4F46E5 100%)', padding: '32px 36px 24px', color: '#fff' }}>
        <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' }}>{info.fullName || 'Your Name'}</div>
        {info.jobTitle && <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9, fontWeight: 500 }}>{info.jobTitle}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
          {contactParts.map((p, i) => (
            <span key={i} style={{ fontSize: 11, opacity: 0.85 }}>{p}</span>
          ))}
          {info.linkedin  && <span style={{ fontSize: 11, opacity: 0.7 }}>in/{info.linkedin}</span>}
          {info.github    && <span style={{ fontSize: 11, opacity: 0.7 }}>gh/{info.github}</span>}
          {info.portfolio && <span style={{ fontSize: 11, opacity: 0.7 }}>{info.portfolio}</span>}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'flex' }}>
        {/* Left column */}
        <div style={{ width: '62%', padding: '24px 20px 24px 36px', borderRight: '1px solid #F3F4F6' }}>
          {c.summary && (
            <CSection title="About Me">
              <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, margin: 0 }}>{c.summary}</p>
            </CSection>
          )}

          {c.experience?.length > 0 && (
            <CSection title="Experience">
              {c.experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 13 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: '#7600CF', fontWeight: 600, marginTop: 1 }}>{e.company}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>
                    {[e.location, `${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`].filter(Boolean).join('  ·  ')}
                  </div>
                  {e.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 4 }}>{e.description}</div>}
                </div>
              ))}
            </CSection>
          )}

          {c.education?.length > 0 && (
            <CSection title="Education">
              {c.education.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{[e.degree, e.fieldOfStudy].filter(Boolean).join(', ') || e.institution}</div>
                  <div style={{ fontSize: 10, color: '#7600CF', fontWeight: 600, marginTop: 1 }}>{e.institution}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{[`${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`, e.grade].filter(Boolean).join('  ·  ')}</div>
                </div>
              ))}
            </CSection>
          )}

          {c.projects?.length > 0 && (
            <CSection title="Projects">
              {c.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                  {p.technologies?.length > 0 && <div style={{ fontSize: 10, color: '#7600CF', marginTop: 1 }}>{p.technologies.join(', ')}</div>}
                  {p.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 3 }}>{p.description}</div>}
                </div>
              ))}
            </CSection>
          )}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, padding: '24px 20px 24px 20px' }}>
          {c.skills?.length > 0 && (
            <CSection title="Skills">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {c.skills.map((sk, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7600CF', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: '#374151' }}>{sk}</span>
                  </div>
                ))}
              </div>
            </CSection>
          )}

          {c.certifications?.length > 0 && (
            <CSection title="Certifications">
              {c.certifications.map((cert, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{cert.name}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{cert.issuingOrganization}</div>
                  {cert.issueDate && <div style={{ fontSize: 10, color: '#9CA3AF' }}>{fmt(cert.issueDate)}</div>}
                </div>
              ))}
            </CSection>
          )}

          {c.achievements?.length > 0 && (
            <CSection title="Achievements">
              {c.achievements.map((a, i) => (
                <div key={i} style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{a.title}</div>
                  {a.date && <div style={{ fontSize: 10, color: '#9CA3AF' }}>{a.date}</div>}
                  {a.description && <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.5 }}>{a.description}</div>}
                </div>
              ))}
            </CSection>
          )}

          {c.languages?.length > 0 && (
            <CSection title="Languages">
              {c.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 11, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{l.language}</span>
                  <span style={{ color: '#9CA3AF' }}> · {l.proficiency}</span>
                </div>
              ))}
            </CSection>
          )}

          {c.references?.length > 0 && (
            <CSection title="References">
              {c.references.map((r, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{[r.title, r.company].filter(Boolean).join(', ')}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>{r.email}</div>
                </div>
              ))}
            </CSection>
          )}
        </div>
      </div>
    </div>
  );
}

function CSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7600CF', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

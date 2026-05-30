// Executive: premium centred header, elegant single-column

function fmt(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

export default function ExecutiveTemplate({ content: c = {} }) {
  const info = c.personalInfo ?? {};
  const contactParts = [info.email, info.phone, info.location].filter(Boolean);
  const links = [info.linkedin, info.github, info.portfolio, info.website].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 12, color: '#111827', background: '#fff', minHeight: '297mm', width: '210mm', padding: '40px 52px', boxSizing: 'border-box' }}>
      {/* Centred header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #111827', paddingBottom: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#111827' }}>
          {info.fullName || 'YOUR NAME'}
        </div>
        {info.jobTitle && (
          <div style={{ fontSize: 13, color: '#4B5563', letterSpacing: '1px', marginTop: 5, fontStyle: 'italic' }}>{info.jobTitle}</div>
        )}
        {contactParts.length > 0 && (
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 8 }}>{contactParts.join('  ·  ')}</div>
        )}
        {links.length > 0 && (
          <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3 }}>{links.join('  ·  ')}</div>
        )}
      </div>

      {c.summary && (
        <EBlock title="Executive Summary">
          <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.8, margin: 0, fontStyle: 'italic' }}>{c.summary}</p>
        </EBlock>
      )}

      {c.experience?.length > 0 && (
        <EBlock title="Professional Experience">
          {c.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Inter', Arial, sans-serif" }}>{e.title}</div>
                <div style={{ fontSize: 10, color: '#6B7280', fontFamily: "'Inter', Arial, sans-serif", whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {fmt(e.startDate)} – {e.isCurrent ? 'Present' : fmt(e.endDate)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#4B5563', fontStyle: 'italic', marginTop: 1 }}>{[e.company, e.location].filter(Boolean).join(', ')}</div>
              {e.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, marginTop: 5, fontFamily: "'Inter', Arial, sans-serif" }}>{e.description}</div>}
            </div>
          ))}
        </EBlock>
      )}

      {c.education?.length > 0 && (
        <EBlock title="Education">
          {c.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Inter', Arial, sans-serif" }}>
                  {[e.degree, e.fieldOfStudy].filter(Boolean).join(', ') || e.institution}
                </div>
                <div style={{ fontSize: 10, color: '#6B7280', fontFamily: "'Inter', Arial, sans-serif", whiteSpace: 'nowrap' }}>
                  {fmt(e.startDate)} – {e.isCurrent ? 'Present' : fmt(e.endDate)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#4B5563', fontStyle: 'italic' }}>{[e.institution, e.grade].filter(Boolean).join('  ·  ')}</div>
            </div>
          ))}
        </EBlock>
      )}

      {c.skills?.length > 0 && (
        <EBlock title="Core Competencies">
          <div style={{ fontFamily: "'Inter', Arial, sans-serif", fontSize: 11, color: '#374151', lineHeight: 2 }}>
            {c.skills.join('  ·  ')}
          </div>
        </EBlock>
      )}

      {c.certifications?.length > 0 && (
        <EBlock title="Certifications & Credentials">
          {c.certifications.map((cert, i) => (
            <div key={i} style={{ marginBottom: 7, fontFamily: "'Inter', Arial, sans-serif" }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{cert.name}</div>
              <div style={{ fontSize: 10, color: '#6B7280' }}>{[cert.issuingOrganization, fmt(cert.issueDate), cert.credentialId].filter(Boolean).join('  ·  ')}</div>
            </div>
          ))}
        </EBlock>
      )}

      {c.projects?.length > 0 && (
        <EBlock title="Key Projects & Initiatives">
          {c.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10, fontFamily: "'Inter', Arial, sans-serif" }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
              {p.technologies?.length > 0 && <div style={{ fontSize: 10, color: '#6B7280' }}>{p.technologies.join(', ')}</div>}
              {p.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.7 }}>{p.description}</div>}
            </div>
          ))}
        </EBlock>
      )}

      {c.achievements?.length > 0 && (
        <EBlock title="Notable Achievements">
          {c.achievements.map((a, i) => (
            <div key={i} style={{ marginBottom: 7, fontFamily: "'Inter', Arial, sans-serif" }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{a.title}{a.date && <span style={{ fontWeight: 400, color: '#6B7280' }}> · {a.date}</span>}</div>
              {a.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6 }}>{a.description}</div>}
            </div>
          ))}
        </EBlock>
      )}

      {(c.languages?.length > 0 || c.references?.length > 0) && (
        <div style={{ display: 'flex', gap: 30, fontFamily: "'Inter', Arial, sans-serif" }}>
          {c.languages?.length > 0 && (
            <div style={{ flex: 1 }}>
              <EBlock title="Languages">
                {c.languages.map((l, i) => (
                  <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>{l.language} <span style={{ color: '#6B7280' }}>· {l.proficiency}</span></div>
                ))}
              </EBlock>
            </div>
          )}
          {c.references?.length > 0 && (
            <div style={{ flex: 1 }}>
              <EBlock title="References">
                {c.references.map((r, i) => (
                  <div key={i} style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>{[r.title, r.company].filter(Boolean).join(', ')}</div>
                    <div style={{ fontSize: 10, color: '#6B7280' }}>{[r.email, r.phone].filter(Boolean).join('  ·  ')}</div>
                  </div>
                ))}
              </EBlock>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EBlock({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#111827', borderBottom: '1px solid #D1D5DB', paddingBottom: 4, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

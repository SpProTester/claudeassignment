// Corporate: dark header band, clean single-column, traditional layout

function fmt(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

export default function CorporateTemplate({ content: c = {} }) {
  const info = c.personalInfo ?? {};
  const contactParts = [info.email, info.phone, info.location].filter(Boolean);
  const links = [
    info.linkedin  && `LinkedIn: ${info.linkedin}`,
    info.github    && `GitHub: ${info.github}`,
    info.portfolio && `Portfolio: ${info.portfolio}`,
    info.website   && `Website: ${info.website}`,
  ].filter(Boolean);

  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: '#1F2937', background: '#fff', minHeight: '297mm', width: '210mm' }}>
      {/* Dark header */}
      <div style={{ background: '#1E293B', color: '#fff', padding: '28px 40px 22px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.3px' }}>{info.fullName || 'Your Name'}</div>
        {info.jobTitle && <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>{info.jobTitle}</div>}
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {contactParts.map((p, i) => (
            <span key={i} style={{ fontSize: 11, color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: 4 }}>
              {p}
            </span>
          ))}
        </div>
        {links.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 10, color: '#64748B' }}>{links.join('  ·  ')}</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '28px 40px' }}>
        {c.summary && (
          <Block title="Professional Summary" accent="#1E293B">
            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.7, margin: 0 }}>{c.summary}</p>
          </Block>
        )}

        {c.experience?.length > 0 && (
          <Block title="Work Experience" accent="#1E293B">
            {c.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{e.title}</div>
                  <div style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {fmt(e.startDate)} – {e.isCurrent ? 'Present' : fmt(e.endDate)}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{[e.company, e.location].filter(Boolean).join('  ·  ')}</div>
                {e.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 5 }}>{e.description}</div>}
              </div>
            ))}
          </Block>
        )}

        {c.education?.length > 0 && (
          <Block title="Education" accent="#1E293B">
            {c.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{[e.degree, e.fieldOfStudy].filter(Boolean).join(', ') || e.institution}</div>
                  <div style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {fmt(e.startDate)} – {e.isCurrent ? 'Present' : fmt(e.endDate)}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{[e.institution, e.grade].filter(Boolean).join('  ·  ')}</div>
              </div>
            ))}
          </Block>
        )}

        {c.skills?.length > 0 && (
          <Block title="Skills" accent="#1E293B">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {c.skills.map((sk, i) => (
                <span key={i} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#374151' }}>{sk}</span>
              ))}
            </div>
          </Block>
        )}

        {c.certifications?.length > 0 && (
          <Block title="Certifications" accent="#1E293B">
            {c.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{cert.name}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>{[cert.issuingOrganization, fmt(cert.issueDate), cert.credentialId].filter(Boolean).join('  ·  ')}</div>
              </div>
            ))}
          </Block>
        )}

        {c.projects?.length > 0 && (
          <Block title="Projects" accent="#1E293B">
            {c.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                {p.technologies?.length > 0 && <div style={{ fontSize: 10, color: '#6B7280' }}>{p.technologies.join(', ')}</div>}
                {p.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, marginTop: 3 }}>{p.description}</div>}
              </div>
            ))}
          </Block>
        )}

        {c.achievements?.length > 0 && (
          <Block title="Achievements" accent="#1E293B">
            {c.achievements.map((a, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{a.title}{a.date && <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 10 }}> · {a.date}</span>}</div>
                {a.description && <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6 }}>{a.description}</div>}
              </div>
            ))}
          </Block>
        )}

        {(c.languages?.length > 0 || c.references?.length > 0) && (
          <div style={{ display: 'flex', gap: 24 }}>
            {c.languages?.length > 0 && (
              <div style={{ flex: 1 }}>
                <Block title="Languages" accent="#1E293B">
                  {c.languages.map((l, i) => (
                    <div key={i} style={{ fontSize: 11, marginBottom: 3 }}>{l.language} <span style={{ color: '#6B7280' }}>· {l.proficiency}</span></div>
                  ))}
                </Block>
              </div>
            )}
            {c.references?.length > 0 && (
              <div style={{ flex: 1 }}>
                <Block title="References" accent="#1E293B">
                  {c.references.map((r, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>{[r.title, r.company].filter(Boolean).join(', ')}</div>
                      <div style={{ fontSize: 10, color: '#6B7280' }}>{[r.email, r.phone].filter(Boolean).join('  ·  ')}</div>
                    </div>
                  ))}
                </Block>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({ title, accent, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

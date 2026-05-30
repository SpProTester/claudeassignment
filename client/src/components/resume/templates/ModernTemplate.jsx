// Modern: two-column — purple sidebar + white main content

const s = {
  root: { display: 'flex', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: '#111827', background: '#fff', minHeight: '297mm', width: '210mm' },
  sidebar: { width: '34%', background: '#7600CF', color: '#fff', padding: '32px 22px', flexShrink: 0 },
  main: { flex: 1, padding: '32px 26px', background: '#fff' },

  sName: { fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 4, wordBreak: 'break-word' },
  sTitle: { fontSize: 12, opacity: 0.85, marginBottom: 20 },
  sSectionHead: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 4, marginTop: 18, marginBottom: 8 },
  sItem: { fontSize: 11, marginBottom: 4, lineHeight: 1.5, opacity: 0.92 },
  sLink: { fontSize: 10, opacity: 0.8, marginBottom: 4, wordBreak: 'break-all' },
  sSkillPill: { display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '2px 7px', fontSize: 10, marginRight: 4, marginBottom: 4 },

  mSectionHead: { fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7600CF', borderBottom: '2px solid #7600CF', paddingBottom: 3, marginTop: 18, marginBottom: 10 },
  mEntryTitle: { fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 },
  mEntryMeta: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  mEntryBody: { fontSize: 11, color: '#374151', lineHeight: 1.6 },
  mSummary: { fontSize: 11, color: '#374151', lineHeight: 1.7 },
};

function fmt(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return m ? `${months[+m - 1]} ${y}` : y;
}

export default function ModernTemplate({ content: c = {} }) {
  const info = c.personalInfo ?? {};
  const contactLines = [info.email, info.phone, info.location].filter(Boolean);
  const links = [
    info.linkedin  && { label: 'LinkedIn',  val: info.linkedin },
    info.github    && { label: 'GitHub',     val: info.github },
    info.portfolio && { label: 'Portfolio',  val: info.portfolio },
    info.website   && { label: 'Website',    val: info.website },
  ].filter(Boolean);

  return (
    <div style={s.root}>
      {/* ── Sidebar ── */}
      <div style={s.sidebar}>
        <div style={s.sName}>{info.fullName || 'Your Name'}</div>
        {info.jobTitle && <div style={s.sTitle}>{info.jobTitle}</div>}

        {contactLines.length > 0 && (
          <>
            <div style={s.sSectionHead}>Contact</div>
            {contactLines.map((l, i) => <div key={i} style={s.sItem}>{l}</div>)}
          </>
        )}

        {links.length > 0 && (
          <>
            <div style={s.sSectionHead}>Links</div>
            {links.map((l, i) => <div key={i} style={s.sLink}>{l.label}: {l.val}</div>)}
          </>
        )}

        {c.skills?.length > 0 && (
          <>
            <div style={s.sSectionHead}>Skills</div>
            <div>{c.skills.map((sk, i) => <span key={i} style={s.sSkillPill}>{sk}</span>)}</div>
          </>
        )}

        {c.languages?.length > 0 && (
          <>
            <div style={s.sSectionHead}>Languages</div>
            {c.languages.map((l, i) => (
              <div key={i} style={s.sItem}>{l.language} <span style={{ opacity: 0.7 }}>· {l.proficiency}</span></div>
            ))}
          </>
        )}
      </div>

      {/* ── Main ── */}
      <div style={s.main}>
        {c.summary && (
          <>
            <div style={s.mSectionHead}>Professional Summary</div>
            <div style={s.mSummary}>{c.summary}</div>
          </>
        )}

        {c.experience?.length > 0 && (
          <>
            <div style={s.mSectionHead}>Experience</div>
            {c.experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={s.mEntryTitle}>{e.title}</div>
                <div style={s.mEntryMeta}>
                  {[e.company, e.location, `${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`].filter(Boolean).join('  ·  ')}
                </div>
                {e.description && <div style={s.mEntryBody}>{e.description}</div>}
              </div>
            ))}
          </>
        )}

        {c.education?.length > 0 && (
          <>
            <div style={s.mSectionHead}>Education</div>
            {c.education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={s.mEntryTitle}>{[e.degree, e.fieldOfStudy].filter(Boolean).join(', ') || e.institution}</div>
                <div style={s.mEntryMeta}>
                  {[e.institution, `${fmt(e.startDate)} – ${e.isCurrent ? 'Present' : fmt(e.endDate)}`, e.grade].filter(Boolean).join('  ·  ')}
                </div>
                {e.description && <div style={s.mEntryBody}>{e.description}</div>}
              </div>
            ))}
          </>
        )}

        {c.certifications?.length > 0 && (
          <>
            <div style={s.mSectionHead}>Certifications</div>
            {c.certifications.map((cert, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={s.mEntryTitle}>{cert.name}</div>
                <div style={s.mEntryMeta}>{[cert.issuingOrganization, fmt(cert.issueDate), cert.credentialId].filter(Boolean).join('  ·  ')}</div>
              </div>
            ))}
          </>
        )}

        {c.projects?.length > 0 && (
          <>
            <div style={s.mSectionHead}>Projects</div>
            {c.projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={s.mEntryTitle}>{p.name}{p.url && <span style={{ fontWeight: 400, color: '#7600CF', fontSize: 11 }}> · {p.url}</span>}</div>
                {p.technologies?.length > 0 && (
                  <div style={{ ...s.mEntryMeta, color: '#7600CF' }}>{p.technologies.join(', ')}</div>
                )}
                {p.description && <div style={s.mEntryBody}>{p.description}</div>}
              </div>
            ))}
          </>
        )}

        {c.achievements?.length > 0 && (
          <>
            <div style={s.mSectionHead}>Achievements</div>
            {c.achievements.map((a, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={s.mEntryTitle}>{a.title}{a.date && <span style={{ fontWeight: 400, color: '#6B7280', fontSize: 11 }}> · {a.date}</span>}</div>
                {a.description && <div style={s.mEntryBody}>{a.description}</div>}
              </div>
            ))}
          </>
        )}

        {c.references?.length > 0 && (
          <>
            <div style={s.mSectionHead}>References</div>
            {c.references.map((r, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={s.mEntryTitle}>{r.name}</div>
                <div style={s.mEntryMeta}>{[r.title, r.company, r.email, r.phone].filter(Boolean).join('  ·  ')}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

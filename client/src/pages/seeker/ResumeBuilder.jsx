import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { useAuth } from '../../hooks/useAuth.js';
import ResumePreview from '../../components/resume/ResumePreview.jsx';
import Button from '../../components/common/Button.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY = {
  personalInfo:  { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', portfolio: '' },
  summary:       '',
  experience:    [],
  education:     [],
  skills:        [],
  certifications: [],
  projects:      [],
  achievements:  [],
  languages:     [],
  references:    [],
};

const uid = () => Math.random().toString(36).slice(2, 10);

// ── Small shared components ───────────────────────────────────────────────────

function SectionHeader({ title, count, open, onToggle, badge }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {count > 0 && <span className="badge bg-primary-100 text-primary-700 text-xs">{count}</span>}
        {badge && <span className="badge badge-green text-xs">{badge}</span>}
      </div>
      <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function InputRow({ label, name, value, onChange, placeholder, type = 'text', half }) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} className="input-field text-sm py-2" />
    </div>
  );
}

function TagInput({ value = [], onChange, placeholder = 'Add and press Enter' }) {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) onChange([...value, input.trim()]);
      setInput('');
    }
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div className="border border-gray-200 rounded-xl p-2 focus-within:border-primary-400 transition-colors">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs rounded-full px-2.5 py-1 font-medium">
            {v}
            <button type="button" onClick={() => remove(i)} className="hover:text-red-500 leading-none">×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={value.length === 0 ? placeholder : 'Add more…'}
        className="text-sm w-full outline-none bg-transparent px-1 text-gray-700"
      />
    </div>
  );
}

function ListEditor({ items, onCreate, onUpdate, onDelete, renderForm, emptyLabel, addLabel }) {
  const [editId, setEditId] = useState(null);
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden">
          {editId === item.id ? (
            <div className="p-3">
              {renderForm({
                item,
                onChange: (patch) => onUpdate(item.id, patch),
                onDone: () => setEditId(null),
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50">
              <div className="text-sm text-gray-700 truncate flex-1">{renderForm.preview?.(item) ?? item.title ?? item.name ?? item.institution ?? item.company ?? item.language ?? '(untitled)'}</div>
              <div className="flex gap-1 ml-2 shrink-0">
                <button type="button" onClick={() => setEditId(item.id)} className="text-xs text-primary-600 hover:text-primary-800 font-medium px-2 py-1">Edit</button>
                <button type="button" onClick={() => onDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1">Remove</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && <p className="text-xs text-gray-400 text-center py-3">{emptyLabel}</p>}
      <button type="button" onClick={() => { const id = uid(); onCreate(id); setEditId(id); }}
        className="w-full text-sm text-primary-600 hover:text-primary-800 font-medium py-2 border border-dashed border-primary-300 rounded-xl hover:bg-primary-50 transition-colors">
        + {addLabel}
      </button>
    </div>
  );
}

// ── Section-specific form renderers ──────────────────────────────────────────

function expForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Job Title *" name="title"    value={item.title}    onChange={h} placeholder="Software Engineer" />
        <InputRow label="Company *"  name="company"  value={item.company}  onChange={h} placeholder="Acme Corp"         />
        <InputRow label="Location"   name="location" value={item.location} onChange={h} placeholder="New York, NY" half />
        <div className="col-span-1">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mt-4 cursor-pointer">
            <input type="checkbox" checked={!!item.isCurrent} onChange={e => onChange({ isCurrent: e.target.checked })} className="rounded" />
            Currently working here
          </label>
        </div>
        <InputRow label="Start Date" name="startDate" value={item.startDate} onChange={h} placeholder="2020-06" type="month" half />
        {!item.isCurrent && <InputRow label="End Date" name="endDate" value={item.endDate} onChange={h} placeholder="2024-01" type="month" half />}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea name="description" value={item.description ?? ''} onChange={h} rows={3} placeholder="Describe your role, responsibilities, and achievements…" className="input-field text-sm resize-none" />
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
expForm.preview = (e) => [e.title, e.company].filter(Boolean).join(' @ ') || '(new experience)';

function eduForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Institution *"   name="institution"  value={item.institution}  onChange={h} placeholder="University of…" />
        <InputRow label="Degree *"        name="degree"       value={item.degree}       onChange={h} placeholder="Bachelor of Science" />
        <InputRow label="Field of Study"  name="fieldOfStudy" value={item.fieldOfStudy} onChange={h} placeholder="Computer Science" half />
        <InputRow label="Grade / GPA"     name="grade"        value={item.grade}        onChange={h} placeholder="3.8 GPA"             half />
        <InputRow label="Start Date"      name="startDate"    value={item.startDate}    onChange={h} placeholder="2016-09" type="month" half />
        {!item.isCurrent && <InputRow label="End Date" name="endDate" value={item.endDate} onChange={h} placeholder="2020-05" type="month" half />}
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
        <input type="checkbox" checked={!!item.isCurrent} onChange={e => onChange({ isCurrent: e.target.checked })} className="rounded" />
        Currently studying
      </label>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
eduForm.preview = (e) => [e.degree, e.institution].filter(Boolean).join(' @ ') || '(new education)';

function certForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Certificate Name *"    name="name"                value={item.name}                onChange={h} placeholder="AWS Solutions Architect" />
        <InputRow label="Issuing Organisation"  name="issuingOrganization" value={item.issuingOrganization} onChange={h} placeholder="Amazon Web Services"     />
        <InputRow label="Issue Date"  name="issueDate"  value={item.issueDate}  onChange={h} placeholder="2023-06" type="month" half />
        <InputRow label="Expiry Date" name="expiryDate" value={item.expiryDate} onChange={h} placeholder="2026-06" type="month" half />
        <InputRow label="Credential ID"  name="credentialId"  value={item.credentialId}  onChange={h} placeholder="AWS-123456" half />
        <InputRow label="Credential URL" name="credentialUrl" value={item.credentialUrl} onChange={h} placeholder="https://…"  half />
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
certForm.preview = (e) => e.name || '(new certification)';

function projForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Project Name *" name="name" value={item.name} onChange={h} placeholder="My Awesome Project" />
        <InputRow label="URL"            name="url"  value={item.url}  onChange={h} placeholder="https://github.com/…" />
        <InputRow label="Start Date" name="startDate" value={item.startDate} onChange={h} placeholder="2023-01" type="month" half />
        <InputRow label="End Date"   name="endDate"   value={item.endDate}   onChange={h} placeholder="2023-06" type="month" half />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Technologies</label>
        <TagInput value={item.technologies ?? []} onChange={v => onChange({ technologies: v })} placeholder="React, Node.js, PostgreSQL…" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea name="description" value={item.description ?? ''} onChange={h} rows={3} placeholder="What the project does and your contributions…" className="input-field text-sm resize-none" />
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
projForm.preview = (p) => p.name || '(new project)';

function achvForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Achievement Title *" name="title" value={item.title} onChange={h} placeholder="Best Employee Award" />
        <InputRow label="Year / Date"         name="date"  value={item.date}  onChange={h} placeholder="2023" half />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <textarea name="description" value={item.description ?? ''} onChange={h} rows={2} placeholder="Brief description of the achievement…" className="input-field text-sm resize-none" />
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
achvForm.preview = (a) => a.title || '(new achievement)';

function langForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Language *" name="language" value={item.language} onChange={h} placeholder="English" half />
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Proficiency *</label>
          <select name="proficiency" value={item.proficiency ?? 'Intermediate'} onChange={h} className="input-field text-sm py-2">
            {['Native','Fluent','Advanced','Intermediate','Basic'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
langForm.preview = (l) => l.language ? `${l.language} · ${l.proficiency ?? ''}` : '(new language)';

function refForm({ item, onChange, onDone }) {
  const h = (e) => onChange({ [e.target.name]: e.target.value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <InputRow label="Full Name *"    name="name"         value={item.name}         onChange={h} placeholder="John Smith" />
        <InputRow label="Job Title"      name="title"        value={item.title}        onChange={h} placeholder="Engineering Manager" />
        <InputRow label="Company"        name="company"      value={item.company}      onChange={h} placeholder="Acme Corp"            />
        <InputRow label="Relationship"   name="relationship" value={item.relationship} onChange={h} placeholder="Former manager"       />
        <InputRow label="Email"          name="email"        value={item.email}        onChange={h} placeholder="john@acme.com" type="email" half />
        <InputRow label="Phone"          name="phone"        value={item.phone}        onChange={h} placeholder="+1 555 000 0000"       half />
      </div>
      <button type="button" onClick={onDone} className="btn-primary text-xs px-4 py-1.5">Done</button>
    </div>
  );
}
refForm.preview = (r) => r.name || '(new reference)';

// ── Template picker modal ────────────────────────────────────────────────────

const TEMPLATE_COLORS = {
  modern:    { bg: '#7600CF', text: '#fff' },
  corporate: { bg: '#1E293B', text: '#fff' },
  minimal:   { bg: '#F9FAFB', text: '#374151' },
  creative:  { bg: 'linear-gradient(135deg,#7600CF,#4F46E5)', text: '#fff' },
  executive: { bg: '#fff',   text: '#111827', border: '2px solid #111827' },
};

function TemplateModal({ templates, current, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Choose Template</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">✕</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const colors = TEMPLATE_COLORS[tpl.slug] ?? {};
            const isActive = tpl.id === current;
            return (
              <button key={tpl.id} onClick={() => { onSelect(tpl); onClose(); }}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${isActive ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-primary-300'}`}
              >
                {/* Mini preview swatch */}
                <div style={{ background: colors.bg ?? '#fff', border: colors.border, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ color: colors.text, textAlign: 'center', padding: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Your Name</div>
                    <div style={{ fontSize: 9, opacity: 0.7, lineHeight: 1.4 }}>Job Title · Email<br/>Experience · Skills</div>
                  </div>
                </div>
                <div className={`py-2.5 px-3 text-left ${isActive ? 'bg-primary-50' : 'bg-white'}`}>
                  <div className="text-sm font-semibold text-gray-800">{tpl.name}</div>
                  {isActive && <span className="text-xs text-primary-600 font-medium">Active</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Completeness score ───────────────────────────────────────────────────────

function completenessScore(c) {
  const checks = [
    c.personalInfo?.fullName,
    c.personalInfo?.email,
    c.personalInfo?.phone,
    c.personalInfo?.location,
    c.summary,
    c.experience?.length > 0,
    c.education?.length > 0,
    c.skills?.length > 0,
    c.certifications?.length > 0,
    c.personalInfo?.linkedin,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Main builder page ────────────────────────────────────────────────────────

export default function ResumeBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const isEdit = !!id;
  const [open, setOpen] = useState('personalInfo');
  const [showTemplates, setShowTemplates] = useState(!isEdit);
  const [showPreview, setShowPreview] = useState(false); // mobile toggle
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [label, setLabel] = useState('');
  const [templateId, setTemplateId] = useState(null);
  const [templateSlug, setTemplateSlug] = useState('modern');
  const [content, setContent] = useState(EMPTY);
  const autoSaveTimer = useRef(null);
  const previewRef = useRef(null);

  // ── Fetch existing resume (edit mode) ─────────────────────────────────────
  const { isLoading: loadingResume } = useQuery({
    queryKey: ['resume', id],
    queryFn:  () => seekerService.getResumeContent(id),
    enabled:  isEdit,
    onSuccess: (data) => {
      const r = data?.resume;
      if (!r) return;
      setLabel(r.label ?? '');
      setTemplateId(r.templateId ?? null);
      setTemplateSlug(r.template?.slug ?? 'modern');
      setContent(r.resumeContent ?? EMPTY);
      setShowTemplates(false);
    },
  });

  // ── Templates list ─────────────────────────────────────────────────────────
  const { data: tplData } = useQuery({
    queryKey: ['resume-templates'],
    queryFn:  () => seekerService.getTemplates(),
    staleTime: 10 * 60 * 1000,
  });
  const templates = tplData?.templates ?? [];

  // ── Save mutation ──────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? seekerService.updateBuiltResume(id, payload)
        : seekerService.createBuiltResume(payload),
    onMutate: () => setSaveStatus('saving'),
    onSuccess: (data) => {
      setSaveStatus('saved');
      qc.invalidateQueries({ queryKey: ['my-resumes'] });
      qc.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      if (!isEdit && data?.resume?.id) {
        navigate(`/seeker/resume/${data.resume.id}/edit`, { replace: true });
      }
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
    onError: () => setSaveStatus('error'),
  });

  // ── Auto-save (debounced, 3 s) ────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (!templateId) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveMutation.mutate({ label, templateId, resumeContent: content });
    }, 3000);
  }, [label, templateId, content, saveMutation]);

  useEffect(() => {
    if (templateId) triggerAutoSave();
    return () => clearTimeout(autoSaveTimer.current);
  }, [content, label, templateId]);

  // ── Content updaters ──────────────────────────────────────────────────────
  const patchInfo  = (patch) => setContent(c => ({ ...c, personalInfo: { ...c.personalInfo, ...patch } }));
  const setSummary = (v)     => setContent(c => ({ ...c, summary: v }));

  function listOps(key) {
    return {
      onCreate: (id) => setContent(c => ({ ...c, [key]: [...(c[key] ?? []), { id }] })),
      onUpdate: (id, patch) => setContent(c => ({ ...c, [key]: c[key].map(it => it.id === id ? { ...it, ...patch } : it) })),
      onDelete: (id) => setContent(c => ({ ...c, [key]: c[key].filter(it => it.id !== id) })),
    };
  }

  // ── Template selection ────────────────────────────────────────────────────
  const handleTemplateSelect = (tpl) => {
    setTemplateId(tpl.id);
    setTemplateSlug(tpl.slug);
  };

  // ── PDF download ──────────────────────────────────────────────────────────
  const downloadPdf = useCallback(() => {
    if (!previewRef.current) return;
    const html = previewRef.current.outerHTML;
    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) { alert('Please allow pop-ups to download PDF.'); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${label || 'Resume'}</title><style>@page{size:A4;margin:0}body{margin:0;padding:0}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  }, [label]);

  // ── Manual save ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!templateId) { setShowTemplates(true); return; }
    clearTimeout(autoSaveTimer.current);
    saveMutation.mutate({ label, templateId, resumeContent: content });
  };

  const score = completenessScore(content);
  const toggle = (k) => setOpen(prev => prev === k ? null : k);

  if (isEdit && loadingResume) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading resume…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/seeker/resume" className="text-gray-400 hover:text-gray-700 transition-colors mr-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Resume label…"
          className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none w-48 min-w-0"
        />
        <span className="text-xs text-gray-300">|</span>

        {/* Template button */}
        <button onClick={() => setShowTemplates(true)}
          className="hidden sm:flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
          {templateSlug ? templateSlug.charAt(0).toUpperCase() + templateSlug.slice(1) : 'Template'}
        </button>

        {/* Completeness */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${score}%` }} />
          </div>
          <span className="text-xs text-gray-500 font-medium">{score}%</span>
        </div>

        {/* Save status */}
        <div className="text-xs text-gray-400 min-w-[60px] text-right hidden sm:block">
          {saveStatus === 'saving' && <span className="text-blue-500">Saving…</span>}
          {saveStatus === 'saved'  && <span className="text-green-600">Saved ✓</span>}
          {saveStatus === 'error'  && <span className="text-red-500">Error</span>}
        </div>

        {/* Mobile preview toggle */}
        <button onClick={() => setShowPreview(p => !p)}
          className="lg:hidden text-sm font-medium text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 ml-auto">
          {showPreview ? 'Edit' : 'Preview'}
        </button>

        <button onClick={downloadPdf} className="btn-outline text-sm py-1.5 px-3 flex items-center gap-1.5 hidden sm:flex">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          PDF
        </button>
        <Button onClick={handleSave} loading={saveMutation.isPending} className="py-1.5 px-4 text-sm">
          Save
        </Button>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div className={`w-full lg:w-[400px] xl:w-[440px] shrink-0 overflow-y-auto bg-white border-r border-gray-200 ${showPreview ? 'hidden lg:block' : 'block'}`}>
          {/* Personal Info */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Personal Information" open={open === 'personalInfo'} onToggle={() => toggle('personalInfo')} />
            {open === 'personalInfo' && (
              <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Full Name *',    name: 'fullName',  placeholder: 'John Doe' },
                  { label: 'Job Title',      name: 'jobTitle',  placeholder: 'Senior Engineer' },
                  { label: 'Email *',        name: 'email',     placeholder: 'john@email.com',   type: 'email' },
                  { label: 'Phone',          name: 'phone',     placeholder: '+1 555 000 0000' },
                  { label: 'Location',       name: 'location',  placeholder: 'New York, NY' },
                  { label: 'Website',        name: 'website',   placeholder: 'https://johndoe.dev' },
                  { label: 'LinkedIn URL',   name: 'linkedin',  placeholder: 'linkedin.com/in/john' },
                  { label: 'GitHub URL',     name: 'github',    placeholder: 'github.com/john' },
                  { label: 'Portfolio URL',  name: 'portfolio', placeholder: 'portfolio.johndoe.dev' },
                ].map(f => (
                  <InputRow key={f.name} label={f.label} name={f.name} value={content.personalInfo[f.name]} onChange={e => patchInfo({ [f.name]: e.target.value })} placeholder={f.placeholder} type={f.type} half />
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Professional Summary" open={open === 'summary'} onToggle={() => toggle('summary')} badge={content.summary ? 'Filled' : null} />
            {open === 'summary' && (
              <div className="px-4 pb-4">
                <textarea value={content.summary} onChange={e => setSummary(e.target.value)} rows={5}
                  placeholder="A compelling 3–5 sentence overview of your experience, skills, and career goals…"
                  className="input-field text-sm resize-none w-full" />
                <p className="text-xs text-gray-400 mt-1">{content.summary?.length ?? 0} characters</p>
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Work Experience" count={content.experience.length} open={open === 'experience'} onToggle={() => toggle('experience')} />
            {open === 'experience' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.experience} renderForm={expForm} emptyLabel="No experience added yet" addLabel="Add Experience" {...listOps('experience')} />
              </div>
            )}
          </div>

          {/* Education */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Education" count={content.education.length} open={open === 'education'} onToggle={() => toggle('education')} />
            {open === 'education' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.education} renderForm={eduForm} emptyLabel="No education added yet" addLabel="Add Education" {...listOps('education')} />
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Skills" count={content.skills.length} open={open === 'skills'} onToggle={() => toggle('skills')} />
            {open === 'skills' && (
              <div className="px-4 pb-4">
                <TagInput value={content.skills} onChange={v => setContent(c => ({ ...c, skills: v }))} placeholder="JavaScript, React, Node.js — press Enter or comma to add" />
                <p className="text-xs text-gray-400 mt-1">Press Enter or comma after each skill</p>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Certifications" count={content.certifications.length} open={open === 'certifications'} onToggle={() => toggle('certifications')} />
            {open === 'certifications' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.certifications} renderForm={certForm} emptyLabel="No certifications added yet" addLabel="Add Certification" {...listOps('certifications')} />
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Projects" count={content.projects.length} open={open === 'projects'} onToggle={() => toggle('projects')} />
            {open === 'projects' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.projects} renderForm={projForm} emptyLabel="No projects added yet" addLabel="Add Project" {...listOps('projects')} />
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Achievements" count={content.achievements.length} open={open === 'achievements'} onToggle={() => toggle('achievements')} />
            {open === 'achievements' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.achievements} renderForm={achvForm} emptyLabel="No achievements added yet" addLabel="Add Achievement" {...listOps('achievements')} />
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="border-b border-gray-100">
            <SectionHeader title="Languages" count={content.languages.length} open={open === 'languages'} onToggle={() => toggle('languages')} />
            {open === 'languages' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.languages} renderForm={langForm} emptyLabel="No languages added yet" addLabel="Add Language" {...listOps('languages')} />
              </div>
            )}
          </div>

          {/* References */}
          <div className="border-b border-gray-100">
            <SectionHeader title="References" count={content.references.length} open={open === 'references'} onToggle={() => toggle('references')} />
            {open === 'references' && (
              <div className="px-4 pb-4">
                <ListEditor items={content.references} renderForm={refForm} emptyLabel="No references added yet" addLabel="Add Reference" {...listOps('references')} />
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        <div className={`flex-1 overflow-auto bg-gray-100 p-6 ${showPreview ? 'block' : 'hidden lg:block'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Live Preview</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowTemplates(true)} className="text-xs text-primary-600 font-medium hover:underline">Change Template</button>
              <span className="text-gray-300">·</span>
              <button onClick={downloadPdf} className="text-xs text-gray-600 font-medium hover:underline flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download PDF
              </button>
            </div>
          </div>

          {!templateId ? (
            <div className="flex items-center justify-center h-80 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="text-4xl mb-3">🎨</div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No template selected</p>
                <p className="text-xs text-gray-400 mb-4">Choose a template to see a live preview</p>
                <button onClick={() => setShowTemplates(true)} className="btn-primary text-sm py-2 px-5">Choose Template</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '210mm', margin: '0 auto' }}>
              <ResumePreview ref={previewRef} content={content} templateSlug={templateSlug} />
            </div>
          )}
        </div>
      </div>

      {/* Template picker modal */}
      {showTemplates && (
        <TemplateModal
          templates={templates}
          current={templateId}
          onSelect={handleTemplateSelect}
          onClose={() => { if (templateId) setShowTemplates(false); }}
        />
      )}
    </div>
  );
}

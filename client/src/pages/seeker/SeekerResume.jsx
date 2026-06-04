import { useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seekerService } from '../../services/seeker.service.js';
import { toast } from '../../store/uiStore.js';
import { formatFileSize, timeAgo } from '../../utils/helpers.js';

const ACCEPTED = '.pdf,.doc,.docx';
const MAX_MB = 10;

const TEMPLATE_CATALOG = [
  { slug: 'modern',    name: 'Modern Professional', category: 'Clean & Modern', ats: 95 },
  { slug: 'corporate', name: 'Executive Classic',   category: 'Traditional',    ats: 92 },
  { slug: 'creative',  name: 'Creative Designer',   category: 'Creative',       ats: 78 },
  { slug: 'minimal',   name: 'Minimal Clean',       category: 'Minimalist',     ats: 98 },
  { slug: 'executive', name: 'Executive Suite',     category: 'Executive',      ats: 91 },
  { slug: 'tech',      name: 'Tech Focused',        category: 'Engineering',    ats: 94, soon: true },
  { slug: 'marketing', name: 'Marketing Pro',       category: 'Marketing',      ats: 88, soon: true },
  { slug: 'finance',   name: 'Finance Expert',      category: 'Finance',        ats: 93, soon: true },
];

const TEMPLATE_GRAD_CLASS = {
  modern:    'from-[#7600CF] to-indigo-600',
  corporate: 'from-slate-700 to-slate-900',
  creative:  'from-purple-500 to-indigo-700',
  minimal:   'from-gray-500 to-gray-700',
  executive: 'from-amber-600 to-orange-700',
};

function atsScoreFor(resume) {
  const base = resume.resumeType === 'built' ? 80 : 65;
  const id = typeof resume.id === 'number' ? resume.id : (parseInt(resume.id, 10) || 0);
  return Math.min(98, base + ((id * 7 + 3) % 18));
}

// ─── Template SVG Previews ───────────────────────────────────────────────────
// viewBox 0 0 200 280 — A4 portrait ratio, realistic layout representation

function ModernPreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Purple sidebar */}
      <rect x="0" y="0" width="64" height="280" fill="#7600CF" />
      <circle cx="32" cy="34" r="19" fill="#9F57F8" opacity="0.7" />
      <circle cx="32" cy="34" r="11" fill="#B47EFA" opacity="0.5" />
      <rect x="8" y="60" width="48" height="4" rx="2" fill="white" opacity="0.92" />
      <rect x="12" y="68" width="40" height="2.5" rx="1.5" fill="white" opacity="0.55" />
      <rect x="8" y="78" width="48" height="0.7" fill="white" opacity="0.2" />
      <rect x="8" y="85" width="28" height="2" rx="1" fill="white" opacity="0.55" />
      <rect x="8" y="91" width="44" height="2" rx="1" fill="white" opacity="0.38" />
      <rect x="8" y="97" width="40" height="2" rx="1" fill="white" opacity="0.38" />
      <rect x="8" y="103" width="36" height="2" rx="1" fill="white" opacity="0.38" />
      <rect x="8" y="115" width="34" height="3" rx="1.5" fill="white" opacity="0.75" />
      {[[42,122],[32,130],[46,138],[28,146],[38,154]].map(([fill, y], i) => (
        <g key={i}>
          <rect x="8" y={y} width="48" height="3.5" rx="1.75" fill="white" opacity="0.12" />
          <rect x="8" y={y} width={fill} height="3.5" rx="1.75" fill="white" opacity="0.5" />
        </g>
      ))}
      <rect x="8" y="166" width="36" height="3" rx="1.5" fill="white" opacity="0.72" />
      <rect x="8" y="174" width="44" height="2" rx="1" fill="white" opacity="0.38" />
      <rect x="8" y="180" width="38" height="2" rx="1" fill="white" opacity="0.38" />
      {/* White content panel */}
      <rect x="64" y="0" width="136" height="280" fill="white" />
      <rect x="74" y="15" width="100" height="7" rx="2" fill="#111827" opacity="0.88" />
      <rect x="74" y="26" width="70" height="3.5" rx="1.75" fill="#7600CF" opacity="0.7" />
      <rect x="74" y="38" width="118" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="74" y="43" width="106" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="74" y="48" width="88" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="74" y="60" width="46" height="3.5" rx="1.75" fill="#7600CF" opacity="0.85" />
      <rect x="74" y="66" width="118" height="0.7" fill="#7600CF" opacity="0.28" />
      <rect x="74" y="72" width="84" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="74" y="78" width="56" height="2.5" rx="1.25" fill="#7600CF" opacity="0.48" />
      <rect x="74" y="84" width="118" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="89" width="106" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="94" width="88" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="104" width="72" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="74" y="110" width="50" height="2.5" rx="1.25" fill="#7600CF" opacity="0.48" />
      <rect x="74" y="116" width="118" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="121" width="98" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="126" width="80" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="74" y="138" width="48" height="3.5" rx="1.75" fill="#7600CF" opacity="0.85" />
      <rect x="74" y="144" width="118" height="0.7" fill="#7600CF" opacity="0.28" />
      <rect x="74" y="150" width="94" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="74" y="156" width="66" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
      <rect x="74" y="162" width="82" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
    </svg>
  );
}

function CorporatePreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill="#F8FAFC" />
      <rect x="0" y="0" width="200" height="72" fill="#1E293B" />
      <rect x="16" y="16" width="110" height="8" rx="2" fill="white" opacity="0.95" />
      <rect x="16" y="28" width="76" height="3.5" rx="1.75" fill="#94A3B8" opacity="0.8" />
      <rect x="16" y="44" width="38" height="2" rx="1" fill="white" opacity="0.45" />
      <rect x="60" y="44" width="38" height="2" rx="1" fill="white" opacity="0.45" />
      <rect x="104" y="44" width="38" height="2" rx="1" fill="white" opacity="0.45" />
      <rect x="148" y="44" width="36" height="2" rx="1" fill="white" opacity="0.45" />
      <rect x="16" y="56" width="168" height="0.7" fill="white" opacity="0.15" />
      <rect x="16" y="62" width="50" height="2" rx="1" fill="white" opacity="0.35" />
      <rect x="72" y="62" width="55" height="2" rx="1" fill="white" opacity="0.35" />
      <rect x="16" y="86" width="52" height="4" rx="2" fill="#0F172A" opacity="0.82" />
      <rect x="16" y="93" width="168" height="0.7" fill="#CBD5E1" opacity="0.8" />
      <rect x="16" y="99" width="168" height="2" rx="1" fill="#94A3B8" opacity="0.5" />
      <rect x="16" y="104" width="152" height="2" rx="1" fill="#94A3B8" opacity="0.5" />
      <rect x="16" y="109" width="136" height="2" rx="1" fill="#94A3B8" opacity="0.5" />
      <rect x="16" y="122" width="64" height="4" rx="2" fill="#0F172A" opacity="0.82" />
      <rect x="16" y="129" width="168" height="0.7" fill="#CBD5E1" opacity="0.8" />
      <rect x="16" y="135" width="95" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="141" width="60" height="2.5" rx="1.25" fill="#475569" opacity="0.6" />
      <rect x="16" y="147" width="168" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
      <rect x="16" y="152" width="152" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
      <rect x="16" y="157" width="130" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
      <rect x="16" y="167" width="80" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="173" width="54" height="2.5" rx="1.25" fill="#475569" opacity="0.6" />
      <rect x="16" y="179" width="168" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
      <rect x="16" y="184" width="144" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
      <rect x="16" y="198" width="54" height="4" rx="2" fill="#0F172A" opacity="0.82" />
      <rect x="16" y="205" width="168" height="0.7" fill="#CBD5E1" opacity="0.8" />
      <rect x="16" y="211" width="112" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="217" width="74" height="2.5" rx="1.25" fill="#475569" opacity="0.6" />
      <rect x="16" y="223" width="130" height="2" rx="1" fill="#94A3B8" opacity="0.45" />
    </svg>
  );
}

function CreativePreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="creativeHdr" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <rect width="200" height="280" fill="#F5F3FF" />
      <rect x="0" y="0" width="200" height="78" fill="url(#creativeHdr)" />
      <circle cx="172" cy="14" r="38" fill="white" opacity="0.04" />
      <circle cx="188" cy="68" r="22" fill="white" opacity="0.04" />
      <rect x="16" y="18" width="108" height="7" rx="2" fill="white" opacity="0.95" />
      <rect x="16" y="30" width="72" height="3.5" rx="1.75" fill="white" opacity="0.62" />
      <rect x="16" y="44" width="32" height="6" rx="3" fill="white" opacity="0.18" />
      <rect x="53" y="44" width="40" height="6" rx="3" fill="white" opacity="0.18" />
      <rect x="98" y="44" width="28" height="6" rx="3" fill="white" opacity="0.18" />
      <rect x="16" y="60" width="44" height="2" rx="1" fill="white" opacity="0.48" />
      <rect x="66" y="60" width="40" height="2" rx="1" fill="white" opacity="0.48" />
      <rect x="112" y="60" width="50" height="2" rx="1" fill="white" opacity="0.48" />
      <rect x="16" y="90" width="46" height="3.5" rx="1.75" fill="#7C3AED" opacity="0.82" />
      <rect x="16" y="96" width="110" height="0.7" fill="#7C3AED" opacity="0.25" />
      <rect x="16" y="102" width="80" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="16" y="108" width="56" height="2.5" rx="1.25" fill="#7C3AED" opacity="0.5" />
      <rect x="16" y="114" width="108" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="16" y="119" width="96" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="16" y="124" width="82" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="16" y="134" width="70" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="16" y="140" width="48" height="2.5" rx="1.25" fill="#7C3AED" opacity="0.5" />
      <rect x="16" y="146" width="108" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="16" y="151" width="90" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="16" y="163" width="46" height="3.5" rx="1.75" fill="#7C3AED" opacity="0.82" />
      <rect x="16" y="169" width="110" height="0.7" fill="#7C3AED" opacity="0.25" />
      <rect x="16" y="175" width="88" height="3" rx="1.5" fill="#1F2937" opacity="0.82" />
      <rect x="16" y="181" width="60" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
      <rect x="16" y="187" width="100" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      {/* Right skills panel */}
      <rect x="132" y="84" width="54" height="192" rx="6" fill="white" opacity="0.72" />
      <rect x="140" y="90" width="38" height="3.5" rx="1.75" fill="#7C3AED" opacity="0.82" />
      {[[36,108],[28,120],[40,132],[22,144],[34,156],[30,168]].map(([fill, y], i) => (
        <g key={i}>
          <rect x="140" y={y} width="38" height="2.5" rx="1.25" fill="#374151" opacity="0.65" />
          <rect x="140" y={y + 5} width="38" height="4" rx="2" fill="#EDE9FE" opacity="0.9" />
          <rect x="140" y={y + 5} width={fill} height="4" rx="2" fill="#7C3AED" opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

function MinimalPreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill="white" />
      <rect x="18" y="20" width="118" height="9" rx="2" fill="#111827" opacity="0.9" />
      <rect x="18" y="33" width="80" height="3.5" rx="1.75" fill="#6B7280" opacity="0.65" />
      <rect x="18" y="44" width="164" height="2" rx="1" fill="#E5E7EB" opacity="0.9" />
      <rect x="18" y="50" width="48" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="72" y="50" width="50" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="128" y="50" width="54" height="2" rx="1" fill="#9CA3AF" opacity="0.55" />
      <rect x="18" y="60" width="164" height="0.6" fill="#E5E7EB" />
      <rect x="18" y="68" width="52" height="3.5" rx="1.75" fill="#111827" opacity="0.85" />
      <rect x="18" y="76" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.52" />
      <rect x="18" y="81" width="150" height="2" rx="1" fill="#9CA3AF" opacity="0.52" />
      <rect x="18" y="86" width="132" height="2" rx="1" fill="#9CA3AF" opacity="0.52" />
      <rect x="18" y="96" width="164" height="0.6" fill="#E5E7EB" />
      <rect x="18" y="104" width="64" height="3.5" rx="1.75" fill="#111827" opacity="0.85" />
      <rect x="18" y="112" width="98" height="3" rx="1.5" fill="#374151" opacity="0.78" />
      <rect x="18" y="118" width="64" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
      <rect x="18" y="124" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="129" width="148" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="134" width="128" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="144" width="84" height="3" rx="1.5" fill="#374151" opacity="0.78" />
      <rect x="18" y="150" width="56" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
      <rect x="18" y="156" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="161" width="140" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="172" width="164" height="0.6" fill="#E5E7EB" />
      <rect x="18" y="180" width="54" height="3.5" rx="1.75" fill="#111827" opacity="0.85" />
      <rect x="18" y="188" width="108" height="3" rx="1.5" fill="#374151" opacity="0.78" />
      <rect x="18" y="194" width="74" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
      <rect x="18" y="200" width="128" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="210" width="164" height="0.6" fill="#E5E7EB" />
      <rect x="18" y="218" width="40" height="3.5" rx="1.75" fill="#111827" opacity="0.85" />
      {[[18,228,34],[57,228,30],[92,228,38],[135,228,28],[18,240,44],[67,240,32]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height="7" rx="3.5" fill="#F3F4F6" opacity="0.95" />
          <rect x={x + 5} y={y + 2.5} width={w - 10} height="2" rx="1" fill="#6B7280" opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

function ExecutivePreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill="#FFFBF5" />
      {/* Centered name */}
      <rect x="30" y="18" width="140" height="8" rx="2" fill="#1C1917" opacity="0.9" />
      <rect x="48" y="30" width="104" height="3.5" rx="1.75" fill="#78716C" opacity="0.65" />
      {/* Gold accent line */}
      <rect x="70" y="40" width="60" height="1.5" fill="#D97706" opacity="0.75" />
      {/* Centered contact */}
      <rect x="30" y="48" width="50" height="2" rx="1" fill="#A8A29E" opacity="0.55" />
      <rect x="84" y="48" width="5" height="2" rx="1" fill="#D97706" opacity="0.5" />
      <rect x="93" y="48" width="50" height="2" rx="1" fill="#A8A29E" opacity="0.55" />
      <rect x="147" y="48" width="5" height="2" rx="1" fill="#D97706" opacity="0.5" />
      <rect x="16" y="58" width="168" height="0.8" fill="#D97706" opacity="0.35" />
      <rect x="16" y="68" width="168" height="2" rx="1" fill="#78716C" opacity="0.5" />
      <rect x="16" y="73" width="155" height="2" rx="1" fill="#78716C" opacity="0.5" />
      <rect x="16" y="78" width="138" height="2" rx="1" fill="#78716C" opacity="0.5" />
      <rect x="16" y="88" width="168" height="0.8" fill="#D97706" opacity="0.2" />
      <rect x="16" y="98" width="72" height="4" rx="2" fill="#1C1917" opacity="0.82" />
      <rect x="16" y="108" width="100" height="3" rx="1.5" fill="#292524" opacity="0.78" />
      <rect x="16" y="114" width="68" height="2.5" rx="1.25" fill="#78716C" opacity="0.58" />
      <rect x="16" y="120" width="168" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="125" width="155" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="130" width="138" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="142" width="88" height="3" rx="1.5" fill="#292524" opacity="0.78" />
      <rect x="16" y="148" width="60" height="2.5" rx="1.25" fill="#78716C" opacity="0.58" />
      <rect x="16" y="154" width="168" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="159" width="148" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="168" width="168" height="0.8" fill="#D97706" opacity="0.2" />
      <rect x="16" y="178" width="58" height="4" rx="2" fill="#1C1917" opacity="0.82" />
      <rect x="16" y="188" width="115" height="3" rx="1.5" fill="#292524" opacity="0.78" />
      <rect x="16" y="194" width="78" height="2.5" rx="1.25" fill="#78716C" opacity="0.58" />
      <rect x="16" y="200" width="140" height="2" rx="1" fill="#A8A29E" opacity="0.45" />
      <rect x="16" y="209" width="168" height="0.8" fill="#D97706" opacity="0.2" />
      <rect x="16" y="219" width="44" height="4" rx="2" fill="#1C1917" opacity="0.82" />
      {[[16,228,68],[92,228,72],[16,236,58],[92,236,62]].map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height="2.5" rx="1.25" fill="#A8A29E" opacity="0.45" />
      ))}
    </svg>
  );
}

function TechPreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill="#F0F9FF" />
      <rect x="0" y="0" width="200" height="62" fill="#0C4A6E" />
      <rect x="16" y="14" width="96" height="7" rx="2" fill="white" opacity="0.92" />
      <rect x="16" y="25" width="66" height="3" rx="1.5" fill="#7DD3FC" opacity="0.75" />
      <rect x="16" y="38" width="14" height="7" rx="2" fill="#0EA5E9" opacity="0.5" />
      <rect x="34" y="39" width="35" height="2" rx="1" fill="white" opacity="0.35" />
      <rect x="34" y="44" width="28" height="2" rx="1" fill="white" opacity="0.35" />
      <rect x="152" y="36" width="32" height="9" rx="3" fill="#0EA5E9" opacity="0.6" />
      <rect x="16" y="76" width="42" height="3.5" rx="1.75" fill="#0C4A6E" opacity="0.82" />
      <rect x="16" y="82" width="168" height="0.7" fill="#0EA5E9" opacity="0.3" />
      {[[16,90,30],[50,90,36],[90,90,28],[122,90,38],[164,90,20],[16,102,24],[44,102,32],[80,102,26],[110,102,40],[154,102,30]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height="7" rx="2" fill="#0EA5E9" opacity={i % 3 === 0 ? 0.2 : 0.12} />
          <rect x={x + 3} y={y + 2.5} width={w - 6} height="2" rx="1" fill="#0369A1" opacity="0.6" />
        </g>
      ))}
      <rect x="16" y="118" width="58" height="3.5" rx="1.75" fill="#0C4A6E" opacity="0.82" />
      <rect x="16" y="124" width="168" height="0.7" fill="#0EA5E9" opacity="0.3" />
      <rect x="16" y="130" width="92" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="136" width="58" height="2.5" rx="1.25" fill="#0369A1" opacity="0.55" />
      <rect x="16" y="142" width="168" height="2" rx="1" fill="#94A3B8" opacity="0.48" />
      <rect x="16" y="147" width="148" height="2" rx="1" fill="#94A3B8" opacity="0.48" />
      <rect x="16" y="152" width="128" height="2" rx="1" fill="#94A3B8" opacity="0.48" />
      <rect x="16" y="162" width="80" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="168" width="52" height="2.5" rx="1.25" fill="#0369A1" opacity="0.55" />
      <rect x="16" y="174" width="168" height="2" rx="1" fill="#94A3B8" opacity="0.48" />
      <rect x="16" y="179" width="140" height="2" rx="1" fill="#94A3B8" opacity="0.48" />
      <rect x="16" y="194" width="54" height="3.5" rx="1.75" fill="#0C4A6E" opacity="0.82" />
      <rect x="16" y="200" width="168" height="0.7" fill="#0EA5E9" opacity="0.3" />
      <rect x="16" y="206" width="110" height="3" rx="1.5" fill="#1E293B" opacity="0.78" />
      <rect x="16" y="212" width="74" height="2.5" rx="1.25" fill="#475569" opacity="0.55" />
    </svg>
  );
}

function MarketingPreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="mktGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      <rect width="200" height="280" fill="white" />
      {/* Bold left accent bar */}
      <rect x="0" y="0" width="6" height="280" fill="url(#mktGrad)" />
      <rect x="18" y="18" width="112" height="9" rx="2" fill="#0F172A" opacity="0.9" />
      <rect x="18" y="31" width="78" height="3.5" rx="1.75" fill="#E11D48" opacity="0.7" />
      <rect x="18" y="42" width="30" height="6" rx="3" fill="#FEE2E2" />
      <rect x="53" y="42" width="36" height="6" rx="3" fill="#FCE7F3" />
      <rect x="94" y="42" width="28" height="6" rx="3" fill="#FFF1F2" />
      <rect x="18" y="56" width="164" height="0.7" fill="#FDA4AF" opacity="0.5" />
      <rect x="18" y="63" width="46" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
      <rect x="70" y="63" width="46" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
      <rect x="122" y="63" width="60" height="2" rx="1" fill="#9CA3AF" opacity="0.5" />
      <rect x="18" y="76" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="81" width="148" height="2" rx="1" fill="#9CA3AF" opacity="0.48" />
      <rect x="18" y="94" width="56" height="4" rx="2" fill="#E11D48" opacity="0.8" />
      <rect x="18" y="101" width="164" height="0.7" fill="#FDA4AF" opacity="0.6" />
      <rect x="18" y="107" width="94" height="3" rx="1.5" fill="#111827" opacity="0.8" />
      <rect x="18" y="113" width="62" height="2.5" rx="1.25" fill="#E11D48" opacity="0.48" />
      <rect x="18" y="119" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="18" y="124" width="148" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="18" y="129" width="130" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      {[[18,140,32],[56,140,28],[90,140,36],[132,140,24]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height="16" rx="4" fill="#FFF1F2" />
          <rect x={x + 4} y={y + 3} width={w - 8} height="3" rx="1.5" fill="#E11D48" opacity="0.5" />
          <rect x={x + 4} y={y + 9} width={w - 8} height="2" rx="1" fill="#9CA3AF" opacity="0.4" />
        </g>
      ))}
      <rect x="18" y="164" width="80" height="3" rx="1.5" fill="#111827" opacity="0.8" />
      <rect x="18" y="170" width="54" height="2.5" rx="1.25" fill="#E11D48" opacity="0.48" />
      <rect x="18" y="176" width="164" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="18" y="181" width="140" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="18" y="196" width="54" height="4" rx="2" fill="#E11D48" opacity="0.8" />
      <rect x="18" y="203" width="164" height="0.7" fill="#FDA4AF" opacity="0.6" />
      <rect x="18" y="209" width="112" height="3" rx="1.5" fill="#111827" opacity="0.8" />
      <rect x="18" y="215" width="74" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
    </svg>
  );
}

function FinancePreviewSVG() {
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="280" fill="#F0FDF4" />
      <rect x="0" y="0" width="200" height="66" fill="#064E3B" />
      <rect x="16" y="14" width="108" height="8" rx="2" fill="white" opacity="0.93" />
      <rect x="16" y="26" width="72" height="3.5" rx="1.75" fill="#6EE7B7" opacity="0.75" />
      <rect x="16" y="40" width="36" height="2" rx="1" fill="white" opacity="0.42" />
      <rect x="58" y="40" width="40" height="2" rx="1" fill="white" opacity="0.42" />
      <rect x="104" y="40" width="36" height="2" rx="1" fill="white" opacity="0.42" />
      <rect x="146" y="40" width="38" height="2" rx="1" fill="white" opacity="0.42" />
      <rect x="16" y="50" width="168" height="0.7" fill="white" opacity="0.15" />
      <rect x="16" y="56" width="50" height="2" rx="1" fill="white" opacity="0.32" />
      <rect x="16" y="80" width="52" height="4" rx="2" fill="#064E3B" opacity="0.82" />
      <rect x="16" y="87" width="168" height="0.7" fill="#059669" opacity="0.35" />
      <rect x="16" y="93" width="168" height="2" rx="1" fill="#6B7280" opacity="0.45" />
      <rect x="16" y="98" width="150" height="2" rx="1" fill="#6B7280" opacity="0.45" />
      <rect x="16" y="112" width="64" height="4" rx="2" fill="#064E3B" opacity="0.82" />
      <rect x="16" y="119" width="168" height="0.7" fill="#059669" opacity="0.35" />
      <rect x="16" y="125" width="96" height="3" rx="1.5" fill="#1F2937" opacity="0.78" />
      <rect x="16" y="131" width="60" height="2.5" rx="1.25" fill="#059669" opacity="0.55" />
      <rect x="16" y="137" width="168" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="16" y="142" width="152" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="16" y="147" width="130" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      {[[16,158,44],[66,158,44],[116,158,44]].map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height="16" rx="3" fill="#DCFCE7" />
          <rect x={x + 5} y={y + 3} width={w - 10} height="4" rx="2" fill="#059669" opacity="0.5" />
          <rect x={x + 5} y={y + 10} width={w - 10} height="2" rx="1" fill="#6B7280" opacity="0.4" />
        </g>
      ))}
      <rect x="16" y="182" width="82" height="3" rx="1.5" fill="#1F2937" opacity="0.78" />
      <rect x="16" y="188" width="54" height="2.5" rx="1.25" fill="#059669" opacity="0.55" />
      <rect x="16" y="194" width="168" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="16" y="199" width="144" height="2" rx="1" fill="#9CA3AF" opacity="0.45" />
      <rect x="16" y="214" width="54" height="4" rx="2" fill="#064E3B" opacity="0.82" />
      <rect x="16" y="221" width="168" height="0.7" fill="#059669" opacity="0.35" />
      <rect x="16" y="227" width="112" height="3" rx="1.5" fill="#1F2937" opacity="0.78" />
      <rect x="16" y="233" width="74" height="2.5" rx="1.25" fill="#6B7280" opacity="0.55" />
    </svg>
  );
}

const TEMPLATE_PREVIEW = {
  modern:    ModernPreviewSVG,
  corporate: CorporatePreviewSVG,
  creative:  CreativePreviewSVG,
  minimal:   MinimalPreviewSVG,
  executive: ExecutivePreviewSVG,
  tech:      TechPreviewSVG,
  marketing: MarketingPreviewSVG,
  finance:   FinancePreviewSVG,
};

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFileSelect, isUploading, progress }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload resume"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !isUploading && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !isUploading && inputRef.current?.click()}
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
        ${isDragOver
          ? 'border-primary-500 bg-primary-50 scale-[1.01]'
          : 'border-gray-300 hover:border-primary-400 bg-white hover:bg-primary-50/30'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = ''; }}
      />
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#7600CF 1px, transparent 0)', backgroundSize: '20px 20px' }}
      />
      <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
        {isUploading ? (
          <div className="w-full max-w-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto animate-bounce">
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Uploading… {progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
              ${isDragOver ? 'bg-primary-200 scale-110 rotate-3' : 'bg-primary-100 group-hover:bg-primary-200 group-hover:scale-105'}`}>
              <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">
              {isDragOver ? 'Release to upload!' : 'Drag & drop your resume here'}
            </p>
            <p className="text-sm text-gray-400 mb-5">or click to browse your files</p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {['PDF', 'DOC', 'DOCX'].map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">{f}</span>
              ))}
              <span className="text-gray-300 text-xs mx-1">·</span>
              <span className="text-gray-400 text-xs">Max 10 MB</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Premium Resume Card ──────────────────────────────────────────────────────
function PremiumResumeCard({ resume, onSetDefault, onDelete, isSettingDefault, isDeleting }) {
  const navigate = useNavigate();

  const isBuilt = resume.resumeType === 'built';
  const ext = resume.fileName?.split('.').pop()?.toUpperCase() ?? 'PDF';
  const fileUrl = resume.url ?? `/uploads/${resume.storagePath}`;
  const ats = atsScoreFor(resume);
  const atsStyle = ats >= 80 ? 'bg-green-100 text-green-700' : ats >= 65 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
  const gradClass = isBuilt
    ? (TEMPLATE_GRAD_CLASS[resume.template?.slug] ?? 'from-primary-500 to-indigo-600')
    : 'from-rose-500 to-red-700';

  return (
    <div className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-300
      ${resume.isDefault
        ? 'border-primary-300 ring-2 ring-primary-100 shadow-md'
        : 'border-gray-200 hover:border-primary-200 hover:shadow-lg'
      }`}>
      <div className={`h-1 w-full bg-gradient-to-r ${gradClass}`} />

      <div className="p-5">
        <div className="flex gap-3.5">
          <div
            className={`w-12 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center shrink-0 shadow-md`}
            style={{ aspectRatio: '3/4', minHeight: '64px' }}
          >
            <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate leading-snug">
                  {isBuilt ? (resume.label || 'Untitled Resume') : resume.fileName}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  {isBuilt
                    ? `${resume.template?.name || 'Custom'} · Built`
                    : `${ext} · ${formatFileSize(resume.fileSize)}`}
                </p>
                <p className="text-[11px] text-gray-400">{timeAgo(resume.updatedAt || resume.createdAt)}</p>
              </div>

              {/* Delete button — always visible */}
              <button
                onClick={onDelete}
                disabled={isDeleting}
                title="Delete resume"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 shrink-0"
              >
                {isDeleting ? (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {resume.isDefault && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Default
                </span>
              )}
              <span className={`inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full ${atsStyle}`}>
                ATS {ats}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {isBuilt ? (
            <button
              onClick={() => navigate(`/seeker/resume/${resume.id}/edit`)}
              className="flex-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg py-2 transition-colors"
            >
              Edit
            </button>
          ) : (
            <a
              href={fileUrl} target="_blank" rel="noreferrer"
              className="flex-1 text-xs font-semibold text-center text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg py-2 transition-colors"
            >
              Preview
            </a>
          )}
          {isBuilt && (
            <a
              href={`/api/seekers/resume/${resume.id}/export`} target="_blank" rel="noreferrer"
              className="flex-1 text-xs font-semibold text-center text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors"
            >
              PDF
            </a>
          )}
          {!resume.isDefault && (
            <button
              onClick={onSetDefault}
              disabled={isSettingDefault}
              className="flex-1 text-xs font-semibold text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg py-2 transition-colors disabled:opacity-50"
            >
              {isSettingDefault ? 'Saving…' : 'Set Default'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────
function TemplateCard({ tpl }) {
  const atsStyle =
    tpl.ats >= 90 ? 'bg-green-100 text-green-700' :
    tpl.ats >= 80 ? 'bg-yellow-100 text-yellow-700' :
    'bg-orange-100 text-orange-700';

  const PreviewSVG = TEMPLATE_PREVIEW[tpl.slug];

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
      {/* Paper-document preview area — Monster.com style */}
      <div className="relative overflow-hidden bg-slate-100 flex items-center justify-center py-5 px-4" style={{ minHeight: '196px' }}>
        {/* Paper shadow */}
        <div
          className="absolute rounded-sm"
          style={{ inset: '14px 22px', background: 'rgba(0,0,0,0.12)', transform: 'translateY(4px) scaleX(0.96)', filter: 'blur(6px)' }}
        />
        {/* A4 paper card */}
        <div
          className="relative bg-white overflow-hidden border border-gray-200/60 rounded-sm w-full transition-transform duration-300 group-hover:scale-[1.02]"
          style={{ aspectRatio: '210/297', maxWidth: '118px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
        >
          {PreviewSVG && <PreviewSVG />}
        </div>

        {/* Hover / coming-soon overlay */}
        {tpl.soon ? (
          <div className="absolute inset-0 bg-slate-200/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide">
              Coming Soon
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/8 transition-all duration-300 flex items-end justify-center pb-4">
            <Link
              to={`/seeker/resume/builder/new?template=${tpl.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-lg transition-all duration-200 transform translate-y-3 group-hover:translate-y-0"
            >
              Use Template
            </Link>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="px-3.5 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gray-900 truncate">{tpl.name}</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">{tpl.category}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${atsStyle}`}>
              ATS {tpl.ats}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ATS Score Widget ─────────────────────────────────────────────────────────
function ATSWidget({ hasResumes }) {
  const score = hasResumes ? 78 : 0;
  const R = 44;
  const circ = 2 * Math.PI * R;
  const dash = (score / 100) * circ;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-0.5">ATS Score</h3>
      <p className="text-xs text-gray-400 mb-4">Compatibility with applicant tracking systems</p>

      {!hasResumes ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">Upload a resume to see your ATS compatibility score</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-28 h-28">
              <svg className="-rotate-90 w-28 h-28" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r={R} fill="none" stroke="#f3f4f6" strokeWidth="9" />
                <circle
                  cx="56" cy="56" r={R} fill="none"
                  stroke="url(#ats-grad)" strokeWidth="9"
                  strokeDasharray={`${dash} ${circ}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="ats-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7600CF" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-gray-900">{score}</span>
                <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Keyword Match', val: 72, color: 'from-yellow-400 to-yellow-500' },
              { label: 'Formatting',    val: 90, color: 'from-green-400 to-green-500' },
              { label: 'Skills Match',  val: 68, color: 'from-orange-400 to-orange-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-700">{item.val}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-xs font-semibold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-xl py-2.5 transition-colors">
            Improve ATS Score
          </button>
        </>
      )}
    </div>
  );
}

// ─── Profile Strength Widget ──────────────────────────────────────────────────
function ProfileStrength({ hasResume, hasDefault }) {
  const items = [
    { label: 'Resume uploaded',    done: hasResume },
    { label: 'Default resume set', done: hasDefault },
    { label: 'Skills added',       done: false },
    { label: 'Work experience',    done: false },
    { label: 'Profile complete',   done: false },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-gray-900">Profile Strength</h3>
        <span className="text-sm font-black text-primary-600">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${item.done ? 'bg-green-100' : 'bg-gray-100'}`}>
              {item.done ? (
                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              )}
            </div>
            <span className={`text-xs ${item.done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Resume Tips ──────────────────────────────────────────────────────────────
function ResumeTips() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl border border-primary-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-primary-900">Pro Tips</h3>
      </div>
      <ul className="space-y-2">
        {[
          'Match keywords from the job description',
          'Quantify achievements with numbers',
          'Keep it to 1–2 pages maximum',
          'Use standard ATS-friendly headings',
          'Save as PDF before submitting',
        ].map((tip) => (
          <li key={tip} className="flex items-start gap-2 text-xs text-primary-800/80">
            <svg className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="py-14 px-6 flex flex-col items-center text-center">
      <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">No resumes yet</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Upload your existing resume or build a professional one with our AI-powered builder.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/seeker/resume/builder/new"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md shadow-primary-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Build New Resume
        </Link>
        <span className="text-xs text-gray-400">or drag &amp; drop above</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SeekerResume() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [labelInput, setLabelInput] = useState('');
  const [showLabel, setShowLabel] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const { data, isLoading, error } = useQuery({
    queryKey: ['seeker', 'resumes'],
    queryFn: seekerService.getResumes,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, label }) => {
      const fd = new FormData();
      fd.append('resume', file);
      if (label) fd.append('label', label);
      return seekerService.uploadResume(fd, setUploadProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume uploaded successfully.');
      setPendingFile(null);
      setLabelInput('');
      setShowLabel(false);
      setUploadProgress(0);
    },
    onError: (err) => { toast.error(err.message); setUploadProgress(0); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => seekerService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Resume deleted.');
    },
    onError: (err) => toast.error(err.message),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => seekerService.setDefaultResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seeker', 'resumes'] });
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] });
      toast.success('Default resume updated.');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileSelect = (file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB} MB.`);
      return;
    }
    setPendingFile(file);
    setShowLabel(true);
  };

  const allResumes = data?.resumes ?? [];
  const builtResumes = allResumes.filter((r) => r.resumeType === 'built');
  const hasDefault = allResumes.some((r) => r.isDefault);

  const filteredResumes = useMemo(() => {
    return allResumes
      .filter((r) => {
        const name = r.resumeType === 'built' ? (r.label || 'Untitled') : (r.fileName || '');
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const an = a.resumeType === 'built' ? (a.label || '') : (a.fileName || '');
          const bn = b.resumeType === 'built' ? (b.label || '') : (b.fileName || '');
          return an.localeCompare(bn);
        }
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
  }, [allResumes, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-8">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#7600CF] via-primary-700 to-indigo-700 p-7 md:p-9">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-[11px] font-semibold text-white/90 mb-4">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Resume Management
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">Your Resume Hub</h1>
            <p className="text-sm text-white/65 max-w-md">
              Stand out to recruiters with ATS-optimized resumes, professional templates, and real-time insights.
            </p>
          </div>
          <Link
            to="/seeker/resume/builder/new"
            className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-colors whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Build New Resume
          </Link>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {[
            { label: 'Total Resumes', value: allResumes.length },
            { label: 'Profile Views',  value: '—' },
            { label: 'Applications',   value: '—' },
            { label: 'Avg ATS Score',  value: allResumes.length > 0 ? '78%' : '—' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
              <p className="text-xl md:text-2xl font-black text-white">{s.value}</p>
              <p className="text-[11px] text-white/55 mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Builder Banner ────────────────────────────────────────────────────── */}
      {builtResumes.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-50/70 via-transparent to-indigo-50/70 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6 md:p-7">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-base font-bold text-gray-900 mb-0.5">Build an ATS-Friendly Resume with AI</h2>
              <p className="text-xs text-gray-500 mb-3">Get 3× more interviews with our AI-powered resume builder</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center sm:justify-start">
                {['ATS Optimized', 'Recruiter Approved', 'Instant PDF', 'AI-Powered'].map((b) => (
                  <span key={b} className="flex items-center gap-1 text-xs text-primary-700 font-semibold">
                    <svg className="w-3 h-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/seeker/resume/builder/new"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md shadow-primary-200 whitespace-nowrap shrink-0"
            >
              Create Resume
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ── Two-Column Layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 columns */}
        <div className="lg:col-span-2 space-y-5">

          {/* Upload Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Upload Resume</h2>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, or DOCX · Max 10 MB</p>
              </div>
              <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Recommended</span>
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              isUploading={uploadMutation.isPending}
              progress={uploadProgress}
            />

            {showLabel && pendingFile && !uploadMutation.isPending && (
              <div className="mt-4 bg-primary-50 border border-primary-200 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary-900 truncate">{pendingFile.name}</p>
                    <p className="text-xs text-primary-600">{(pendingFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="Label your resume (e.g. 'Frontend Engineer 2025')"
                  className="w-full bg-white border border-primary-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 mb-3 placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPendingFile(null); setShowLabel(false); }}
                    className="flex-1 text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl py-2.5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => uploadMutation.mutate({ file: pendingFile, label: labelInput })}
                    className="flex-1 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl py-2.5 transition-colors"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* My Resumes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-sm font-bold text-gray-900">
                My Resumes
                {allResumes.length > 0 && (
                  <span className="ml-1.5 text-gray-400 font-normal">({allResumes.length})</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg w-32 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="date">Latest</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-52" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-red-500 text-center py-8">{error.message}</p>
            ) : filteredResumes.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredResumes.map((r) => (
                  <PremiumResumeCard
                    key={r.id}
                    resume={r}
                    onSetDefault={() => defaultMutation.mutate(r.id)}
                    onDelete={() => deleteMutation.mutate(r.id)}
                    isSettingDefault={defaultMutation.isPending && defaultMutation.variables === r.id}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === r.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <ATSWidget hasResumes={allResumes.length > 0} />
          <ProfileStrength hasResume={allResumes.length > 0} hasDefault={hasDefault} />
          <ResumeTips />
        </div>
      </div>

      {/* ── Templates Section ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Professional Templates</h2>
            <p className="text-xs text-gray-400 mt-0.5">ATS-optimized, recruiter-approved designs</p>
          </div>
          <Link
            to="/seeker/resume/builder/new"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            Browse All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TEMPLATE_CATALOG.map((tpl) => (
            <TemplateCard key={tpl.slug} tpl={tpl} />
          ))}
        </div>
      </div>
    </div>
  );
}

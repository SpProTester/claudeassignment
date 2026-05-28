import { useState, useRef } from 'react';

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'expert'];

export default function SkillsInput({ skills = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [showProficiency, setShowProficiency] = useState(false);
  const inputRef = useRef(null);

  const removeSkill = (skillId) => {
    onChange(skills.filter((s) => s.id !== skillId));
  };

  const updateProficiency = (skillId, level) => {
    onChange(
      skills.map((s) =>
        s.id === skillId
          ? { ...s, SeekerSkill: { ...s.SeekerSkill, proficiencyLevel: level } }
          : s
      )
    );
  };

  const PROFICIENCY_COLOR = {
    beginner:     'bg-gray-100 text-gray-600',
    intermediate: 'bg-blue-100 text-blue-700',
    expert:       'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      {/* Existing skill tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((skill) => {
          const level = skill.SeekerSkill?.proficiencyLevel ?? 'intermediate';
          return (
            <div
              key={skill.id}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5"
            >
              <span className="text-sm font-medium text-gray-800">{skill.name}</span>
              <button
                type="button"
                onClick={() => {
                  const current = PROFICIENCY_LEVELS.indexOf(level);
                  const next = PROFICIENCY_LEVELS[(current + 1) % PROFICIENCY_LEVELS.length];
                  updateProficiency(skill.id, next);
                }}
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${PROFICIENCY_COLOR[level]}`}
                title="Click to cycle proficiency level"
              >
                {level}
              </button>
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {skills.length === 0 && (
          <p className="text-sm text-gray-400 italic">No skills added yet.</p>
        )}
      </div>

      {/* Add skill input */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type skill name and press Enter…"
          className="input-field flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              setShowProficiency(true);
            }
          }}
        />
      </div>

      {showProficiency && inputValue.trim() && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            Select proficiency for <strong>{inputValue.trim()}</strong>:
          </p>
          <div className="flex gap-2">
            {PROFICIENCY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  // Add a placeholder skill (no real ID until saved server-side via search)
                  const tempSkill = {
                    id: `temp-${Date.now()}`,
                    name: inputValue.trim(),
                    slug: inputValue.trim().toLowerCase().replace(/\s+/g, '-'),
                    SeekerSkill: { proficiencyLevel: level },
                    _isNew: true,
                  };
                  onChange([...skills, tempSkill]);
                  setInputValue('');
                  setShowProficiency(false);
                  inputRef.current?.focus();
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${PROFICIENCY_COLOR[level]} border-transparent hover:border-current`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        Click a skill&apos;s level badge to cycle between beginner → intermediate → expert.
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

const SALARY_DATA = [
  { title: 'Software Engineer',       min: 80000,  max: 160000, avg: 120000, category: 'Engineering' },
  { title: 'Product Manager',         min: 90000,  max: 170000, avg: 130000, category: 'Product' },
  { title: 'Data Scientist',          min: 85000,  max: 155000, avg: 118000, category: 'Data & Analytics' },
  { title: 'UI/UX Designer',          min: 65000,  max: 130000, avg: 95000,  category: 'Design' },
  { title: 'DevOps Engineer',         min: 90000,  max: 165000, avg: 127000, category: 'DevOps & Cloud' },
  { title: 'Marketing Manager',       min: 60000,  max: 120000, avg: 88000,  category: 'Marketing' },
  { title: 'Sales Manager',           min: 70000,  max: 140000, avg: 100000, category: 'Sales' },
  { title: 'HR Manager',              min: 55000,  max: 110000, avg: 78000,  category: 'Human Resources' },
  { title: 'Finance Analyst',         min: 65000,  max: 125000, avg: 90000,  category: 'Finance' },
  { title: 'Legal Counsel',           min: 95000,  max: 200000, avg: 145000, category: 'Legal' },
  { title: 'Customer Success Manager',min: 55000,  max: 100000, avg: 72000,  category: 'Customer Success' },
  { title: 'Operations Manager',      min: 70000,  max: 130000, avg: 95000,  category: 'Operations' },
];

const fmt = (n) => '$' + n.toLocaleString();

export default function SalaryTools() {
  const [search, setSearch] = useState('');

  const filtered = SALARY_DATA.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Salary Tools</h1>
          <p className="text-primary-200 text-lg mb-8">
            Research salaries across roles and industries. Know your worth before you negotiate.
          </p>
          <div className="relative max-w-xl mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by job title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-sm outline-none shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Salary table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Salary Ranges by Role</h2>
          <span className="text-sm text-gray-500">{filtered.length} roles found</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Job Title</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Category</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-700">Min</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-700">Avg</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-700">Max</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-primary-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">{fmt(row.min)}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary-600">{fmt(row.avg)}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{fmt(row.max)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/jobs?keyword=${encodeURIComponent(row.title)}`}
                      className="text-xs font-semibold text-primary-600 hover:underline whitespace-nowrap"
                    >
                      View Jobs →
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No results for "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Salary tip cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
          {[
            { icon: '💡', title: 'Know Your Worth', body: 'Research industry benchmarks before any salary discussion. Candidates who research earn 7–15% more on average.' },
            { icon: '📊', title: 'Factor in Benefits', body: 'Total compensation includes bonuses, equity, health, PTO, and remote flexibility — not just base salary.' },
            { icon: '🤝', title: 'Negotiate Confidently', body: 'Always negotiate. 85% of employers expect it. Start 10–20% above your target and let them meet you.' },
          ].map((card) => (
            <div key={card.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

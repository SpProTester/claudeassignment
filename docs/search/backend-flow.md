# Search — Backend Flow

---

## Search Query Builder

`server/src/controllers/job.search.controller.js`

```javascript
async function searchJobs(req, res, next) {
  const { q, location, job_type, work_mode, experience_level,
          salary_min, salary_max, category_id, sort, page, limit } = req.query;

  const where = {
    status: 'active',
    expires_at: { [Op.gt]: new Date() },
    deleted_at: null,
  };

  // Full-text search
  let order = [['published_at', 'DESC']];
  if (q) {
    where[Op.and] = [
      sequelize.literal(`search_vector @@ plainto_tsquery('english', ${sequelize.escape(q)})`)
    ];
    if (sort === 'relevance') {
      order = [
        [sequelize.literal(`ts_rank_cd(search_vector, plainto_tsquery('english', ${sequelize.escape(q)}))`), 'DESC'],
        ['published_at', 'DESC']
      ];
    }
  }

  // Structured filters
  if (job_type) where.job_type = job_type;
  if (work_mode) where.work_mode = work_mode;
  if (experience_level) where.experience_level = experience_level;
  if (category_id) where.category_id = category_id;
  if (salary_min) where.salary_max = { [Op.gte]: parseInt(salary_min) };
  if (salary_max) where.salary_min = { [Op.lte]: parseInt(salary_max) };
  if (location && location !== 'remote') {
    where[Op.or] = [
      { location_city: { [Op.iLike]: `%${location}%` } },
      { location_country: { [Op.iLike]: `%${location}%` } },
    ];
  }
  if (location === 'remote') where.work_mode = 'remote';

  // Sort
  if (sort === 'salary_asc') order = [['salary_min', 'ASC NULLS LAST']];
  if (sort === 'salary_desc') order = [['salary_max', 'DESC NULLS LAST']];
  if (sort === 'date') order = [['published_at', 'DESC']];

  const offset = (parseInt(page || 1) - 1) * parseInt(limit || 20);
  const { count, rows } = await JobListing.findAndCountAll({ where, order, limit, offset, include: [EmployerProfile, Skills] });

  // Log search async (non-blocking)
  SearchLog.create({ user_id: req.user?.userId, keywords: q, filters: req.query, result_count: count }).catch(() => {});

  res.json(buildPaginatedResponse(rows, count, page, limit));
}
```

---

## Autocomplete Handler

```javascript
async function autocomplete(req, res) {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ data: { suggestions: [] } });

  const [titles, skills] = await Promise.all([
    JobListing.findAll({
      attributes: [sequelize.fn('DISTINCT', sequelize.col('title')), 'title'],
      where: { title: { [Op.iLike]: `${q}%` }, status: 'active' },
      limit: 5,
    }),
    Skill.findAll({
      where: { name: { [Op.iLike]: `${q}%` } },
      limit: 5,
    }),
  ]);

  const suggestions = [
    ...titles.map(t => ({ type: 'title', value: t.title })),
    ...skills.map(s => ({ type: 'skill', value: s.name })),
  ];

  res.json({ data: { suggestions } });
}
```

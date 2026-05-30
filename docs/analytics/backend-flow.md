# Analytics — Backend Flow

---

## Job Stats Query

```javascript
// GET /api/employer/jobs/:id/stats
async function getJobStats(req, res, next) {
  const { id } = req.params;
  const userId = req.user.userId;

  const job = await JobListing.findOne({ where: { id, employer_id: employerProfile.id } });
  if (!job) throw new AppError('NOT_FOUND', 404, 'Job not found');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [stageBreakdown, dailyApps] = await Promise.all([
    Application.findAll({
      attributes: ['ats_stage', [sequelize.fn('COUNT', '*'), 'count']],
      where: { job_id: id },
      group: ['ats_stage'],
    }),
    Application.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count'],
      ],
      where: { job_id: id, created_at: { [Op.gte]: thirtyDaysAgo } },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
    }),
  ]);

  res.json({
    success: true,
    data: {
      views_count: job.views_count,
      applications_count: job.applications_count,
      applications_by_stage: formatStageBreakdown(stageBreakdown),
      daily_applications: dailyApps.map(r => ({ date: r.get('date'), count: parseInt(r.get('count')) })),
    },
  });
}
```

---

## Search Trends Query (Admin)

```javascript
async function getSearchTrends(req, res) {
  const { period = '7d' } = req.query;
  const days = { '7d': 7, '30d': 30, '90d': 90 }[period] || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [topKeywords, zeroResults] = await Promise.all([
    SearchLog.findAll({
      attributes: ['keywords', [sequelize.fn('COUNT', '*'), 'count']],
      where: { created_at: { [Op.gte]: since }, keywords: { [Op.ne]: null } },
      group: ['keywords'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
    }),
    SearchLog.findAll({
      attributes: ['keywords', [sequelize.fn('COUNT', '*'), 'count']],
      where: { created_at: { [Op.gte]: since }, result_count: 0 },
      group: ['keywords'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 10,
    }),
  ]);

  res.json({ data: { top_keywords: topKeywords, zero_result_keywords: zeroResults } });
}
```

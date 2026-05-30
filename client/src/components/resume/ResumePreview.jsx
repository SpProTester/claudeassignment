import { forwardRef, memo } from 'react';
import ModernTemplate    from './templates/ModernTemplate.jsx';
import CorporateTemplate from './templates/CorporateTemplate.jsx';
import MinimalTemplate   from './templates/MinimalTemplate.jsx';
import CreativeTemplate  from './templates/CreativeTemplate.jsx';
import ExecutiveTemplate from './templates/ExecutiveTemplate.jsx';

const TEMPLATES = {
  modern:    ModernTemplate,
  corporate: CorporateTemplate,
  minimal:   MinimalTemplate,
  creative:  CreativeTemplate,
  executive: ExecutiveTemplate,
};

const ResumePreview = forwardRef(function ResumePreview({ content, templateSlug, scale = 1 }, ref) {
  const Template = TEMPLATES[templateSlug] ?? ModernTemplate;

  return (
    <div
      ref={ref}
      style={{
        transform:       `scale(${scale})`,
        transformOrigin: 'top left',
        width:           '210mm',
        minHeight:       '297mm',
        boxShadow:       '0 4px 24px rgba(0,0,0,0.12)',
        background:      '#fff',
        overflow:        'hidden',
      }}
    >
      <Template content={content} />
    </div>
  );
});

export { TEMPLATES };
export default memo(ResumePreview);

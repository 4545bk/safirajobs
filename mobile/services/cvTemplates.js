/**
 * CV HTML Templates - 11 Lovable-style templates with rich detail
 */

import { mapToLovableFormat } from './cvDataMapper';

// Base styles optimized for thumbnail visibility
const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: white; font-size: 9px; line-height: 1.3; }
  .cv { width: 210mm; min-height: 297mm; background: white; display: flex; }
  .sidebar { width: 35%; padding: 15px; color: white; }
  .main { width: 65%; padding: 15px; background: white; }
  h1 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  h2 { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 700; border-bottom: 1px solid currentColor; padding-bottom: 3px; }
  p { font-size: 8px; line-height: 1.4; margin-bottom: 4px; }
  .section { margin-bottom: 12px; }
  ul { list-style: none; }
  li { font-size: 8px; margin-bottom: 2px; }
  .job-title { font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 1px; }
  .photo { width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 12px; border: 3px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); }
  .photo-icon { font-size: 30px; opacity: 0.6; }
  .skill-bar { height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin-top: 2px; overflow: hidden; }
  .skill-fill { height: 100%; border-radius: 2px; }
  .entry { margin-bottom: 8px; padding-left: 8px; border-left: 2px solid; }
  .entry-title { font-size: 9px; font-weight: 600; }
  .entry-sub { font-size: 8px; color: #666; }
  .entry-date { font-size: 7px; opacity: 0.7; }
  .tag { display: inline-block; padding: 2px 6px; margin: 2px; border-radius: 3px; font-size: 7px; }
`;

// Template 1: Classic Teal - Sidebar layout with teal gradient
function classicTeal(d) {
  return `<div class="cv">
    <div class="sidebar" style="background: linear-gradient(180deg, #0891B2 0%, #155E75 100%);">
      <div class="photo"><span class="photo-icon">👤</span></div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Contact</h3>
        <p>📧 ${d.personal.email}</p>
        <p>📱 ${d.personal.phone}</p>
        <p>📍 ${d.personal.location}</p>
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Skills</h3>
        ${d.skills.slice(0, 5).map(s => `<div style="margin-bottom:4px"><span style="font-size:8px">${s.name}</span><div class="skill-bar"><div class="skill-fill" style="width:${s.level}%;background:#67E8F9"></div></div></div>`).join('')}
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Languages</h3>
        ${d.languages.map(l => `<p>• ${l.name} - ${l.proficiency}</p>`).join('')}
      </div>
    </div>
    <div class="main">
      <div style="background: linear-gradient(90deg, #0891B2, #155E75); color: white; padding: 12px; margin: -15px -15px 12px -15px;">
        <h1>${d.personal.firstName} ${d.personal.lastName}</h1>
        <p class="job-title">${d.personal.jobTitle}</p>
      </div>
      <div class="section">
        <h3 style="color: #0891B2; border-color: #0891B2;">Summary</h3>
        <p style="color: #444;">${d.summary.text}</p>
      </div>
      <div class="section">
        <h3 style="color: #0891B2; border-color: #0891B2;">Experience</h3>
        ${d.experience.slice(0, 2).map(e => `<div class="entry" style="border-color: #0891B2;"><p class="entry-title">${e.position}</p><p class="entry-sub">${e.company}</p><p class="entry-date">${e.startDate} - ${e.endDate}</p></div>`).join('')}
      </div>
      <div class="section">
        <h3 style="color: #0891B2; border-color: #0891B2;">Education</h3>
        ${d.education.map(e => `<div class="entry" style="border-color: #0891B2;"><p class="entry-title">${e.institution}</p><p class="entry-sub">${e.degree}</p></div>`).join('')}
      </div>
    </div>
  </div>`;
}

// Template 2: Modern Amber - Dark sidebar with amber accents
function modernAmber(d) {
  return `<div class="cv">
    <div class="sidebar" style="background: #1F2937;">
      <div style="background: #F59E0B; margin: -15px -15px 15px -15px; padding: 15px; text-align: center;">
        <div class="photo" style="border-color: white;"><span class="photo-icon">👤</span></div>
      </div>
      <div class="section">
        <h3 style="color: #F59E0B; border-color: #F59E0B;">Contact</h3>
        <p>📧 ${d.personal.email}</p>
        <p>📱 ${d.personal.phone}</p>
        <p>📍 ${d.personal.location}</p>
      </div>
      <div class="section">
        <h3 style="color: #F59E0B; border-color: #F59E0B;">Education</h3>
        ${d.education.map(e => `<p style="font-size:8px;color:#fff">${e.institution}</p><p style="font-size:7px;color:#9CA3AF">${e.degree}</p>`).join('')}
      </div>
    </div>
    <div class="main">
      <div style="background: #F59E0B; padding: 15px; margin: -15px -15px 12px -15px;">
        <h1 style="color: #1F2937;">${d.personal.firstName} ${d.personal.lastName}</h1>
        <p class="job-title" style="color: #374151;">${d.personal.jobTitle}</p>
      </div>
      <div class="section">
        <h3 style="color: #1F2937;">About Me</h3>
        <p style="color: #4B5563; font-style: italic;">${d.summary.text}</p>
      </div>
      <div class="section">
        <h3 style="color: #1F2937;">Experience</h3>
        ${d.experience.slice(0, 2).map(e => `<div class="entry" style="border-color: #F59E0B;"><p class="entry-title">${e.company}</p><p class="entry-sub">${e.position}</p><p class="entry-date">${e.startDate} - ${e.endDate}</p></div>`).join('')}
      </div>
      <div class="section">
        <h3 style="color: #1F2937;">Skills</h3>
        <div style="display: flex; flex-wrap: wrap;">${d.skills.slice(0, 6).map(s => `<span class="tag" style="background: #FEF3C7; color: #92400E;">${s.name}</span>`).join('')}</div>
      </div>
    </div>
  </div>`;
}

// Template 3: Professional Navy - Navy sidebar with cyan timeline
function professionalNavy(d) {
  return `<div class="cv">
    <div class="sidebar" style="background: #1E3A5F;">
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="width: 60px; height: 75px; background: #E5E7EB; margin: 0 auto; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center;"><span style="font-size: 28px; color: #9CA3AF;">👤</span></div>
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Contact</h3>
        <p>✉ ${d.personal.email}</p>
        <p>📱 ${d.personal.phone}</p>
        <p>📍 ${d.personal.location}</p>
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Skills</h3>
        ${d.skills.slice(0, 4).map(s => `<div style="margin-bottom:5px"><span style="font-size:8px">${s.name}</span><div style="display:flex;gap:2px;margin-top:2px">${[1, 2, 3, 4, 5].map(i => `<div style="width:6px;height:6px;border-radius:50%;background:${i <= Math.round(s.level / 20) ? '#22D3EE' : 'rgba(255,255,255,0.2)'}"></div>`).join('')}</div></div>`).join('')}
      </div>
    </div>
    <div class="main">
      <h1 style="color: #1E3A5F;">${d.personal.firstName} ${d.personal.lastName}</h1>
      <p class="job-title" style="color: #22D3EE;">${d.personal.jobTitle}</p>
      <div class="section" style="margin-top: 12px;">
        <div style="background: #22D3EE; color: white; padding: 3px 10px; display: inline-block; font-size: 9px; font-weight: 600;">ABOUT ME</div>
        <p style="color: #4B5563; margin-top: 6px;">${d.summary.text}</p>
      </div>
      <div class="section">
        <div style="background: #22D3EE; color: white; padding: 3px 10px; display: inline-block; font-size: 9px; font-weight: 600;">EXPERIENCE</div>
        <div style="border-left: 2px solid #22D3EE; margin-left: 6px; padding-left: 10px; margin-top: 6px;">
          ${d.experience.slice(0, 2).map(e => `<div style="position: relative; margin-bottom: 8px;"><div style="position: absolute; left: -14px; top: 2px; width: 8px; height: 8px; border-radius: 50%; background: #22D3EE;"></div><p class="entry-title">${e.company}</p><p class="entry-sub">${e.position}</p></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// Template 4: Clean Minimal - Simple white ATS-friendly
function cleanMinimal(d) {
  return `<div class="cv" style="flex-direction: column; padding: 20px;">
    <div style="text-align: center; border-bottom: 2px solid #374151; padding-bottom: 12px; margin-bottom: 12px;">
      <h1 style="font-size: 22px; color: #111827;">${d.personal.firstName} ${d.personal.lastName}</h1>
      <p style="color: #6B7280; font-size: 9px;">${d.personal.location} • ${d.personal.phone} • ${d.personal.email}</p>
    </div>
    <div class="section">
      <h3 style="color: #374151; border-color: #D1D5DB;">Summary</h3>
      <p style="color: #4B5563; text-align: justify;">${d.summary.text}</p>
    </div>
    <div class="section">
      <h3 style="color: #374151; border-color: #D1D5DB;">Work Experience</h3>
      ${d.experience.slice(0, 2).map(e => `<div style="margin-bottom: 8px;"><div style="display: flex; justify-content: space-between;"><span class="entry-title">${e.company}</span><span class="entry-date">${e.startDate} - ${e.endDate}</span></div><p class="entry-sub">${e.position}</p></div>`).join('')}
    </div>
    <div class="section">
      <h3 style="color: #374151; border-color: #D1D5DB;">Education</h3>
      ${d.education.map(e => `<div style="margin-bottom: 6px;"><span class="entry-title">${e.degree}</span><p class="entry-sub">${e.institution}</p></div>`).join('')}
    </div>
    <div class="section">
      <h3 style="color: #374151; border-color: #D1D5DB;">Skills & Languages</h3>
      <p style="color: #4B5563;"><strong>Skills:</strong> ${d.skills.slice(0, 5).map(s => s.name).join(', ')}</p>
      <p style="color: #4B5563;"><strong>Languages:</strong> ${d.languages.map(l => l.name).join(', ')}</p>
    </div>
  </div>`;
}

// Template 5: Elegant Gray - Sophisticated gray
function elegantGray(d) {
  return `<div class="cv">
    <div class="sidebar" style="background: #4B5563;">
      <div class="photo"><span class="photo-icon">👤</span></div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Contact</h3>
        <p>${d.personal.email}</p>
        <p>${d.personal.phone}</p>
        <p>${d.personal.location}</p>
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Skills</h3>
        ${d.skills.slice(0, 5).map(s => `<p>• ${s.name}</p>`).join('')}
      </div>
      <div class="section">
        <h3 style="border-color: rgba(255,255,255,0.3);">Languages</h3>
        ${d.languages.map(l => `<p>${l.name}</p>`).join('')}
      </div>
    </div>
    <div class="main">
      <h1 style="color: #374151;">${d.personal.firstName} ${d.personal.lastName}</h1>
      <p class="job-title" style="color: #6B7280;">${d.personal.jobTitle}</p>
      <div class="section" style="margin-top: 12px;">
        <h3 style="color: #4B5563; border-color: #9CA3AF;">Profile</h3>
        <p style="color: #4B5563;">${d.summary.text}</p>
      </div>
      <div class="section">
        <h3 style="color: #4B5563; border-color: #9CA3AF;">Experience</h3>
        ${d.experience.slice(0, 2).map(e => `<div class="entry" style="border-color: #9CA3AF;"><p class="entry-title">${e.position}</p><p class="entry-sub">${e.company} | ${e.startDate} - ${e.endDate}</p></div>`).join('')}
      </div>
      <div class="section">
        <h3 style="color: #4B5563; border-color: #9CA3AF;">Education</h3>
        ${d.education.map(e => `<p class="entry-title">${e.degree} - ${e.institution}</p>`).join('')}
      </div>
    </div>
  </div>`;
}

// Template 6: Creative Split - Deep navy split
function creativeSplit(d) {
  return classicTeal(d).replace(/#0891B2/g, '#1E40AF').replace(/#155E75/g, '#1E3A8A').replace(/#67E8F9/g, '#93C5FD');
}

// Template 7: Minimal Red - Clean with red accents
function minimalRed(d) {
  return cleanMinimal(d).replace(/#374151/g, '#DC2626').replace(/#D1D5DB/g, '#FCA5A5');
}

// Template 8: Modern Sections - Gray backgrounds
function modernSections(d) {
  return cleanMinimal(d).replace(/border-bottom: 1px solid currentColor; padding-bottom: 3px;/g, 'background: #F3F4F6; padding: 4px 8px; border: none;');
}

// Template 9: Pink Creative - Pink accent
function pinkCreative(d) {
  return classicTeal(d).replace(/#0891B2/g, '#EC4899').replace(/#155E75/g, '#BE185D').replace(/#67E8F9/g, '#F9A8D4');
}

// Template 10: Teal Sidebar - Muted teal
function tealSidebar(d) {
  return classicTeal(d).replace(/#0891B2/g, '#0D9488').replace(/#155E75/g, '#115E59').replace(/#67E8F9/g, '#5EEAD4');
}

// Template 11: Blue Header - Blue theme
function blueHeader(d) {
  return modernAmber(d).replace(/#F59E0B/g, '#3B82F6').replace(/#FEF3C7/g, '#DBEAFE').replace(/#92400E/g, '#1E40AF').replace(/#1F2937/g, '#1E3A5F');
}

// Template registry
const templates = {
  'classic-teal': { name: 'Classic Teal', render: classicTeal },
  'modern-amber': { name: 'Modern Amber', render: modernAmber },
  'professional-navy': { name: 'Professional Navy', render: professionalNavy },
  'clean-minimal': { name: 'Clean Minimal', render: cleanMinimal },
  'elegant-gray': { name: 'Elegant Gray', render: elegantGray },
  'creative-split': { name: 'Creative Split', render: creativeSplit },
  'minimal-red': { name: 'Minimal Red', render: minimalRed },
  'modern-sections': { name: 'Modern Sections', render: modernSections },
  'pink-creative': { name: 'Pink Creative', render: pinkCreative },
  'teal-sidebar': { name: 'Teal Sidebar', render: tealSidebar },
  'blue-header': { name: 'Blue Header', render: blueHeader },
};

export function getTemplateList() {
  return Object.entries(templates).map(([id, t]) => ({ id, name: t.name }));
}

export function generateTemplateHTML(cvData, templateId = 'classic-teal') {
  const data = mapToLovableFormat(cvData);
  if (!data) return '<html><body><p>No CV data</p></body></html>';

  const template = templates[templateId] || templates['classic-teal'];

  return `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${baseStyles}</style>
</head><body>${template.render(data)}</body></html>`;
}

export default { generateTemplateHTML, getTemplateList };

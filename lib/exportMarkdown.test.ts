import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  assessmentToMarkdown,
  buildExportFilename,
  downloadMarkdown,
  type ExportableAssessment,
} from './exportMarkdown';

// Minimal fixture matching the fields exportMarkdown.ts actually reads.
// Cast bypasses strict typing against your real AssessmentResult/UserAssessmentData
// interfaces so the test doesn't need every field those types define.
const fixture = {
  githubData: {
    username: 'octocat',
    name: 'The Octocat',
    bio: 'I build things.\nSometimes badly.',
    publicRepos: 42,
    followers: 100,
    totalStars: 500,
    totalPrs: 12,
    createdAt: `${new Date().getFullYear() - 3}-01-01T00:00:00Z`,
    blog: 'example.com',
    linkedinUrl: 'https://linkedin.com/in/octocat',
  },
  assessment: {
    summary: 'Solid generalist with a few gaps.',
    hirabilityScore: 62, // should normalize to 6.2/10
    hirabilityRoles: ['Backend Engineer'],
    notSuitedRoles: [],
    tags: ['typescript', 'react'],
    timeline: [{ year: '2023', title: 'Started', description: 'First real repo' }],
    growthMeter: 70,
    swot: { strengths: ['Consistent commits'], weaknesses: [], opportunities: [], threats: [] },
    metrics: { creativity: 80, potential: 75, aiUsage: 40, security: 60, professionalism: 90, codeQuality: 70 },
    weaknessMetrics: { buzzwordDensity: 10, aiSlop: 5, lackOfDocs: 20, inconsistency: 15, arrogance: 5, poorArchitecture: 10 },
    repoAssessments: [],
  },
} as unknown as ExportableAssessment;

describe('assessmentToMarkdown', () => {
  it('includes the username and mode label', () => {
    const md = assessmentToMarkdown(fixture, 'employer');
    expect(md).toContain('@octocat');
    expect(md).toContain('Employer Mode');
  });

  it('normalizes a 0-100 hirability score to a 0-10 scale', () => {
    const md = assessmentToMarkdown(fixture, 'employer');
    expect(md).toContain('**Score:** 6.2 / 10');
  });

  it('does not normalize a score already on a 0-10 scale', () => {
    const md = assessmentToMarkdown(
      { ...fixture, assessment: { ...fixture.assessment, hirabilityScore: 8.5 } } as ExportableAssessment,
      'employer'
    );
    expect(md).toContain('**Score:** 8.5 / 10');
  });

  it('falls back to "_None noted._" for empty list sections', () => {
    const md = assessmentToMarkdown(fixture, 'employer');
    expect(md).toContain('_None noted._'); // from empty notSuitedRoles/weaknesses/etc.
  });

  it('collapses embedded newlines in free text (bio, summary)', () => {
    const md = assessmentToMarkdown(fixture, 'employer');
    expect(md).toContain('> I build things. Sometimes badly.');
  });

  it('omits the mentorship plan section in employer mode', () => {
    const md = assessmentToMarkdown(
      { ...fixture, assessment: { ...fixture.assessment, mentorshipPlan: 'Learn testing!' } } as ExportableAssessment,
      'employer'
    );
    expect(md).not.toContain('Mentorship & Upgrade Plan');
  });

  it('includes the mentorship plan section in developer mode', () => {
    const md = assessmentToMarkdown(
      { ...fixture, assessment: { ...fixture.assessment, mentorshipPlan: 'Learn testing!' } } as ExportableAssessment,
      'developer'
    );
    expect(md).toContain('## Mentorship & Upgrade Plan');
    expect(md).toContain('Learn testing!');
  });
});

describe('buildExportFilename', () => {
  it('builds a predictable, safe filename', () => {
    expect(buildExportFilename('octocat', 'employer')).toBe('gitdeep-octocat-employer-report.md');
  });

  it('strips unsafe characters from the username', () => {
    expect(buildExportFilename('oct@cat!/../', 'developer')).toBe('gitdeep-octcat-developer-report.md');
  });

  it('falls back to "user" if the sanitized username is empty', () => {
    expect(buildExportFilename('!!!', 'employer')).toBe('gitdeep-user-employer-report.md');
  });
});

describe('downloadMarkdown', () => {
  beforeEach(() => {
    // jsdom doesn't implement these, so we stub them to verify the download flow.
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

 it('creates and clicks a download link, then cleans up the object URL', () => {
  const anchor = document.createElement('a');
  const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => {});

  vi.spyOn(document, 'createElement').mockReturnValue(anchor);

  downloadMarkdown('report.md', '# Hello');

  expect(clickSpy).toHaveBeenCalledTimes(1);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
});
});
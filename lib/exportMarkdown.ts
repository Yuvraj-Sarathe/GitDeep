import { AssessmentMode, AssessmentResult } from './ai';
import { UserAssessmentData } from './github';

/**
 * Bundle of everything assessmentToMarkdown needs to render a full report.
 * Kept as one object (rather than spreading fields across many args) so the
 * call site stays stable as AssessmentResult / UserAssessmentData evolve.
 */
export interface ExportableAssessment {
  githubData: UserAssessmentData;
  assessment: AssessmentResult;
}

const NOT_NOTED = '_None noted._';

/** Collapses embedded newlines/whitespace so free-text never breaks a Markdown list item. */
function sanitizeLine(text: string | undefined | null): string {
  return (text ?? '').replace(/\r?\n+/g, ' ').trim();
}

/** Renders a `- item` bullet list, or a fallback line when the array is empty. */
function mdList(items: string[] | undefined | null): string {
  const clean = (items ?? []).map(sanitizeLine).filter(Boolean);
  if (clean.length === 0) return NOT_NOTED;
  return clean.map((item) => `- ${item}`).join('\n');
}

/** Renders inline code chips, e.g. for detected buzzwords / tech stack tags. */
function mdChips(items: string[] | undefined | null): string {
  const clean = (items ?? []).map(sanitizeLine).filter(Boolean);
  if (clean.length === 0) return NOT_NOTED;
  return clean.map((item) => `\`${item}\``).join(', ');
}

/**
 * Some AI providers return hirability-style scores on a 0-100 scale instead of
 * 0-10. The assessment page normalizes this the same way (see app/assessment/page.tsx)
 * so the exported report matches what's on screen instead of showing e.g. "62/10".
 */
function normalizeToTen(score: number): number {
  if (typeof score !== 'number' || Number.isNaN(score)) return 0;
  return score > 10 ? score / 10 : score;
}

function formatAccountAge(createdAt: string): string {
  const years = Math.max(0, new Date().getFullYear() - new Date(createdAt).getFullYear());
  return `${years} year${years === 1 ? '' : 's'}`;
}

/**
 * Serializes an AssessmentResult (plus the GitHub profile it was generated from)
 * into a clean, self-contained Markdown report. Pure function: no DOM/Blob access,
 * so it can be unit tested with plain fixture objects.
 */
export function assessmentToMarkdown(data: ExportableAssessment, mode: AssessmentMode): string {
  const { githubData: g, assessment: a } = data;
  const displayName = g.name || g.username;
  const generatedAt = new Date().toLocaleString();
  const modeLabel = mode === 'employer' ? 'Employer Mode' : 'Developer Mode';

  const sections: string[] = [];

  // --- Header -------------------------------------------------------------
  sections.push(`# GitDeep Assessment Report: ${displayName}`);
  sections.push(
    [
      `**GitHub:** [@${g.username}](https://github.com/${g.username})`,
      `**Mode:** ${modeLabel}`,
      `**Generated:** ${generatedAt}`,
    ].join('  \n')
  );

  if (g.bio) {
    sections.push(`> ${sanitizeLine(g.bio)}`);
  }

  sections.push(
    [
      '| Public Repos | Followers | Total Stars | Total PRs | Account Age |',
      '|---|---|---|---|---|',
      `| ${g.publicRepos} | ${g.followers} | ${g.totalStars} | ${g.totalPrs} | ${formatAccountAge(g.createdAt)} |`,
    ].join('\n')
  );

  const links: string[] = [];
  if (g.blog) links.push(`[Website](${g.blog.startsWith('http') ? g.blog : `https://${g.blog}`})`);
  if (g.linkedinUrl) links.push(`[LinkedIn](${g.linkedinUrl})`);
  if (g.leetcodeUrl) links.push(`[LeetCode](${g.leetcodeUrl})`);
  if (g.instagramUrl) links.push(`[Instagram](${g.instagramUrl})`);
  if (g.twitterUsername) links.push(`[Twitter](https://twitter.com/${g.twitterUsername})`);
  if (links.length > 0) sections.push(links.join(' · '));

  // --- Executive Summary ----------------------------------------------------
  sections.push(['## Executive Summary', sanitizeLine(a.summary) || NOT_NOTED].join('\n\n'));

  // --- Hirability -------------------------------------------------------
  sections.push(
    [
      '## Hirability Verdict',
      `**Score:** ${normalizeToTen(a.hirabilityScore).toFixed(1)} / 10`,
      '',
      '**Suited Roles**',
      mdList(a.hirabilityRoles),
      '',
      '**Not Suited For**',
      mdList(a.notSuitedRoles),
      '',
      '**Developer Tags**',
      mdChips(a.tags),
    ].join('\n')
  );

  // --- Career Timeline ----------------------------------------------------
  if (a.timeline && a.timeline.length > 0) {
    const timelineLines = a.timeline.map(
      (phase) => `- **${sanitizeLine(phase.year)} — ${sanitizeLine(phase.title)}:** ${sanitizeLine(phase.description)}`
    );
    sections.push(
      ['## Career Timeline', `**Growth Potential:** ${a.growthMeter}%`, '', timelineLines.join('\n')].join('\n')
    );
  }

  // --- SWOT -----------------------------------------------------------------
  sections.push(
    [
      '## SWOT Analysis',
      '### Strengths',
      mdList(a.swot.strengths),
      '',
      '### Weaknesses',
      mdList(a.swot.weaknesses),
      '',
      '### Opportunities',
      mdList(a.swot.opportunities),
      '',
      '### Threats',
      mdList(a.swot.threats),
    ].join('\n')
  );

  // --- Metrics ----------------------------------------------------------
  sections.push(
    [
      '## Metrics',
      '### Strength Signals',
      '| Metric | Score |',
      '|---|---|',
      `| Creativity | ${a.metrics.creativity}/100 |`,
      `| Potential | ${a.metrics.potential}/100 |`,
      `| AI Usage | ${a.metrics.aiUsage}/100 |`,
      `| Security | ${a.metrics.security}/100 |`,
      `| Professionalism | ${a.metrics.professionalism}/100 |`,
      `| Code Quality | ${a.metrics.codeQuality}/100 |`,
      '',
      '### Weakness Signals',
      '| Signal | Score |',
      '|---|---|',
      `| Buzzword Density | ${a.weaknessMetrics.buzzwordDensity}/100 |`,
      `| AI Slop | ${a.weaknessMetrics.aiSlop}/100 |`,
      `| Lack of Docs | ${a.weaknessMetrics.lackOfDocs}/100 |`,
      `| Inconsistency | ${a.weaknessMetrics.inconsistency}/100 |`,
      `| Arrogance | ${a.weaknessMetrics.arrogance}/100 |`,
      `| Poor Architecture | ${a.weaknessMetrics.poorArchitecture}/100 |`,
    ].join('\n')
  );

  // --- Advanced AI Insights -----------------------------------------------
  if (a.slopeAnalysis || a.buzzwordAnalysis || a.behavioralAnalysis) {
    const insightBlocks: string[] = ['## Advanced AI Insights'];

    if (a.slopeAnalysis) {
      insightBlocks.push(
        [
          '### Career Slope Detection',
          `- **Trajectory:** ${sanitizeLine(a.slopeAnalysis.slopeTrajectory)}`,
          `- **Consistency:** ${sanitizeLine(a.slopeAnalysis.consistencyRating)}`,
          `- **Burnout Risk:** ${sanitizeLine(a.slopeAnalysis.burnoutRisk)}`,
          '',
          sanitizeLine(a.slopeAnalysis.analysisSummary),
        ].join('\n')
      );
    }

    if (a.buzzwordAnalysis) {
      insightBlocks.push(
        [
          '### Buzzword vs Reality',
          `- **Verdict:** ${sanitizeLine(a.buzzwordAnalysis.verdict)}`,
          `- **Buzzword-to-Reality Ratio:** ${a.buzzwordAnalysis.buzzwordToRealityRatio.toFixed(1)}/10`,
          `- **Detected Buzzwords:** ${mdChips(a.buzzwordAnalysis.buzzwordsDetected)}`,
          `- **Actual Tech Stack:** ${mdChips(a.buzzwordAnalysis.actualTechStack)}`,
          '',
          a.buzzwordAnalysis.roastOrPraise ? `> ${sanitizeLine(a.buzzwordAnalysis.roastOrPraise)}` : '',
        ]
          .filter(Boolean)
          .join('\n')
      );
    }

    if (a.behavioralAnalysis) {
      insightBlocks.push(
        [
          '### Arrogance vs Confidence',
          `- **Confidence:** ${a.behavioralAnalysis.confidenceScore}/10`,
          `- **Arrogance:** ${a.behavioralAnalysis.arroganceScore}/10`,
          `- **Archetype:** ${sanitizeLine(a.behavioralAnalysis.primaryArchetype)}`,
          '',
          sanitizeLine(a.behavioralAnalysis.vibeCheck),
          '',
          '**Behavioral Flags**',
          mdList(a.behavioralAnalysis.behavioralFlags),
        ].join('\n')
      );
    }

    sections.push(insightBlocks.join('\n\n'));
  }

  // --- Per-Repo Assessment --------------------------------------------------
  if (a.repoAssessments && a.repoAssessments.length > 0) {
    const repoBlocks = a.repoAssessments.map((repo) => {
      const lines = [
        `### ${sanitizeLine(repo.repoName) || 'Untitled repo'}`,
        `[View on GitHub](https://github.com/${g.username}/${repo.repoName})`,
        '',
        `**Score:** ${(repo.repoScore ?? 0).toFixed(1)}/10 · **Verdict:** ${sanitizeLine(repo.repoVerdict) || 'N/A'}`,
        '',
        sanitizeLine(repo.repoAnalysis) || NOT_NOTED,
      ];

      if (repo.keyHighlights && repo.keyHighlights.length > 0) {
        lines.push('', '**Key Highlights**', mdList(repo.keyHighlights));
      }
      if (repo.redFlags && repo.redFlags.length > 0) {
        lines.push('', '**Red Flags**', mdList(repo.redFlags));
      }

      return lines.join('\n');
    });

    sections.push(['## Per-Repo Assessment', repoBlocks.join('\n\n')].join('\n\n'));
  }

  // --- Detailed Assessment Output ------------------------------------------
  if (a.detailedReport) {
    sections.push(['## Detailed Assessment Output', a.detailedReport.replace(/\\n/g, '\n\n')].join('\n\n'));
  }

  // --- Mentorship Plan (developer mode only) -------------------------------
  if (mode === 'developer' && a.mentorshipPlan) {
    sections.push(['## Mentorship & Upgrade Plan', a.mentorshipPlan].join('\n\n'));
  }

  // --- Footer ---------------------------------------------------------------
  sections.push('---\n\n_Generated by [GitDeep](https://github.com/Yuvraj-Sarathe/GitDeep). AI-generated assessment — verify before relying on it for hiring decisions._');

  return sections.join('\n\n').trim() + '\n';
}

/** Builds a stable, filesystem-safe filename for a report download. */
export function buildExportFilename(username: string, mode: AssessmentMode): string {
  const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
  return `gitdeep-${safeUsername}-${mode}-report.md`;
}

/**
 * Triggers a client-side download of the given text content. No server round-trip,
 * consistent with GitDeep's 100%-client-side architecture.
 */
export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

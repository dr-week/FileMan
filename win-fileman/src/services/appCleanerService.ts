import {
  AppDataAuditResult,
  CleanerCategory,
  CleanerItem,
  CleanerSummary,
  SafetyTier,
} from './appCleanerTypes';
import { SAMPLE_AUDIT_ITEMS } from './appCleanerSamples';
import { isDesktopRuntime, scanAppDataCandidates } from './fileSystemApi';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function runAppDataAudit(): Promise<AppDataAuditResult> {
  if (!isDesktopRuntime()) {
    return {
      items: SAMPLE_AUDIT_ITEMS.map(item => ({ ...item })),
      source: 'sample',
      durationMs: 0,
      installedAppCount: 0,
      skippedCount: 0,
    };
  }

  const report = await scanAppDataCandidates();
  const items: CleanerItem[] = report.findings.map(finding => {
    const safety = (finding.safety as SafetyTier) || 'caution';
    return {
      id: finding.id,
      name: finding.name,
      category: (finding.category as CleanerCategory) || 'temp',
      safety,
      path: finding.path,
      sizeBytes: finding.sizeBytes,
      sizeFormatted: formatBytes(finding.sizeBytes),
      fileCount: finding.fileCount,
      lastModified: finding.lastModified,
      description: finding.description,
      recommendation: finding.recommendation,
      evidence: finding.evidence,
      selected: safety === 'safe',
    };
  });

  return {
    items,
    source: 'live-scan',
    durationMs: report.durationMs,
    installedAppCount: report.installedAppCount,
    skippedCount: report.skippedCount,
  };
}

export function calculateSummary(items: CleanerItem[]): CleanerSummary {
  const activeItems = items.filter(item => !item.quarantined);
  let totalBytes = 0;
  let safeBytes = 0;
  let cautionBytes = 0;
  let selectedBytes = 0;
  let selectedCount = 0;

  for (const item of activeItems) {
    totalBytes += item.sizeBytes;
    if (item.safety === 'safe') safeBytes += item.sizeBytes;
    else if (item.safety === 'caution') cautionBytes += item.sizeBytes;
    if (item.selected && item.safety !== 'protected') {
      selectedBytes += item.sizeBytes;
      selectedCount += 1;
    }
  }

  return {
    totalBytes,
    totalFormatted: formatBytes(totalBytes),
    safeBytes,
    safeFormatted: formatBytes(safeBytes),
    cautionBytes,
    cautionFormatted: formatBytes(cautionBytes),
    itemCount: activeItems.length,
    selectedBytes,
    selectedFormatted: formatBytes(selectedBytes),
    selectedCount,
  };
}

export function buildCategoryBreakdown(items: CleanerItem[], totalBytes: number) {
  const map = new Map<string, { bytes: number; count: number }>();
  for (const item of items.filter(entry => !entry.quarantined)) {
    const prev = map.get(item.category) ?? { bytes: 0, count: 0 };
    map.set(item.category, { bytes: prev.bytes + item.sizeBytes, count: prev.count + 1 });
  }
  return Array.from(map.entries())
    .map(([category, stats]) => ({
      category,
      totalFormatted: formatBytes(stats.bytes),
      itemCount: stats.count,
      share: totalBytes > 0 ? Math.round((stats.bytes / totalBytes) * 100) : 0,
    }))
    .sort((a, b) => b.share - a.share);
}

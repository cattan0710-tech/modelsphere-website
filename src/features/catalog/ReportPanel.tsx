import { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory, useLocation } from '@docusaurus/router';
import React, { useEffect, useRef, useState } from 'react';
import { type Recipe } from './data';
import {
  availableReportTunings,
  loadReportDocument,
  localizeReportDocument,
  selectReportTuning,
  type ReportDocument,
} from './report';
import styles from './styles.module.css';
import reportStyles from './ReportPanel.module.css';
export default function ReportPanel({
  r,
  commit,
  active = true,
}: {
  r: Recipe;
  commit: string;
  active?: boolean;
}) {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const location = useLocation();
  const history = useHistory();
  const requestedReport = new URLSearchParams(location.search).get('report');
  const tuning = selectReportTuning(r, requestedReport);
  const tunings = availableReportTunings(r);
  const english = currentLocale === 'en';
  const [data, setData] = useState<ReportDocument | null>(null),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0),
    [fullscreen, setFullscreen] = useState(false),
    [fullscreenError, setFullscreenError] = useState('');
  const reportSection = useRef<HTMLElement>(null);
  const reportTitle = useRef<HTMLHeadingElement>(null);
  const reportFrame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!active || location.hash !== '#benchmark-title') return;
    // Wait until the performance tab is visible before moving focus and scroll.
    const frame = requestAnimationFrame(() => {
      reportTitle.current?.focus({ preventScroll: true });
      reportSection.current?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [active, location.key, location.hash]);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let wasFullscreen = false;
    const syncFullscreen = () => {
      const frame = reportFrame.current;
      const active = !!frame && document.fullscreenElement === frame;
      setFullscreen(active);
      if (
        wasFullscreen &&
        !active &&
        !fullscreenButton.current?.closest('[hidden]')
      )
        fullscreenButton.current?.focus({ preventScroll: true });
      wasFullscreen = active;
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () =>
      document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);
  useEffect(() => {
    if (
      !active &&
      reportFrame.current &&
      document.fullscreenElement === reportFrame.current
    )
      void document.exitFullscreen().catch(() => {});
  }, [active, fullscreen]);
  async function toggleFullscreen() {
    setFullscreenError('');
    try {
      if (!reportFrame.current) return;
      if (document.fullscreenElement === reportFrame.current)
        await document.exitFullscreen();
      else if (reportFrame.current?.requestFullscreen)
        await reportFrame.current.requestFullscreen();
      else throw new Error('Fullscreen unavailable');
    } catch {
      setFullscreenError(
        translate({
          id: 'catalog.report.fullscreenUnavailable',
          message: english
            ? 'Full screen is unavailable. Please read the report below.'
            : '暂时无法全屏观看，请在下方阅读报告。',
        }),
      );
    }
  }

  useEffect(() => {
    const c = new AbortController();
    setData(null);
    setError('');
    loadReportDocument(r, commit, c.signal, requestedReport)
      .then((x) => {
        if (!c.signal.aborted)
          setData(localizeReportDocument(x, currentLocale));
      })
      .catch(() => {
        if (!c.signal.aborted)
          setError(
            translate({
              id: 'catalog.report.loadFailed',
              message: english
                ? 'The report could not be loaded. Please retry.'
                : '报告数据加载失败，请重试。',
            }),
          );
      });
    return () => c.abort();
  }, [r.key, commit, retry, currentLocale, requestedReport]);
  return (
    <section
      ref={reportSection}
      id="benchmark"
      className={styles.report}
      aria-labelledby="benchmark-title"
    >
      <div className={styles.reportHeader}>
        <div>
          <span className={styles.kicker}>PERFORMANCE REPORT</span>
          <h2 ref={reportTitle} id="benchmark-title" tabIndex={-1}>
            {translate({ id: 'site.97a3583c6b16', message: '基线与调优对照' })}
          </h2>
          <p>
            {tuning?.baseline} → {tuning?.optimized}
          </p>
          {tunings.length > 1 && (
            <div className={reportStyles.reportPicker}>
              <label htmlFor="benchmark-report-select">
                {translate({
                  id: 'catalog.report.chooseComparison',
                  message: english ? 'Performance report' : '性能报告',
                })}
              </label>
              <select
                id="benchmark-report-select"
                value={tuning?.report ?? ''}
                onChange={(event) => {
                  const params = new URLSearchParams(location.search);
                  params.set('report', event.currentTarget.value);
                  history.replace({
                    ...location,
                    search: '?' + params.toString(),
                  });
                }}
              >
                {!tuning && (
                  <option value="" disabled>
                    {english ? 'Select a report' : '请选择报告'}
                  </option>
                )}
                {tunings.map((item) => (
                  <option key={item.report} value={item.report}>
                    {item.baseline} → {item.optimized}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className={styles.reportActions}>
          <button
            ref={fullscreenButton}
            className={styles.secondary}
            type="button"
            disabled={!data && !fullscreen}
            aria-pressed={fullscreen}
            aria-controls="benchmark-report"
            onClick={toggleFullscreen}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                d={
                  fullscreen
                    ? 'M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6'
                    : 'M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6'
                }
              />
            </svg>
            {fullscreen
              ? translate({ id: 'site.0f1505b6ad3f', message: '退出全屏' })
              : translate({ id: 'site.90cd137f160c', message: '全屏观看' })}
          </button>
        </div>
      </div>
      {fullscreenError && <p role="status">{fullscreenError}</p>}
      {data && !data.matchesLocale && (
        <p className={styles.notice} role="status">
          {translate({
            id: 'catalog.reportLanguageFallback',
            message: '该报告暂无当前语言版本，已显示原始报告。',
          })}
        </p>
      )}
      {error ? (
        <p className={reportStyles.reportPlaceholder} role="status">
          {error}{' '}
          <button onClick={() => setRetry((n) => n + 1)}>
            {translate({ id: 'site.b8784c8dd563', message: '重试' })}
          </button>
        </p>
      ) : !data ? (
        <p className={reportStyles.reportPlaceholder} role="status">
          {translate({ id: 'site.ab325d7067a1', message: '正在读取报告数据…' })}
        </p>
      ) : (
        <iframe
          ref={reportFrame}
          id="benchmark-report"
          className={styles.reportFrame}
          title={translate({
            id: 'site.0bb54211e373',
            message: '原始性能对照报告',
          })}
          srcDoc={data.html}
          sandbox="allow-scripts"
          referrerPolicy="no-referrer"
        />
      )}
    </section>
  );
}

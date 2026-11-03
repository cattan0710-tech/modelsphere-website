import { translate } from '@docusaurus/Translate';
import React from 'react';
import styles from './qos-scaling.module.css';

function Symbol({ name }: { name: string }) {
  return (
    <span
      className={`material-symbols-outlined ${styles.symbol}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
function Icon({
  name,
}: {
  name: 'shield' | 'document' | 'trend' | 'cube' | 'layers' | 'settings';
}) {
  const icons = {
    shield: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
      </svg>
    ),
    document: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" x2="8" y1="13" y2="13"></line>
        <line x1="16" x2="8" y1="17" y2="17"></line>
        <line x1="10" x2="8" y1="9" y2="9"></line>
      </svg>
    ),
    trend: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    ),
    cube: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" x2="12" y1="22.08" y2="12"></line>
      </svg>
    ),
    layers: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    ),
    settings: (
      <svg
        aria-hidden="true"
        className={styles.svgIcon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  };
  return icons[name];
}

// Content and icon geometry follow the two selected Stitch screens.
export function QosScaling() {
  return (
    <>
      <DynamicRateLimiting />
      <DynamicScaling />
    </>
  );
}

function DynamicRateLimiting() {
  const gradient = React.useId();
  const arrow = React.useId();
  return (
    <section
      id="qos-scaling"
      data-home-design=""
      className={`w-full py-12 px-margin bg-slate-50/70 border-b border-slate-200/70 ${styles.section}`}
      aria-labelledby="dynamic-rate-title"
    >
      <div className="max-w-7xl mx-auto">
        <header className={styles.rateIntro} data-home-intro="">
          <h2 id="dynamic-rate-title" className={styles.title}>
            ModelSphere{' '}
            <span>
              {translate({ id: 'home.qos.rateTitle', message: '动态限流' })}
            </span>
            {translate({
              id: 'home.qos.rateTitleEnd',
              message: '：在保障服务质量的前提下，最大化算力利用',
            })}
          </h2>
          <p className={styles.valueBanner}>
            <span className={styles.shieldBadge}>
              <Icon name="shield" />
            </span>
            {translate({
              id: 'home.qos.rateSubtitle',
              message:
                '让平台上的所有大模型服务，都持续满足预期的服务质量（如响应速度、生成速度等）',
            })}
          </p>
        </header>
        <div
          className={styles.rateWorkflow}
          data-home-pair=""
          data-home-reveal="panel"
        >
          <div className={styles.staticComparison}>
            <article className={styles.rateCard}>
              <div>
                <h3>
                  {translate({
                    id: 'home.qos.staticTitle',
                    message: '传统静态限流',
                  })}
                </h3>
                <p className={styles.cardSubtitle}>
                  {translate({
                    id: 'home.qos.staticSubtitle',
                    message: '（基于 RPM, TPM）',
                  })}
                </p>
              </div>
              <div className={styles.staticChart}>
                <div className={styles.staticPlot}>
                  <div className={styles.staticLimit} data-qos-static-limit="">
                    <span>
                      {translate({
                        id: 'home.qos.concurrencyLimit',
                        message: '并发上限',
                      })}
                    </span>
                    <i />
                  </div>
                  <div className={styles.staticBars}>
                    <i data-qos-static-bar="" />
                    <i data-qos-static-bar="" />
                  </div>
                </div>
                <div className={styles.staticLabels}>
                  <div>
                    {translate({
                      id: 'home.qos.simpleRequest',
                      message: '简单请求',
                    })}
                    <small>
                      {translate({
                        id: 'home.qos.simpleDetail',
                        message: '（算力有富余）',
                      })}
                    </small>
                  </div>
                  <div>
                    {translate({
                      id: 'home.qos.complexRequest',
                      message: '复杂请求',
                    })}
                    <small>
                      {translate({
                        id: 'home.qos.complexDetail',
                        message: '（容易变慢）',
                      })}
                    </small>
                  </div>
                </div>
              </div>
            </article>
            <article className={`${styles.rateCard} ${styles.problemCard}`}>
              <h3>
                {translate({
                  id: 'home.qos.problemTitle',
                  message: '为什么静态限流很难做好？',
                })}
              </h3>
              <div className={styles.problems}>
                <div className={styles.problem}>
                  <span className={styles.iconTile}>
                    <Icon name="document" />
                  </span>
                  <div>
                    <h4>
                      {translate({
                        id: 'home.qos.differentRequests',
                        message: '请求差异大',
                      })}
                    </h4>
                    <p>
                      {translate({
                        id: 'home.qos.differentRequestsDetail',
                        message: '简单问答和长文本的算力消耗差很多',
                      })}
                    </p>
                  </div>
                </div>
                <div className={styles.problem}>
                  <span className={styles.iconTile}>
                    <Icon name="trend" />
                  </span>
                  <div>
                    <h4>
                      {translate({
                        id: 'home.qos.changingCapacity',
                        message: '处理能力会变化',
                      })}
                    </h4>
                    <p>
                      {translate({
                        id: 'home.qos.changingCapacityDetail',
                        message: '受模型、上下文长度、负载等影响',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
          <article className={`${styles.rateCard} ${styles.solutionCard}`}>
            <div className={styles.solutionHeading}>
              <span className={`${styles.iconTile} ${styles.cubeBadge}`}>
                <Icon name="cube" />
              </span>
              <div>
                <h3>
                  {translate({
                    id: 'home.qos.solutionTitle',
                    message: 'ModelSphere 动态限流',
                  })}
                </h3>
                <p>
                  {translate({
                    id: 'home.qos.solutionDetail',
                    message: '根据实时处理能力，自动调整并发',
                  })}
                </p>
              </div>
            </div>
            <div className={styles.dynamicChart}>
              <div className={styles.dynamicPlot}>
                <span
                  className={`${styles.pointAnnotation} ${styles.openNote}`}
                  data-qos-point="open"
                >
                  <span className={styles.chartNote} data-qos-annotation="open">
                    {translate({
                      id: 'home.qos.openNote',
                      message: '性能充足 自动放开',
                    })}
                  </span>
                  <i className={styles.chartPoint} aria-hidden="true" />
                </span>
                <span
                  className={`${styles.pointAnnotation} ${styles.tightenNote}`}
                  data-qos-point="tighten"
                >
                  <span
                    className={styles.chartNote}
                    data-qos-annotation="tighten"
                  >
                    {translate({
                      id: 'home.qos.tightenNote',
                      message: '性能下降 及时收紧',
                    })}
                  </span>
                  <i className={styles.chartPoint} aria-hidden="true" />
                </span>
                <span
                  className={`${styles.axisLabel} ${styles.yAxisLabel}`}
                  data-qos-axis="y"
                >
                  {translate({ id: 'home.qos.concurrency', message: '并发' })}
                </span>
                <span
                  className={`${styles.axisLabel} ${styles.xAxisLabel}`}
                  data-qos-axis="x"
                >
                  {translate({ id: 'home.qos.time', message: '时间' })}
                </span>
                <svg
                  viewBox="0 0 380 150"
                  fill="none"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={translate({
                    id: 'home.qos.rateChart',
                    message: '并发上限随实时处理能力动态调整的曲线',
                  })}
                >
                  <defs>
                    <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--color-home-primary)"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-home-primary)"
                        stopOpacity="0.01"
                      />
                    </linearGradient>
                    <marker
                      id={arrow}
                      markerHeight="6"
                      markerWidth="6"
                      orient="auto-start-reverse"
                      refX="6"
                      refY="5"
                      viewBox="0 0 10 10"
                    >
                      <path
                        d="M 0 1.5 L 8 5 L 0 8.5 z"
                        fill="var(--color-home-muted)"
                      />
                    </marker>
                  </defs>
                  <line
                    markerEnd={`url(#${arrow})`}
                    stroke="var(--color-home-muted)"
                    strokeWidth="1.5"
                    x1="28"
                    x2="28"
                    y1="130"
                    y2="12"
                  />
                  <line
                    markerEnd={`url(#${arrow})`}
                    stroke="var(--color-home-muted)"
                    strokeWidth="1.5"
                    x1="28"
                    x2="368"
                    y1="130"
                    y2="130"
                  />
                  <path
                    d="M 28 108 C 55 106, 75 100, 100 85 C 120 73, 140 60, 175 60 C 210 60, 240 85, 275 98 C 295 106, 310 105, 335 98 C 345 96, 355 98, 365 102 L 365 130 L 28 130 Z"
                    fill={`url(#${gradient})`}
                  />
                  <path
                    d="M 28 108 C 55 106, 75 100, 100 85 C 120 73, 140 60, 175 60 C 210 60, 240 85, 275 98 C 295 106, 310 105, 335 98 C 345 96, 355 98, 365 102"
                    stroke="var(--color-home-primary)"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <p className={styles.chartLegend}>
                <i />
                {translate({
                  id: 'home.qos.dynamicLimit',
                  message: '并发上限（动态调整）',
                })}
              </p>
            </div>
          </article>
        </div>
        <div className={styles.benefits}>
          <div>
            <span className={styles.iconTile}>
              <Icon name="layers" />
            </span>
            <div>
              <h3>
                {translate({
                  id: 'home.qos.utilization',
                  message: '更高利用率',
                })}
              </h3>
              <p>
                {translate({
                  id: 'home.qos.utilizationDetail',
                  message: '让算力发挥更大价值',
                })}
              </p>
            </div>
          </div>
          <div>
            <span className={styles.iconTile}>
              <Icon name="shield" />
            </span>
            <div>
              <h3>
                {translate({ id: 'home.qos.stability', message: '更稳定体验' })}
              </h3>
              <p>
                {translate({
                  id: 'home.qos.stabilityDetail',
                  message: '高峰期也能保持响应质量',
                })}
              </p>
            </div>
          </div>
          <div>
            <span className={styles.iconTile}>
              <Icon name="settings" />
            </span>
            <div>
              <h3>
                {translate({
                  id: 'home.qos.operations',
                  message: '更低运维成本',
                })}
              </h3>
              <p>
                {translate({
                  id: 'home.qos.operationsDetail',
                  message: '自动适配不同模型和业务',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScalingChart() {
  const id = React.useId();
  return (
    <div className={styles.scalingChart}>
      <div className={styles.chartHeading}>
        <span>
          {translate({
            id: 'home.qos.allDayTrend',
            message: '24小时全天候负载流转趋势 (两者占比之和 = 100%)',
          })}
        </span>
        <strong>
          {translate({
            id: 'home.qos.dynamicUtilization',
            message: '动态算力利用率: 100%',
          })}
        </strong>
      </div>
      <div className={styles.stackedPlot}>
        <svg
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 600 130"
          role="img"
          aria-label={translate({
            id: 'home.qos.scalingChart',
            message: '全天 GLM 5.3 与 MiniMax M3 算力占比互补，总和为 100%',
          })}
        >
          <defs>
            <linearGradient id={`${id}-glm`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-home-tag-blue)"
                stopOpacity="0.75"
              />
              <stop
                offset="100%"
                stopColor="var(--color-home-tag-blue)"
                stopOpacity="0.35"
              />
            </linearGradient>
            <linearGradient id={`${id}-minimax`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-home-tag-violet)"
                stopOpacity="0.06"
              />
              <stop
                offset="100%"
                stopColor="var(--color-home-tag-violet)"
                stopOpacity="0.4"
              />
            </linearGradient>
            <pattern
              height="26"
              id={`${id}-grid`}
              patternUnits="userSpaceOnUse"
              width="60"
            >
              <path
                d="M 60 0 L 0 0 0 26"
                stroke="var(--color-border-default)"
                strokeDasharray="2 3"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect
            fill={`url(#${id}-grid)`}
            height="130"
            opacity="0.8"
            width="600"
          />
          <rect fill={`url(#${id}-minimax)`} height="130" width="600" />
          <path
            d="M 0 0 L 600 0 L 600 26 C 560 26, 520 26, 480 30 C 440 38, 410 65, 360 78 C 300 90, 260 104, 200 104 C 140 104, 100 80, 50 36 C 25 26, 10 26, 0 26 Z"
            fill={`url(#${id}-glm)`}
          />
          <path
            d="M 0 26 C 10 26, 25 26, 50 36 C 100 80, 140 104, 200 104 C 260 104, 300 90, 360 78 C 410 65, 440 38, 480 30 C 520 26, 560 26, 600 26"
            stroke="var(--color-home-tag-blue)"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <line
            opacity="0.6"
            stroke="var(--color-home-tag-blue)"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            x1="200"
            x2="200"
            y1="0"
            y2="130"
          />
          <circle
            cx="200"
            cy="104"
            fill="var(--color-background-surface)"
            r="4.5"
            stroke="var(--color-home-tag-blue)"
            strokeWidth="2.5"
          />
          <line
            opacity="0.6"
            stroke="var(--color-home-muted)"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            x1="360"
            x2="360"
            y1="0"
            y2="130"
          />
          <circle
            cx="360"
            cy="78"
            fill="var(--color-background-surface)"
            r="4"
            stroke="var(--color-home-tag-blue)"
            strokeWidth="2"
          />
          <line
            opacity="0.6"
            stroke="var(--color-home-tag-violet)"
            strokeDasharray="3 3"
            strokeWidth="1.2"
            x1="520"
            x2="520"
            y1="0"
            y2="130"
          />
          <circle
            cx="520"
            cy="28"
            fill="var(--color-background-surface)"
            r="4.5"
            stroke="var(--color-home-tag-violet)"
            strokeWidth="2.5"
          />
        </svg>
        <span className={styles.glmCoverage}>
          {translate({
            id: 'home.qos.glmCoverage',
            message: 'GLM 5.3 算力覆盖区 ↑',
          })}
        </span>
        <span className={styles.minimaxCoverage}>
          {translate({
            id: 'home.qos.minimaxCoverage',
            message: 'MiniMax M3 算力覆盖区 ↓',
          })}
        </span>
      </div>
      <div className={styles.timeAxis}>
        <span>00:00</span>
        <span className={styles.glm}>
          {translate({
            id: 'home.qos.morningAxis',
            message: '09:00 (蓝80% : 紫20%)',
          })}
        </span>
        <span>
          {translate({
            id: 'home.qos.afternoonAxis',
            message: '15:00 (蓝60% : 紫40%)',
          })}
        </span>
        <span className={styles.minimax}>
          {translate({
            id: 'home.qos.nightAxis',
            message: '23:00 (蓝20% : 紫80%)',
          })}
        </span>
        <span>24:00</span>
      </div>
    </div>
  );
}

function DynamicScaling() {
  const scenarios = [
    {
      title: translate({
        id: 'home.qos.morningTitle',
        message: '白天高峰 09:00',
      }),
      detail: translate({
        id: 'home.qos.morningDetail',
        message: '办公模型流量大',
      }),
      glm: 8,
      ratio: ['GLM 80% (8卡)', 'MiniMax 20% (2卡)'],
    },
    {
      title: translate({
        id: 'home.qos.afternoonTitle',
        message: '日常时段 15:00',
      }),
      detail: translate({
        id: 'home.qos.afternoonDetail',
        message: '流量均衡',
      }),
      glm: 6,
      ratio: ['GLM 60% (6卡)', 'MiniMax 40% (4卡)'],
    },
    {
      title: translate({
        id: 'home.qos.nightTitle',
        message: '深夜高峰 23:00',
      }),
      detail: translate({
        id: 'home.qos.nightDetail',
        message: '夜间任务流量大',
      }),
      glm: 2,
      ratio: ['GLM 20% (2卡)', 'MiniMax 80% (8卡)'],
    },
  ];
  return (
    <section
      id="dynamic-scaling"
      data-home-design=""
      className={`w-full py-12 px-margin bg-white border-b border-slate-200/70 ${styles.section}`}
      aria-labelledby="dynamic-scaling-title"
    >
      <div
        className={`max-w-7xl mx-auto ${styles.scalingLayout}`}
        data-home-pair=""
        data-home-reveal="panel"
      >
        <div className={styles.scalingCopy}>
          <div data-home-intro="" className={styles.scalingIntro}>
            <p className={styles.scalingPill}>
              <i className="animate-pulse" />
              {translate({
                id: 'home.qos.scalingPill',
                message: '智能算力调度 · 告别资源闲置',
              })}
            </p>
            <h2 id="dynamic-scaling-title" className={styles.title}>
              {translate({
                id: 'home.qos.scalingTitle',
                message: '算力动态扩缩容：',
              })}
              <br />
              <span>
                {translate({
                  id: 'home.qos.scalingTitleAccent',
                  message: '按模型流量实时分配',
                })}
              </span>
              <br />
              {translate({
                id: 'home.qos.scalingTitleEnd',
                message: '算力24小时满负荷',
              })}
            </h2>
            <p className={styles.scalingDescription}>
              {translate({
                id: 'home.qos.scalingDescription',
                message:
                  '解决传统模式下模型固定部署在指定算力上，导致低峰期算力空转浪费、高峰期算力不足的业务痛点。',
              })}
            </p>
          </div>
          <div className={styles.scalingFeatures}>
            <div>
              <span className={styles.iconTile}>
                <Symbol name="radar" />
              </span>
              <h3>
                {translate({
                  id: 'home.qos.measureUsage',
                  message: '实时判断模型使用量',
                })}
              </h3>
            </div>
            <div>
              <span className={styles.iconTile}>
                <Symbol name="sync_alt" />
              </span>
              <h3>
                {translate({
                  id: 'home.qos.scaleWithTraffic',
                  message: '算力随流量自动扩缩',
                })}
              </h3>
            </div>
            <div>
              <span className={`${styles.iconTile} ${styles.success}`}>
                <Symbol name="verified" />
              </span>
              <h3>
                {translate({
                  id: 'home.qos.eliminateIdle',
                  message: '消灭低使用率闲置浪费',
                })}
              </h3>
            </div>
          </div>
          <div className={styles.scalingBadges}>
            <span>
              <Symbol name="bolt" />
              {translate({
                id: 'home.qos.noStutter',
                message: '热门模型不卡顿',
              })}
            </span>
            <span>
              <Symbol name="shield" />
              {translate({
                id: 'home.qos.zeroIdle',
                message: '算力资源 0 闲置',
              })}
            </span>
          </div>
        </div>
        <div className={styles.scalingPanel}>
          <div className={styles.scalingComparison}>
            <div className={styles.negative}>
              <b aria-hidden="true">✕</b>
              <div>
                <strong>
                  {translate({
                    id: 'home.qos.fixedMode',
                    message: '传统固定绑定模式',
                  })}
                </strong>
                <p>
                  {translate({
                    id: 'home.qos.fixedModeDetail',
                    message: '模型低谷期大量算力闲置空转',
                  })}
                </p>
              </div>
            </div>
            <div className={styles.positive}>
              <b aria-hidden="true">✓</b>
              <div>
                <strong>
                  {translate({
                    id: 'home.qos.dynamicMode',
                    message: 'ModelSphere 动态调配',
                  })}
                </strong>
                <p>
                  {translate({
                    id: 'home.qos.dynamicModeDetail',
                    message: '算力随流量流动，集群 100% 满载',
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.poolLegend}>
            <div className={styles.modelLegend}>
              <span>
                <i className={styles.glmSwatch} />
                <strong>GLM 5.3</strong>
                <small>
                  {translate({
                    id: 'home.qos.glmWorkload',
                    message: '办公/分析',
                  })}
                </small>
              </span>
              <span>
                <i className={styles.minimaxSwatch} />
                <strong>MiniMax M3</strong>
                <small>
                  {translate({
                    id: 'home.qos.minimaxWorkload',
                    message: '代码/批处理',
                  })}
                </small>
              </span>
            </div>
            <p>
              <Symbol name="view_in_ar" />
              {translate({
                id: 'home.qos.gpuPool',
                message: '集群算力总池：固定 10 张 GPU 算力卡，实时无感流转',
              })}
            </p>
          </div>
          <ScalingChart />
          <div className={styles.scenarios}>
            {scenarios.map((scenario, index) => (
              <React.Fragment key={scenario.glm}>
                {index > 0 && (
                  <div
                    className={`${styles.scenarioArrow} ${index === 2 ? styles.minimax : styles.glm}`}
                  >
                    <span className="animate-pulse">
                      <Symbol name="east" />
                    </span>
                    <span>
                      {index === 1 ? (
                        <>
                          {translate({
                            id: 'home.qos.reallocateFirst',
                            message: '实时感知',
                          })}
                          <br />
                          {translate({
                            id: 'home.qos.reallocateSecond',
                            message: '调配',
                          })}
                        </>
                      ) : (
                        <>
                          {translate({
                            id: 'home.qos.autoFirst',
                            message: '自动',
                          })}
                          <br />
                          {translate({
                            id: 'home.qos.autoSecond',
                            message: '扩缩容',
                          })}
                        </>
                      )}
                    </span>
                  </div>
                )}
                <div
                  className={styles.scenario}
                  data-gpu-scenario={scenario.glm}
                >
                  <h3>{scenario.title}</h3>
                  <p>{scenario.detail}</p>
                  <div className={styles.ratios}>
                    <span className={styles.glm}>
                      {translate({
                        id: `home.qos.glm${scenario.glm}`,
                        message: scenario.ratio[0],
                      })}
                    </span>
                    <span className={styles.minimax}>
                      {translate({
                        id: `home.qos.minimax${10 - scenario.glm}`,
                        message: scenario.ratio[1],
                      })}
                    </span>
                  </div>
                  <div className={styles.gpuGrid}>
                    {Array.from({ length: 10 }, (_, gpu) => (
                      <div
                        key={gpu}
                        data-model={gpu < scenario.glm ? 'glm' : 'minimax'}
                        className={
                          gpu < scenario.glm ? styles.glmGpu : styles.minimaxGpu
                        }
                      >
                        <Symbol name="developer_board" />
                        <span>{String(gpu + 1).padStart(2, '0')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <p className={styles.scalingSummary}>
            <Symbol name="electric_bolt" />
            <span>
              {translate({
                id: 'home.qos.summaryStart',
                message:
                  '算力随模型流量大小实时增减，两者资源占比之和始终保持 ',
              })}
              <strong>100%</strong>
              {translate({
                id: 'home.qos.summaryEnd',
                message: '，彻底消除算力闲置',
              })}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

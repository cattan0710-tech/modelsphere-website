import { translate } from '@docusaurus/Translate';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import styles from './architecture.module.css';

function ArchitectureIcon({
  name,
}: {
  name: 'chip' | 'library' | 'agent' | 'engine' | 'more';
}) {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'chip' && (
        <>
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <rect x="8" y="8" width="8" height="8" rx="1" />
          <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
        </>
      )}
      {name === 'library' && (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 7h2m3 0h1M9 11h6m-6 4h6" />
        </>
      )}
      {name === 'agent' && (
        <>
          <rect x="4" y="8" width="16" height="12" rx="3" />
          <path d="M12 4v4M2 12v4m20-4v4M9 16h6" />
          <circle cx="12" cy="3" r="1" />
          <circle cx="9" cy="12" r="0.6" />
          <circle cx="15" cy="12" r="0.6" />
        </>
      )}
      {name === 'engine' && (
        <>
          <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10 9-5m-9 5L3 7m9 5v10M7.5 4.5l9 5" />
        </>
      )}
      {name === 'more' && (
        <>
          <circle cx="4" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="20" cy="12" r="1" />
        </>
      )}
    </svg>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div className={styles.connector} data-architecture-connector>
      <svg viewBox="0 0 12 40" aria-hidden="true">
        <circle cx="6" cy="4" r="2.5" fill="currentColor" />
        <path d="M6 6v27" stroke="currentColor" strokeWidth="1.5" />
        <path d="m2 31 4 7 4-7Z" fill="currentColor" />
      </svg>
      <p>{label}</p>
    </div>
  );
}

export default function ArchitectureDiagram() {
  const brand = useBaseUrl('/brand/');
  const applications = [
    { name: 'Claude', logo: 'claude-icon.png' },
    { name: 'Codex', logo: 'codex-icon.png' },
    { name: 'OpenClaw', logo: 'openclaw-icon.png' },
    {
      name: translate({
        id: 'home.architecture.knowledge',
        message: '企业知识库',
      }),
      icon: 'library' as const,
    },
    {
      name: translate({
        id: 'home.architecture.agents',
        message: '业务智能体',
      }),
      icon: 'agent' as const,
    },
  ];
  const capabilities = [
    translate({ id: 'home.architecture.deploy', message: '模型部署与调优' }),
    translate({ id: 'home.architecture.routing', message: '请求缓存感知路由' }),
    translate({ id: 'home.architecture.throttling', message: '动态限流' }),
    translate({ id: 'home.architecture.pd', message: 'PD 分离部署' }),
    translate({ id: 'home.architecture.cache', message: '三级 KV 缓存' }),
    translate({
      id: 'home.architecture.scaling',
      message: '基于服务质量的自动扩缩容',
    }),
    translate({
      id: 'home.architecture.continuation',
      message: '服务断流自动续写',
    }),
    translate({
      id: 'home.architecture.tuning',
      message: 'Tuning Agent 持续调优',
    }),
  ];
  const accelerators = [
    translate({ id: 'home.architecture.ascend', message: '华为昇腾' }),
    translate({ id: 'home.architecture.iluvatar', message: '天数智芯' }),
    translate({ id: 'home.architecture.moore', message: '摩尔线程' }),
    translate({ id: 'home.architecture.hygon', message: '海光' }),
    translate({ id: 'home.architecture.nvidia', message: '英伟达 NVIDIA' }),
    translate({ id: 'home.architecture.moreChips', message: '更多 AI 芯片' }),
  ];
  const platformTitle = translate({
    id: 'site.df36818e82c3',
    message: '模域 ModelSphere',
  });
  const enginesTitle = translate({
    id: 'home.architecture.engines',
    message: '集成推理引擎',
  });

  return (
    <figure
      className={styles.architecture}
      aria-label={translate({
        id: 'site.8f575cabd8c0',
        message: 'ModelSphere 系统分层架构与算力调度拓扑',
      })}
      data-home-diagram="architecture"
      data-home-architecture
    >
      <div className={styles.ecosystem}>
        <h3 className={styles.rowTitle}>
          {translate({
            id: 'home.architecture.applications',
            message: '应用生态',
          })}
        </h3>
        <ul className={styles.applications}>
          {applications.map((application) => (
            <li className={styles.chip} key={application.name}>
              {application.logo ? (
                <img
                  src={`${brand}${application.logo}`}
                  alt=""
                  width="28"
                  height="28"
                  data-architecture-logo={application.name.toLowerCase()}
                />
              ) : application.icon ? (
                <ArchitectureIcon name={application.icon} />
              ) : null}
              <span>{application.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <Connector
        label={translate({
          id: 'home.architecture.api',
          message: '标准 API 接入',
        })}
      />

      <section
        className={styles.platform}
        aria-label={platformTitle}
        data-architecture-platform
      >
        <header className={styles.platformHeader}>
          <div className={styles.platformTitle}>
            <img
              src={`${brand}modelsphere-symbol.png`}
              alt=""
              width="52"
              height="52"
            />
            <h3>{platformTitle}</h3>
          </div>
          <p>
            {translate({
              id: 'home.architecture.core',
              message: '生产级算力部署与推理优化开源平台',
            })}
          </p>
        </header>

        <ul className={styles.capabilities} data-architecture-capabilities>
          {capabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>

        <Connector
          label={translate({
            id: 'home.architecture.engineManagement',
            message: '统一部署与服务治理',
          })}
        />

        <section
          className={styles.engines}
          aria-label={enginesTitle}
          data-architecture-engines
        >
          <h3 className={styles.rowTitle}>{enginesTitle}</h3>
          <ul className={styles.engineList}>
            <li className={styles.chip}>
              <ArchitectureIcon name="library" />
              vLLM
            </li>
            <li className={styles.chip}>
              <ArchitectureIcon name="engine" />
              SGLang
            </li>
            <li className={styles.chip}>
              <ArchitectureIcon name="more" />
              {translate({
                id: 'home.architecture.moreEngines',
                message: '更多引擎',
              })}
            </li>
          </ul>
        </section>
      </section>

      <Connector
        label={translate({
          id: 'home.architecture.hardwareManagement',
          message: '异构资源纳管与调度',
        })}
      />

      <div className={styles.ecosystem} data-architecture-hardware>
        <h3 className={styles.rowTitle}>
          {translate({ id: 'home.architecture.hardware', message: '异构算力' })}
        </h3>
        <ul className={styles.accelerators}>
          {accelerators.map((accelerator) => (
            <li className={styles.chip} key={accelerator}>
              <ArchitectureIcon name="chip" />
              <span>{accelerator}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

import { translate } from '@docusaurus/Translate';
import React from 'react';
import './continuation.css';

function ContinuationIcon({
  name,
  filled = false,
}: {
  name: string;
  filled?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined continuation-icon${filled ? ' continuation-icon-filled' : ''}`}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

function ContinuationSignal() {
  return (
    <span className="continuation-signal" aria-hidden="true">
      <span className="animate-ping" />
      <span />
    </span>
  );
}

// Copy and Material Symbols follow Stitch screen 11190555543817321216.
export function FaultTolerance() {
  const stepsRef = React.useRef<HTMLOListElement>(null);
  React.useEffect(() => {
    const element = stepsRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    const update = () => {
      if (reduced.matches) {
        delete element.dataset.continuationMotion;
      } else {
        element.dataset.continuationMotion = 'true';
      }
      element.dataset.continuationRunning = String(
        inView && !document.hidden && !reduced.matches,
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        update();
      },
      { threshold: [0, 0.25] },
    );
    observer.observe(element);
    reduced.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      reduced.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
      delete element.dataset.continuationMotion;
      delete element.dataset.continuationRunning;
    };
  }, []);
  const features = [
    {
      icon: 'radar',
      title: translate({
        id: 'home.continuation.detect',
        message: '自动识别异常',
      }),
      description: translate({
        id: 'home.continuation.detectDetail',
        message: '通过心跳探测发现异常节点，触发故障切换',
      }),
      badge: translate({
        id: 'home.continuation.detectBadge',
        message: '异常检测',
      }),
    },
    {
      icon: 'alt_route',
      title: translate({
        id: 'home.continuation.switch',
        message: '自动切换集群其他机器',
      }),
      description: translate({
        id: 'home.continuation.switchDetail',
        message: '根据节点健康状态，自动调度至可用节点',
      }),
      badge: translate({
        id: 'home.continuation.switchBadge',
        message: '健康节点调度',
      }),
    },
    {
      icon: 'sync_saved_locally',
      title: translate({
        id: 'home.continuation.resume',
        message: '接续已有回答',
      }),
      description: translate({
        id: 'home.continuation.resumeDetail',
        message: '结合已有上下文，接续生成后续内容',
      }),
      badge: translate({
        id: 'home.continuation.resumeBadge',
        message: '上下文续写',
      }),
    },
  ];
  const steps = [
    {
      icon: 'dns',
      machine: translate({
        id: 'home.continuation.machineA',
        message: '机器 A',
      }),
      title: translate({
        id: 'home.continuation.responding',
        message: '正在响应回答',
      }),
      metric: translate({ id: 'home.continuation.load', message: '负载 42%' }),
      status: translate({ id: 'home.continuation.healthy', message: '健康' }),
    },
    {
      icon: 'warning',
      machine: translate({
        id: 'home.continuation.failedMachine',
        message: '机器 A',
      }),
      title: translate({
        id: 'home.continuation.failure',
        message: '突发异常 / 卡死',
      }),
      metric: translate({
        id: 'home.continuation.circuit',
        message: '触发熔断',
      }),
      status: translate({
        id: 'home.continuation.interruption',
        message: '硬件中断',
      }),
    },
    {
      icon: 'route',
      machine: translate({
        id: 'home.continuation.machineB',
        message: '机器 B',
      }),
      title: translate({
        id: 'home.continuation.scheduling',
        message: '调度健康节点',
      }),
      metric: translate({
        id: 'home.continuation.latency',
        message: '自动切换',
      }),
      status: translate({
        id: 'home.continuation.loss',
        message: '接续上下文',
      }),
    },
    {
      icon: 'task_alt',
      machine: translate({
        id: 'home.continuation.resumedMachine',
        message: '机器 B',
      }),
      title: translate({
        id: 'home.continuation.continuing',
        message: '继续吐字回复',
      }),
      metric: translate({
        id: 'home.continuation.restored',
        message: '恢复输出',
      }),
      status: translate({
        id: 'home.continuation.coherence',
        message: '接续回答',
      }),
    },
  ];
  return (
    <section
      className="w-full py-12 px-margin bg-white border-b border-slate-200/70"
      id="fault-tolerance"
      data-home-design=""
      aria-label={translate({
        id: 'site.0df458657238',
        message: '大模型推理断流续写',
      })}
      aria-description={translate({
        id: 'site.a52a481c1137',
        message:
          '按设计稿展示的机制、配置与性能示例，不代表运行时状态、实测证明或服务保证。',
      })}
    >
      <div
        className="continuation-layout"
        data-home-pair=""
        data-home-reveal="panel"
      >
        <div className="continuation-copy">
          <div className="continuation-intro">
            <div
              className="continuation-pill continuation-success"
              data-home-intro=""
            >
              <ContinuationSignal />
              <ContinuationIcon name="verified_user" filled />
              {translate({
                id: 'home.continuation.badge',
                message: '集群级故障恢复',
              })}
            </div>
            <div data-home-intro="">
              <h2 className="continuation-title" id="continuation-title">
                <a
                  href="https://github.com/modelsphere/modelsphere/blob/d5c892d2c1747b9411b423dae5c776d0c84a8003/docs/deploy-a-model.md#continuation-gateway-optional"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translate({
                    id: 'home.continuation.title',
                    message: '断流续写：',
                  })}
                </a>
                <span>
                  {translate({
                    id: 'home.continuation.subtitle',
                    message: '单机故障，集群接力续写',
                  })}
                </span>
              </h2>
              <p className="continuation-description">
                {translate({
                  id: 'home.continuation.description',
                  message:
                    '当节点异常导致回答中断时，自动切换至健康节点，结合已有上下文继续生成，减少故障对用户对话的影响。',
                })}
              </p>
            </div>
          </div>
          <div className="continuation-features">
            {features.map((feature, index) => (
              <div
                className={`continuation-feature ${index === 2 ? 'continuation-success' : ''}`}
                key={feature.icon}
              >
                <div className="continuation-feature-icon">
                  <ContinuationIcon name={feature.icon} />
                </div>
                <div className="continuation-feature-copy">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
                <span className="continuation-pill continuation-feature-badge">
                  {feature.badge}
                </span>
              </div>
            ))}
          </div>
          <div className="continuation-guarantees">
            <span className="continuation-pill">
              <ContinuationIcon name="security" filled />
              {translate({
                id: 'home.continuation.userGuarantee',
                message: '减少对话中断',
              })}
            </span>
            <span className="continuation-pill">
              <ContinuationIcon name="bolt" filled />
              {translate({
                id: 'home.continuation.machineGuarantee',
                message: '降低单机故障影响',
              })}
            </span>
          </div>
        </div>
        <div className="continuation-visual">
          <div className="continuation-chat">
            <div className="continuation-chat-bar">
              <div className="continuation-chat-heading">
                <span className="continuation-window-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <ContinuationIcon name="forum" />
                <strong>
                  {translate({
                    id: 'home.continuation.chat',
                    message: 'AI 对话',
                  })}
                </strong>
                <span className="continuation-pill continuation-success continuation-connection">
                  <i className="continuation-dot" />
                  {translate({
                    id: 'home.continuation.connection',
                    message: '连接正常 · 实时响应',
                  })}
                </span>
              </div>
              <span className="continuation-pill continuation-success">
                <ContinuationIcon name="check_circle" />
                {translate({
                  id: 'home.continuation.invisible',
                  message: '自动接续',
                })}
              </span>
            </div>
            <div className="continuation-chat-body">
              <div className="continuation-prompt">
                <span className="continuation-avatar">
                  <ContinuationIcon name="person" />
                </span>
                <p>
                  {translate({
                    id: 'home.continuation.prompt',
                    message:
                      '请详细分析一下2025年企业级大模型算力集群的核心建设原则与最佳实践？',
                  })}
                </p>
              </div>
              <div className="continuation-answer">
                <span className="continuation-avatar">
                  <ContinuationIcon name="smart_toy" filled />
                </span>
                <div className="continuation-answer-main">
                  <div className="continuation-answer-meta">
                    <div>
                      <strong>DeepSeek</strong>
                      <span>
                        {translate({
                          id: 'home.continuation.distributed',
                          message: '集群分布式推理',
                        })}
                      </span>
                    </div>
                    <span>
                      {translate({
                        id: 'home.continuation.throughput',
                        message: '吞吐速度: 64.2 tokens/s',
                      })}
                    </span>
                  </div>
                  <div className="continuation-response">
                    <div className="continuation-response-part">
                      <div className="continuation-response-meta">
                        <span className="continuation-pill">
                          <i className="continuation-dot" />
                          {translate({
                            id: 'home.continuation.answerA',
                            message: '由集群机器 A 回答 (初始链路)',
                          })}
                        </span>
                        <span>
                          {translate({
                            id: 'home.continuation.progressA',
                            message: '生成进度 45%',
                          })}
                        </span>
                      </div>
                      <p>
                        {translate({
                          id: 'home.continuation.answerStart',
                          message: '大模型集群建设的首要原则是',
                        })}
                        <strong>
                          {translate({
                            id: 'home.continuation.answerEmphasis',
                            message: '【高吞吐与容灾韧性】',
                          })}
                        </strong>
                        {translate({
                          id: 'home.continuation.answerEnd',
                          message:
                            '。在实际生产高并发场景下，单节点显存波动、网卡瞬断或硬件死机在所难免。',
                        })}
                      </p>
                    </div>
                    <div className="continuation-handover">
                      <ContinuationSignal />
                      <div>
                        <strong>
                          <ContinuationIcon name="bolt" />
                          {translate({
                            id: 'home.continuation.handover',
                            message: '后台自动接力完成',
                          })}
                        </strong>
                        <span>
                          {translate({
                            id: 'home.continuation.handoverDetail',
                            message: '(切换健康节点 · 接续已有上下文)',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="continuation-response-part continuation-success">
                      <div className="continuation-response-meta">
                        <span className="continuation-pill">
                          <i className="continuation-dot" />
                          {translate({
                            id: 'home.continuation.answerB',
                            message: '由集群机器 B 接着上一台机器继续回答',
                          })}
                        </span>
                        <span>
                          {translate({
                            id: 'home.continuation.progressB',
                            message: '生成完成 100%',
                          })}
                        </span>
                      </div>
                      <p>
                        {translate({
                          id: 'home.continuation.answerContinuation',
                          message:
                            '因此系统需要结合已有上下文，将请求转交健康节点并接续输出，降低硬件故障对业务的影响。',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="continuation-workflow">
            <div className="continuation-workflow-heading">
              <div>
                <h3>
                  <ContinuationIcon name="hub" />
                  {translate({
                    id: 'home.continuation.technology',
                    message: '断流续写技术',
                  })}
                </h3>
                <span>
                  {translate({
                    id: 'home.continuation.pipeline',
                    message: '集群后台自动接力链路',
                  })}
                </span>
              </div>
              <span className="continuation-pill continuation-success">
                <i className="continuation-dot" />
                {translate({
                  id: 'home.continuation.available',
                  message: '自动接力',
                })}
              </span>
            </div>
            <ol className="continuation-steps" ref={stepsRef}>
              {steps.map((step, index) => (
                <li
                  className={`continuation-step continuation-step-${index + 1}`}
                  key={step.icon}
                >
                  <div className="continuation-step-top">
                    <span className="continuation-step-number">
                      {index + 1}
                    </span>
                    <ContinuationSignal />
                  </div>
                  <span className="continuation-machine">
                    <ContinuationIcon name={step.icon} />
                    {step.machine}
                  </span>
                  <h4>{step.title}</h4>
                  <div className="continuation-step-metrics">
                    <span>{step.metric}</span>
                    <span>{step.status}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

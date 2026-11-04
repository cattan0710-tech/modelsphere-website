---
title: 'From running a model to running a service: ModelSphere open-sources its production inference infrastructure'
summary: A model that can answer is only the starting point. Built on Kubernetes, ModelSphere brings model deployment, cache-aware routing, SLO-based scaling, observability, and interrupted-stream recovery into one serving stack, with a Tuning Agent that explores configurations for real workloads.
---

## From a demo to production

In a demo, one GPU, one engine, and a `curl` request may be enough. Production brings a longer checklist: accelerator support, Kubernetes, routing, rate limiting, scaling, and keeping generation going when a node fails. Many teams reach the same point: the model can answer, but operating the service reliably takes much more work.

vLLM and SGLang have advanced single-instance throughput. Production also requires a fleet that can handle peak traffic efficiently. Much of the remaining work sits in scheduling and service management around the engine.

That is why we open-sourced ModelSphere. Built on Kubernetes, it brings model deployment, cache-aware routing, SLO-based scaling, observability, interrupted-stream recovery, and workload-driven configuration exploration into one inference serving stack.

## Who we are

ModelSphere aims to help enterprises and developers turn raw compute into secure, stable, operable model services with less infrastructure work from scratch. Our goal is to let teams bring compute while the platform handles more of the deployment, scheduling, scaling, monitoring, and alerting.

Inference engines handle computation within an instance. ModelSphere handles deployment and service management across the cluster. Together, they support scaling and, for supported scenarios, continuing generation after an interruption.

![Screenshot of the ModelSphere open-source repository with code and documentation entry points](repository.webp)

Source and quick start: [modelsphere/modelsphere](https://github.com/modelsphere/modelsphere).

## What we do

### From manual instance configuration to cluster management

Think of vLLM and SGLang as high-performance engines, and ModelSphere as fleet scheduling and management: putting those engines into service together.

Going to production traditionally involves accelerator drivers, Kubernetes setup, traffic gateways, and scaling scripts. ModelSphere turns more of this work into reusable automation:

- **Cluster management:** Route requests and scale replicas across nodes as concurrency changes.
- **Heterogeneous resources:** Provide a common serving stack for environments including NVIDIA GPUs, Huawei Ascend, and Iluvatar accelerators. Check the deployment recipe and environment requirements for each accelerator, driver, model, and engine combination.
- **Service management:** Connect service quality, recovery, and observability signals to deployment and operations, reducing repeated infrastructure work.

![ModelSphere architecture showing application integration, platform capabilities, inference engines, and heterogeneous compute](architecture.png)

### One platform for different teams

- **Platform and infrastructure teams:** Manage model deployment, routing, and operating policies together, with less duplicated service infrastructure.
- **Application and model teams:** Use a model catalog, visual configuration, and a standard serving entry point to spend more time on models and applications.
- **Operations and SRE teams:** Use health checks, service metrics, graceful draining, rate limiting, and scaling to handle traffic changes and maintenance.

## What the platform offers

### Connect deployment and service operations

After preparing a Kubernetes cluster, `kubectl`, Helm, Helmfile, and `helm-diff`, and configuring and registering the `mycluster` environment as described in the [quick start](https://github.com/modelsphere/modelsphere/blob/d5c892d2c1747b9411b423dae5c776d0c84a8003/README.zh-CN.md#快速开始), install the serving stack with:

```bash
make helm-apply ENV=mycluster
```

Model deployment is a separate next step, using a Helm recipe or the graphical control platform. Installation time depends on the cluster, network, images, and model preparation.

The platform brings scaling, Prefill/Decode disaggregation, hierarchical KV caching, and service-quality-based rate limiting into the same deployment and operating workflow. For [supported requests and model/engine combinations](https://github.com/modelsphere/continuation_gateway), the continuation gateway can use generated output as a prefix to resume an interrupted stream. Enable each capability according to its component configuration and limits.

![Model service management in the ModelSphere graphical control platform](console.webp)

### Explore better configurations with real workloads

ModelSphere's [workload-driven automatic tuning is currently in preview](https://github.com/modelsphere/llm-autotune). The Tuning Agent explores serving configurations for real workloads, seeking suitable parameters within throughput and time-to-first-token constraints.

For **B300 + Kimi K3 in mxfp4 precision**, the published report compares a baseline recipe with an optimized configuration under an SLO of **TTFT p50 ≤ 8,000 ms and per-request generation speed ≥ 15 tok/s**. Each configuration is evaluated at its best concurrency within the SLO. Throughput normalized to eight GPUs is:

| Workload                                     |    Baseline |    Optimized | Improvement |
| -------------------------------------------- | ----------: | -----------: | ----------: |
| Agent long context (50k input + 1.5k output) | 7,850 tok/s | 12,368 tok/s |       57.6% |
| Document QA (8k input + 1k output)           | 8,394 tok/s | 10,189 tok/s |       21.4% |

![Kimi K3 throughput on B300 within the SLO: 57.6% improvement for Agent long context and 21.4% for Document QA](throughput.webp)

These results apply to the hardware, precision, engine configurations, and workloads in the report. They are not a general performance guarantee. The [full report](https://github.com/modelsphere/model-catalog/blob/5b668ff2bfd5459ff01d3be6e26cdeac1b037f60/models/kimi-k3/kimi-k3-1.0.4-b300-report.html) includes configurations, concurrency sweeps, and metric records.

### Manage heterogeneous compute through a common stack

Enterprise compute often spans hardware vendors. ModelSphere uses a common Kubernetes serving stack and deployment configurations to bring heterogeneous accelerators into service management, reducing repeated work on surrounding infrastructure.

Hardware integration still requires matching drivers, device plugins, inference engines, and model configurations. Check the installation guide and recipe for the target environment before deployment; unified management does not remove compatibility requirements.

### Keep up with models and inference engines

As models and engines evolve, deployment knowledge needs to evolve with them. The [model catalog](https://modelsphere.github.io/model-catalog/) brings together models and deployment recipes, including DeepSeek, Qwen, Kimi, MiniMax, and GLM families, for selection by hardware, engine, and workload.

Recipes, versions, and test results form the basis for deployment decisions. Refer to specific catalog records for the status of model integration and optimization.

![Animated demonstration of the ModelSphere model catalog and deployment workflow](model-deployment.gif)

## Join us

ModelSphere turns systems engineering experience into a public resource that others can fork, inspect, and improve. A contribution or tuning result can help teams beyond a single organization.

We welcome developers, enterprise users, hardware vendors, and ecosystem partners:

- Run a minimal installation using the [repository quick start](https://github.com/modelsphere/modelsphere).
- File an [Issue](https://github.com/modelsphere/modelsphere/issues) with your environment, accelerator, model, and original error message.
- Share tuning results from real workloads, suggest accelerator adaptations, or contribute improvements through a PR.
- If the project helps you, consider giving it a Star on GitHub.

Learn more on the [ModelSphere website](https://modelsphere.tech/).

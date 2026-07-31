---
title: "Core AI: a first look at Apple's new on-device model runtime"
date: 2026-07-31T00:00:00Z
image: /images/apple-core-ai-cover.webp
image_alt: "Terminal window titled llm-runner, showing the Core AI commands to export a Qwen3-0.6B checkpoint to an .aimodel bundle, run it with llm-runner, and measure it with llm-benchmark"
categories: ["Core AI", "MLX", "CLI"]
featured: false
draft: false
---

At WWDC 2026 Apple introduced [Core AI](https://developer.apple.com/videos/play/wwdc2026/324/), a new framework for running machine-learning models on Apple silicon — in Apple's words, "the inference framework powering on-device Apple Intelligence" — and, alongside it, an open-source repository that turns the framework into a practical local-LLM stack. For anyone shipping on-device language models on Apple platforms, this is the most consequential platform change since MLX appeared. Enigmus runs its inference on [mlx-swift-lm](https://github.com/ml-explore/mlx-swift-lm) directly today, and a transition to Core AI is under consideration — but not a quick one, for reasons covered below. This post is a technical first read: what the framework actually is, what is genuinely new, and where it beats or loses to building on MLX's LM layer directly.

## What Core AI is

Core AI is a general inference runtime, not an LLM framework. The press calls it the Core ML successor; Apple's own docs are more careful — Core ML is not deprecated, and the two are positioned side by side, with Core ML keeping classic model types and Core AI taking "the latest model architectures and inference techniques." It runs models across CPU, GPU, and Neural Engine, and its central idea is *specialization*: a `.aimodel` bundle is a device-independent source representation, exported from PyTorch via `torch.export` with first-class dynamic shapes. On first load it is compiled for the exact device in two phases — compute is segmented, planned, and optimized, then executable artifacts are generated for the compute units in use — and the result lands in an `AIModelCache` that can even be shared across apps in an app group. Ahead-of-time compilation via `coreai-build` shrinks, but does not remove, that first-load cost. There is a dedicated Core AI Debugger app plus Xcode instruments for profiling. Availability is 27.0 on every platform, and every entry is marked beta.

The LLM layer sits on top, in [apple/coreai-models](https://github.com/apple/coreai-models) (BSD-3-Clause, first released June 2026). It contains model export recipes that convert Hugging Face checkpoints into `.aimodel` bundles, a Swift runtime with four engine strategies — a pipelined GPU engine, a sequential engine, a static-shape engine aimed at the Neural Engine, and a VLM variant — plus KV-cache management, samplers, tool-call parsing, and grammar-constrained generation built on XGrammar (the same constrained-decoding engine MLX adopted, so the two stacks converged there). Export recipes currently cover Gemma 3, GPT-OSS, Mistral, Mixtral, and the Qwen families for LLMs, with a longer tail of vision, audio, and diffusion models.

## What is actually new

Three things stand out against the status quo of Core ML on one side and MLX on the other.

**A working Neural Engine path for LLM decode.** Core ML never handled autoregressive decoding well — static shapes, awkward KV-cache state, and limited ANE coverage of the decode loop. Core AI's static-shape engine targets the ANE directly, and the repository ships explicit transformer-on-ANE authoring rules: keep the whole model resident on the Neural Engine, per-head attention instead of fused SDPA, fp16 only, palettized weights. (Apple never states outright that LLM decode runs on the ANE — the claim is verified at the code level, not in marketing copy.) The one independent benchmark available ([apple-silicon-llm-bench](https://github.com/john-rocky/apple-silicon-llm-bench)) measured Qwen3-0.6B decode on an iPhone 17 Pro at 49 tok/s on the ANE via Core AI against 39 tok/s for the legacy Core ML path — not fast in absolute terms, but running decode off the GPU entirely, which matters for sustained workloads and thermals.

**A faster GPU engine for small models.** The same benchmark measured Core AI's pipelined GPU engine at 181 tok/s steady-state on Qwen3-0.6B (iPhone 17 Pro) against 112 tok/s for MLX — roughly 1.6× once warm. Apple offers no explanation for the gap; the mechanism has to be read out of the engine's source, which describes a three-stage pipeline with rotated buffers so CPU and GPU work overlap, token sampling (argmax/top-k) executed directly on the GPU via MPSGraph compute shaders instead of round-tripping logits to the CPU, and a growing KV cache with pipelined expansion. The caveats are load-bearing: the first generation pays a cold-start cost (about 71 tok/s while kernels compile and the three-stage pipeline fills), and the advantage collapses as models grow. On an M4 Max the gap is ~2.47× at 0.6B but only ~1.05× at Qwen3-8B, where memory bandwidth rather than compute is the bottleneck — and on the Mac the same source places MLX, not Core AI, on the energy-per-token Pareto frontier. These are single-author numbers with documented session-to-session variance, so they should be read as directional. Apple itself publishes no throughput figures at all.

**One generation API over swappable engines.** The Foundation Models framework shipped in OS 26, but OS 27 adds beta protocols — `LanguageModel` and `LanguageModelExecutor` — that let any third-party engine sit behind `LanguageModelSession`, the same API that drives Apple's built-in system model. `coreai-models` ships the reference implementation, and MLX ships its own bridge (`MLXFoundationModels`). An app can adopt `LanguageModelSession` as its only generation surface and choose the backend — Apple's system model, a Core AI `.aimodel`, or an arbitrary MLX checkpoint — behind one protocol, with structured output and tool calling handled by the framework.

## Against mlx-lm directly

Enigmus's current stack is MLX with mlx-swift-lm on top: the model registry, config decoding, weight loading, and the token loop, pinned to exact revisions. Measured against that, Core AI's trade-offs look like this.

In Core AI's favor:

- **First-party runtime.** The engine ships with the OS and is maintained by the platform vendor, with a debugger and profiling instruments. MLX is also Apple-run, but as an open-source project outside the OS, with the app carrying the runtime.
- **The ANE is reachable.** MLX runs LLMs on the GPU; Core AI is the only supported route to Neural Engine decode.
- **Faster small-model decode on iPhone**, per the numbers above — the regime a phone actually operates in.
- **Specialization caching and AOT compilation** — kernel compilation cost is explicit, cacheable, and can be paid at build time rather than first use.
- **Constrained decoding, tool-call parsing, and VLM support in the box**, behind the same session API.

Against it:

- **OS 27 or nothing.** Everything above requires iOS/macOS 27 — in public beta as of late July 2026, with general availability expected around September but not officially dated. Even after release, adopting Core AI as the only engine means dropping every user still on OS 26 or earlier and every device that cannot upgrade. This is the single biggest reason a shipping app cannot simply switch, the honest pain point of the whole story — and the loudest complaint in the [community discussion](https://news.ycombinator.com/item?id=48449665) too.
- **A closed model catalog.** Models must be exported to `.aimodel` bundles through the repo's recipes, which cover a short list of architectures. mlx-swift-lm loads thousands of community-quantized checkpoints straight from Hugging Face as safetensors — no export step, no per-model recipe. For an app whose model picker is a catalog of community builds, this gap is structural.
- **Export-environment sensitivity.** The benchmark author found the identical export recipe produced artifacts 2.2× slower when run on the macOS 27 beta SDK versus the macOS 26 SDK. Quantization presets also differ by platform (plain INT4 on macOS, palettized 4-bit on iOS), so an exported bundle is not one artifact but a per-platform matrix.
- **Beta protocol churn, closed development.** The `LanguageModel`/`LanguageModelExecutor` protocols are beta, and `coreai-models` is not accepting pull requests — issues only. mlx-swift-lm's development happens in the open at roughly 150 commits per quarter.
- **No first-party performance data.** Apple ships an `llm-benchmark` tool but publishes no numbers; every figure above comes from one independent benchmarker.

## Building a local-LLM CLI with Core AI

A detail worth spelling out: Apple ships Core AI LLM inference as command-line executables. `coreai-models` declares `llm-runner` and `llm-benchmark` as SwiftPM executable targets built on `swift-argument-parser` — no app bundle, no Xcode project, no entitlements dance. That makes a private, local LLM CLI on a Mac a short exercise:

```bash
# 1. Export a checkpoint to an .aimodel bundle (runs on the dev machine)
uv run coreai.model.registry --list-models
uv run coreai.llm.export Qwen/Qwen3-0.6B                 # macOS variant, 4-bit default
uv run coreai.llm.export Qwen/Qwen3-0.6B --platform iOS  # palettized 4-bit for iPhone

# 2. Run it
swift run -c release llm-runner \
  --model path/to/exported_model_folder \
  --prompt "Summarize the Bell inequality in three sentences."

# 3. Measure it (512-token prompt, 1024 generated, 5 trials by default)
swift run -c release llm-benchmark --model path/to/exported_model_folder
```

`llm-runner`'s flag set doubles as a map of what the stack can do: `--json-schema` for constrained decoding, `--kv-cache-strategy`, `--warmup` for pre-paying kernel compilation, `--image` for VLM input, and `--inference-engine-variant` to pick between the pipelined, sequential, and static-shape engines. It prints a performance summary and memory usage on exit.

A custom CLI is one SwiftPM executable that depends on `CoreAILanguageModels` and `FoundationModels`:

```swift
import FoundationModels
import CoreAILanguageModels

let model = try await CoreAILanguageModel(resourcesAt: modelURL)
let session = LanguageModelSession(model: model)
let response = try await session.respond(to: prompt)
print(response)
```

(For Apple's built-in system model there is an even shorter path — macOS 27 preinstalls an `fm` command-line tool, with a companion Python SDK — but that drives the system Foundation Model only, not custom weights.)

The privacy read here is unusually auditable. The only network code in the entire `coreai-models` repository is the Hugging Face download inside the Python export tooling, which runs on the development machine; the Swift runtime contains no networking at all — it loads a local resources folder and generates. The OS-side framework is closed source, so Apple's "zero server dependencies" claim has to be taken on its word there, but the open-source layer can be checked directly.

## Where Enigmus lands

Enigmus stays on mlx-swift-lm for now. The OS 27 floor alone settles the near term — a privacy app does not abandon its installed base for a beta OS. The catalog question matters just as much: the app's model picker is built on community MLX checkpoints fetched directly from Hugging Face, and Core AI has no equivalent supply today.

But the transition is being considered seriously, and the architecture is being shaped for it. The practical reading of the Foundation Models protocols is that the generation layer of an app should become engine-agnostic: adopt `LanguageModelSession` semantics internally, keep mlx-swift-lm as the backend that ships, and leave the seam where a `CoreAILanguageModel` could slot in once OS 27 is the floor rather than the ceiling. In the meantime, the numbers worth trusting are the ones measured locally — `llm-benchmark` exists precisely so that the decision, when it comes, rests on device-measured tokens per second rather than anyone's blog post. Including this one.

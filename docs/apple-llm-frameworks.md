# Apple-Only Local LLM Frameworks

Split out from `docs/local-llm-inference-engines.md`, the survey of embeddable local LLM
inference engines. Scope here is engines and frameworks whose LLM layer runs **only on Apple
platforms**:

- **MLX** — the tensor core itself now runs on CUDA and Windows too, but its LLM layers
  (`mlx-swift-lm`, `mlx-lm`, `MLXFoundationModels`) remain Apple-focused in practice, and models
  ship as MLX-quantized `.safetensors`, not GGUF.
- **Apple's own Core AI and Foundation Models frameworks**, and the legacy Core ML/ANEMLL path.

Everything else surveyed (llama.cpp, ik_llama.cpp, ExLlamaV3, onnxruntime-genai, gemma.cpp,
LiteRT-LM, ExecuTorch, OpenVINO GenAI, the Rust/Go/JVM/.NET bindings, and the server-class
engines) stays in the main document — those either run cross-platform already or are not
Apple-specific.

Researched 30–31 July 2026 alongside the main document; see there for method notes and the
list of unverified-claim conventions (⚠).

---

## 1. MLX

[ml-explore/mlx](https://github.com/ml-explore/mlx) · MIT · 27,765★ · **v0.32.0 (2026-07-07)** ·
**167 commits since 2026-05-01**. The core is unambiguously healthy.

**The repo map matters, and a 2025-vintage one is wrong.** The LLM layer for Swift moved out of
`mlx-swift-examples` into a dedicated package in October 2025:

| Repo | Role | ★ | Latest | Commits since 2026-05-01 |
| :-- | :-- | --: | :-- | --: |
| [mlx](https://github.com/ml-explore/mlx) | C++/Python core | 27,765 | v0.32.0 (2026-07-07) | **167** |
| [mlx-swift](https://github.com/ml-explore/mlx-swift) | Swift API for the core | 1,975 | 0.31.6 (2026-07-02) | 15 |
| **[mlx-swift-lm](https://github.com/ml-explore/mlx-swift-lm)** | **LLMs/VLMs for Swift** | 756 | **3.31.4 (2026-06-30)** | **150** |
| [mlx-swift-examples](https://github.com/ml-explore/mlx-swift-examples) | example apps only | 2,641 | 2.29.1 (2025-10-16) | 6 |
| [mlx-lm](https://github.com/ml-explore/mlx-lm) | Python LM layer | 6,476 | v0.31.3 (2026-04-22) | 22 |
| [mlx-c](https://github.com/ml-explore/mlx-c) | **C API** | 227 | **no releases ever** | **0** |

So the earlier read that "the MLXLLM package moves far slower than MLX core" was measuring the
wrong repo. **`mlx-swift-lm` is the live Swift LM layer at 150 commits/quarter**;
`mlx-swift-examples` is now just sample applications that depend on it. Its libraries are
`MLXLLM`, `MLXLMCommon`, `MLXVLM`, `MLXEmbedders`, `MLXFoundationModels`,
`MLXGuidedGeneration`, `MLXCXGrammar`, `MLXHuggingFace(+Macros)`. Note `main` is a **breaking
3.x major** that decoupled the tokenizer and downloader packages; it now integrates with
`swift-huggingface` 0.9.0+ and `swift-transformers` 1.3.0+ by protocol conformance.

```swift
let model = try await #huggingFaceLoadModelContainer(
    configuration: LLMRegistry.gemma3_1B_qat_4bit)
let session = ChatSession(model)
print(try await session.respond(to: "What are two things to see in San Francisco?"))
```

**`mlx-lm` (Python) is slow but not dead** — 22 commits since May, with real content
(nvfp4 support for new coding models, XTC sampler fixes through 2026-07-26), but **no release
since v0.31.3 on 2026-04-22** and 565 open issues.

**`mlx-c` is the weak link for a C or C++ CLI**: 227★, **zero releases ever, zero commits
since May, last push 2026-04-24**. Anyone planning to reach MLX from C++ rather than Swift or
Python should treat this as a risk, not a supported path.

**MLX is no longer strictly Apple-Silicon-only** — a correction worth making. v0.32.0's
changelog is full of CUDA work, adds **JIT compiler support for Windows** (#3556), and
**enables the Metal backend by default on iOS** (#3617). Ollama's Daniel Hiltgen appears
repeatedly as a contributor (Windows CUDA build, CPU allocator buffer caching, singleton
lifetime fixes), which is the clearest confirmation of Ollama's MLX investment. That said, the
*LM* layers remain Apple-focused, and models are MLX-quantized `.safetensors`, **not GGUF**.

**The two previously unidentified subsystems, now resolved:**

- **NAX** — a Metal kernel family for the M5 generation's matmul hardware, built on
  `<MetalPerformancePrimitives/MetalPerformancePrimitives.h>`. Files include
  `quantized_nax.metal`, `fp_quantized_nax.metal`, `steel/gemm/nax.h`, `steel/attn/nax.h`, and
  `steel_gemm_{fused,splitk,gather,segmented}_nax`, with the in-source comment *"NAX Steel with
  new tiles"*. This is MLX's counterpart to llama.cpp's Metal 4 tensor-API path — the same
  M5 prefill win, reached independently. ⚠ The acronym is never expanded in the source.
- **JACCL** — MLX's own collective-communication library at `mlx/distributed/jaccl/`, with
  `tcp`, `ring`, `mesh` and **`rdma`** transports. It is a NCCL analogue for distributed
  inference across multiple machines. v0.32.0 added a barrier primitive and fixed a race in
  `MeshImpl::all_reduce`.

**MLX vs llama.cpp on Apple Silicon remains genuinely unresolved, and this document will not
assert a winner.** The only careful primary comparison retrievable is
[Andreas Kunar's](https://medium.com/@andreask_75652/benchmarking-apples-mlx-vs-llama-cpp-bbbebdc18416)
— M2 Max, Llama-2-7B, and it is from **December 2023**, showing llama.cpp winning decisively
at 4-bit (61 vs 31 tok/s generation), the opposite of the widely repeated 2026 blog claim
that MLX is ~2× faster. Those blog numbers never state matched quantization, and a 2× decode
gap between two engines reading the same weights over the same memory bus is physically
implausible. Note also that **both stacks now have an M5 tensor-hardware path** (NAX for MLX,
Metal 4 tensor API for llama.cpp), so any comparison predating mid-2026 is doubly stale.
(llama.cpp itself, including its Metal 4 tensor-API path, is covered in the main document.)

---

## 2. Apple's own frameworks — Core AI and Foundation Models

This is the most consequential Apple development for a local LLM CLI, and it is two frameworks
working together.

### Core AI — a general on-device inference framework

[developer.apple.com/documentation/coreai](https://developer.apple.com/documentation/coreai) ·
*"Run AI models in your app on Apple silicon."*

> Core AI helps you build, run, and deploy AI models in your app. Designed with Apple silicon
> in mind, Core AI allows your app to use the latest model architectures and inference
> techniques **across the CPU, GPU, and Neural Engine**. The Swift API makes common tasks
> simple, while giving you more control over model specialization, caching, and inference
> performance when needed.

**Availability: 27.0 on every platform, and every one is marked beta** — iOS, iPadOS, macOS,
Mac Catalyst, tvOS, visionOS, watchOS. This is unreleased software.

It is not LLM-specific; it is a general model runtime and effectively the successor line to
Core ML. The API centres on a **specialization** step: an `AIModelAsset` (unspecialized source
asset) is specialized — with `SpecializationOptions` and `ComputeUnitKind` — into an `AIModel`,
and the result is cached in an `AIModelCache`. Inference goes through `InferenceFunction` /
`InferenceFunctionDescriptor` over `InferenceValue`, `NDArray` / `NDArrayDescriptor` and
`ImageDescriptor`, with `ComputeStream` for async work. Ahead-of-time compilation is available
via **`xcrun coreai-build compile`**, and there is a **Core AI Debugger** app plus Xcode
instruments for profiling.

### `apple/coreai-models` — Apple's open-source LLM layer on top

[apple/coreai-models](https://github.com/apple/coreai-models) · **BSD-3-Clause** · 1,452★ ·
136 forks · created **2026-06-08** · release **0.2.0 (2026-07-08)** · 63 commits total.
*"Model export recipes, Python primitives, and Swift runtime utilities for on-device AI."*
Requires **macOS/iOS 27.0+ and Xcode 27.0+**; `Package.swift` declares
`platforms: [.macOS("27.0"), .iOS("27.0")]`.

**This answers the CLI question decisively, and by construction.** The package declares six
`executableTarget`s built on `swift-argument-parser` — **`llm-runner`**, **`llm-benchmark`**,
`image-segmenter`, `object-detector`, `diffusion-runner`, `speech-runner`. Apple ships Core AI
LLM inference *as command-line tools*, so no app bundle is required.

`llm-runner`'s flag set is a useful specification of what this stack can do: `--model` (path to
a model bundle), `--prompt` / `--prompt-file` / `--raw-tokens`, `--max-tokens`,
`--temperature` / `--top-k` / `--top-p` / `--min-p`, `--sampling-strategy`,
**`--json-schema`** (constrained decoding), `--inference-engine-variant`,
**`--kv-cache-strategy`** and `--kv-cache-initial-capacity`, `--stop-tokens`, `--warmup` and
`--warmup-length` (kernel compilation), **`--bucket-size`** (query-length bucket granularity)
and **`--chunk-size`** (prefill chunk threshold), `--image` / `--image-strategy` for VLMs,
`--save-logits` / `--print-logits`, and `--clear-coreai-cache` (clears cached specialization).
It reports a performance summary and memory usage on exit.

Internally `CoreAILanguageModels` contains four engine strategies —
`CoreAIPipelinedEngine`, `CoreAISequentialEngine`, `CoreAIStaticShapeEngine` and
`CoreAISequentialVLMEngine` behind an `EngineFactory` — plus `KVCache+CoreAI`, samplers,
decoding strategies, guided generation, a `ToolCallParser`, and profiling. Guided generation
is built on **XGrammar** (a `CXGrammar` target wrapping the `xgrammar` package) — the same
choice MLX made, so both Apple-adjacent stacks converged on it.

**Model export recipes** cover Gemma 3, GPT-OSS, Mistral, Mixtral, Qwen2.5, Qwen3, Qwen3-MoE
(LLMs); Qwen3-VL (VLM); Stable Diffusion 1.5/2.1/3.5-Medium and FLUX.2; CLIP, Depth Anything
v3, EDSR, EfficientSAM, PVT v2, SAM 3, YOLOS; CLAP, Wav2Vec 2.0, Whisper; RoBERTa, T5. The
workflow is `uv run coreai.model.registry --list-models --type llm` then
`uv run coreai.llm.export Qwen/Qwen3-0.6B`, producing a **`.aimodel`** bundle.

**Quantization presets differ by platform** — worth noting, because it implies the ANE path
needs palettization:

| Platform | Preset | Meaning |
| :-- | :-- | :-- |
| macOS | `4bit` (default) | INT4 weight-only, block size 32, all layers |
| macOS | `none` | Full precision |
| iOS | `4bit_weight_palettized_group32` (default) | 4-bit palettization, channel group size 32 |
| iOS | `4bit_weight_palettized_group8` | 4-bit palettization, channel group size 8 |
| iOS | `none` | Full precision |

Quality is published as WikiText-2 perplexity rather than throughput. Qwen3 0.6B ranges
26.16–30.90, 4B 16.41–18.80, 8B 12.19–12.90 across compression settings; bits-per-weight is
16.0 (float16), 4.50 (4-bit), or ~4.89–5.71 (mixed 4/8-bit palettized). **Qwen3 8B is
macOS-only**; 0.6B and 4B run on both.

⚠ **No throughput numbers — no tokens/sec, latency, or memory figures — are published anywhere
in the repo or the Core AI documentation**, despite `llm-benchmark` existing as a shipped tool.
This is the single biggest gap in the Apple story, and it is measurable locally.

Two governance notes: the repo states it is **"not accepting pull requests at launch"** (issues
only), and it ships agent skills for coding agents — `.claude-plugin`, `.codex-plugin` and
`gemini-extension.json` — covering "working-with-coreai", "model-authoring" and
"model-compression-exploration".

### Foundation Models — and the third-party provider opening

[developer.apple.com/documentation/foundationmodels](https://developer.apple.com/documentation/foundationmodels)
· *"Perform tasks with models that specialize in language understanding, structured output, and
tool calling."* Availability: **iOS/iPadOS/macOS/Mac Catalyst/visionOS 26.0 (shipped, not
beta)**; watchOS 27.0 (beta).

The earlier lead that Apple opened this framework to third-party models is **confirmed**, and
the mechanism is a pair of protocols, currently in beta:

- **`LanguageModel`** — the protocol a model conforms to.
- **`LanguageModelExecutor`** — the protocol that responds to session requests, via
  `respond(to: LanguageModelExecutorGenerationRequest, model:, streamingInto:
  LanguageModelExecutorGenerationChannel)` plus a `prewarm(model:transcript:)` hook.
- **`LanguageModelCapabilities`** — what the model supports.

A conforming model is then passed to `LanguageModelSession(model:)` and driven through exactly
the same API as Apple's own system model. `apple/coreai-models` ships the reference
implementation — `CoreAILanguageModel: LanguageModel` with a nested
`CoreAIExecutor: LanguageModelExecutor`:

```swift
public struct CoreAILanguageModel: LanguageModel {
    public enum LoadMode: Sendable { case lazy, eager }
    public typealias Executor = CoreAIExecutor

    public var capabilities: LanguageModelCapabilities { get }
    public var estimatedSizeOnDiskBytes: Int? { get }

    public init(resourcesAt url: URL,
                mode: LoadMode = .lazy,
                variant: String? = nil,          // e.g. "coreai-sequential"
                kvCacheStrategy: KVCacheStrategy = .auto) async throws
    public func load() async throws
    public func unload()
}
```

Other notable additions to the framework, all beta: **`PrivateCloudComputeLanguageModel`**
(a Private Cloud Compute variant offering *"enhanced capabilities with privacy guarantees"*),
`Attachment` / `ImageAttachmentContent` / `ImageReference` for image input, a **dynamic
profile** system (`LanguageModelSession.DynamicProfile`, `.Profile`, `DynamicProfileModifier`,
`DynamicInstructions`, `DynamicInstructionsForEach`), custom session properties
(`SessionPropertyKey`, `SessionPropertyEntry()` macro, `SessionPropertyValues`),
`ContextOptions`, `LanguageModelError` and `TranscriptErrorHandlingPolicy`. The stable surface
remains `LanguageModelSession`, `SystemLanguageModel`, `Prompt`, `Instructions`, `Transcript`,
`GenerationOptions`, `Tool`, `Generable`, `GenerationSchema` / `DynamicGenerationSchema`.

### `MLXFoundationModels` — the bridge, and the most useful combination here

`Libraries/MLXFoundationModels` in `mlx-swift-lm` bridges any MLX model into
`FoundationModels.LanguageModel`, so an arbitrary Hugging Face model can be driven through
`LanguageModelSession` — including `@Generable` structured output, which is grammar-constrained
via `MLXGuidedGeneration`. **Requires the macOS/iOS/visionOS 27.0 SDK**, and is guarded by both
a package trait and the SDK, compiling to an empty module on older SDKs.

```swift
if #available(iOS 27.0, macOS 27.0, visionOS 27.0, *) {
    let model = #huggingFaceLanguageModel(
        configuration: LLMRegistry.gemma3_1B_qat_4bit,
        capabilities: [.guidedGeneration])
    let session = LanguageModelSession(model: model)
    let recommendation = try await session.respond(
        to: "Recommend one thing to do in Chicago.",
        generating: Recommendation.self)   // a @Generable struct
}
```

Capabilities are `.guidedGeneration` (the default), `.toolCalling`, `.reasoning` and `.vision`.
Custom weights and loaders are supported through `weightsLocation:` and `load:` closures
rather than the macro. `MLXGuidedGeneration` is also usable standalone — grammar-constrained
generation from JSON Schema or EBNF against any MLX model.

**Why this matters for a CLI**: it means an Apple-targeted tool can adopt `LanguageModelSession`
as its *only* generation API and then choose the backend — Apple's system model, a Core AI
`.aimodel`, or an arbitrary MLX model — behind one protocol. The cost is a hard **OS 27
floor**, and OS 27 is in beta.

### Core ML and ANEMLL — the legacy Neural Engine path

Core ML for autoregressive LLMs remains awkward: static shapes, KV cache via stateful models,
and limited ANE support for the decode loop. Core AI is clearly the intended successor.

[ANEMLL](https://github.com/Anemll/Anemll) is the notable community project for Neural Engine
LLM inference, and it is **not in good health**: 1,631★ but **only 4 commits in all of 2026**,
last push 2026-03-10, latest release `0.3.5_beta` (2026-02-14). It also documents a hard
architectural limit — on **M1/A14 it is constrained to 512-context monolithic models due to ANE
non-uniform state shape restrictions**.

🚨 **ANEMLL has no license file at all.** The GitHub API reports no license, and no `LICENSE`
or `COPYING` file exists in the repository root. Absent a license, there is no grant of rights
— treat it as unusable in any shipped product until the maintainers add one.

---

## 3. Recommendation: if the CLI is Apple-only

There is now a genuinely different architecture available, and it is worth weighing rather than
defaulting to llama.cpp:

**Adopt `FoundationModels.LanguageModelSession` as the only generation API, and treat the engine
as a swappable backend behind the `LanguageModel` / `LanguageModelExecutor` protocols.** That
buys Apple's system model, Core AI `.aimodel` bundles, and arbitrary MLX models through one
interface, with `@Generable` structured output, tool calling and vision handled by the framework
rather than by hand. Apple's `llm-runner` and MLX's `MLXFoundationModels` are both working
reference implementations, and Apple's own tools are command-line executables, so nothing here
requires an app bundle.

The costs are real and currently disqualifying for a shipping product: the third-party
protocols are **beta**, the MLX bridge and all of Core AI require the **27.0 SDK**, and OS 27
is itself in beta. There are also **no published throughput numbers for Core AI at all**. The
pragmatic reading is to build on llama.cpp or MLX now, but design the generation layer so it
could sit behind `LanguageModelExecutor` later — and to benchmark Core AI locally with
`llm-benchmark` before betting on it, since nobody has published numbers.

---

## 4. Licensing landmine

| Project | Issue |
| :-- | :-- |
| **ANEMLL** | **No license at all.** No `LICENSE` file exists and the GitHub API reports none. Absent a license there is no grant of rights — unusable in a shipped product until one is added. |

---

## 5. Unverified — collected flags

**Missing numbers** — every one of these is measurable locally, and nobody has published it:

1. **Core AI throughput.** No tokens/sec, latency or memory figure exists anywhere in
   `apple/coreai-models` or Apple's Core AI documentation, despite `llm-benchmark` shipping as a
   tool. Only WikiText-2 perplexity is published. **The most valuable missing Apple number.**
2. **A matched-quantization MLX vs llama.cpp comparison** — still none from a primary source, and
   now doubly stale because both stacks gained an M5 tensor-hardware path in mid-2026. Do not
   assert a winner. (llama.cpp itself is covered in the main document.)

**Legal**

3. **ANEMLL has no license at all** — see §4 above. Resolved as a finding, unresolved as a blocker.

**Leads found but not investigated**

4. **Apple's `fm` CLI and Python SDK** for Foundation Models (reported as macOS 26.0+) — the
   framework's own third-party protocols were verified, but this separate first-party tooling
   was not. Also unverified: the system model's parameter count and context window, and the
   WWDC26 sessions (241, 334, 339) themselves.

**Method limitation to be aware of when extending this document**: the WebSearch budget for the
session that produced it was fully consumed (200/200). The Apple sections were therefore built
from the GitHub API, `raw.githubusercontent.com`, and **Apple's documentation JSON API**
(`developer.apple.com/tutorials/data/documentation/<framework>.json`) — the HTML documentation
pages are JavaScript shells and return nothing useful to a fetcher. That JSON endpoint is the
reliable way to read Apple framework docs programmatically, including availability annotations
and beta flags.

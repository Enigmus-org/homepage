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
Mac Catalyst, tvOS, visionOS, watchOS. This is unreleased software: iOS 27 reached developer
beta 4 on 2026-07-20 and public beta 4 on 2026-07-22, with GA *projected* by press for
mid-September 2026 alongside the iPhone 18 Pro — **no official Apple date exists**.

It is not LLM-specific; it is a general model runtime. Apple's own framing in session 324 is
**"the inference framework powering on-device Apple Intelligence… built from the ground up for
modern workloads"**, with a pitch spanning VLM camera Q&A up to "a powerful agentic assistant
powered by a 70 billion parameter LLM… all of it running locally… no server and no cost per
token."

⚠ **It is *not* officially a Core ML replacement**, a distinction the press blurs. Core ML is not
deprecated; the two documentation pages cross-reference each other as a deliberate segmentation —
Core ML's page says *"If your app integrates AI models using the latest architectures and
inference techniques, see Core AI"*, and Core AI's says *"If your app uses model types other than
neural networks, such as decision trees or tabular feature engineering, see Core ML."* The
"successor/replacement" language comes from [9to5Mac](https://9to5mac.com/2026/03/01/apple-replacing-core-ml-with-modernized-core-ai-framework-for-ios-27-at-wwdc/)
and [InfoQ](https://www.infoq.com/news/2026/06/apple-core-ai-wwdc/), not from Apple.

The API centres on a **specialization** step: an `AIModelAsset` (unspecialized source
asset) is specialized — with `SpecializationOptions` and `ComputeUnitKind` — into an `AIModel`,
and the result is cached in an `AIModelCache`. Inference goes through `InferenceFunction` /
`InferenceFunctionDescriptor` over `InferenceValue`, `NDArray` / `NDArrayDescriptor` and
`ImageDescriptor`, with `ComputeStream` for async work. Ahead-of-time compilation is available
via **`xcrun coreai-build compile`**, and there is a **Core AI Debugger** app plus Xcode
instruments for profiling.

**How specialization actually works** (session 324 plus the docs): a `.aimodel` is a
*device-independent source representation* runnable on any Apple device. On first load it is
specialized for the exact device in two phases — "first, it goes through a core set of
compilation steps which segment, plan and optimize compute. Second, executable artifacts are
generated for the compute units used." The result is cached per-app in `AIModelCache`, with a
configurable persistence policy, deletable entries, and — notably — **sharing across apps in an
app group**. Pre-specialization is explicit via `try await AIModel.specialize(contentsOf:)`, and
[AOT compilation](https://developer.apple.com/documentation/CoreAI/compiling-core-ai-models-ahead-of-time)
on the dev machine reduces but does not eliminate on-device specialization time.
`SpecializationOptions` carries `allowedComputeUnitKinds: Set<ComputeUnitKind>`,
`preferredComputeUnitKind` and `expectFrequentReshapes: Bool`, with `.default` (all units) and
`.cpuOnly` presets; `ComputeUnitKind` is `cpu | gpu | neuralEngine`.

**Dynamic shapes are first-class** — the opposite of Core ML's static-shape awkwardness. Models
are exported from `torch.export` with declared dynamic dimensions
(`torch.export.Dim("seq_len", min: 1, max: 256)`), and the docs render dynamic dims as `?` in
`NDArray` signatures. Session 325 also documents **custom Metal 4 kernels inlined into the
converted model** — "the kernel travels with the model" — and multi-function assets (one
`.aimodel`, several entrypoints) that share embeddings between functions; their SAM 3 example
measures a 76% faster second inference from that reuse. ⚠ No mention of MLIR anywhere, despite
the obvious architectural similarity.

⚠ **No Core ML → Core AI converter was found.** Core AI consumes `.aimodel` produced by
`coreai-torch` from `torch.export`; there is no evidence it loads `.mlmodel`/`.mlpackage`, and no
Apple statement either way. Migration appears to mean re-exporting from PyTorch.

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
decoding strategies, guided generation, a `ToolCallParser`, and profiling. `EngineFactory`
auto-selects: dynamic-shape models get `coreai-pipelined`, chunked-static models (those exporting
`extend_*` functions) get `static-shape`; the `--inference-engine-variant` strings are
`auto`, `coreai-sequential`, `coreai-pipelined`, `static-shape`. KV strategies are
`auto | growing | chunked | fixed_size`, with `fixed_size` explicitly warned against in the
tool's own help text (it pre-allocates full context and slows every step).

**Why the pipelined engine wins, read from source** — Apple publishes no explanation, so this is
inference from `CoreAIPipelinedEngine.swift`, not an Apple claim. Its header documents
"non-blocking GPU encoding via `InferenceFunction.encode`", **GPU-direct token sampling
(argmax/topK) via MPSGraph compute shaders** — logits are never round-tripped to the CPU to pick a
token — "pipeline-depth-matched buffer rotation for CPU/GPU overlap", a growing KV cache with
pipelined expansion, and "all tensors are owned `MTLBuffer`s — Core AI never allocates/frees
them". `private let pipelineDepth = 3` confirms the 3-deep pipeline, with a backpressure gate and
buffer rotation sized to guarantee no two concurrent stages alias the same memory. There is also
implicit prefix caching via `TokenHistory`. Warmup costs differ sharply by engine: pipelined warms
decode shape [1] plus prefill shape [256] in under a second, while static-shape must warm *every*
bucket shape (~2.6 s). `--bucket-size` is "query length bucket granularity (0 to disable, default
64)" and `--chunk-size` the "prefill chunk threshold — prompts above this are chunked (default
1024, use 128 for MoE)".

**The ANE path is real but demanding.** `EngineFactory` labels the static-shape variant
"chunked static, Neural Engine", and it requires models exported with fixed-shape `extend_*`
functions: bucketed query lengths, fixed-size KV cache `NDArray`s named `key_cache`/`value_cache`,
and the embedding gather performed outside the model. The repo ships
`skills/skills/model-authoring/references/neural_engine_rules.md` — authoring rules for
transformers on the ANE: keep the entire model ANE-resident ("switching between accelerators
introduces overhead that dominates small-model inference"), use `BC1S` `(B, C, 1, S)` layout and
1×1 `Conv2d` in place of `nn.Linear`, per-head attention because there is no fused SDPA on the
ANE, fp16 only, palettization natively supported. ⚠ Apple's public statements stay generic
("inference across the CPU, GPU, and Neural Engine"); **no Apple statement explicitly says LLM
decode runs on the ANE** — that is verified at the code level only. Guided generation
is built on **XGrammar** (a `CXGrammar` target wrapping the `xgrammar` package) — the same
choice MLX made, so both Apple-adjacent stacks converged on it.

**Model export recipes** cover Gemma 3, GPT-OSS, Mistral, Mixtral, Qwen2.5, Qwen3, Qwen3-MoE
(LLMs); Qwen3-VL (VLM); Stable Diffusion 1.5/2.1/3.5-Medium and FLUX.2; CLIP, Depth Anything
v3, EDSR, EfficientSAM, PVT v2, SAM 3, YOLOS; CLAP, Wav2Vec 2.0, Whisper; RoBERTa, T5. The
workflow is `uv run coreai.model.registry --list-models` then
`uv run coreai.llm.export Qwen/Qwen3-0.6B`, producing a **`.aimodel`** bundle. Verified export
flags: `--compression none`, `--platform iOS` (the default is the macOS variant), `--output-dir`,
`--dry-run`, and `--num-layers 1` for debug truncation. Running and measuring are
`swift run -c release llm-runner --model path/to/exported_model_folder --prompt "Hello"` and
`swift run -c release llm-benchmark --model path/to/exported_model_folder` (defaults: 512-token
prompt, 1024 generated, 5 trials; overridable with `-p`, `-g`, `-n`). The minimal Swift program is
six lines:

```swift
import FoundationModels
import CoreAILanguageModels

let model = try await CoreAILanguageModel(resourcesAt: modelURL)
let session = LanguageModelSession(model: model)
let response = try await session.respond(to: "What is quantum computing?")
print(response)
```

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

⚠ **Apple itself still publishes no throughput numbers** — no tokens/sec, latency, or memory
figure anywhere in the repo or the Core AI documentation, despite `llm-benchmark` existing as a
shipped tool. Only WikiText-2 perplexity is published. But the gap is no longer completely
open — independent measurement now exists, from one prolific benchmarker rather than a
consensus of sources, so treat it as a first data point, not a verified figure.

**Third-party measurement, filling most of the gap (researched 2026-07-31):**
[apple-silicon-llm-bench](https://github.com/john-rocky/apple-silicon-llm-bench) (John Rocky,
MIT, 55★, created 2026-05-02, **100 commits since 2026-05-01**, last push 2026-07-20) runs
Core AI head-to-head against MLX, llama.cpp, CoreML/ANE, LiteRT-LM, Cactus and Apple Foundation
Models on the same devices and models. The author's companion
[Medium write-up](https://rockyshikoku.medium.com/i-benchmarked-apples-new-framework-against-mlx-for-on-device-llms-e52a769494b1)
gives the cleanest single comparison — Qwen3-0.6B, iPhone 17 Pro, warm/steady-state decode:

| Engine | Compute unit | Decode tok/s | Peak RAM |
| :-- | :-- | --: | --: |
| Core AI, pipelined | GPU | 181 | 524 MB |
| MLX | GPU | 112 | 539 MB |
| Core AI, static-shape | ANE | 49 | 1,166 MB |
| CoreML-LLM | ANE | 39 | 184 MB |

Core AI's GPU "pipelined" engine is ~1.6× MLX once warm, but pays a one-time cold-start cost —
the author measured ~71 tok/s on the very first generation (kernel compilation plus filling a
3-deep pipeline) before settling at 181 tok/s steady-state.

**The advantage narrows sharply as models scale up**, and does not hold on Mac.
[WCCFTech's summary](https://wccftech.com/apples-new-coreai-engine-barely-edges-out-its-own-mlx-framework-at-realistic-8b-model-sizes-despite-being-2-47x-faster-on-tiny-models/)
of the same author's M4 Max results: Core AI is ~2.47× faster than MLX decoding Qwen3 0.6B, but
only ~1.05× at Qwen3 8B — the benchmark's own conclusion is that the two converge to a near-tie
once memory bandwidth, not compute, is the bottleneck. On Mac, the same source reports MLX —
not Core AI — as owning the energy/speed Pareto frontier. Read together: Core AI's edge is real
but concentrated in the small-model, GPU-pipelined, iPhone-adjacent case, not a general win.

A second, complementary source from the same author —
[coreai-model-zoo](https://github.com/john-rocky/coreai-model-zoo) (375★, created 2026-06-10,
actively pushed as of 2026-07-31) — publishes per-model device-measured tok/s across roughly 49
converted models (Qwen3.5, LFM2.5, MiniCPM5, Gemma 4, BitCPM, etc.) on iPhone 17 Pro and M4 Max.
⚠ It carries **no license file** (`NOASSERTION` per the GitHub API) — the same caution as
ANEMLL below (§4): treat its numbers as reference data, not code to vendor.

Two methodology caveats the benchmark author documents are worth carrying forward to anyone
reproducing these figures: **session-to-session variance** (the same device measured ~16%
faster in one session than another), and **export-environment sensitivity** — the identical
export recipe run on the macOS 27 beta SDK produced artifacts measured 2.2× slower than the
same recipe on the macOS 26 SDK. Given OS 27 is itself in beta (§2 above), read all of the
above as directional, not final — and as reinforcing, not replacing, the recommendation in §3 to
benchmark locally before betting on Core AI.

**Network behaviour, since it is the whole point for a privacy-oriented product:** a code search
across `apple/coreai-models` returns **zero `URLSession` hits and zero "telemetry" hits**.
`huggingface_hub` appears only in the Python export tooling — weights are fetched at *export*
time on the developer's machine, and the Swift runtime loads everything from a local resources
folder via `CoreAILanguageModel(resourcesAt:)`. `.aimodel` bundles ship in the app or through
developer-managed downloads; there is no runtime model fetch and no Background Assets
integration statement. Apple's matching claims are "zero server dependencies and zero token
costs" ([developer.apple.com/core-ai](https://developer.apple.com/core-ai/)) and, in session 326,
"the user's data never leaves their device." ⚠ The OS-level framework is closed source, so
absence of telemetry *there* cannot be independently confirmed — only the open-source layer is
auditable.

Two governance notes: the repo states it is **"not accepting pull requests at launch"** — the
stated policy is that a PR "will be closed", a curated-gallery stance worth contrasting with
MLX's fully community-driven development — and it ships agent skills for coding agents:
`.claude-plugin`, `.codex-plugin` and `gemini-extension.json`, covering "working-with-coreai",
"model-authoring" and "model-compression-exploration".

**Compression stack** (session 325): `coreai-opt` supports int4/int8/FP4/FP8 plus palettization,
config-driven per platform, with palettization recommended for iOS power efficiency. The SAM 3
example compresses 3 GB → 430 MB using the `presets.w4` preset.

**Developer reception** — the [Hacker News thread](https://news.ycombinator.com/item?id=48449665)
(334 points, 96 comments) is the most useful signal, and it converges on a segmentation read
rather than a replacement one: MLX remains the bring-your-own-weights track with thousands of
Hugging Face checkpoints, while Core AI is the curated, per-model-optimized track. ANE access
draws a shrug ("been doing that for years with Core ML"), and the dominant complaint is the
**OS 27 gating** — many in-use devices cannot reach 26 or 27, which forces keeping a Core ML or
MLX path for backward compatibility regardless. Several write-ups settle on the same three-way
split: Core ML for classic non-neural ML, Core AI for transformers, MLX for custom weights and
experimentation. ⚠ Note that the benchmark author's articles do *not* address model availability
or quantization-ecosystem developer experience — that gap is real and should not be sourced to
them.

### Foundation Models — and the third-party provider opening

[developer.apple.com/documentation/foundationmodels](https://developer.apple.com/documentation/foundationmodels)
· *"Perform tasks with models that specialize in language understanding, structured output, and
tool calling."* Availability: **iOS/iPadOS/macOS/Mac Catalyst/visionOS 26.0 (shipped, not
beta)**; watchOS 27.0 (beta).

The earlier lead that Apple opened this framework to third-party models is **confirmed**. Note the
version split: the *framework* is 26.0+ and shipped, but the **third-party protocols are 27.0+ and
beta** — so provider support carries the same OS 27 floor as Core AI itself. Today's only
conformers are `SystemLanguageModel` and `PrivateCloudComputeLanguageModel`. Session 339 and the
protocol docs also state the intended design: keep the conforming type "intentionally light", and
note that the executor is cached by configuration — "the configuration is the lookup key, not the
model". The mechanism is a pair of protocols:

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
and limited ANE support for the decode loop. Core AI is clearly where Apple is putting its
transformer effort — though, as noted above, Apple frames this as segmentation rather than
succession, and Core ML is not deprecated.

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
is itself in beta (public beta 4 as of late July 2026, GA unannounced). Apple still publishes
**no throughput numbers for Core AI at all**, and the only independent measurement is
single-author. The
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

1. **Core AI throughput — partially resolved.** Apple itself still publishes no tokens/sec,
   latency or memory figure anywhere in `apple/coreai-models` or its documentation, despite
   `llm-benchmark` shipping as a tool — only WikiText-2 perplexity. Independent, single-author
   measurement now fills most of this gap; see §2's "Third-party measurement" discussion for
   numbers, sourcing, and caveats (session-to-session variance, export-environment sensitivity).
   An Apple-published figure, or a local reproduction, would still be the more reliable source.
2. **A matched-quantization MLX vs llama.cpp comparison** — still none from a primary source, and
   now doubly stale because both stacks gained an M5 tensor-hardware path in mid-2026. Do not
   assert a winner. (llama.cpp itself is covered in the main document.)

**Legal**

3. **ANEMLL has no license at all** — see §4 above. Resolved as a finding, unresolved as a blocker.

**Leads found but not investigated**

4. **The system model's parameter count and context window** — still unverified.

**Resolved since first draft** (verified 2026-07-31):

5. **Apple's `fm` CLI and Python SDK** — confirmed, with a correction: the `fm` CLI comes
   **pre-installed with macOS 27**, not 26.0+ as first reported. It prompts Apple's Foundation
   Models (on-device and Private Cloud Compute) from the terminal — `fm chat`, `fm respond`,
   structured output, and an `fm serve` OpenAI-compatible endpoint. The companion Python SDK is
   `pip install apple_fm_sdk` ([apple/python-apple-fm-sdk](https://github.com/apple/python-apple-fm-sdk),
   docs at [apple.github.io/python-apple-fm-sdk](https://apple.github.io/python-apple-fm-sdk/)).
   Covered by WWDC26 session 334.
6. **The WWDC26 sessions** — identified, and the earlier lead was wrong about which is which.
   241/334/339 are the *Foundation Models* sessions; **Core AI proper is 324/325/326**:

   | # | Title |
   | :-- | :-- |
   | [324](https://developer.apple.com/videos/play/wwdc2026/324/) | Meet Core AI |
   | [325](https://developer.apple.com/videos/play/wwdc2026/325/) | Dive into Core AI model authoring and optimization |
   | [326](https://developer.apple.com/videos/play/wwdc2026/326/) | Integrate on-device AI models into your app using Core AI |
   | [241](https://developer.apple.com/videos/play/wwdc2026/241/) | What's new in the Foundation Models framework |
   | [334](https://developer.apple.com/videos/play/wwdc2026/334/) | Build AI-powered scripts with the fm CLI and Python SDK |
   | [339](https://developer.apple.com/videos/play/wwdc2026/339/) | Bring an LLM provider to the Foundation Models framework |
   | [382](https://developer.apple.com/videos/play/wwdc2026/382/) | Inside Apple Intelligence and Xcode (Core AI deployment) |

**Method note.** A second research pass on 2026-07-31 (with WebSearch available) resolved the
WWDC26 session identities, the `fm` CLI, the Core ML positioning question, Core AI's
specialization and pipelining mechanics, network behaviour, and OS 27 timing. Items 5–6 above, and
the partial resolution noted in item 1, come from that pass.

**Method limitation to be aware of when extending this document**: the WebSearch budget for the
*first* session that produced it was fully consumed (200/200). The Apple sections were therefore
originally built from the GitHub API, `raw.githubusercontent.com`, and **Apple's documentation JSON API**
(`developer.apple.com/tutorials/data/documentation/<framework>.json`) — the HTML documentation
pages are JavaScript shells and return nothing useful to a fetcher. That JSON endpoint is the
reliable way to read Apple framework docs programmatically, including availability annotations
and beta flags.

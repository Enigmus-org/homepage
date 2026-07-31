# Local LLM Inference Engines — Embeddable Cores

Research reference for building a local LLM CLI tool. Scope is deliberately narrow:
**inference engines that can be embedded as a library** — linked into a binary or loaded
in-process — as opposed to model runners spoken to over HTTP.

- **Researched**: 30–31 July 2026, by parallel web research against primary sources
  (GitHub API, PyPI/Maven/crates.io, first-party docs and benchmark threads).
- **Method note**: version numbers, dates, commit counts and licenses below were pulled
  live from APIs rather than recalled. Where only blog-quality evidence existed, it is
  labelled. A large share of "2026 LLM benchmark" web content is AI-generated filler that
  repeats architecturally stale claims — several such sources were identified and excluded.
- **Unverified claims are flagged inline** with ⚠, and collected at the end.

---

## 1. The short answer

For an embeddable local LLM engine in mid-2026, the field narrows fast:

1. **`libllama` from [llama.cpp](https://github.com/ggml-org/llama.cpp)** is the default and
   the only option that is simultaneously fast, portable across every relevant backend,
   GGUF-native, MoE-offload-capable, permissively licensed (MIT), and current on models.
   Every mainstream ecosystem's answer eventually resolves back to it.
2. **[ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp)** if CPU or low-bit
   quantization quality is the priority — a drop-in `libllama` C API with materially better
   CPU kernels and its own quant family, at the cost of an API that diverged from upstream in
   August 2024.
3. **[ExLlamaV3](https://github.com/turboderp-org/exllamav3)** if the target is an NVIDIA GPU
   and the goal is fitting a larger model into fixed VRAM below 4 bits per weight.
4. **[onnxruntime-genai](https://github.com/microsoft/onnxruntime-genai)** if Windows NPUs or
   a single API across CPU/CUDA/DirectML/QNN/OpenVINO/WebGPU matter more than raw speed.

Everything else is either specialized (ternary weights, Qualcomm NPUs, Gemma-only),
server-shaped, or not actually embeddable. **Apple-only options — MLX, and Apple's own Core AI
/ Foundation Models frameworks — are covered separately in
[`docs/apple-llm-frameworks.md`](./apple-llm-frameworks.md).**

### What changed in 2025–2026, versus what a 2025-vintage mental model would assume

These reversals are the most decision-relevant findings in this document.

| Assumption | Reality as of July 2026 |
| :-- | :-- |
| Ollama moved off llama.cpp onto its own Go/ggml engine | **Reversed.** [PR #16031](https://github.com/ollama/ollama/pull/16031) (2026-05-29) deleted the CGO engines and 430,004 lines; Ollama now spawns upstream `llama-server` as a subprocess and speaks HTTP to it. Its own Go engine survives only as an **MLX** wrapper on Apple Silicon. |
| TensorRT-LLM is the fast NVIDIA option | **The TensorRT engine backend was removed.** PyTorch is the sole execution backend, `trtllm-build` is deleted, Windows support is gone, and the [supported-hardware list](https://github.com/NVIDIA/TensorRT-LLM/blob/main/docs/source/supported-hardware.md) contains **no GeForce SKU**. Datacenter Linux only. |
| vLLM's advantage is PagedAttention | **PagedAttention was deleted** in vLLM v0.25.0 (#47361). Any 2026 article explaining vLLM via PagedAttention is describing removed code. |
| TGI is a serious engine | **Archived read-only** 2026-03-21. HF's own notice redirects users to vLLM, SGLang, "or local engines with inter-compatibility such as llama.cpp or MLX". |
| Intel's ipex-llm is the Intel path | **Archived** 2026-01-28 with an unusually blunt notice including *"identified as having known security issues"*. |
| ktransformers is a local engine for big MoE models | **Pivoted.** The framework is in `archive/`; what remains is `kt-kernel`, a CPU MoE kernel operator consumed through a fork of SGLang. |
| ExLlamaV2 is the NVIDIA quantization engine | **Self-archived**; README redirects to ExLlamaV3, which left alpha at **v1.0.0 on 2026-07-14**. |
| MLC-LLM is a live compile-to-native option | **Maintenance mode** — 8 commits in 90 days, all TVM-churn adaptation; no real release since 2023. |
| llamafile is abandoned | **Alive, but changed hands.** Repo moved to [mozilla-ai/llamafile](https://github.com/mozilla-ai/llamafile); Justine Tunney's last commit was 2025-01-05; new maintainer is Davide Eynard at Mozilla.ai, and 0.10.4 shipped 2026-07-16. |

---

## 2. Performance ranking

**Read this caveat before the tables.** Ranking engines by a single number is not meaningful,
for three reasons that recur throughout the data below:

- **Prefill and decode rank differently.** Decode is memory-bandwidth-bound; prefill is
  compute-bound. The M5's Neural Accelerators give a ~3.4× prefill win and roughly nothing for
  decode. Adding an NPU often improves prefill by ~50× and decode barely at all.
- **Batch size changes the answer more than engine choice does.** Unsloth measured NVFP4 on a
  B200 at 128-way concurrency as **2.5× aggregate throughput but 1.03× for the person waiting**.
  A change that transforms throughput can be worth nothing to a single interactive user.
- **Cross-engine numbers are almost never matched on model and quantization.** MLX 4-bit is not
  Q4_K_M; EXL3 4.00 bpw is not Q4_0 at ~4.5 bpw.

### 2a. Tier list for embedding into a CLI

Ordered by how readily each can be reached for, not by peak throughput.

| Tier | Engine | Language | License | Embeddable | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| **1** | llama.cpp `libllama` | C/C++ | MIT | ✅ C API | The default. Widest backend matrix in existence. |
| **1** | ik_llama.cpp | C++ | MIT | ✅ drop-in `libllama` | Best CPU + low-bit quant quality. API diverged Aug 2024. |
| **1** | ExLlamaV3 | Python + CUDA | MIT | ✅ Python | NVIDIA only. Unmatched below 4 bpw. |
| **1** | onnxruntime-genai | C++ | MIT | ✅ C/C++/C#/Java/Python | Broadest execution-provider reach incl. NPUs. |
| **2** | gemma.cpp | C++17 | Apache-2.0 | ✅ `libgemma.a` | Cleanest library API here. CPU-only, `.sbs` format. |
| **2** | LiteRT-LM | C++ | Apache-2.0 | ✅ C++ "Stable" | Furthest along on *desktop GPU*. Bazel-only build. |
| **2** | ExecuTorch | C++ | BSD-3 | ✅ CMake | Best citizen to embed; desktop GPU experimental. |
| **2** | OpenVINO GenAI | C++ | Apache-2.0 | ✅ C++/Python | The Intel path, incl. Core Ultra NPU. |
| **2** | mistral.rs / candle | Rust | MIT / dual | ✅ crate | Only if the CLI is Rust; no C FFI crate exists. |
| **2** | BitNet.cpp | C++ | MIT | ✅ via vendored `libllama` | Required for real BitNet support (see §4). |
| **3** | GenieX (ex-Nexa SDK) | Rust + C | BSD-3 | ✅ real C API | **Qualcomm Snapdragon only.** Now a Qualcomm repo. |
| **3** | tinygrad | Python | MIT | ✅ `tinygrad.llm` | Newly plausible; feature-poor, dequantizes to FP16. |
| **3** | LMDeploy | Python + C++ | Apache-2.0 | ✅ `pipeline()` | Cleanest server-class offline API. NVIDIA/Ascend. |
| **3** | vLLM / SGLang | Python | Apache-2.0 | ✅ `LLM` / `sgl.Engine` | Genuine in-process engines, but GPU-server-shaped. |
| **3** | transformers v5 | Python | Apache-2.0 | ✅ | Now has paged attention + prefix caching. Not a speed play. |
| **✗** | koboldcpp | C++ | **AGPL-3.0** | Technically yes | AGPL §13 kills proprietary/network use. |
| **✗** | cactus | C++ | **source-available** | Technically yes | $2M funding/revenue ceiling; no GGUF since v2.0. |
| **✗** | TensorRT-LLM | Python + C++ | Apache-2.0 + NVIDIA | ❌ | Datacenter Linux; no consumer RTX; C++ demoted to legacy. |
| **✗** | Ollama / LM Studio / LocalAI / Lemonade | — | — | ❌ | All subprocess-plus-HTTP or proprietary. |
| **✗** | llamafile | C++ | Apache-2.0/MIT | ❌ | A *packaging* project; its kernels are already upstream. |
| **☠** | MLC-LLM, ktransformers, PowerInfer, T-MAC, ExLlamaV2, TGI, ipex-llm, DeepSpeed-MII, rustformers/llm, go-llama.cpp, JLama | — | — | ❌ | Dead, archived, or pivoted. See §5. |

### 2b. Single-stream throughput, matched model and quantization

The one genuinely comparable dataset in this space: llama.cpp's own maintainer-curated
scoreboards, **Llama-2 7B Q4_0, `llama-bench -ngl 99`, batch 1**. `pp512` is prefill, `tg128`
is decode, both tok/s.

**NVIDIA** — [Discussion #15013](https://github.com/ggml-org/llama.cpp/discussions/15013):

| GPU | Memory | pp512 | tg128 |
| :-- | :-- | --: | --: |
| RTX PRO 6000 Blackwell | 96 GB GDDR7 | 16,619 | 281.1 |
| RTX 5090 | 32 GB GDDR7 | 14,970 | **300.4** |
| RTX 4090 | 24 GB GDDR6X | 14,771 | 189.0 |
| H100 | 80 GB HBM3 | 11,263 | 280.7 |
| RTX 5080 | 16 GB GDDR7 | 9,488 | 184.7 |
| A100 | 80 GB HBM2e | 5,286 | 200.9 |
| RTX 3090 | 24 GB | 5,175 | 158.2 |
| RTX 3060 | 12 GB | 2,138 | 75.6 |
| DGX Spark (GB10) | 128 GB LPDDR5x | 3,062 | 57.2 |
| Jetson AGX Orin | 64 GB LPDDR5 | 991 | 33.6 |

An RTX 5090 **beats an H100 on decode** (300 vs 281) because a 7B Q4_0 decode is pure
bandwidth and GDDR7 on a 512-bit bus wins.

**Apple Silicon** — [Discussion #4167](https://github.com/ggml-org/llama.cpp/discussions/4167),
same model and quants, so directly comparable to the table above:

| Chip | BW (GB/s) | GPU cores | pp512 | tg128 |
| :-- | --: | --: | --: | --: |
| M1 Ultra | 800 | 64 | 1,030 | 83.7 |
| M2 Ultra | 800 | 76 | 1,238 | 94.3 |
| M3 Ultra | 800 | 80 | 1,471 | 92.1 |
| M4 Pro | 273 | 20 | 440 | 50.7 |
| M4 Max | 546 | 40 | 886 | 83.1 |
| M5 Max (Metal only, Mar 2026) | 614 | 40 | 987 | 102.9 |
| **M5 Max (`MTL,BLAS` + Neural Accelerators, Jun 2026)** | 614 | 40 | **3,347** | **119.1** |

The M5 is a genuine discontinuity, and it is a **prefill** discontinuity: 3.8× the M4 Max on
prefill, 1.43× on decode. M5 Max on prefill now sits between an RTX 3060 and an RTX 3090 —
with 128 GB of unified memory. Any MLX-vs-llama.cpp comparison predating
[PR #16634](https://github.com/ggml-org/llama.cpp/pull/16634) is stale on M5 hardware.

### 2c. llama.cpp vs ExLlamaV3, normalized to the memory bus

Neither project benchmarks against the other, but both publish batch-1 decode on the same
GPUs. Converting to **fraction of theoretical memory bandwidth achieved** — the only fair
currency for bandwidth-bound decode — gives:

| GPU | Peak BW | llama.cpp (7B Q4_0) | ExLlamaV3 v1.0 (8B 4.00 bpw) |
| :-- | --: | :-- | :-- |
| RTX 3090 | 936 GB/s | 158 t/s → **65%** | 126 t/s → **57%** |
| RTX 4090 | 1008 GB/s | 189 t/s → **72%** | 156 t/s → **65%** |
| RTX 5090 | 1792 GB/s | 300 t/s → **64%** | 209 t/s → **49%** |

**At equal bitrate, llama.cpp's CUDA backend extracts more of the memory bus.** This
corroborates turboderp's own README, which says the GEMM *"achieves roughly memory-bound
latency under optimal conditions (4bpw, RTX 4090), though it still needs some work … on
Ampere GPUs and to remain memory-bound at lower bitrates."* ⚠ The arithmetic crosses two
different models (6.74B vs 8.03B params) and estimates EXL3's on-disk bytes, so treat the
percentages as ±5 points; the ordering is robust because it holds across three GPUs.

**Consequence:** the ExLlamaV3-vs-llama.cpp decision is not a speed decision. It is
**quality per bit below 4 bpw**, where llama.cpp has no equivalent —
*"Llama-3.1-70B-EXL3 is coherent at 1.6 bpw … inference is possible in under 16 GB of VRAM."*

### 2d. Batched throughput

llama.cpp's own `benches/` directory runs identical commands on two machines —
gpt-oss-120b MXFP4, `llama-batched-bench -fa 1 -ub 2048`, aggregate tok/s:

| Batch | DGX Spark prefill | DGX Spark decode | M2 Ultra prefill | M2 Ultra decode |
| --: | --: | --: | --: | --: |
| 1 | 1,152 | 57.1 | 1,201 | **88.6** |
| 4 | 2,480 | 98.5 | 1,702 | 151.2 |
| 8 | 2,492 | 159.2 | 1,705 | 176.0 |
| 32 | **2,481** | **353.3** | 1,708 | 279.4 |

Two observations worth carrying forward: the M2 Ultra wins single-user decode by 55% while
the Spark wins long-context prefill by 1.6× and overtakes on decode around batch 8–16; and
**llama.cpp does continuous batching and scales** (542 → 1,832 t/s from B=1 to B=32). The
widely repeated claim that llama.cpp or Ollama "processes requests sequentially" is false.

For genuine multi-user throughput the server-class engines are in a different class —
O(10⁴) tok/s aggregate for an 8B bf16 model on an H100, roughly **50× the single-stream
decode rate**. That gap, not any inter-engine delta, is the actual argument for a batching
engine. ⚠ The one well-specified cross-engine comparison found
([aimultiple](https://aimultiple.com/inference-engines), H100, Llama 3.1 8B bf16, 1,000
ShareGPT prompts) reports SGLang 16,215 / LMDeploy 16,132 / vLLM 12,553 output tok/s — but
it lists **SGLang v0.2.3, a mid-2024 release**, and all three versions are ≥6 months stale
relative to publication. The "SGLang is 29% faster than vLLM" figure should be treated as
unverified.

### 2e. Specialized wins

| Engine | Claim | Source quality |
| :-- | :-- | :-- |
| **BitNet.cpp** | 2.37×–6.17× over llama.cpp on ternary models; 5.07× on 70B, M2 Ultra | Good — [arXiv 2410.16144](https://arxiv.org/html/2410.16144v2) Table 4 |
| **ik_llama.cpp** | IQ3_K prefill 6.45×, decode 2.37× vs mainline on Ryzen 7950X; IQ4_K 2.7× lower quantization error than Q4_0 | Good — project discussions |
| **SmallThinker** | At an 8 GB cap on a phone, Qwen3-30B-A3B collapses to 0.18 tok/s while SmallThinker 21B holds 15.50 — an ~86× gap | Good — in-repo README |
| **ktransformers** | 9.44× prefill, 3.03× decode vs llama.cpp on DeepSeek-R1 671B | ⚠ **Stale.** Feb 2025 data; the llama.cpp baseline predates `--n-cpu-moe`/`-ot` expert offload |
| **T-MAC** | 4–5× over llama.cpp on 2-bit; 0.66 J/tok vs 1.54 for GPU | ⚠ Profiled against llama.cpp b2794, **May 2024**; project dormant 14 months |
| **PowerInfer** | Up to 11.69× vs llama.cpp | ⚠ 2023–24 data; ReLU-sparsified models only; project dormant |
| **Multi-Token Prediction** | "Up to 3× speedup without degradation" across Gemma 4 | Google first-party; drafters now shared across LiteRT-LM, MLX, transformers, vLLM, SGLang, Ollama |

### 2f. Desktop numbers from non-llama.cpp engines

Not comparable to §2b — different models, different quantization — but useful as sanity checks.

| Engine | Model | Hardware | Prefill | Decode |
| :-- | :-- | :-- | --: | --: |
| LiteRT-LM | Gemma-4-E2B (mixed 2/4/8-bit, 2.58 GB) | RTX 4090, GPU | **11,234** | **143** |
| LiteRT-LM | same | M4 Max, GPU | 7,835 | 160 |
| LiteRT-LM | same | M4 Max, CPU | 901 | 42 |
| LiteRT-LM | same | Raspberry Pi 5 16 GB, CPU | 133 | 8 |
| Ollama (MLX, NVFP4) | Qwen3.5-35B-A3B | M5-class ⚠ chip not isolated | 1,810 | 112 |
| Ollama (llama.cpp Q4_K_M) | same | same | 1,154 | 58 |
| tinygrad | Llama-3.2-3B f16 | tinybox green (NV) | 41 | 127 |
| tinygrad | Qwen3.6-35B-A3B UD-Q4_K_M | tinybox (AMD) | 12 | 151 |
| cactus | Gemma-4-E2B-CQ4 | M5 Max | 2,964 | 154 |
| cactus | same | iPhone 17 Pro | 729 | 37 |
| Qualcomm Genie | Qwen3-4B w4a16, 4096 ctx | Snapdragon 8 Elite Gen 5 … X Elite | — | 5.74–39.13 |
| ExecuTorch | Llama 1B SpinQuant | OnePlus 12, XNNPACK | 260.5 | 50.2 |

---

## 3. The engines in detail

### 3.1 llama.cpp / `libllama` — the baseline

[ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp) · C/C++ · **MIT** · 122,127★ ·
21,159 forks · master `5f55650a78`, release tag **b10198** (2026-07-30). Releases are
per-commit, multiple per day. [ggml-org/ggml](https://github.com/ggml-org/ggml) — MIT,
15,082★ — is the underlying tensor library and is usable standalone; it now has semver
releases. ⚠ (Detail on the semver cutover date was not captured.)

**Backends** — the widest matrix in existence: CPU (AVX2/AVX-512/AMX, ARM NEON/i8mm/SME,
RISC-V), CUDA, Metal, HIP/ROCm, Vulkan, SYCL, CANN (Ascend), OpenCL (Adreno), MUSA, BLAS,
plus an experimental **Hexagon NPU (HTP)** backend supporting HTP v73/v75/v79/v81 that
requires the Hexagon SDK Community Edition 6.6+ at build time, and an RPC backend.

**Format and quantization**: GGUF. K-quants, i-quants (IQ1_S…IQ4_XS), ternary **TQ1_0
(1.69 bpw) / TQ2_0 (2.06 bpw)**, MXFP4, NVFP4. Note the ternary types are **CPU-only** —
zero hits in the CUDA, Metal or Vulkan backends, and a Metal request
([#24477](https://github.com/ggml-org/llama.cpp/issues/24477)) was auto-closed as stale on
2026-07-27 with nothing merged.

**API**: the C API in `llama.h` — `llama_model_load_from_file`, `llama_init_from_model`,
`llama_batch` / `llama_decode`, and the sampler-chain API. `llama-cpp.h` adds only RAII
wrappers. Multimodal lives in `libmtmd`. GBNF grammars and JSON-schema constrained decoding
are built in, as are speculative decoding and MTP.

**Apple embedding — the SPM package is gone.** `Package.swift` no longer exists at the repo
root; git history for that path ends at `a057897ad`, 2025-03-05, *"llama : add xcframework
build script"*. **Every release now publishes `llama-bNNNN-xcframework.zip` as an asset**,
and the current recommended path is an SPM `.binaryTarget` pointing at that zip with its
checksum. `examples/llama.swiftui` is stale demo code (last touched 2025-06-06);
`examples/llama.android` by contrast is maintained (2026-05-22). There is **no official
llama.cpp AAR** on Maven Central or JitPack.

**Also in-tree, and relevant to a CLI project**: an `app/` tree, a `llama-agent` reference
implementation, and "Pi", a local coding agent from ggml-org. ⚠ These were discovered but
not characterized in detail — worth reading before designing a CLI from scratch.

### 3.2 ik_llama.cpp — where quantization research actually happens

[ikawrakow/ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp) · C++ · **MIT** ·
2,977★ · forked June 2024, **last synced with upstream August 2024**, 4,763+ commits, last
commit 2026-07-30. The most actively developed project surveyed — multiple merges per day.

Per its README, features that appeared here *before* mainline: MLA, quant repacking, fused
delta-net, tensor parallelism, MTP, DFlash. The draw is the **IQ_K non-linear quants**
(IQ2_KS through IQ6_K), which use tiny 4–64-value INT8 lookup tables so they vectorize well
on CPU, plus `_R4` row-interleaved variants, trellis quants (IQ1_KT–IQ4_KT), and Q8_KV cache.

Quality on LLaMA-3.1-70B: **IQ4_K has 2.7× lower quantization error than Q4_0**, IQ5_K 2.1×
lower than Q5_0, ~40% error reduction vs Q4_K_S/Q5_K_S.

DeepSeek-R1 671B on a Threadripper PRO 7965WX + RTX A6000 with `--override-tensor exps=CPU`:
Unsloth Q2_K_XL 69.85 prefill / 7.35 decode, rising to **110.79 / 13.13** with `-rtr 1`.
64k context in under 24 GB VRAM at >15 tok/s.

**Three real caveats.** Only CPU (AVX2+) and CUDA (Turing+) are supported — ROCm, Vulkan and
Metal issues will be closed unread. AVX-512 machines **must** pass extra build flags or a
vanilla Release build *"silently falls back to the AVX2 path"*. And because it last synced in
Aug 2024, the C API has diverged from modern llama.cpp. Only one release tag exists
(`t0002`, 2025-07-22) — build from `main`.

### 3.3 ExLlamaV3 — quality per bit on NVIDIA

[turboderp-org/exllamav3](https://github.com/turboderp-org/exllamav3) · Python + CUDA ·
**MIT** · 1,085★. **Left alpha at v1.0.0 on 2026-07-14**, then v1.1.0 (07-18), v1.2.0
(07-25), **v1.2.1 (07-27)** — sub-two-week cadence.

EXL3 is a **QTIP variant** using a procedural codebook and tail-biting trellis structures.
Hessians are computed on the fly with a fused Viterbi kernel, so quantizing a 70B takes hours
on one 4090 versus AQLM's ~720 A100-GPU-hours. Documented operating points span 1.6–8 bpw.
v1.0.0 changed the default codebook to `mul1`, dropped hard dependencies on flash-attn-2 /
xformers / causal_conv1d, and made cache quantization **latency-free** (*"For KV-heavy models,
quantization often increases throughput instead"*).

Decode gains from the v1.0 kernel work are large and inversely proportional to bitrate —
Llama-3.1-8B at 2 bpw on a 3090 went 94 → **146** tok/s (+55%), Qwen 3.6 27B at 3 bpw
29 → **50** (+72%) — while prefill barely moved (1–13%). 60+ architectures, ~14 multimodal,
tensor **and expert** parallelism, continuous dynamic batching, speculative decoding, and an
HF Transformers plugin (converted models retain original tensor names).

Turboderp is notably non-promotional: *"GGUF i-quants are abundant, and it's worth noting
that they hold up well in comparison to SOTA formats."* **The only remaining to-do is ROCm**,
so treat it as NVIDIA-only — no ROCm, no Apple, no CPU.

### 3.4 gemma.cpp — the cleanest library API surveyed

[google/gemma.cpp](https://github.com/google/gemma.cpp) · C++17 · **Apache-2.0** · 7,003★.
**Look at the `dev` branch**: `main` last saw a commit 2025-10-23, while `dev` is at
2026-07-28 with multi-commits-per-day cadence. The README is stale.

Model coverage is far broader than "Gemma": the `Model` enum on `dev` includes
**GEMMA4_26B_MOE, GEMMA4_2B, DEEPSEEK4_FLASH, T5GEMMA, QWEN3_600M/2B/4B**, plus the Gemma 2/3
and PaliGemma families. There is a whole `deepseek/` directory implementing DeepSeek-V4-Flash
with MLA.

Architecturally distinctive: SIMD via [Google Highway](https://github.com/google/highway) with
**runtime ISA dispatch** from a single source, rather than ggml's hand-written per-arch
kernels; a custom `.sbs` weight format with mixed fp8/bf16/fp32 and non-uniform 4-bit, where
**compression is integrated directly into the GEMM** rather than being a separate dequant
step; and automatic runtime autotuning of 7 GEMM parameters per matrix shape.

Explicitly designed to embed — *"~2K LoC core"*, builds `libgemma.a`, documented `FetchContent`
integration, clean streaming-callback API. **Costs**: CPU-only with no GPU backend at all;
**Safetensors conversion is not open sourced**, so `.sbs` artifacts must come from Google;
⚠ **no published tok/s figures with named hardware exist anywhere**; and the project
self-describes as targeting *"experimentation and research"*, recommends JAX/Keras/PyTorch for
production edge deployments, and states *"this is not an officially supported Google product."*

### 3.5 The Google edge stack — LiteRT-LM, and the naming maze

Three renames to internalize:

- **`litert` is not a PyPI package.** The wheel is **`ai-edge-litert` 2.1.6**.
- **`ai-edge-torch` was renamed to `litert-torch`.** The old package's summary is literally
  *"DEPRECATED: renamed to litert-torch"*.
- **MediaPipe's LLM Inference API is in maintenance-only mode.** Verbatim from the guide:
  *"We recommend migrating your projects to LiteRT-LM."* Hard corroboration:
  `com.google.mediapipe:tasks-genai` is frozen at 0.10.35 (2026-04-27) while sibling
  `tasks-vision` shipped **1.0.0 on 2026-07-27**. Do not start new work on `tasks-genai`.

**[LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)** · C++ · **Apache-2.0** · 6,059★ ·
**v0.14.0 (2026-07-08)** · 229 PRs merged in July 2026. Still 0.x, but the README
self-describes as production-ready and claims it powers on-device GenAI in **Chrome,
Chromebook Plus and Pixel Watch**, and the **C++ API is marked "Stable"**.

The API is chat-oriented rather than a low-level runner: `ModelAssets` → `EngineSettings` →
`Engine::CreateEngine` → `Conversation::Create` → `SendMessage` / `SendMessageAsync`.
Dependencies are Abseil + nlohmann/json.

**The main friction is the build**: **Bazel 7.6.1 only, no CMake anywhere**, Git LFS for
prebuilt shared libraries, and special flags plus manual library colocation for GPU on any
platform. The docs open by saying *"You do **not** need to build this project from source"*.
Prebuilt artifacts do exist, including `litert_lm_main.macos_arm64` (a 15.6 MB prebuilt CLI)
and Apple xcframeworks, and the `litert-lm` CLI itself is a shipping desktop product with
`run` / `serve` / `benchmark` subcommands, an OpenAI-compatible server, and Linux/macOS/
Windows/Android/Raspberry Pi support.

**Where it leads the field is desktop GPU** — native Windows, working GPU on all three
desktop OSes, and published numbers (§2f). Costs: Bazel, a heavier dependency surface, a
Gemma-centric model zoo, and 0.x with no semver contract.

`litert-torch` is the authoring path, and it is much less mature: **Linux-only for
conversion**, PyTorch converter in Beta, **Generative API in Alpha**, and the `.litertlm`
builder available only as a nightly package.

### 3.6 ExecuTorch — the best citizen to embed

[pytorch/executorch](https://github.com/pytorch/executorch) · C++ · **BSD-3-Clause** (GitHub
reports NOASSERTION only because the header carries eight copyright holders) · 4,844★ ·
~347 contributors · **708 PRs merged in July 2026**. **v1.0.0 shipped 2025-10-18**; current
is **v1.3.1 (2026-05-29)**.

CMake-first (`add_subdirectory`, link `executorch`, `::backends`, `::extensions`, `::kernels`),
Swift Package Manager with prebuilt xcframeworks on Apple, and `org.pytorch:executorch-android`
on Maven Central. No libtorch and no Python at inference time. The `.ptd` FlatTensor format
enables **program-data separation** — weight sharing across programs, LoRA adapters over a
shared base, independent updates of program vs weights. Model coverage is the widest of any
edge runtime here (~40 architectures including `gemma4`, `qwen3_5_moe`, Voxtral, Whisper,
Stable Diffusion, YOLO).

**Three caveats that matter more than the "1.0" label.** `TextLLMRunner` is declared
`class ET_EXPERIMENTAL` — **the LLM runner API is still explicitly experimental at 1.3.1**;
1.0 stability applies to the core runtime. There is a `.pte` backward-compatibility promise of
at least six months but **no forward compatibility and no ABI stability promise**. And the
desktop story is candid in its own [`desktop/README.md`](https://github.com/pytorch/executorch/blob/main/desktop/README.md):
*"ExecuTorch is now **experimenting** with CUDA and Metal support … On windows we only
supports WSL right now. Native Windows support is WIP."* MPS is deprecated and slated for
removal.

Honest self-reported comparison against llama.cpp, from
[arXiv 2605.08195](https://arxiv.org/html/2605.08195) (authored by the ExecuTorch team):
on CPU *"llama.cpp demonstrates higher decode throughput for Qwen3 and Phi4 Mini"*; on GPU
ExecuTorch's Vulkan underperforms llama.cpp's OpenCL on prefill but beats it on decode; on
**NPU ExecuTorch wins decisively** — *"llama.cpp's Hexagon backend achieves much lower
throughput compared to QNN."*

### 3.7 onnxruntime-genai and OpenVINO GenAI

**[onnxruntime-genai](https://github.com/microsoft/onnxruntime-genai)** · C++ · **MIT** ·
1,092★ · **v0.15.0 (2026-07-30)** — very actively released. Implements the entire generative
loop natively: pre/post-processing, logits processing, search and sampling, KV-cache
management, **grammar/constrained decoding for tool calling**, multi-LoRA, continuous decoding.
APIs in **Python, C#, C, C++, Java**. Execution providers: CPU, CUDA, DirectML,
**NvTensorRtRtx**, OpenVINO, **QNN**, WebGPU; Linux/Windows/Mac/Android. It powers **Foundry
Local, Windows ML and the VS Code AI Toolkit**. The correct division of labour on the ONNX
path is `optimum-onnx` for *export* (which saw only 7 commits in all of 2026) and
onnxruntime-genai for the *runtime*.

**OpenVINO GenAI** · Apache-2.0 · `openvino-genai` **2026.2.1.0** — `ov::genai::LLMPipeline`
in C++ and Python, NPU support on Intel Core Ultra, conversion via optimum-intel, NNCF weight
compression. ⚠ Official Intel benchmark CSVs were located but the specific rows were not
captured before that agent was stopped.

### 3.8 Rust, Go, JVM, .NET

The decisive differentiator across all bindings is **how far behind upstream llama.cpp each
one pins**. Measured with the GitHub compare API against master HEAD at b10198:

| Binding | Pinned | Commits behind |
| :-- | :-- | --: |
| **java-llama.cpp — ladenthin fork** | b10173 | **27** |
| **llama.rn** (React Native) | b10156 | **44** |
| **yzma** (Go, purego) | b10105+ | ~90 ⚠ |
| Ollama | b10091 | 109 |
| **node-llama-cpp** v3.19.1 | b10068 | 132 |
| LLM.swift v3.0.3 | b10068 | 132 |
| **llama-cpp-python** v0.3.34 | — | **224** |
| **llama-cpp-rs** 0.1.153 | — | **647** |
| LLamaSharp v0.27.0 (latest shipped) | — | **1,384** |
| SwiftLlama v0.4.0 | b5046 | 5,154 ⚠ |
| go-skynet/go-llama.cpp | 2023-09-27 | **8,922** ☠ |

**Rust.** The default is **`llama-cpp-2`** ([utilityai/llama-cpp-rs](https://github.com/utilityai/llama-cpp-rs))
— dual `MIT OR Apache-2.0` per the Cargo manifests, 470k recent downloads, multimodal via
`mtmd`, Android-ready, thin idiomatic API. ⚠ It is 647 commits behind despite a README
claiming it *"was created with the explicit goal of staying as up to date as possible."*
The pure-Rust alternative is **[mistral.rs](https://github.com/EricLBuehler/mistral.rs)**
(MIT, 7,552★, v0.9.0 2026-07-07) — its own engine built on candle, with GGUF/GPTQ/AWQ/HQQ/FP8,
in-situ quantization, very broad multimodality, and published CUDA numbers (Gemma 4 E4B Q8 on
GB10: 7,395 prefill / 44.1 decode). Two frictions: the published crate lags the repo (0.8.1 vs
v0.9.0), and **there is no C FFI crate** — a code search for `crate-type = ["cdylib"]` returns
exactly one hit, the Python bindings — so embedding into a C/C++ CLI means writing and
maintaining an `extern "C"` wrapper. [candle](https://github.com/huggingface/candle)
(Apache-2.0, 20,800★) has the same FFI caveat. **Dead: rustformers/llm (archived
2024-06-24), edgenai `llama_cpp` (abandoned).** ⚠ `drama_llama` is alive but **RAIL-S
licensed** and self-declared not production-ready. [ZML](https://github.com/zml/zml) (Zig,
Apache-2.0, 3,944★, active) is a *compilation framework* where models are written in Zig and
built with Bazel — no documented C API, accelerator-oriented, awkward for a CLI.

**Go.** The answer is **[yzma](https://github.com/hybridgroup/yzma)** — Apache-2.0,
**cgo-free**, loading llama.cpp/ggml shared libraries at runtime via
[purego](https://github.com/ebitengine/purego). *"No C compiler needed!"* means shipping a
normal Go binary plus llama.cpp's own official release `.so`/`.dylib`, which is a genuinely
better distribution story than cgo. It maintains an explicit llama.cpp compatibility matrix,
tracks build windows deliberately (v1.21.0 shipped 2026-07-30), has the second-broadest
backend list including SYCL, and supports multimodal. **go-skynet/go-llama.cpp is dead** —
8,922 commits behind, master untouched for 28 months, and its `pushed_at` field is misleading
because only bot branches move. **Ollama and LocalAI are subprocess architectures, not
libraries.** ⚠ Other Go leads found but not written up: `litertlm-go`, GoMLX/`gollmx`,
`go-huggingface` (which contains a pure-Go GGUF dequantizer), and
`knights-analytics/ortgenai` (Go bindings to ONNX Runtime GenAI).

**JVM.** Use **[bernardladenthin/java-llama.cpp](https://github.com/bernardladenthin/java-llama.cpp)**
(`net.ladenthin:llama:5.0.6`) — MIT, **the freshest binding surveyed at 27 commits behind**,
0 open issues, heavily test-instrumented, GPU builds via Maven classifiers. Weigh the bus
factor: 14 stars, single maintainer. The original **kherud/java-llama.cpp is abandoned** —
last commit 2025-06-20, pinned to b4916, with an open issue *"Notice: project no longer
maintained, link to active fork"* that the owner never answered. **[JLama](https://github.com/tjake/Jlama)**
(pure Java, Panama/Vector API, Apache-2.0, 1,297★) is going stale — last commit 2025-10-12,
last release 2025-01-01 — and ⚠ a "retirement" issue plus an active fork named **Deliverance**
were found but not investigated. Also relevant: **the Vector API is still in incubator**, and
**`ai.djl.llama` is frozen at 0.28.0 (May 2024)** — DJL's `genai` extension is remote API
clients, not local inference. ⚠ `GPULlama3` keeps a performance-history file worth reading.

**.NET.** **[LLamaSharp](https://github.com/SciSharp/LLamaSharp)** — MIT, 3,758★, the easiest
install story of any binding (prebuilt NuGet backend packages, no C++ toolchain) and **the
most thorough libmtmd multimodal surface** of any binding surveyed. The problem is staleness:
the shipped **v0.27.0 is 1,384 commits behind**; master is being prepped for v0.28.0 at 902
behind but is unreleased. Release cadence is 2–6 months. Credit where due — the README
maintains an explicit version→llama.cpp-commit table, which is how these numbers were derived.

**Other host languages.** Python → **llama-cpp-python** (MIT, 10,520★, v0.3.34, broadest
backend matrix, both multimodal stacks; accept a 598-issue backlog and effectively
single-maintainer status). Node/Electron → **node-llama-cpp** (MIT, cleanest backlog and best
DX, GBNF grammar enforcement — but **text-only, no multimodal**, and Metal/CUDA/Vulkan only).
React Native → **llama.rn** (freshest tracking, SHA-256-verified prebuilt artifacts, vision
*and* audio, Adreno OpenCL and Hexagon NPU; requires RN New Architecture from v0.10).
Swift → the official XCFramework via SPM `.binaryTarget`, using
[LLM.swift](https://github.com/eastriverlee/LLM.swift)'s `Package.swift` as the reference
pattern. **SwiftLlama is stale (5,154 commits behind) — avoid.**

### 3.9 Server-class engines, for completeness

All of these are genuinely embeddable as in-process Python libraries; none is shaped right for
a local CLI.

- **[vLLM](https://github.com/vllm-project/vllm)** — Apache-2.0, 87.7k★, **v0.26.0**, **3,119
  commits since 2026-05-01**. `from vllm import LLM` is a real embedded engine. Two corrections
  to a 2025 mental model: Model Runner V2 superseded the "V1 engine" in v0.25.0, and
  **PagedAttention was removed**. **GGUF support has moved out-of-tree** (`vllm-gguf-plugin`)
  and remains *"highly experimental and under-optimized"* — do not plan on vLLM as a GGUF
  runtime. macOS is experimental, FP32/FP16 only, with **no published wheel and no Metal**.
- **[SGLang](https://github.com/sgl-project/sglang)** — Apache-2.0, **v0.5.16**, **3,703
  commits/quarter**, the highest development velocity in the field. `sgl.Engine` is explicitly
  *"direct inference without the need for an HTTP server"*. RadixAttention prefix reuse is the
  right structural advantage for agentic and multi-turn workloads.
- **[LMDeploy](https://github.com/InternLM/lmdeploy)** — Apache-2.0, v0.14.0, the **cleanest
  offline API** of the four (`lmdeploy.pipeline(...)`), and notably `serve()`/`client()` are now
  deprecated and raise `NotImplementedError` — the library entry point is deliberately
  in-process. NVIDIA + Ascend. No GGUF. Discount for a ~20× smaller development effort.
- **[transformers](https://github.com/huggingface/transformers) v5.14.1** — v5.0.0 shipped
  2026-01-26 with **weekly minor releases** since. It now has genuine paged attention,
  `ContinuousBatchingManager`, and **prefix caching on by default** — arriving *after* vLLM
  deleted its PagedAttention. HF states its own position plainly: *"We don't aim to do
  specialized optimizations like the dedicated inference engines."* Budget for the v5 breaking
  changes (no TF/Flax, no torchscript/torch.fx, `load_in_4bit=` removed, `dtype` default
  `auto`, safetensors-only). Note `--compile` is incompatible with `--continuous-batching`.
- **[tinygrad](https://github.com/tinygrad/tinygrad)** — MIT, 33,376★, **986 commits since
  2026-05-01**. Genuinely reclassified during this research: `tinygrad.llm` shipped in 2026 as a
  real, GGUF-native, in-process runtime, and it **is in the pip wheel**
  (`Transformer.from_gguf(...)` returning a token generator). CI-measured throughput on
  self-hosted hardware (§2f). Real limits: **weights are dequantized to FP16 on load**, so GGUF
  gives compatibility but not memory savings; no continuous batching or paged attention; no
  quantized *compute* kernels; slow first-run JIT; a hardcoded ~17-entry model registry; and
  poor tensor-parallel decode scaling.

---

## 4. Traps worth knowing about

**Mainline llama.cpp silently mis-runs Microsoft's BitNet model.** `src/models/bitnet.cpp`
uses `LLM_FFN_SILU`, which is correct for `BitnetForCausalLM` (the 1bitLLM 3B model llama.cpp
targets) but wrong for Microsoft's `BitNetForCausalLM` 2B-4T, which uses **squared ReLU**.
[PR #25885](https://github.com/ggml-org/llama.cpp/pull/25885) proposed the one-token fix with
measured wikitext-2 perplexity **99.82 → 17.11**, and was **closed unmerged within 40 minutes**
with a request to redo it via new metadata. No such PR has landed. Meanwhile
[PR #25769](https://github.com/ggml-org/llama.cpp/pull/25769) (merged 2026-07-16) registered
`BitNetForCausalLM` as a conversion alias — so **converting the Microsoft model with mainline
succeeds silently and then generates degraded output.** Working BitNet requires
[BitNet.cpp](https://github.com/microsoft/BitNet) or ik_llama.cpp.

**BitNet.cpp has a supply-chain oddity.** Its `.gitmodules` pins `3rdparty/llama.cpp` to
`https://github.com/isHuangXin/llama.cpp`, a personal fork of a personal fork. The pinned
commit is fresh (2026-07-15), but the core dependency is an individual's branch.

**NPU decode does not deliver.** This pattern held across all three vendors independently.
On Qualcomm, academic measurement ([arXiv 2410.03613](https://arxiv.org/html/2410.03613v2))
found AI Hub delivers ~50× prefill speedup over CPU/GPU while **decode is only marginally
better than CPU**; Qualcomm's own support forum carries a thread titled *"Why does the Surface
Pro 11's Snapdragon X Elite NPU perform so much worse than the CPU for Llama 3.2 3B"*. On AMD,
FastFlowLM NPU decode lands at ~8–28 tok/s while the same machine's Vulkan iGPU does ~101
tok/s on a 30B MoE. **Decode is memory-bandwidth-bound, so TOPS figures do not translate into
tokens/sec.** The NPU's argument is power and leaving the GPU free, not throughput. ⚠ No
rigorous same-model same-machine NPU-vs-iGPU comparison was found.

**On AMD, "Vulkan beats ROCm" is only half true.** From
[Discussion #15021](https://github.com/ggml-org/llama.cpp/discussions/15021): RX 7800 XT ROCm
2,151 prefill / 100.9 decode vs Vulkan 2,145 / 96.9; RX 7600 XT ROCm 1,099 / 48.6 vs Vulkan
606 / **52.8**. **ROCm wins prefill, Vulkan matches or beats it on decode.** Separately,
**Vulkan is the shippable AMD backend** — rocBLAS kernel fatbins are enormous, and Lemonade's
own docs refuse to bundle `llamacpp:rocm` on any OS.

**No binding documents its own FFI overhead.** Not one of llama-cpp-python, node-llama-cpp,
llama-cpp-rs, LLamaSharp, java-llama.cpp or llama.rn publishes a measured overhead figure
against a `llama-bench` baseline. Any overhead claim encountered is unsourced. This is the
single biggest evidence gap in the space.

**Ollama overhead is unresolved.** No credible primary measurement exists. Secondary sources
span "within 2–10% at batch 1" to "30–70% fewer tokens/s". Mechanistically, since Ollama wraps
llama.cpp, a large batch-1 gap would have to come from **defaults, not engine speed** —
context size, flash attention on/off, KV-cache quantization, and whether tok/s is computed
end-to-end or steady-state. Any number that does not pin those four things is noise.

### Licensing landmines

| Project | Issue |
| :-- | :-- |
| **koboldcpp** | **AGPL-3.0.** It has the best C ABI of any llama.cpp derivative (~45 exports, flat `extern "C"`, documented structs in `expose.h`) — but linking makes a CLI a derivative work, and §13's network clause triggers if the tool is ever network-reachable. Fatal for proprietary use. Also: undocumented, unstable, unendorsed ABI and single global model state. |
| **cactus** | **Source-available, not OSI.** Grants rights only to individuals for non-commercial use, organizations with **both <$2M funding AND <$2M revenue**, educational institutions, and 501(c)(3) non-profits. License was churned repeatedly in Sept 2025 — re-read before committing. Also: v2.0 (2026-07-09) rewrote onto its own ARM NEON kernels and proprietary CQ1–CQ4 quantization; **it does not consume GGUF** and is no longer a llama.cpp wrapper. |
| **LM Studio** | **Proprietary** (Element Labs). Terms forbid sublicensing, SaaS use, derivative works, and *"open-source integration that would impose copyleft requirements"*. There is **no LM Studio llama.cpp fork** — verified two ways. Only `mlx-engine` (MIT Python, Apple Silicon, no GGUF) is importable. |
| **Qualcomm QAIRT / Genie** | Proprietary EULA. ⚠ **The applicable redistribution clause could not be retrieved** — the only license text surfaced was for the AI 100 Cloud SDK, which grants dev/test rights only. Shipping Android apps demonstrably embed `libQnnHtp.so`, so redistribution is presumably permitted, but **this is a genuine legal blocker to resolve before shipping**. |
| **TensorRT-RTX** | PyPI declares "Proprietary"; the referenced NVIDIA license agreement could not be fetched. |
| **Gemma-derived models** | The real constraint is model licensing, and the labelling is inconsistent. `litert-community/gemma-4-E2B-it-litert-lm` displays **Apache-2.0** while being a Gemma derivative of an upstream governed by the **Gemma Terms of Use**. Treat the Gemma terms as governing and verify per-repo. |
| **unsloth-zoo** | **LGPL-3.0-or-later**, unlike `unsloth` itself (Apache-2.0). |
| **drama_llama** | RAIL-S — use-restricted, not OSI. |

---

## 5. Dead, archived, or pivoted — do not start here

| Project | Status |
| :-- | :-- |
| **TGI** | Archived read-only 2026-03-21. HF redirects to vLLM/SGLang/llama.cpp/MLX. |
| **ipex-llm** | Archived by Intel 2026-01-28, *"known security issues"*. Successor `llm-scaler` is Docker images wrapping vLLM/SGLang for Arc Pro, not a library. For Intel consumer hardware the live paths are llama.cpp SYCL or Vulkan, OpenVINO GenAI, or vLLM XPU. |
| **DeepSpeed-MII / FastGen** | Dead — 0 commits since 2026-05-01, last release 2025-03-25, `qwen3` unsupported issue open a year with zero comments. No formal deprecation notice, which is worse. DeepSpeed core is healthy but is now **a training library** (v0.19.0 contains zero inference content) and moved to the `deepspeedai` org under the PyTorch Foundation. |
| **ExLlamaV2** | Self-archived: *"This project is archived for now."* Last non-README commit 2025-12-09. |
| **MLC-LLM** | Maintenance mode — 8 commits in 90 days, all TVM-refactor adaptation. Only release ever is `v0.1.dev0` (2023). |
| **ktransformers** | Pivoted. Framework in `archive/`; `kt-kernel` is a **MoE kernel operator only** (no `generate()`), consumed through a kvcache-ai fork of SGLang, and assumes a dual-socket AMX Xeon with hundreds of GB of DRAM. |
| **PowerInfer** | Dormant; org moved to `Tiiny-AI` and the team commercialized into hardware (Tiiny AI Pocket Lab, CES 2026). ReLU-only models, modified GGUF, open build failures. **PowerInfer-2 has no code after two years** — issue #207 open since 2024-07-02, unanswered. The interesting open successor is [SmallThinker](https://github.com/SJTU-IPADS/SmallThinker). |
| **T-MAC** | Dormant ~14 months. Its kernels reach users via BitNet.cpp's TL1/TL2. Never merged upstream — `.gitmodules` points at a personal llama.cpp fork. |
| **optimum-quanto** | Formal maintenance-mode banner naming bitsandbytes/torchao as successors. 9 commits in all of 2026, all dependabot. |
| **rustformers/llm** | Archived 2024-06-24. |
| **go-skynet/go-llama.cpp** | 8,922 commits behind; master untouched 28 months; no deprecation notice. |
| **kherud/java-llama.cpp** | Abandoned; unanswered abandonment issue. Use the ladenthin fork. |
| **nano-vllm** | Finished pedagogical reimplementation, 0 commits since May. |
| **NVIDIA RTX-AI-Toolkit** | Archived 2025-11-24; absorbed into TensorRT-RTX + Windows ML. |
| **NVIDIA AIM SDK** | "Early access" in every source; no GA, no repo, no version. Likely abandoned. |

---

## 6. Recommendation for a local LLM CLI

**Embed `libllama` directly.** It is the only choice that does not require accepting a major
compromise, and the compromises it does carry are known and small.

- **Distribution shape.** Prefer linking against llama.cpp's **official per-release binary
  artifacts** over vendoring and building. Every release publishes macOS arm64/x64, Ubuntu
  arm64, Android arm64, plus Vulkan / ROCm 7.2 / SYCL / OpenVINO builds, and an
  `xcframework.zip` for Apple. The **yzma** model — ship a small binary that loads llama.cpp's
  own shared libraries at runtime — is worth copying regardless of host language, because it
  decouples release cadence from build complexity.
- **Backend defaults.** CPU plus Vulkan covers AMD and Intel without vendor runtimes; CUDA for
  NVIDIA; Metal on Apple. Skip ROCm for a redistributable binary. Skip NPUs entirely for a
  first version — the decode data does not justify the integration cost.
- **Where to deviate.** Add **ik_llama.cpp** as an optional backend if CPU-only users or
  sub-4-bit quantization quality matter; add **ExLlamaV3** only if NVIDIA users need models
  that do not otherwise fit.
- **What to skip.** A GGUF path through vLLM (out-of-tree and under-optimized), TensorRT-LLM
  (no consumer RTX), anything AGPL or source-available, and MLC-LLM.
- **Also worth reading first**: llama.cpp's in-tree `app/` tree, `llama-agent`, and the "Pi"
  local coding agent — a CLI-shaped reference implementation already exists upstream.

**If the CLI is Apple-only**, a genuinely different architecture — MLX, and Apple's own Core AI
/ Foundation Models frameworks — is worth weighing instead of defaulting to llama.cpp. See
[`docs/apple-llm-frameworks.md`](./apple-llm-frameworks.md) for the recommendation.

---

## 7. Unverified — collected flags

Each is a genuine gap, not a detail. (Apple-specific gaps are collected in the companion
document instead of here — see §1.)

**Missing numbers** — every one of these is measurable locally, and nobody has published it:

1. **gemma.cpp throughput** — no tok/s figure with named hardware exists anywhere.
2. **A controlled 2026 llama.cpp vs ik_llama.cpp vs ktransformers MoE-offload head-to-head** —
   the single most valuable missing number in the space overall.
3. **Binding FFI overhead** — undocumented by every binding; must be measured locally with
   `llama-bench` as the control.
4. **OpenVINO GenAI benchmark rows** — official Intel CSVs located but not extracted.
5. **A rigorous same-model, same-machine NPU-vs-iGPU comparison** — the ~8–28 vs ~101 tok/s
   figures in §4 cross sources and models.

**Leads found but not investigated**

6. **Go**: `litertlm-go`, GoMLX/`gollmx`, `go-huggingface`'s pure-Go GGUF dequantizer,
   `knights-analytics/ortgenai`.
7. **`ggml-et`** — a ggml backend spotted in passing, presumably ExecuTorch-related.
8. **MLC-LLM** — one agent's narration called it "alive" while two others measured maintenance
   mode. The measurements are more credible, but the disagreement is unresolved.
9. **LocalScore** — whether the leaderboard still accepts submissions in 2026.
10. **MLPerf Client 2026** results and the HF LLM-Perf leaderboard status.

### Benchmark sources worth trusting

| Source | Credibility |
| :-- | :-- |
| llama.cpp `llama-bench` scoreboards — [CUDA #15013](https://github.com/ggml-org/llama.cpp/discussions/15013), [Apple #4167](https://github.com/ggml-org/llama.cpp/discussions/4167), [ROCm #15021](https://github.com/ggml-org/llama.cpp/discussions/15021), [Vulkan #10879](https://github.com/ggml-org/llama.cpp/discussions/10879), [SYCL #23313](https://github.com/ggml-org/llama.cpp/discussions/23313) | **Highest** — fixed model and quant, maintainer-curated |
| [llama.cpp `benches/`](https://github.com/ggml-org/llama.cpp/tree/master/benches) | **Highest** — maintainer-run, batch 1→32, includes eval accuracy. The most underused source in this space |
| ik_llama.cpp discussions | Medium-high — best for CPU/AVX-512 and MoE-offload deltas |
| [LocalScore](https://www.localscore.ai/about) | Medium — llamafile-based, single-GPU only, so it tracks llamafile-era llama.cpp |
| Vendor blogs (Ollama, Unsloth, Google, NVIDIA, AMD) | Medium — usually relative-only, hardware often under-specified |
| Generic "2026 benchmark" blogs (markaicode, techplained, spheron, sitepoint, insiderllm, runaihome, localaimaster, myaihardware) | **Low — avoid.** Mutually contradictory (RTX 5090 + Llama-3-8B-Q4 reported as 42, 142 and 213 tok/s), frequently describe deleted architecture, rarely state batch size or prefill-vs-decode |

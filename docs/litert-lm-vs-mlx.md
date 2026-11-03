# LiteRT-LM vs our MLX pipeline

Evaluation of Google's [LiteRT-LM Swift API](https://developers.google.com/edge/litert-lm/swift) as a potential alternative/complement to the MLX Swift pipeline in `LLMEvaluator`. Analysis only — no migration planned. Written 2026-07-03 against LiteRT-LM v0.13/0.14 (Swift API "Early Preview").

## Verdict

Not a viable replacement. The Swift API is Early Preview, the `.litertlm` catalog is a fraction of `mlx-community` (no Qwen3 line, no large MoE models), and it lacks the GPU memory introspection that `ModelCompatibility` gating and the Settings memory panel depend on. But it beats MLX on decode speed and (dramatically) memory for Gemma models specifically, and has three capabilities MLX Swift lacks: multimodal input, declarative tool calling, and speculative decoding. Re-check when the Swift API leaves Early Preview.

## Side-by-side

| Dimension | Our MLX pipeline | LiteRT-LM Swift |
|---|---|---|
| Maturity | MLX Swift v3, stable, shipped in v1.0.0 | Swift API "Early Preview" (v0.12+); C++/Kotlin/Python cores production-ready |
| Model format | Standard HF safetensors + config + tokenizer | Proprietary single-file `.litertlm` |
| Model catalog | All of `mlx-community` (~thousands); our 15-model ladder 0.3–44 GB | Mostly `litert-community`: Gemma 4 E2B/E4B/12B, some Qwen/Llama/Phi-4 — no Qwen3 30B/80B MoE equivalents |
| Downloading | Our own (HF tree API, resumable streaming in `ModelStorage`) | None built in — you provide a path; we'd still roll our own |
| Streaming | `MLXLMCommon.generate` AsyncStream + our cancel/throttle loop | `sendMessageStream` async sequence — same shape |
| Chat history | Explicit prompt history (`getPromptHistory`, `<think>` stripping, `/no_think`) | `Conversation` object owns history internally — less control for reasoning-model handling |
| KV cache | uncapped (`maxKVSize` retired 2026-07-30), `kvBits: 4` on iOS (per-family reality in [kv-cache.md](kv-cache.md)) | `maxNumTokens` only; no KV quantization control documented |
| Memory introspection | `GPU.activeMemory` / `GPU.snapshot()` — powers Settings memory panel and `MemoryBudget` | Nothing equivalent documented |
| Multimodal | Not in app (MLX Swift has `MLXVLM`, unused) | Image + audio input on Gemma 4, first-class API |
| Tool calling | We skip tool-call chunks in the stream | Declarative `Tool` protocol with `@ToolParam` |
| Decode speed tricks | None | Multi-token prediction (speculative decoding) behind experimental flags; Google claims up to 2.2× on Gemma 4 |
| Backends | Metal via MLX (Apple silicon only) | `.gpu` (Metal) / `.cpu`; NPU is Android-only in practice |

## API shape (for reference)

```swift
let engineConfig = try EngineConfig(
  modelPath: "path/to/model.litertlm",
  backend: .gpu,
  maxNumTokens: 512,          // KV-cache size
  cacheDir: NSTemporaryDirectory()
)
let engine = Engine(engineConfig: engineConfig)
try await engine.initialize()

let conversation = try await engine.createConversation(with: ConversationConfig(
  systemMessage: Message("You are a helpful assistant."),
  samplerConfig: try SamplerConfig(topK: 40, topP: 0.95, temperature: 0.7)
))
for try await chunk in conversation.sendMessageStream(Message("Hello!")) {
  print(chunk.toString, terminator: "")
}
```

Install via SPM: `https://github.com/google-ai-edge/LiteRT-LM`, from 0.12.0. iOS + macOS.

## Performance: is generation faster?

**Only for Gemma models — and yes, meaningfully so there.** Two data points:

**Independent benchmark** ([john-rocky, iPhone 17 Pro / A19 Pro, June 2026](https://dev.to/john-rocky/on-device-llm-on-iphone-which-runtime-is-fastest-mlx-vs-llamacpp-vs-litert-lm-vs-coreml-1b42), 128-token short-chat, median of 3 cold runs):

| Runtime | Gemma 4 E2B decode | Qwen 3.5 2B decode | Gemma 4 E2B peak RAM |
|---|---|---|---|
| LiteRT-LM | **55.4 tok/s** | n/a (Gemma only) | **641 MB** |
| MLX-Swift | 47.5 tok/s | **61.2 tok/s** | 2,900 MB |
| llama.cpp | 37.8 tok/s | 39.1 tok/s | 3,156 MB |
| CoreML/ANE | 33.4 tok/s | 27.9 tok/s | 1,187 MB |

So on Gemma 4 E2B: LiteRT-LM decodes ~17% faster than MLX **without** MTP, using ~4.5× less memory. With MTP enabled Google claims up to 2.2× further decode speedup on Gemma 4 ([InfoQ](https://www.infoq.com/news/2026/06/google-litertlm-gemma4/)). On non-Gemma models MLX wins (61.2 vs — LiteRT-LM's Qwen coverage doesn't include an equivalent), and our entire Qwen3 ladder doesn't run on LiteRT-LM at all.

**Google's own claim** of "1.8–3.7× faster prefill and decode than llama.cpp, MLX, Cactus, ONNX" ([blog](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)) is not reproduced by the independent numbers above for decode vs MLX (1.17×); treat it as best-case/prefill-weighted marketing.

**The memory number matters more than the speed number for us** — but the 4.5× headline is roughly half real efficiency, half iOS memory accounting:

- **Real, part 1 — mixed-bit quantization.** The E2B `.litertlm` is 2.6 GB using "a mixture of 2-bit, 4-bit and 8-bit weights" ([model card](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm)), vs 4.0 GB for our uniform OptiQ 4-bit. Smaller file → smaller resident core.
- **Real, part 2 — mmap'd embeddings.** Gemma E-series puts ~1.12 GB of embedding parameters in a memory-mapped region paged in on demand; the card states a "text-only weight footprint as low as 0.8 GB". MLX loads everything into Metal buffers up front.
- **Accounting.** iOS charges apps for dirty + compressed memory (`phys_footprint`, what jetsam enforces); clean file-backed mmap pages are not charged. LiteRT-LM's mmap'd weights are largely invisible to the metric, while MLX's Metal allocations are fully charged. The tell: Google's own numbers for the *same* E2B file are 607 MB on iPhone 17 Pro but 1,733 MB on Android and 1,628 MB on Linux — the model didn't shrink 3×, the accounting differs. The true working set for fast decode is plausibly ~1.5 GB+.

Practical upshot: the low number is still partly real for us, because jetsam kills on `phys_footprint` too — clean mmap'd weights genuinely don't count against the limit, and under pressure they get evicted (slower tokens via SSD re-faults) instead of the app being killed. So LiteRT-LM Gemma would survive on smaller iPhones than our OptiQ builds, but the honest efficiency gain is ~2×, not 4.5×, and sustained decode speed under memory pressure is unmeasured. No Mac numbers in the independent bench (Google's own M4 Max CPU figure: 736 MB); the gap matters less on Macs anyway.

Other caveats: single device (iPhone 17 Pro), short-context chat only (bench context 2048; long-context behavior with our uncapped 4-bit KV untested), and mixed 2/4/8-bit is a different quality point than our OptiQ 4-bit, so output quality isn't apples-to-apples either.

## What switching would cost / gain

**Lose:** the Qwen3 line including the bundled default model (would need unsupported conversion to `.litertlm`), 4-bit KV cache config, `GPU.activeMemory` instrumentation (Settings memory panel, `MemoryBudget.maxModelDiskSize`), explicit history control for thinking-mode handling.

**Gain:** multimodal input, declarative tool calling, MTP/speculative decoding, single-file model downloads, much lower Gemma memory footprint.

None of the gains except speculative decoding require leaving MLX: vision could come from `MLXVLM`; tool calling is already in the chat-template plumbing (we currently drop tool-call chunks in `generate()`).

**Possible middle path (if ever justified):** dual-runtime — keep MLX as the engine and add LiteRT-LM only for Gemma models behind the `LLMEvaluator` seam. Real cost: two runtimes in the binary, two download formats, memory display degraded for LiteRT models. Not worth it while Gemma is a secondary line in the catalog.

## Sources

- [LiteRT-LM Swift docs](https://developers.google.com/edge/litert-lm/swift)
- [LiteRT-LM GitHub](https://github.com/google-ai-edge/LiteRT-LM)
- [litert-community models on Hugging Face](https://huggingface.co/models?library=litert-lm)
- [Independent iPhone runtime benchmark (dev.to, June 2026)](https://dev.to/john-rocky/on-device-llm-on-iphone-which-runtime-is-fastest-mlx-vs-llamacpp-vs-litert-lm-vs-coreml-1b42)
- [Google: Blazing fast on-device GenAI with LiteRT-LM](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/)
- [InfoQ: LiteRT-LM Gemma 4 MTP](https://www.infoq.com/news/2026/06/google-litertlm-gemma4/)

# LiteRT-LM runtime spike

Hands-on follow-up to [litert-lm-vs-mlx.md](litert-lm-vs-mlx.md): a real Swift test exercising
LiteRT-LM v0.13.1 on macOS, **GPU/Metal backend only** (the production target on Mac and iOS),
against **Gemma 4 E2B** (`gemma-4-E2B-it.litertlm`, 2.59 GB — smallest Gemma 4 in the LiteRT
catalog and the exact model behind the comparison doc's benchmark numbers). Written 2026-07-08.
**No production dependencies were added** — the spike lives in `spikes/litertlm/`, a standalone
SPM package outside `enigmus.xcodeproj`.

## How to run

```sh
cd spikes/litertlm
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --branch v0.13.1 \
  https://github.com/google-ai-edge/LiteRT-LM   # once (clone is gitignored)
HF_AUTH_HEADER_FILE=~/.hf-header swift test     # header file: one line "Authorization: Bearer hf_..."
```

First run curls the model (~2.6 GB, sha256-pinned, license-gated — see Finding 2) into
`~/Library/Caches/enigmus-test-models/litert` (override: `LITERT_TEST_MODEL_DIR`) and lets SPM
download the official `CLiteRTLM_mac.xcframework` release binary (checksum-pinned by Google's
manifest).

Tests (mirroring what a production `LLMEvaluator` integration would need):
- `testBenchmarkFlowMatchesAppModal` — replicates the app's benchmark modal
  (`OnboardingDoBenchModelView`) stat-for-stat with the **same prompt** (50-word dragon story),
  so numbers compare 1:1 against the app's MLX benchmark on the same machine
- `testSustainedDecodeBenchmark` — same flow, ~400-token generation for stable decode tok/s
- `testMultiTurnConversationKeepsContext` — `Conversation`-owned history + turn-2 latency
- `testCancelMidStreamThenRecover` — `cancel()` error surface + engine reuse afterwards

Every generation passes a coherence gate (real words, no `<unused` special-token soup) — see
Finding 3 for why that matters.

## Finding 1: LiteRT-LM is not consumable as a normal SPM dependency (v0.12–v0.14)

The install path in [Google's own docs](https://developers.google.com/edge/litert-lm/swift)
(add `https://github.com/google-ai-edge/LiteRT-LM` in Xcode) fails for three independent reasons:

1. **Unsafe build flags.** The manifest compiles the Swift wrapper with
   `linkerSettings: [.unsafeFlags(["-Xlinker", "-all_load"])]`. SwiftPM refuses products with
   unsafe flags as *remote* dependencies (`the package product 'LiteRTLM' cannot be used as a
   dependency of this target because it uses unsafe build flags`) — policy, affects every
   consumer. Only **local path references** (root-adjacent packages) are exempt; verified: the
   same product wired as a local package passes this check.
2. **Git LFS × SwiftPM.** The repo LFS-tracks ~44 `prebuilt/*` binaries. SwiftPM checks
   packages out from a **local bare mirror** in `DerivedData/…/SourcePackages/repositories/`,
   which never fetches LFS objects — so on any machine with git-lfs installed the checkout dies
   with a misleading `remote missing object` smudge error (the objects exist on GitHub; the
   "remote" that's missing them is the local mirror). Machines *without* git-lfs silently get
   pointer stubs, which happen to work because the build never reads those files — that's why
   the docs' path appears to work for some people. Workaround if ever needed:
   `git lfs fetch origin <tag>` inside the mirror dir.
3. **v0.14.0 is broken as published.** Its Swift sources call C symbols
   (`litert_lm_sampler_params_create`, `…set_stream_tool_calls`, …) that don't exist in the
   v0.13.1 binaries its own manifest still pins (no v0.14.0 XCFramework was ever released).
   Newest self-consistent tag: **v0.13.1**.

Hence the spike consumes a local clone at v0.13.1 via `.package(path:)`. This also kills the
"add it to `enigmusTests` like FlyingFox" plan — any in-project integration (test-only or
production) needs a committed local copy: git submodule, vendored sources, or a bootstrap-cloned
directory. Factor this into any future dual-runtime decision.

## Finding 2: the models are license-gated; download needs a token (or a hash-verified mirror)

`litert-community/*` Gemma repos are gated on Hugging Face: metadata APIs are public but
`resolve/` downloads return 401 anonymously (unlike the un-gated `mlx-community` mirrors the app
uses). HF also **masks LFS sha256 oids on gated repos** anonymously (all gated files report the
same dummy oid) — with an authorized token the API returns real oids, which is how the spike's
pin was obtained: `gemma-4-E2B-it.litertlm` = 2,588,147,712 bytes, sha256
`181938105e0eefd105961417e8da75903eacda102c4fce9ce90f50b97139a63c`, read from the canonical
repo's authenticated tree API and confirmed byte-identical on an independent community mirror.
The spike downloads from the canonical repo using a token header file (`HF_AUTH_HEADER_FILE`,
passed to curl as `-H @file` so the token stays out of args/logs). A production
Gemma-via-LiteRT feature would need its own distribution answer (user HF token flow, or
Google's Play-services-style delivery — neither exists in our current download pipeline).

## Finding 3: GPU capability is a per-conversion property — and the runtime doesn't check it

The smallest Gemma `.litertlm` files are NOT GPU-capable, and nothing fails loudly when you try:

- `gemma-3-270m-it` (q8, 304 MB): the card says GPU "is WIP and will be coming soon". On
  `backend: .gpu` the engine initializes fine, streams at full speed (110 tok/s decode on an
  Apple-silicon Mac) and produces **pure special-token soup** (`<pad><unused16>…`) — no error,
  no warning. A production integration must gate model×backend compatibility itself and/or
  sanity-check output; the runtime won't.
- `Gemma3-1B-IT` (int4, 584 MB): card documents CPU+GPU. Smallest GPU-capable Gemma 3.
- `gemma-4-E2B-it` (2.59 GB): card documents CPU+GPU+NPU incl. iOS/macOS GPU numbers
  (56.5 tok/s decode iPhone 17 Pro, 160.2 tok/s M4 Max). Smallest Gemma 4 — the spike model.

The spike's streaming test now carries a coherence gate (no `<unused` tokens, must contain
real words) so a miscomputing backend fails the test instead of passing on "non-empty output".

## Finding 4: runtime results (macOS, Apple silicon, GPU backend)

All tests pass against Gemma 4 E2B with coherent output (multi-turn retained context:
"What is my name?" → "Your name is Enigmus.", turn-2 latency 221 ms). Numbers from
`swift test` 2026-07-08 on a 24 GB Apple-silicon Mac, `maxNumTokens: 512`,
topK 40 / topP 0.95 / temp 0.7. The "app-modal" column uses the app benchmark's exact prompt —
run the app's benchmark modal with the MLX Gemma-4 E2B OptiQ on the same machine for a direct
side-by-side:

| Metric (modal stat) | App-modal prompt (82 tok) | Sustained (395 tok) |
|---|---|---|
| Load time (2.59 GB → GPU) | 1.35 s | loaded once per run — same engine reused, like the app |
| Model memory | +362 MB `phys_footprint` | — |
| Peak memory during gen | +479 MB | +477 MB |
| Tokens/sec (incl. prefill wall) | 33.9 | 52.9 |
| **Tokens/sec (gen only)** | 39.3 | **53.6** |
| Prefill | 122 tok/s (40 tok) | 347 tok/s (35 tok) |
| TTFT / TTFC | 353 / 703 ms (first gen after init) | 119 / 119 ms (warm) |

Load time across all of today's runs ranged 1.1–2.9 s. Cold vs warm (measured with
`sudo purge` before a run): **init time doesn't change** (1.32 s cold vs 1.35 s warm — the
mmap'd file isn't bulk-read at load), but the cold cost surfaces in the **first generation**
as weight pages fault in from SSD: TTFC 1,145 ms vs 703 ms, first-gen decode 31.8 vs
39.3 tok/s. After the first response the page cache is warm and numbers recover. UX contrast
with MLX: MLX pays its whole cold cost up front in the load bar (4.5 s for E2B OptiQ); LiteRT
always "loads" in ~1.3 s and pays a sub-second penalty on the first reply instead.

### Same-machine side-by-side vs the app's MLX benchmark

The app's benchmark modal was run manually (2026-07-08, same 24 GB Mac) with the MLX
**Gemma 4 e2b-it-OptiQ-4bit** (4.0 GB) — same prompt as `testBenchmarkFlowMatchesAppModal`:

| Modal stat | MLX OptiQ 4-bit | LiteRT-LM E2B | Delta |
|---|---|---|---|
| Load time | 4.54 s | 1.35 s warm | ~3.4× faster (structural: mmap vs full read into Metal buffers) |
| Model memory | 4,077 MB `GPU.activeMemory` | +362 MB load / +479 MB gen peak `phys_footprint` | ~8–11× less **charged** memory |
| Tokens/sec | 33.30 | 33.9 | parity |
| Tokens/sec (gen only) | 33.79 | 39.3 (53.6 sustained) | **+16%** |

Caveats: the memory metrics differ (MLX Metal buffers are fully charged; LiteRT's clean
mmap'd pages aren't charged to `phys_footprint` — but charged memory is what jetsam enforces,
so it's the operative number for iOS survival). Quality isn't apples-to-apples: mixed 2/4/8-bit
vs uniform OptiQ 4-bit. The +16% gen-only delta independently matches the +17% from the
iPhone 17 Pro benchmark cited in [litert-lm-vs-mlx.md](litert-lm-vs-mlx.md).

Cancellation surfaces as `LiteRTLMError.conversation(.invalidResponse("CANCELLED…"))` and the
engine stays reusable. LiteRT reports TTFT and prefill tok/s natively (`getBenchmarkInfo()`) —
metrics MLX doesn't expose; conversely LiteRT has no `GPU.activeMemory` equivalent, so
`phys_footprint` is the only memory metric (the Settings memory panel couldn't be powered as-is).

Context for the numbers:

- **The memory story from the comparison doc holds on macOS.** A 2.59 GB model file costs
  only ~0.5–0.7 GB of `phys_footprint` — the mmap'd-weights accounting analysis
  (doc §"memory number") is confirmed first-hand; for comparison, our MLX Gemma-4 E2B OptiQ
  loads ~4 GB into Metal buffers up front.
- **Decode is well below the card's M4 Max figure** (53.6 vs 160.2 tok/s). Plausible causes:
  this is a 24 GB Mac, not an M4 Max; Debug build of the wrapper; `maxNumTokens: 512`; no MTP
  flags. Comparable to the iPhone 17 Pro card figure (56.5). A tuned benchmark (Release,
  larger KV, speculative-decoding flags) is future work if the evaluation ever gets serious.
- The macOS "GPU" backend logs itself as **WebGPU** (Dawn→Metal), with a missing
  `libLiteRtTopKWebGpuSampler.dylib` warning falling back to a statically linked sampler —
  works, but another Early Preview rough edge.

## Finding 5: distribution & binary-size overhead (if this ever shipped)

**Model distribution:** in-app downloads from the canonical `litert-community` repos are
impossible without a per-user HF token + accepted Gemma license (401 otherwise). Shipping
options: self-host the `.litertlm` files under the Gemma license's redistribution terms
(bandwidth: ~2.6 GB per E2B install), or a power-user "bring your own HF token" flow. Our MLX
catalog has no such problem — `mlx-community` repos are un-gated.

**App bundle:** `CLiteRTLM` is a prebuilt **dynamic** framework embedded in the bundle —
iOS device slice 39 MB uncompressed (v0.13.1; sim slice another 38 MB, dev-only), macOS
universal dylib ~127 MB in-bundle. Ballpark App Store download delta on iOS: ~25–35 MB.

**Dependency effect:** zero transitive SPM packages (binary target + ~1.6k-line Swift wrapper),
but it cannot be a remote dependency (Finding 1) so the cost shifts to repo hygiene: a
submodule/vendored copy to maintain by hand. The core is closed-source prebuilt C++ — opaque
crash reports, no patching, and release hygiene is currently poor (broken v0.14.0 tag, LFS
storage issues). A dual-runtime app would carry MLX + LiteRT binaries and both runtimes in
memory whenever a Gemma model is active.

## Verdict impact

The comparison doc's verdict ("not a viable replacement; re-check when the Swift API leaves
Early Preview") stands, with sharper edges: beyond catalog and instrumentation gaps, the
package can't even be added the way Google documents, its release hygiene is poor (broken tag,
missing binaries, broken LFS storage interactions), and model access is gated. Re-check should
verify: manifest without unsafe flags (or an official binary-only package), LFS-free repo or
SPM fix, self-consistent tags, and an un-gated (or in-app-authenticated) model channel.

---
title: "One model, six memory numbers: what on-device footprint actually measures"
date: 2026-08-07T00:00:00Z
image: /images/litert-lm-memory-cover.webp
image_alt: "Grouped bar chart of reported memory for the same 2,583 MB Gemma 4 E2B model file: iOS 607 MB on CPU versus 1,450 MB on GPU, macOS 736 versus 1,623, Android 1,733 versus 676, with the Apple platforms measured using phys_footprint and Android using ru_maxrss"
categories: ["LiteRT-LM", "MLX", "benchmarks"]
featured: false
draft: false
---

The most quoted number about Google's [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM) is a memory figure: a 2.58 GB Gemma 4 E2B model running in 607 MB. Against the roughly 2.9 GB an MLX build of the same model occupies on the same phone, that is a 4.5x difference, and it is the number that makes LiteRT-LM look like a step change rather than an increment.

It is also the number that falls apart first. Google's own model card reports **six different memory figures for that one file** depending on platform and backend - 607 MB and 1,450 MB on the same iPhone - and the card states, in a footnote, that it measured Apple platforms with one operating-system metric and Android with a different one. The two metrics do not count the same bytes. Neither of them counts what a phone actually has to hold in RAM.

Enigmus runs its inference on [mlx-swift-lm](https://github.com/ml-explore/mlx-swift-lm), and LiteRT-LM was evaluated as a possible replacement, so the figure mattered enough to take apart. This post is about what the memory number in an on-device LLM benchmark actually measures, using that evaluation as the worked example - and, since the answer bears on whether the runtime is adoptable at all, what the rest of the LiteRT-LM stack looks like from a Swift project today.

## Where the number comes from

Two architectural facts about the model come first, because the memory story is as much about Gemma as about LiteRT-LM.

Gemma 4's E-series uses [per-layer embeddings](https://ai.google.dev/gemma/docs/core). The "E" is for *effective*: E2B is about 2.3B effective parameters but roughly 5.1B parameters counting embeddings, and that ~2.8B gap is almost entirely embedding tables that are consulted by lookup rather than participating in the matrix multiplies. So the weights split naturally into a compute-hot core and a large, cold, lookup-only tail. LiteRT-LM's model card puts precise numbers on it: a mixture of 2-bit, 4-bit and 8-bit weights bringing the text-only weight footprint to "as low as 0.8 GB", while "the runtime uses memory mapping to support the 1.12GB of embedding parameters."

That is a genuinely good design. Roughly 1.12 GB of the file is mapped from disk and paged in on demand rather than loaded. The question is what happens when someone then measures the process.

## Google's own table, read properly

The [model card](https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm) publishes per-platform benchmarks. Collected into one place, with the decode speed each memory figure was measured alongside:

| Platform | Device | Backend | Decode | Memory | Metric used |
|---|---|---|---|---|---|
| iOS | iPhone 17 Pro | CPU | 25.0 tok/s | 607 MB | `phys_footprint` |
| iOS | iPhone 17 Pro | GPU | 56.5 tok/s | 1,450 MB | `phys_footprint` |
| macOS | MacBook Pro M4 Max | CPU | 41.6 tok/s | 736 MB | `phys_footprint` |
| macOS | MacBook Pro M4 Max | GPU | 160.2 tok/s | 1,623 MB | `phys_footprint` |
| Android | Galaxy S26 Ultra | CPU | 46.9 tok/s | 1,733 MB | `ru_maxrss` |
| Android | Galaxy S26 Ultra | GPU | 52.1 tok/s | 676 MB | `ru_maxrss` |
| Linux | Arm 2.3/2.8 GHz | CPU | 35.0 tok/s | 1,628 MB | `ru_maxrss` |
| Linux | RTX 4090 | GPU | 143.4 tok/s | 913 MB | `ru_maxrss` |

The model file is 2,583 MB in every row. Three things fall out immediately.

**The famous memory number and the famous speed number are different rows.** 607 MB is the CPU backend, decoding at 25.0 tok/s. Google's [announcement post](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/) is explicit about this if read closely - the 607 MB figure is attributed to "Apple mobile CPUs utilizing XNNPACK's weight caching mechanism," XNNPACK being a CPU inference library. The same post's headline speed claim, 56 tok/s on iOS, is the Metal backend. On that backend the same card reports 1,450 MB. An Apple app shipping LiteRT-LM would use Metal, so the operative iPhone figure is 1,450 MB, not 607 MB - 2.4x the quoted number, for the same file on the same phone.

**The direction of the CPU-to-GPU difference reverses between Apple and Android.** On iOS, moving to the GPU raises reported memory (607 -> 1,450). On Android it lowers it, by a similar factor (1,733 -> 676). A property of a runtime does not invert with the operating system. A property of a *measurement* does.

**Every figure is below the 2,583 MB file.** That part is the mmap working as designed, on every platform.

## The footnote that explains it

The model card documents its own methodology, and this single sentence resolves the table:

> CPU memory was measured using `rusage::ru_maxrss` on Android/Linux/Raspberry Pi, `task_vm_info::phys_footprint` on iOS/macOS, and `process_memory_counters::PrivateUsage` on Windows.

These count different things.

`ru_maxrss` is peak resident set size - physical pages the process has resident, *including* clean file-backed pages from a mapping. Map a gigabyte of embeddings and touch it, and `ru_maxrss` shows it.

`phys_footprint` is Apple's footprint metric, and it deliberately excludes exactly those pages. Apple's own definition, from [WWDC22 session 10106](https://developer.apple.com/videos/play/wwdc2022/10106/):

> For clean memory pages, they include read-only files mapped from disk, such as texture or audio assets, and frameworks loaded into the process. The system can empty or reload them from disk at any time, so they don't count towards your game's memory footprint.

So on Apple platforms, the 1.12 GB of mapped embeddings is definitionally invisible to the number being reported. On Android, the equivalent pages are counted. That alone accounts for the cross-platform spread: 607 MB on iOS against 1,628-1,733 MB on Linux and Android are not measurements of different efficiency, they are measurements of different quantities.

The same session explains the reversal, too:

> On devices with Apple silicon, accessed Metal resources also fall into this category - this is because CPU and GPU share the same pool of fast unified memory.

"This category" is *dirty* memory, which does count. So on Apple silicon the GPU path moves weights out of exempt clean mappings and into fully-charged Metal buffers, and the footprint goes up. On Android, the GPU path moves them into OpenCL allocations outside the process's resident set, and the RSS goes down. Both movements are accounting, in opposite directions, from the same underlying change.

Apple attaches the necessary caveat to its own exemption, and it is the honest core of the matter:

> However, they may be resident on memory, and excessive use will slow down the system and your game.

Uncharged is not free. The pages are in RAM, competing for it.

## What is actually real

Netting the artifact out does not leave nothing. Two of the three components of the memory advantage survive.

**Mixed-bit quantization is real.** The E2B `.litertlm` is 2.6 GB at a mixture of 2-, 4- and 8-bit weights, against 4.0 GB for the uniform 4-bit MLX build in the Enigmus catalog. A smaller file is a smaller resident core, on any metric, on any platform. It is also a different quality point, so output is not directly comparable in either direction.

**Demand-paging a cold 1.12 GB tail is real.** Not as a reduction in bytes needed, but as a change in *what kind* of bytes they are. Clean file-backed pages can be evicted under pressure and re-faulted from SSD. Dirty Metal buffers cannot - they can only be swapped or, on iOS, get the process killed.

That second point is why the accounting distinction is not merely academic on iOS, and it cuts in LiteRT-LM's favour. Jetsam terminates apps on `phys_footprint` - the same metric that exempts clean mapped pages. So an exemption that looks like a measurement trick in a benchmark table is a real survival advantage in the field: under memory pressure a mapped-weights runtime gets slower, and a Metal-buffer runtime gets killed. Community-collected jetsam ceilings - Apple publishes none - put the limit near 2.05 GB on an iPhone 14 and around 900 MB on a 3 GB iPhone SE. Against those, a 2,900 MB MLX build is not viable on an iPhone 14 at all, while 1,450 MB is.

The honest summary is that the efficiency gain on the backend an Apple app would actually ship is closer to **2x** than 4.5x, and that the remaining advantage is as much about *survivability* as about size.

None of this generalizes beyond this model family. The artifact is large here precisely because the E-series puts an unusual share of its parameters into cold lookup tables. On a conventional dense model, with no large mmap-able tail, the same runtime on the same metric would have much less to hide.

## The independent benchmark does not reconcile it

The most cited third-party comparison is [john-rocky's iPhone 17 Pro runtime benchmark](https://dev.to/john-rocky/on-device-llm-on-iphone-which-runtime-is-fastest-mlx-vs-llamacpp-vs-litert-lm-vs-coreml-1b42) - Gemma 4 E2B, 128-token chat, median of three cold runs:

| Runtime | Decode | Peak RAM |
|---|---|---|
| LiteRT-LM | 55.4 tok/s | 641 MB |
| MLX-Swift | 47.5 tok/s | 2,900 MB |
| llama.cpp | 37.8 tok/s | 3,156 MB |
| Core ML / ANE | 33.4 tok/s | 1,187 MB |

Those two LiteRT-LM columns come from different rows of Google's table. 55.4 tok/s is unambiguously the GPU backend, matching the card's 56.5. But 641 MB sits next to the card's *CPU* figure of 607 MB, while the card's GPU figure for the same model on the same phone is 1,450 MB. The benchmark does not document which memory API it used, so the 2.3x discrepancy cannot be resolved from the published material. It is the same runtime, the same model, the same device, and two public sources disagree by more than a factor of two.

The internal measurement has the same problem in a different place. Testing LiteRT-LM v0.13.1 on Metal against Gemma 4 E2B on a 24 GB Apple-silicon Mac produced a `phys_footprint` delta of +362 MB at load and +479 MB at generation peak - where Google reports 1,623 MB for macOS GPU. Different machine, and a delta from process baseline rather than an absolute footprint, but the gap is larger than either explains. The v0.13.1 macOS GPU backend also logs itself as WebGPU, running Dawn over Metal, which is plausibly not the configuration Google measured.

And the in-house MLX comparison mixes metrics exactly as the model card does. The table below reports MLX via `GPU.activeMemory` and LiteRT-LM via `phys_footprint`, because those are the only figures each runtime exposes. They are not the same quantity, and the ~8x ratio between them should be read as the upper bound of a range whose lower bound is much nearer 2x.

## Measured on one machine

With that caveat attached, here is the same-machine comparison - same prompt, same 24 GB Mac, MLX running the 4.0 GB uniform 4-bit build and LiteRT-LM the 2.59 GB mixed-bit `.litertlm`:

| Metric | MLX 4-bit | LiteRT-LM E2B | Note |
|---|---|---|---|
| Load time | 4.54 s | 1.35 s warm | structural: full read into Metal buffers vs mmap |
| Reported memory | 4,077 MB (`GPU.activeMemory`) | +479 MB peak (`phys_footprint`) | **different metrics - not a like-for-like ratio** |
| Tokens/sec, wall | 33.30 | 33.9 | parity |
| Tokens/sec, generation only | 33.79 | 39.3 (53.6 sustained) | +16% |

The speed column is the trustworthy one, and it is a real if modest win: +16% on generation-only decode, independently consistent with the +17% implied by the iPhone benchmark above. Two agreeing measurements on different hardware put the Gemma decode advantage in the mid-teens percent before multi-token prediction - which is a good deal less than Google's claim of ["1.8-3.7x faster prefill and decode than llama.cpp, MLX, Cactus, ONNX"](https://developers.googleblog.com/blazing-fast-on-device-genai-with-litert-lm/). That figure is best read as prefill-weighted and best-case; prefill is where LiteRT-LM's margins genuinely are large.

The load-time difference is also real, and it relocates cost rather than removing it. MLX reads weights into Metal buffers up front and pays the whole cold cost in the load bar. LiteRT-LM maps the file, so with a `sudo purge` beforehand initialization does not change at all - 1.32 s cold against 1.35 s warm - and the cost reappears in the *first generation* as pages fault in from SSD: time-to-first-chunk of 1,145 ms against 703 ms, first-generation decode of 31.8 against 39.3 tok/s. After the first reply the page cache is warm. One runtime shows the delay in a progress bar; the other shows it in a first answer.

One variable neither comparison holds constant deserves naming: KV-cache size is a first-order term in footprint, and it differs across every source here. The LiteRT-LM runs used `maxNumTokens: 512`; the MLX side runs uncapped with 4-bit KV on iOS; the public benchmarks used a 2048-token context. Any memory figure quoted without a context length is underspecified.

## The rest of the state of the stack

The measurement question turned out to be the least of it. Three practical findings matter more to whether the runtime is adoptable at all.

**The Swift package cannot be installed the way Google documents it.** [The Swift guide](https://developers.google.com/edge/litert-lm/swift) says to add the repository URL in Xcode. That fails for three independent reasons. The manifest compiles the wrapper with `linkerSettings: [.unsafeFlags(["-Xlinker", "-all_load"])]`, and SwiftPM refuses products with unsafe flags as *remote* dependencies as a matter of policy - only local path references are exempt. The repository LFS-tracks around 44 prebuilt binaries, and SwiftPM checks out from a local bare mirror that never fetches LFS objects, so the checkout dies with a misleading `remote missing object` error on any machine that has git-lfs installed, while machines without it silently get pointer stubs that happen to work. And v0.14.0's Swift sources call C symbols that do not exist in the v0.13.1 binaries its own manifest pins, because no v0.14.0 XCFramework was ever released. The newest self-consistent tag is v0.13.1, and any integration needs a committed local copy - submodule, vendored sources, or a bootstrap clone.

**The models are license-gated, and their hashes are masked.** `litert-community` Gemma repositories return 401 on `resolve/` downloads anonymously, unlike the un-gated `mlx-community` mirrors. Hugging Face additionally masks LFS sha256 object IDs on gated repositories - every gated file reports the same dummy oid - so a download cannot even be pinned to a hash without a token. Shipping would require either self-hosting the files under the Gemma license's redistribution terms, at ~2.6 GB per install, or a bring-your-own-token flow.

**GPU capability is a per-conversion property, and the runtime does not check it.** `gemma-3-270m-it` at q8 is not GPU-capable; its card says GPU support is still in progress. Requested with `backend: .gpu` it initializes without complaint, streams at 110 tok/s, and emits pure special-token soup - `<pad><unused16>...` - with no error and no warning. A test asserting non-empty output passes. Any integration has to gate model-by-backend compatibility itself, and any test suite around it needs a coherence check rather than a liveness check.

Alongside those, the catalog and instrumentation gaps are the ones that decide the question. `mlx-community` holds thousands of community checkpoints loadable as plain safetensors; the `.litertlm` catalog is a short list with no Qwen3 30B or 80B MoE equivalent and no supported conversion path to make one, which means an entire product line does not run on it. And LiteRT-LM documents no equivalent of `GPU.activeMemory` - which, after everything above, is worth stating precisely: the runtime whose headline advantage is memory is the one that cannot report its own memory use to the application.

## How to read a memory number

The generalizable part, and the reason this was worth writing up:

- **Ask which metric.** `phys_footprint`, `ru_maxrss`, `PrivateUsage` and a Metal allocation counter are four different quantities. A cross-platform memory comparison that switches metric between rows is comparing nothing.
- **Ask which backend.** CPU and GPU footprints can differ by 2.4x on one device, and the direction of the difference depends on the OS.
- **Check that the memory row and the speed row are the same row.** They frequently are not.
- **Ask what the context length was.** KV cache is a first-order term.
- **Prefer the metric the platform enforces.** On iOS that is `phys_footprint`, because it is what jetsam kills on - which makes it the right number for survival questions even though it understates real RAM use.
- **Treat mmap savings as a change in kind, not in quantity.** The bytes are still in RAM; they are merely evictable instead of fatal.

## Where Enigmus lands

LiteRT-LM is not a replacement for the MLX pipeline today, and the memory analysis is why the decision is closer than it first appeared rather than further away. The runtime is good: 16-17% faster Gemma decode, much faster loads, large prefill margins, and a real survivability advantage on memory-constrained iPhones that outlives the deflated headline figure. What blocks it is everything around the runtime - a package that cannot be added as documented, a broken newest tag, gated models with masked hashes, a closed-source prebuilt core, a catalog that omits the models most used, and no memory introspection.

The re-check conditions are concrete, and all four are Google's to fix: a manifest without unsafe build flags or an official binary-only package; a repository without LFS-tracked build inputs; tags whose Swift sources and shipped binaries agree; and a model channel that is un-gated or authenticable from inside an app. When those land, the runtime numbers are good enough to justify running the evaluation again - measured locally, on one machine, with one metric named explicitly.

---
title: Technology for Private AI on Apple Devices
description: "Enigmus delivers private, on-device AI for Mac, iPhone, and iPad using Apple's MLX framework. By leveraging Apple Silicon's unified memory architecture and Metal GPU acceleration, all processing happens locally—data never leaves the device."
layout: aurora-article
heading: Private AI, Powered by
heading_accent: Apple Silicon
intro: Enigmus is built exclusively for Apple platforms, leveraging MLX—Apple's machine learning framework—to deliver private AI on Mac, iPhone, and iPad. By running entirely on-device, data never leaves the hardware.
---

## Why Apple Silicon?

LLM inference is memory-bound: generating each token requires streaming the model's weights through the processor, so memory capacity and bandwidth matter more than raw compute. Apple's M-series chips (M1 through M5) are unusually well suited to this workload because of their **unified memory architecture**—CPU, GPU, and Neural Engine share one high-bandwidth memory pool, so tensors never cross a PCIe bus and there is no separate VRAM ceiling.

This means large language models run efficiently without a dedicated GPU: the same memory that holds the OS and apps holds the model. A MacBook, iMac, or iPhone becomes a capable AI workstation.

## MLX: Apple's ML Framework

MLX is Apple's open-source array framework for machine learning, purpose-built for Apple Silicon. It pairs a NumPy-like API with **lazy evaluation**—computation graphs are built up and executed only when results are needed—and dispatches work to Metal kernels tuned for Apple GPUs. At WWDC 2025, Apple signaled MLX as a strategic component of their AI ecosystem, with deep integration into macOS and iOS.

### Key Advantages

- **Unified Memory**: Arrays live in shared memory—operations run on CPU, GPU, or Neural Engine without data copying
- **Metal GPU Acceleration**: Hand-tuned Metal kernels for the operations that dominate transformer inference—attention, matrix multiplication, and quantized arithmetic
- **Native Swift Support**: The mlx-swift bindings expose the same runtime to iOS and macOS apps—this is what Enigmus builds on
- **Neural Engine Integration**: On M5 chips, MLX leverages dedicated Neural Accelerators for matrix operations

### On-Device Benefits

Running AI locally on Apple devices provides:

- **Complete Privacy**: Conversations and data never leave the device
- **No API Costs**: No per-token fees or subscription requirements
- **Offline Capable**: Works without internet once the model is downloaded
- **Low Latency**: Instant responses without network round-trips

## Supported Models

Enigmus runs open-weight models quantized to 4-bit precision, which puts memory use at roughly half a gigabyte per billion parameters plus overhead for the KV cache—the practical rule of thumb for what fits on a given device. Supported model families are optimized for Apple Silicon:

### GPT-OSS by OpenAI

OpenAI's first open-weight models since GPT-2, released August 2025:

- **gpt-oss-20b**: 21B parameters, runs within 16GB memory—ideal for M1/M2/M3 Macs
- **gpt-oss-120b**: 117B parameters for high-memory configurations

Both use mixture-of-experts (MoE) architecture with 4-bit quantization, delivering excellent performance on Apple Silicon.

### Qwen3 by Alibaba

Alibaba's hybrid reasoning models, released April 2025:

- **Qwen3-0.6B / Qwen3-1.7B / Qwen3-4B / Qwen3-8B**: Models for iPhone and iPad, with Qwen3-8B for high-memory devices
- **Qwen3-14B / Qwen3-32B**: Full-featured models for Mac
- **Qwen3-30B-A3B**: Sparse MoE variant—32B-class performance with only 3B parameters active
- **Qwen3-Next-80B / Qwen3-235B-A22B**: Large models for high-memory Macs (64GB+)

Qwen3 features hybrid reasoning (toggle between fast and deep thinking), 128K context window, and support for 119 languages.

## Performance on Apple Devices

The binding constraint is unified memory: the quantized weights plus the KV cache—which grows with context length—must fit alongside the OS and other apps. Token throughput then scales primarily with memory bandwidth.

### Mac (Apple Silicon)

On M1 and newer Macs, Enigmus delivers responsive AI interactions:

- **M1/M2 (8GB)**: Qwen3-0.6B and Qwen3-1.7B run smoothly for everyday tasks
- **M1/M2 Pro (16GB+)**: GPT-OSS-20b and Qwen3-14B for advanced use cases
- **M3/M4 Max (64GB+)**: Run large models including Qwen3-32B, Qwen3-Next-80B
- **M3/M4 Max (128GB+)**: Run the largest models including Qwen3-235B-A22B
- **M5 with Neural Accelerators**: Optimized matrix operations for fastest inference

### iPhone & iPad (iOS 18+)

Enigmus brings on-device AI to mobile:

- **iPhone 13+ / iPad**: Run Qwen3-0.6B, Qwen3-1.7B, Qwen3-4B, or Qwen3-8B (high-memory devices)
- **Increased Memory Entitlement**: Enables larger models on capable devices
- **Metal GPU Required**: Real device needed (simulators not supported)

## The Privacy Advantage

Unlike cloud-based AI services, Enigmus processes everything locally. When asking a question, drafting an email, or analyzing a document:

1. The prompt is tokenized in the app's own memory
2. The model executes on Apple Silicon via Metal—no server round-trip
3. Tokens are generated and decoded locally, straight into the interface
4. Nothing is uploaded—there is no server endpoint to receive it

This architecture ensures privacy by design—data remains on the device at all times. The [AI and privacy page](/ai-and-privacy) covers why that matters.

---

## Frequently Asked Questions

<details>
<summary><strong>What is MLX and why does Enigmus use it?</strong></summary>

MLX is Apple's open-source machine learning framework, designed specifically for Apple Silicon. Unlike other ML frameworks, MLX uses a **unified memory model** where arrays live in shared memory—allowing operations to run on CPU, GPU, or Neural Engine without copying data between them. This makes it exceptionally efficient for running large language models on Mac, iPhone, and iPad.

At WWDC 2025, Apple announced deeper MLX integration into macOS and iOS, signaling it as a core component of their AI strategy.

*Sources: [Apple MLX Open Source](https://opensource.apple.com/projects/mlx/) · [GitHub - ml-explore/mlx](https://github.com/ml-explore/mlx) · [WWDC 2025 MLX Session](https://developer.apple.com/videos/play/wwdc2025/298/)*

</details>

<details>
<summary><strong>What's the minimum Mac configuration to run Enigmus?</strong></summary>

Enigmus requires **any Mac with Apple Silicon** (M1 or newer) running **macOS 14 Sonoma** or later. The experience scales with the hardware:

- **8GB RAM**: Run compact models like Qwen3-0.6B or Qwen3-1.7B for everyday tasks
- **16GB RAM**: Run mid-size models like GPT-OSS-20b or Qwen3-14B
- **32GB+ RAM**: Run larger models with better context handling
- **64GB+ RAM**: Run large models like Qwen3-32B, Qwen3-Next-80B
- **128GB+ RAM**: Run the largest models like Qwen3-235B-A22B

The M5 chips with Neural Accelerators provide the fastest inference thanks to dedicated matrix multiplication hardware.

*Sources: [MLX Documentation](https://ml-explore.github.io/mlx/build/html/index.html) · [Apple M5 Neural Accelerators](https://machinelearning.apple.com/research/exploring-llms-mlx-m5)*

</details>

<details>
<summary><strong>Does Enigmus run on iPhone and iPad?</strong></summary>

Yes. Enigmus supports **iOS 18+** on devices with sufficient hardware:

- **iPhone 13** or newer (A15 chip or later)
- **iPad** with A15 chip or later

A real device is required—iOS Simulators don't support the Metal GPU features MLX requires. For larger models, the "Increased Memory Limit" entitlement must be enabled in device settings.

The Qwen3-0.6B and Qwen3-1.7B models run well on all supported devices, with Qwen3-4B and Qwen3-8B available on high-memory devices.

*Sources: [MLX Swift on iOS](https://medium.com/@cetinibrahim/mlx-swift-run-llms-in-ios-apps-8f89c1123588) · [GitHub - ml-explore/mlx-swift](https://github.com/ml-explore/mlx-swift)*

</details>

<details>
<summary><strong>What is GPT-OSS and how does it compare to ChatGPT?</strong></summary>

GPT-OSS is OpenAI's first **open-weight model family** since GPT-2, released in August 2025. It includes two variants:

- **gpt-oss-20b**: 21 billion parameters, fits in 16GB memory
- **gpt-oss-120b**: 117 billion parameters for high-end systems

Both use a mixture-of-experts (MoE) architecture with 4-bit quantization (MXFP4). The gpt-oss-120b matches or exceeds OpenAI's o4-mini on benchmarks for coding, math, and tool use—running entirely on-device with no API costs or data sharing.

*Sources: [Introducing GPT-OSS | OpenAI](https://openai.com/index/introducing-gpt-oss/) · [GPT-OSS Model Card](https://openai.com/index/gpt-oss-model-card/) · [GitHub - openai/gpt-oss](https://github.com/openai/gpt-oss)*

</details>

<details>
<summary><strong>What makes Qwen3 special for local AI?</strong></summary>

Qwen3, released by Alibaba in April 2025, offers several advantages for local deployment:

- **Hybrid reasoning**: Toggle between fast responses and deep thinking mode
- **Efficient variants**: The Qwen3-30B-A3B uses only 3B active parameters while delivering 32B-class performance
- **Massive context**: 128K token context window (1M tokens in Qwen3-2507)
- **Multilingual**: Supports 119 languages and dialects
- **Size range**: From 0.6B (ultra-light) to 32B (full-featured)

The compact Qwen3-0.6B and Qwen3-1.7B models work on all supported iOS devices, Qwen3-4B and Qwen3-8B on high-memory devices, while larger variants shine on Mac.

*Sources: [Alibaba Qwen3 Announcement](https://techcrunch.com/2025/04/28/alibaba-unveils-qwen-3-a-family-of-hybrid-ai-reasoning-models/) · [GitHub - QwenLM/Qwen3](https://github.com/QwenLM/Qwen3) · [Qwen on Hugging Face](https://huggingface.co/Qwen)*

</details>

<details>
<summary><strong>Does data stay private with Enigmus?</strong></summary>

**Yes, completely.** Enigmus processes everything on-device using Apple's MLX framework. Here's what that means:

1. **No cloud connection required**: Once a model is downloaded, Enigmus works entirely offline
2. **No data transmission**: Prompts, documents, and conversations never leave the Mac, iPhone, or iPad
3. **No telemetry**: No usage data, analytics, or interaction information is collected
4. **Local ownership**: Everything stays in local storage under user control

This is fundamentally different from cloud AI services like ChatGPT or Claude, which process data on remote servers. With Enigmus, privacy isn't a policy—it's architecture.

*Sources: [MLX Unified Memory Model](https://ml-explore.github.io/mlx/build/html/unified_memory.html) · [On-device ML with MLX Swift](https://www.swift.org/blog/mlx-swift/)*

</details>

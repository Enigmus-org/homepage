---
title: AI and Privacy concerns
description: "Understanding privacy risks in AI systems and how on-device processing addresses them."
layout: aurora-article
heading: AI and
heading_accent: Privacy
intro: What actually happens to a prompt sent to a cloud AI service — and how on-device inference changes the threat model.
---

## What Leaves the Device with Cloud AI

Every query to a cloud-hosted model follows the same path: the full prompt — along with attached documents, conversation history, and client metadata — is serialized, sent over TLS to the provider's servers, tokenized and processed there, and streamed back. Encryption in transit protects the payload from third parties, but not from the provider itself. The plaintext is available server-side, where logging, retention, and downstream use are governed by terms of service rather than by architecture.

Typical server-side handling includes request logging for abuse detection, retention windows measured in weeks or months, human review of sampled conversations for model quality, and — depending on plan and settings — reuse of conversations as training data.

## Privacy-Sensitive Queries

Certain query types are particularly exposed when processed on remote servers:

1. **Health and medical information**: Symptoms, diagnoses, medication lists, or health-record excerpts pasted into a prompt become part of a provider-side log.
2. **Financial data**: Statements, credit history, tax documents, and transaction details contain sensitive personal information that outlives the session.
3. **Personal identifying information (PII)**: Names, addresses, phone numbers, and ID numbers — enough to link an otherwise anonymous account to a person.
4. **Legal and confidential documents**: Contracts, NDAs, and privileged correspondence; sharing them with a third-party service can itself breach confidentiality obligations.
5. **Work and business communications**: Internal plans, source code, and client data carry trade-secret and compliance exposure when they transit external infrastructure.

## Profiling and Breach Risk

Conversation logs are a uniquely dense data source. A few months of prompts can reveal health status, financial situation, employer, relationships, and intentions with far higher fidelity than browsing history — each query is an explicit statement of what someone wants to know. That density makes prompt stores valuable for behavioral profiling and attractive targets for breaches. Even without full transcripts, query patterns alone — timestamps, topics, languages — support detailed inference.

## Regulatory Frameworks

Data protection laws like the GDPR in Europe and the CCPA in the United States constrain how personal data may be collected and processed, and cross-border transfers add data-residency requirements on top. But regulation acts after the fact: it governs what a processor may do with data it already holds. An architecture in which the data never reaches a processor removes the question entirely.

## Potential Abuse of User Data by Online LLM Providers

Online LLM providers process vast amounts of queries and conversations, creating significant potential for misuse:

1. **Training data harvesting**: Conversations may be stored and folded into fine-tuning or preference-tuning datasets without meaningful consent.
2. **Conversation logging**: Every prompt and response can be logged indefinitely, creating detailed longitudinal records of interests, concerns, and private matters.
3. **Behavioral analysis**: Query patterns reveal work habits, health concerns, and financial situations that can be analyzed or sold.
4. **Third-party data sharing**: Logs may be shared with partners or change hands through acquisitions, taking the accumulated history with them.

## Where Local Inference Changes the Model

A locally run LLM inverts the data flow. The model weights are downloaded once — a static, public artifact — and from then on inference happens in-process on the device:

1. **Tokenization is local**: Prompts are converted to tokens in the app's own memory, never serialized to a network socket.
2. **Inference is local**: The runtime executes the model on the device's CPU, GPU, or Neural Engine; no server sees the input, the output, or any intermediate state.
3. **State is local**: Conversation history and caches live in device storage inside the app sandbox, and can be deleted like any other file.
4. **Offline by construction**: Once a model is on disk, everything works with networking disabled — the privacy property can be verified, not just promised.

## Architecture, Not Policy

The practical difference between the two models is enforcement. A cloud provider's privacy posture is a policy: it can change with an acquisition, a subpoena, or a settings default. An on-device system's privacy posture is a property of the architecture: there is no server to log the prompt, no retention window to configure, and no third party holding the data. For the query categories above, that distinction is the entire threat model.

This is the approach Enigmus takes — language models running on Apple silicon through the MLX framework, entirely on-device. The [technology page](/technology) covers how that works in practice.

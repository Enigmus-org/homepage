---
title: "Enigmus 1.2, part 2: read-aloud, Gemma 4 thinking, and per-model sampling"
date: 2026-09-27T12:00:00Z
image: /images/enigmus-1-2-continued-cover.webp
image_alt: "The Enigmus chat screen on iPhone: a reply explaining Euler's formula with typeset equations, and under it the copy button, the play button that reads the reply aloud, and the reply's decode rate"
hero_iphone: /images/enigmus-1-2-continued-chat
hero_iphone_height: 2607
categories: ["AI", "MLX"]
featured: true
draft: false
---

Enigmus runs open-weight language models entirely on device, on iPhone, iPad and Mac, with MLX Swift doing the inference. The [1.2 release post](/posts/enigmus-1-2-qwen-3-5-and-memory) covered the new models and the memory work. This one covers what it left out: replies read aloud, how Gemma 4 marks its thinking, and the sampling and thinking budgets that now differ per model.

## 1. Speech follows the rendered reply, not the raw markdown

Every finished reply now has a play button next to the copy button, as in the screenshot at the top. It reads the reply on device with `AVSpeechSynthesizer`, and the interesting part is what gets read.

Model output is markdown written for the eye, so most of the work was deciding what it should sound like. The spoken text comes from the same CommonMark parse that draws the bubble, via MarkdownUI's `renderPlainText()`, not from a second stripper that would drift from what is on screen. That renderer is wrong for speech in predictable ways: it prints code blocks verbatim, keeps table pipes, and leaves bare URLs to be spelled out. A pass before the parse replaces each fenced code block with its language ("Python code block."), so the listener knows what was skipped. A rule table after the parse reads each table row as a short list, drops the divider row, and cuts bare URLs down to the host, at the cost of any path that mattered.

Math is where the order of passes matters. CommonMark treats a backslash before any ASCII punctuation as an escape, so `\(x\)` leaves the parser as a plain `(x)` and silently stops being math. Bracket-delimited math is therefore normalized before the parse. Math spans then go through an ordered rewrite table with a guard: if any of `\ { } ^ _ & |` survives it, the span is read as the single word "equation". `$E = mc^2$` reads as expected, an `align` environment becomes one word, and raw TeX is never spoken.

Pacing has to be added too, because nothing in the text provides it. The synthesizer reads a newline as a space and ends a sentence at a full stop only when a capital follows, so a lowercase list runs together however it is punctuated. Each rendered line is therefore its own utterance, with a `postUtteranceDelay` of 0.25 s after a line and 0.5 s after a paragraph.

On iPhone and iPad, the audio session runs as `ambient`, the only category that both obeys the Silent switch and leaves other apps' music playing. The trade-off is that it cannot duck, so speech plays over music instead of lowering it. Calls, Siri and alarms pause playback, which resumes only if the system reports `.shouldResume`.

Voice quality is the ceiling. A stock install has only compact voices, Enhanced and Premium voices are a manual download, and Siri's voices are closed to third-party apps. Enigmus starts from the system voice and only upgrades it, skipping novelty voices like Zarvox that sit in the same tier. The language guess from `NLLanguageRecognizer` is trusted only at 40 characters or more and above 0.85 confidence: a voice in the wrong language is worse than no guess.

## 2. Gemma 4 thinks, and treats the toggle as a hint

Since 1.2 the thinking toggle also works on Gemma 4. Most of the work went into finding out how Gemma marks its reasoning, and the answer came from probing the models, not from reading their templates. Every Gemma 4 model uses the same three markers:

- `<|think|>` in the system turn allows reasoning. It is a directive, not a block opener.
- `<|channel>thought` opens the reasoning block.
- `<channel|>` closes it.

These match Google's [prompt-formatting documentation for Gemma 4](https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4). The chat templates around them do not agree with each other: three variants, differing on tool calls and on when past reasoning is re-rendered. So the markers live once per family in a `ThinkingDialect`, and the templates stay in the model repositories.

The structural difference from Qwen is who opens the block. Qwen 3.5's template writes `<think>` into the prompt, so the model starts inside its reasoning and the engine inserts the opener into the stream for the display to split on. Gemma emits `<|channel>thought` itself, so its dialect sets `modelOpensBlock` and nothing is inserted. As with Qwen, `enable_thinking` defaults to off, so turning thinking off sends the same prompt as leaving it unset.

On the smallest Gemma model, E2B at 2.7 GB, a greedy run of "What is 2 + 2? Answer briefly." with thinking on produced 89 tokens in one pass, trimmed where marked:

```text
<|channel>thought
Thinking Process:
1.  **Analyze the Request:** The user is asking a simple arithmetic question ...
4.  **Final Output Generation.**<channel|>4
```

Thinking on does not guarantee a block, though. At the shipped sampling settings, the same model answered "What is 2 + 2?" with a bare `4`, while "Explain in one sentence why the sky is blue" opened a block first. These are single runs, not a systematic test. Google documents the opposite case: larger Gemma models occasionally reason with thinking off. The flag is a hint in both directions, so the parser waits for an opener instead of assuming one, and a reply without a block is an ordinary answer.

## 3. Sampling follows the model

<IPadFrame
  src="/images/enigmus-1-2-continued-generation"
  alt="The chats settings page on an iPad with customize generation switched on: temperature 0.60, top-p 0.95, top-k 20 and max tokens 4096, the values of the bundled Qwen 3.5 0.8B model, with a reset to model default button under the sliders"
  dark={false}
  className="relative mx-auto mb-10 mt-2 w-[300px] md:w-[420px]"
/>

Up to 1.1, every model was sampled at temperature 0.5, a value none of the vendors publish. In 1.2 each model carries its own sampling per thinking mode, taken from the vendor wherever one is published:

- **Gemma 4**: temperature 1.0, top-p 0.95, top-k 64 in both modes, from the `generation_config.json` in Google's repositories and the MLX builds.
- **Qwen 3.6**: temperature 1.0, top-p 0.95, top-k 20 in both modes, from its repositories' `generation_config.json`.
- **Qwen 3.5**: the smaller repositories ship no generation config. Thinking uses temperature 0.6, top-p 0.95, top-k 20 from the 122B's config; fast mode uses 0.7, 0.8 and 20, the model card's general non-thinking preset.

The Qwen model cards list several presets, so some choice was unavoidable. One value is Enigmus's own: a repetition penalty of 1.1 against reasoning loops. The loops only showed up on the small models, but the penalty covers every Qwen 3.5 and 3.6 model, 27B and 35B included, since they are one family.

Switching models never carries sampling over: `applySampling` resets every field the new model does not set before applying its own. The optional override on the chats settings page, off by default, is a `GenerationOverride` that replaces only the fields it exposes, so a model's repetition penalty survives it. Turning it on seeds the sliders from the current model, hence 0.60, 0.95 and 20 for the bundled 0.8B in the screenshot. Turning it off returns every chat to the model's own values from the next reply.

## 4. Thinking has a budget, and the smallest one was measured

The other per-model setting is `maxThinkingTokens`. Qwen 3.5 caps reasoning at 64 tokens on the bundled 0.8B, 256 on the 2B, 512 on the 4B and 1,024 on the 9B. The 122B and both Qwen 3.6 models only fit on a Mac and are uncapped. So is every Gemma 4 model, phone-sized ones included, because Gemma 4 does not run away the way the small Qwen 3.5 models do.

At the budget, the block is closed and the same messages go out again with thinking off, so an answer always comes back, for the price of one extra prefill. Biasing the model toward its closing tag was tried first and failed: on the 0.8B, three of six chat prompts reasoned on to the 1,500-token limit and the scratch work surfaced as the reply. Leaving it uncapped fails too: the same model never closes its reasoning on "explain recursion" or "write a haiku".

The 64 was measured, not picked. A budget only helps when the model closes its reasoning within it; otherwise the answer comes from the retry either way. Over the 49 prompts of Enigmus's quality battery, run with the app's default system prompt, the 0.8B closed within 64 tokens on 6. Budgets of 100 and 160 add none, and 256 adds two, at four times the reasoning on the other 41.

The same battery also shows the limit of the idea. Its scoring runs send no system prompt, and without one the model reasons longer: no prompt closed within 100 tokens and only three within 256, so nearly every answer came from the retry. Scores at budgets from 32 to 256 ranged from 27 to 33 of 49, against 32 with thinking off, all within the battery's noise of about six points. On the bundled model, thinking at these budgets adds latency and no measurable quality, which is why new conversations on iPhone and iPad start in fast mode. Budgets for the larger models have not been measured yet.

## Getting it

Everything here shipped in Enigmus 1.2.2, a free update for iPhone (13 or newer), iPad (M1 or newer) and Mac (Apple silicon).

[Enigmus on the App Store, for iPhone and iPad](https://apps.apple.com/us/app/enigmus/id6771532268)

[Enigmus on the Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)

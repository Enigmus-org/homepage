---
title: "Enigmus 1.2, continued: replies read aloud, Gemma 4 thinking, and generation settings per model"
date: 2026-09-27T12:00:00Z
image: /images/enigmus-1-2-continued-cover.webp
image_alt: "The Enigmus chat screen on iPhone: a reply explaining Euler's formula with typeset equations, and under it the copy button, the play button that reads the reply aloud, and the reply's decode rate"
hero_iphone: /images/enigmus-1-2-continued-chat
hero_iphone_height: 2607
categories: ["AI", "MLX"]
featured: true
draft: true
---

Enigmus runs open-weight language models entirely on device, on iPhone, iPad and Mac, with MLX Swift doing the inference. The 1.2 release post covered the new model lineup and the memory work, and ended with a list of what it left out. This post picks up two changes from that list, reading a reply aloud and the sampling settings, plus Gemma 4 thinking, which that post only touched on. All three are live in the current version, 1.2.2. The generation settings get two sections, sampling and the thinking budget, because they have the most measurements behind them.

## 1. Speech follows what is shown, not the raw markdown

Every finished reply now has a play button beside the copy button, visible in the screenshot at the top. It reads the reply on the device with `AVSpeechSynthesizer`, and only appears once the reply is complete.

Model output is markdown written for the eye, so most of the work is deciding what it should sound like. The spoken text comes from the same CommonMark parse that draws the bubble, through MarkdownUI's `renderPlainText()`, rather than from a second stripper that would drift from what is on screen. That renderer is wrong for speech in predictable ways: it prints code blocks verbatim, keeps table pipes, and leaves bare URLs to be spelled out. A rewrite before the parse replaces each fenced code block with its language ("Python code block."), so a listener knows what was skipped. A per-line rule table after it reads each table row as a short list, drops the divider row, and cuts a bare URL down to its host.

Math is where the order of those passes matters. CommonMark treats a backslash before any ASCII punctuation as an escape, so `\(x\)` leaves the parser as a plain `(x)` and silently stops being math. Bracket math is normalized before the parse for that reason. Spans then go through an ordered rewrite table with a guard: if any of `\ { } ^ _ & |` survives it, the span is read as the single word "equation". `$E = mc^2$` reads as expected, an `align` environment becomes one word, and raw TeX is never spoken.

Each rendered line is its own utterance, with a `postUtteranceDelay` of 0.25 s between lines and 0.5 s between paragraphs, because nothing in the text paces a reply: the synthesizer reads a newline as a space and counts a full stop only before a capital, so a lowercase list runs on however it is punctuated.

On iPhone and iPad, the audio session category decides how speech mixes with other audio:

| Category | Silent switch | Other apps' audio |
|---|---|---|
| `soloAmbient`, the default | silences it | interrupted |
| `playback` | ignored | interrupted unless mixing is requested |
| `ambient` | silences it | mixed |

Enigmus uses `ambient`, the only one that both obeys the Silent switch and leaves music playing. The cost is that it cannot duck, so speech plays over music instead of lowering it. Calls, Siri and alarms pause a reply, and it resumes only when the system reports `.shouldResume`. Unplugging headphones, locking or leaving the app pause it too, as sleep and user switching do on the Mac.

The voices set the ceiling. A stock install has compact voices only, Enhanced and Premium are a manual download, and Siri's voices are closed to third-party apps. Enigmus starts from the system voice and only upgrades it, never to a novelty voice like Zarvox that shares its tier. The language guess from `NLLanguageRecognizer` is trusted only at 40 characters or more and above 0.85 confidence. A voice in the wrong language is worse than no guess.

Two losses are accepted. An indented code block is read aloud, because model output fences code every time and the scan that caught indented blocks was more complexity than that justifies. And cutting a URL to its host drops a path that may have mattered.

## 2. Gemma 4 thinks, and treats the switch as a hint

Since 1.2 the think and fast toggle also works on the Gemma 4 rows. Most of the work was finding out how Gemma marks reasoning, and that came from probing the models, not from reading their templates.

Every Gemma row in the catalog uses the same three markers:

- `<|think|>` goes in the system turn and permits reasoning. It is a directive, not a block opener.
- `<|channel>thought` opens the reasoning block.
- `<channel|>` closes it.

They match Google's [prompt-formatting documentation for Gemma 4](https://ai.google.dev/gemma/docs/core/prompt-formatting-gemma4). The templates that carry them do not match each other: the catalog spans three template variants, which differ on tool calls and on when past reasoning is re-rendered. So the markers are stored once per family, in a `ThinkingDialect`, and the templates stay with the model repositories.

The structural difference from Qwen is who opens the block. Qwen 3.5's template writes `<think>` into the prompt, so the model starts inside its reasoning and the engine inserts the opener into the stream for the display to split on. Gemma emits `<|channel>thought` itself, so its dialect sets `modelOpensBlock` and nothing is inserted. As with Qwen, `enable_thinking` defaults to off, so turning thinking off sends the same prompt as leaving the setting out.

Enabling thinking does not guarantee any. On the smallest Gemma row, E2B at 2.7 GB, a greedy run of "What is 2 + 2? Answer briefly." with thinking on produced this, 89 tokens in one pass, trimmed where marked:

```text
<|channel>thought
Thinking Process:
1.  **Analyze the Request:** The user is asking a simple arithmetic question ...
4.  **Final Output Generation.**<channel|>4
```

At the shipped sampling settings, the same model answered "What is 2 + 2?" with a bare `4` and no block, while "Explain in one sentence why the sky is blue" opened one and then answered. These are single runs, not a battery. Google documents the mirror case: larger Gemma models occasionally reason with thinking turned off. The flag is a hint in both directions, so the parser waits for an opener instead of assuming one, and a reply without a block is an ordinary answer.

## 3. Sampling follows the model

<IPadFrame
  src="/images/enigmus-1-2-continued-generation"
  alt="The chats settings page on an iPad with customize generation switched on: temperature 0.60, top-p 0.95, top-k 20 and max tokens 4096, the values of the bundled Qwen 3.5 0.8B model, with a reset to model default button under the sliders"
  dark={false}
  className="relative mx-auto mb-10 mt-2 w-[300px] md:w-[420px]"
/>

Up to 1.1, every model was sampled the same way: temperature 0.5 across the board. That matched none of the vendors' published values. In 1.2 each catalog row carries its own sampling for each thinking mode, taken from the vendor where the vendor publishes it:

- **Gemma 4**: temperature 1.0, top-p 0.95, top-k 64 in both modes, as in the `generation_config.json` of Google's repositories and of the MLX builds.
- **Qwen 3.6**: temperature 1.0, top-p 0.95, top-k 20 in both modes, as in the `generation_config.json` of its repositories.
- **Qwen 3.5**: the smaller repositories ship no generation config. Thinking uses 0.6, 0.95 and 20 from the 122B's config, and non-thinking uses 0.7, 0.8 and 20, the model card's general non-thinking preset.

The Qwen model cards list several presets instead of one, so some choice was unavoidable, and one value is Enigmus's own: a repetition penalty of 1.1 against reasoning loops. The loops showed up on the small models, but the penalty covers every Qwen 3.5 and 3.6 row, the 27B and 35B included, since it is one family.

Switching models never leaks sampling: `applySampling` resets every field the new model does not set before applying its own. The optional override on the chats settings page, off by default, is a `GenerationOverride` that replaces only the fields it exposes, so a model's repetition penalty survives it. Switching it on seeds the sliders from the current model, which is why the screenshot shows 0.60, 0.95 and 20 for the bundled 0.8B. Switching it off returns every chat to the model's own values on the next reply.

## 4. Thinking has a budget, and the smallest one is measured

The other per-model number is `maxThinkingTokens`. The Qwen 3.5 rows up to 9B cap their reasoning at 64 tokens on the bundled 0.8B, 256 on the 2B, 512 on the 4B and 1,024 on the 9B. The 122B and the Qwen 3.6 rows only fit a Mac and are uncapped. So is every Gemma row, including the ones that fit a phone, because Gemma 4 does not fall into the runaway reasoning the small Qwen 3.5 rows do.

At the budget, the block is closed and the same messages are sent again with thinking off, so an answer always comes back, for the price of one extra prefill. Biasing the model toward its closing tag was tried first and failed: on the 0.8B, three of six chat prompts then reasoned on to the 1,500-token limit and the scratch work surfaced as the reply. Leaving the model uncapped fails too, since the same model never closes on "explain recursion" or "write a haiku".

The 64 is measured, not picked. A budget only helps when the model closes its reasoning under it. Past that, the answer comes from the retry either way. Over the 49 prompts of Enigmus's quality battery, run with the app's default system prompt, the 0.8B closed within 64 tokens on 6. Budgets of 100 and 160 add none, and 256 adds two, at four times the reasoning on the other 41.

The same battery shows the limit of the idea. Its scoring runs send no system prompt, and without one the model reasons longer: no prompt closed within 100 tokens and only three within 256, so nearly every answer came from the thinking-off retry. Scores at budgets from 32 to 256 ranged from 27 to 33 of 49, against 32 with thinking off, inside the battery's noise of about six. On the bundled model, thinking at these budgets adds latency and no measurable quality, so starting new conversations in fast mode on iPhone and iPad, as 1.2.2 does, gives nothing up. The budgets of the larger rows have not been measured yet.

## Getting it

All three changes are in Enigmus 1.2.2, the current version, a free update for the existing app on iPhone (13 or newer), iPad (M1 or newer), and Mac (Apple silicon).

[Enigmus on the App Store, for iPhone and iPad](https://apps.apple.com/us/app/enigmus/id6771532268)

[Enigmus on the Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)

---
title: "Enigmus 1.3: the on-device model, served to other apps"
date: 2026-11-13T12:00:00Z
image: /images/enigmus-1-3-cover.webp
image_alt: "The LLM Server page of Enigmus on iPhone: the server switched on, the bundled Qwen 3.5 0.8B model, the base URL http://127.0.0.1:31415/v1, the web chat switch on, and Allow Network Access off"
hero_iphone: /images/enigmus-1-3-server
hero_iphone_height: 2607
categories: ["AI", "privacy"]
featured: true
draft: false
---

Enigmus runs open-weight language models entirely on device, on iPhone, iPad and Mac, with MLX Swift doing the inference. Until now, only Enigmus's own chat could use the model it loads. Coding agents, scripts and other chat apps expect an OpenAI-style API instead, and the usual one is in the cloud: every prompt, and every file an agent reads, goes to someone else's server. Version 1.3.0, out now on all three platforms, puts that API inside the app. Those tools can now use the device's own model, and by default nothing leaves it.

## 1. Any OpenAI client can use the model Enigmus has loaded

The LLM Server page, opened from the LLM Server row at the top of the chats list and shown at the top, starts with an Active switch. Turning it on opens `http://127.0.0.1:31415/v1`, and any app or script that takes an OpenAI base URL can point at it. On a Mac with the bundled model loaded:

```sh
curl -s http://127.0.0.1:31415/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "bundled/Qwen3.5-0.8B-4bit",
    "messages": [{"role": "user",
      "content": "Name the capital of France in one word."}],
    "max_tokens": 20
  }'
```

The reply is a standard `chat.completion` object, with "Paris" in `choices[0].message.content`.

The server is not a second copy of the model: it shares the loaded one with the chat, so a request waits its turn while a reply is being written.

The official `openai` package works unchanged, and so do coding agents such as opencode and Pi. With a tool-calling model from section 3 loaded, they read and edit a project on the Mac's own model, and none of the code leaves it. A few options return an error instead, such as asking for several answers at once or for JSON-only output.

The switch is off at every launch. On iPhone and iPad, iOS gives the server no background time, so it runs only while Enigmus is open. The page lists each request as it arrives, and prompts stay out of the list unless the user turns them on.

## 2. A phone can chat with a Mac's model

<IPhoneFrame
  src="/images/enigmus-1-3-web-chat"
  alt="The Enigmus web chat in a phone-width browser, served by the app: the bundled Qwen 3.5 0.8B model selected at the top, the prompt Write a haiku about autumn rain, a three-line reply, and token counts of 20 in and 22 out"
  dark={false}
  className="relative mx-auto mb-10 mt-2 w-[240px] md:w-[280px]"
/>

The server also serves a chat page, shown above at phone width. It is built from files bundled in Enigmus, fetches nothing from the internet, and talks to the same API as any other client. On a Mac, one button opens it in Safari.

By default the server only accepts apps on the same device. Allow Network Access opens it to the local network: the page shows the device's Wi-Fi address and a QR code for the chat page, so a phone can scan it and chat with the model on a Mac.

The cost is that there is no password, and traffic is plain HTTP. With the switch on, any device on the same Wi-Fi can use the model. That is why the switch is off by default and is not remembered between launches.

## 3. Qwen models from 2B up can call tools

<img src="/images/enigmus-1-3-tool-rows.webp" alt="Three rows of the model installer on iPad: Qwen 3.5 2B and 4B, each followed by a wrench icon, and a Gemma 4 E2B row between them with no wrench" style={{maxWidth: '440px', width: '100%', display: 'block', margin: '0 auto', borderRadius: '18px'}} />

Tool calls are what let an agent act: the client describes its tools in `tools`, and the model answers with a `tool_calls` request, such as "read this file", instead of text. Enigmus offers tools to Qwen 3.5 from 2B up and every Qwen 3.6 model, and the install screen marks them with a wrench, as in the rows above. The 9B and larger ones also sit under a new Coding category.

Small models often leave a tag unclosed in their calls, so Enigmus closes it and parses the call again. The bundled 0.8B is too small for tools, and Gemma 4 does not support them in Enigmus yet.

## Also in 1.3

- **Message text** follows the system text size, set in iOS Settings or with Command-plus and Command-minus on Mac, replacing the app's own font size setting. Toolbars and settings keep their layout.
- **Shortcuts open the app.** "Ask Enigmus" and the new "Start an Enigmus chat" answer in a saved chat instead of in the background.
- **The thinking toggle** is a two-option menu that says what each mode costs.
- **The model picker** closes once the new model has loaded.
- **Any installed model** can be benchmarked again from the models list.
- **On Mac**, half a gigabyte more memory goes to the model and long conversations.
- **Fixes:** deleting a chat now deletes its messages, and ones left by earlier deletes are cleared at launch. Each model load no longer leaves about 80 MB behind. The onboarding screens lay out correctly on iPad.

## Getting it

Enigmus 1.3.0 is a free update for iPhone (13 or newer), iPad (M1 or newer) and Mac (Apple silicon).

[Enigmus on the App Store, for iPhone and iPad](https://apps.apple.com/us/app/enigmus/id6771532268)

[Enigmus on the Mac App Store](https://apps.apple.com/us/app/enigmus/id6771532268?platform=mac)

---
title: Privacy Policy
description: "Privacy policy for the Enigmus app and website"
layout: default

---

Effective Date: 2026-05-17

Enigmus ("we", "us", "our") is operated by RevoBolic LLC. This Privacy Policy explains what information the Enigmus app and the enigmus.cc website handle, and what we do — and do not do — with it.

The short version: **Enigmus runs entirely on your device. We do not collect, transmit, store, or sell your conversations or personal information. Enigmus has no user accounts and no servers that receive your data.**

### The Enigmus App

**On-device processing.** All chat inference runs locally on your iPhone, iPad, or Mac using Apple's MLX framework. Your prompts, the model's responses, and your conversation history never leave your device.

**No accounts.** Enigmus does not require sign-up, sign-in, or any personal information to use.

**No analytics or telemetry.** Enigmus does not include any analytics SDK, crash reporting service, advertising identifier, or telemetry of any kind. We have no way to observe how you use the app.

**Local storage on your device.** The app stores the following on your device only:

- Conversation history (chat threads and messages), via Apple's SwiftData
- App preferences (theme, tint color, font, haptics), via UserDefaults
- Downloaded language models, in the app's Application Support directory (excluded from iCloud backup)

You can delete this data at any time by clearing chat threads in the app, uninstalling Enigmus, or resetting onboarding (which removes downloaded models).

**Model downloads.** A default language model is bundled with the app. If you choose to download additional models, the app fetches them directly from the public [Hugging Face](https://huggingface.co) MLX Community repositories. When you initiate a download, Hugging Face will receive a standard HTTPS request from your device (including your IP address) as required for any web download. We do not control or receive this data. Review Hugging Face's privacy policy for their practices. No download happens unless you tap to start one.

**Permissions.** Enigmus does not request access to your photos, contacts, location, camera, microphone, or files outside its own sandbox. The app's PrivacyInfo manifest declares the use of `UserDefaults` (for settings) and the `DiskSpace` API (to check available space before downloading a model) — both are local operations with no external transmission.

### The Enigmus Website (enigmus.cc)

The website is a static informational site. It does not use cookies, analytics, advertising trackers, fingerprinting, or any third-party scripts that collect visitor data. Standard web server logs (such as IP addresses for incoming requests) may be retained by our hosting provider for operational and security purposes; we do not actively use, share, or correlate this data.

### Children

Enigmus is not directed at children under 13 and we do not knowingly collect any information from anyone. Because the app runs entirely on-device with no accounts, no data is transmitted to us regardless of the user's age.

### Third Parties

We do not share, sell, or transfer any user data to third parties, because we do not have any user data. The only third-party interactions are:

- Apple (App Store distribution, system services such as iCloud backup if enabled — covered by Apple's privacy practices)
- Hugging Face (only if you initiate a model download — covered by Hugging Face's privacy policy)

### Changes to This Policy

If this policy changes, the updated version will be posted at this URL with a new effective date.

### Contact

For privacy-related questions, contact us at <RevealEmail d="113,110,117,117,120,73,110,119,114,112,118,126,124,55,108,108" o="9" />

import { IPadFrame, IPhoneFrame, MacBookFrame } from "./DeviceFrames";

// One column per device, in order of memory: a screenshot of what differs on
// that device, then the same spec rows for each so they read across as a
// comparison. "Model budget" is the install list's fit rule in the app,
// min(0.8 x RAM, RAM - 2) / 1.2 GB of weights (MemoryBudget.maxModelDiskSize),
// and "Largest model" is the biggest catalogue row under that budget at the
// top RAM size. Both move when the app's rule or catalogue does.
const DEVICES = [
  {
    name: "iPhone",
    requires: "iPhone 13 or newer",
    specs: [
      ["RAM", "4-12 GB"],
      ["Model budget", "1.7-8 GB"],
      ["Largest model", "Gemma 4 E4B (12 GB)"],
      ["New chats", "Fast"],
    ],
    caption:
      "New chats start in fast mode. At phone decode speeds a reasoning preamble would be most of the wait for a first reply, so thinking is one tap away instead of the default.",
    frame: (
      <IPhoneFrame
        src="/images/home-iphone-chat"
        height={2609}
        alt="Enigmus on iPhone - a chat about Euler's formula, with the Fast chip in the message bar"
        sizes="142px"
        className="w-[142px]"
      />
    ),
  },
  {
    name: "iPad",
    requires: "M1 or newer",
    specs: [
      ["RAM", "8-16 GB"],
      ["Model budget", "5-10.7 GB"],
      ["Largest model", "Gemma 4 12B (16 GB)"],
      ["New chats", "Fast"],
    ],
    caption:
      "The model list is sorted by size and checks every row against the device's RAM. On a 12 GB iPad, Gemma 4 E4B is the largest that fits; Gemma 4 12B and everything above it is greyed out as Not enough RAM.",
    frame: (
      <IPadFrame
        src="/images/home-ipad-models"
        alt="Enigmus on iPad - the model list on a 12 GB device, with Gemma 4 12B and larger rows greyed out as Not enough RAM"
        sizes="228px"
        className="w-[228px]"
      />
    ),
  },
  {
    name: "Mac",
    requires: "Apple silicon",
    specs: [
      ["RAM", "8 GB and up"],
      ["Model budget", "5 GB and up"],
      ["Largest model", "Qwen 3.5 122B-A10B (128 GB)"],
      ["New chats", "Thinking"],
    ],
    caption:
      "New chats think by default, since a Mac decodes fast enough to afford it. Every row from Qwen 3.6 27B up needs more memory than any iPhone or iPad has, so those sizes run only on a Mac.",
    frame: (
      <MacBookFrame
        src="/images/home-mac-chat"
        height={1150}
        alt="Enigmus on Mac - a chat about Euler's formula, with the Think chip in the message bar"
        sizes="340px"
        className="w-full max-w-[340px]"
      />
    ),
  },
];

const DeviceShowcase = () => (
  <section className="mx-auto max-w-[1200px] px-4 pt-14 md:px-8 md:pt-20">
    <div className="mb-8 max-w-[680px]">
      <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
        One engine, three memory budgets
      </h2>
      <p className="mt-2 text-[15px] leading-[1.65] text-[var(--text-muted)]">
        Enigmus runs the same MLX engine on iPhone, iPad and Mac. What changes
        is how much memory a model can take: the model list accepts a model
        when its weights fit in about two-thirds of the device&apos;s RAM,
        leaving the rest to the system and to the KV cache that grows with
        each conversation.
      </p>
    </div>
    <div className="grid gap-px border-y border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">
      {DEVICES.map(({ name, requires, specs, caption, frame }) => (
        <div key={name} className="bg-[var(--bg)] px-4 pb-8 pt-10 md:px-6">
          <div className="mb-8 flex h-[300px] items-end justify-center">
            {frame}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[15px] font-semibold">{name}</h3>
            <span className="font-mono text-[11.5px] text-[var(--text-faint)]">
              {requires}
            </span>
          </div>
          <dl className="mt-3 border-t border-[var(--border)] text-[13px]">
            {specs.map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-4 border-b border-[var(--border)] py-2"
              >
                <dt className="text-[var(--text-faint)]">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] leading-[1.6] text-[var(--text-dim)]">
            {caption}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default DeviceShowcase;

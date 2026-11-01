import { IPadFrame, IPhoneFrame, MacBookFrame } from "./DeviceFrames";

// Mac, iPad and iPhone as one group: the Mac centered, the iPad and iPhone
// standing in front of its lower corners on a shared baseline. Widths are
// percentages of the row, so the group scales as one piece at every width.
const DeviceShowcase = () => (
  <section className="mx-auto max-w-[1040px] px-4 pt-14 md:px-8 md:pt-20">
    <div className="relative">
      <MacBookFrame
        className="w-[74%]"
        sizes="(min-width: 1040px) 720px, 70vw"
      />
      <IPadFrame
        className="absolute bottom-0 left-0 w-[23%]"
        sizes="(min-width: 1040px) 230px, 23vw"
      />
      <IPhoneFrame
        className="absolute bottom-0 right-[3%] w-[11.5%]"
        sizes="(min-width: 1040px) 120px, 12vw"
      />
    </div>
  </section>
);

export default DeviceShowcase;

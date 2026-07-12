// iPhone-over-MacBook duo under the hero feature chips: MacBook as the main
// piece with the iPhone overlapping its lower-left corner, bases on one
// line. The pair scales as a single composition at every width — no
// breakpoint-dependent layout.
import IPhoneFrame from "./IPhoneFrame";
import MacBookFrame from "./MacBookFrame";

const DeviceShowcase = () => (
  <div className="relative z-0 mx-auto mt-9 max-w-[760px] md:mt-14">
    <MacBookFrame className="mt-0" />
    <IPhoneFrame className="absolute -left-[3%] bottom-0 z-10 w-[24%]" />
  </div>
);

export default DeviceShowcase;

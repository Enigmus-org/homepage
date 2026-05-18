import { markdownify } from "@lib/utils/textConverter";
import ImageFallback from "./components/ImageFallback";
import RevealEmail from "./shortcodes/RevealEmail";

const Contact = ({ data }) => {
  const { frontmatter } = data;
  const { title, description, email_d, email_o } = frontmatter;

  return (
    <section className="section lg:mt-16">
      <div className="container">
        <div className="row relative pb-16">
          <ImageFallback
            className="-z-[1] object-cover object-top opacity-60"
            src={"/images/map.svg"}
            fill="true"
            alt="map bg"
            priority={true}
          />
          <div className="mx-auto text-center md:col-10 lg:col-8">
            <h1 className="h1 mt-10 lg:mt-16 lg:pt-8 lg:text-[44px] lg:leading-tight">
              {title.split(/(Enigmus)/g).map((part, i) =>
                part === "Enigmus" ? (
                  <span key={i} className="text-primary">
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>
            {description &&
              markdownify(
                description,
                "h3",
                "h3 mt-6 font-secondary font-normal text-dark/80 dark:text-darkmode-light/80"
              )}
            {email_d && email_o && (
              <div className="mx-auto mt-14 max-w-md lg:mt-16">
                <div className="flex flex-col items-center gap-4 rounded border border-border p-8 dark:border-darkmode-border">
                  <p className="text-lg font-medium text-dark dark:text-darkmode-light">
                    send us an email
                  </p>
                  <RevealEmail d={email_d} o={email_o} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

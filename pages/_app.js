import config from "@config/config.json";
import { JsonContext } from "context/state";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import { useEffect } from "react";
import TagManager from "react-gtm-module";
import "@fontsource-variable/inter";
import "styles/style.scss";

const App = ({ Component, pageProps }) => {
  // default theme setup
  const { default_theme } = config.settings;

  // google tag manager (gtm)
  const tagManagerArgs = {
    gtmId: config.params.tag_manager_id,
  };
  useEffect(() => {
    setTimeout(() => {
      process.env.NODE_ENV === "production" &&
        config.params.tag_manager_id &&
        TagManager.initialize(tagManagerArgs);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <JsonContext>
      <Head>
        {/* responsive meta */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        {/* favicon */}
        <link key="favicon-png" rel="icon" type="image/png" href="/favicon-48x48.png" sizes="48x48"/>
        <link key="favicon-svg" rel="icon" type="image/svg+xml" href="/favicon.svg"/>
        <link key="shortcut-icon" rel="shortcut icon" href="/favicon.ico"/>
        <link key="apple-touch-icon" rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
        <meta key="apple-mobile-web-app-title" name="apple-mobile-web-app-title" content="Enigmus AI"/>

        <link key="manifest" rel="manifest" href="/site.webmanifest"/>
      </Head>
      <ThemeProvider attribute="class" defaultTheme={default_theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </JsonContext>
  );
};

export default App;

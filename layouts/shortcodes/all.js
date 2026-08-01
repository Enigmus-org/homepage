import IPadFrame from "@layouts/components/aurora/IPadFrame";
import IPhoneFrame from "@layouts/components/aurora/IPhoneFrame";
import MacBookFrame from "@layouts/components/aurora/MacBookFrame";
import Accordion from "./Accordion";
import Button from "./Button";
import CodeBlock from "./CodeBlock";
import Notice from "./Notice";
import RevealEmail from "./RevealEmail";
import Tab from "./Tab";
import Tabs from "./Tabs";
import Video from "./Video";
import Youtube from "./Youtube";

const shortcodes = {
  // Lowercase key: an element override, applied to every fenced code block.
  pre: CodeBlock,
  Button,
  Accordion,
  Video,
  Tab,
  Tabs,
  Notice,
  Youtube,
  RevealEmail,
  MacBookFrame,
  IPhoneFrame,
  IPadFrame
};

export default shortcodes;

import {
  IPadFrame,
  IPhoneFrame,
  MacBookFrame,
} from "@layouts/components/site/DeviceFrames";
import WebUISketch from "@layouts/components/site/WebUISketch";
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
  IPadFrame,
  WebUISketch
};

export default shortcodes;

"use client";
import type { CodeId, DioramaId, PersonId, PropId } from "../content/eras";
import type { DioN } from "../engine/dioramas";
import { AgentErrand } from "./AgentErrand";
import { BlankPage } from "./BlankPage";
import { CodeCard } from "./CodeCard";
import { Coffee } from "./Coffee";
import { Deploy } from "./Deploy";
import { Diorama } from "./Diorama";
import { Feed } from "./Feed";
import { GenUI } from "./GenUI";
import { Gmail } from "./Gmail";
import { Guestbook } from "./Guestbook";
import { Haggle } from "./Haggle";
import { JsxReveal } from "./JsxReveal";
import { LeftPad } from "./LeftPad";
import { MapDrag } from "./MapDrag";
import { Modem } from "./Modem";
import { Optimistic } from "./Optimistic";
import { Outage } from "./Outage";
import { Pendulum } from "./Pendulum";
import { Person } from "./Person";
import { SlowImage } from "./SlowImage";
import { Sticker } from "./Sticker";
import { Streaming } from "./Streaming";
import { Swing } from "./Swing";
import { TenDays } from "./TenDays";
import { Terminal } from "./Terminal";
import { ThreePoles } from "./ThreePoles";
import { Views } from "./Views";
import { Vote } from "./Vote";
import { Agents } from "./static/Agents";
import { Aws } from "./static/Aws";
import { Boxes } from "./static/Boxes";
import { Cern } from "./static/Cern";
import { Checkout } from "./static/Checkout";
import { Crash } from "./static/Crash";
import { Flat } from "./static/Flat";
import { Gate } from "./static/Gate";
import { Jam } from "./static/Jam";
import { Lineup } from "./static/Lineup";
import { Memo } from "./static/Memo";
import { Phone2007 } from "./static/Phone2007";
import { PublicDomain } from "./static/PublicDomain";
import { Stack } from "./static/Stack";
import { Usenet } from "./static/Usenet";
import { Wars } from "./static/Wars";
import { Zero } from "./static/Zero";

type W = (p: { active: boolean }) => React.ReactNode;
/** era 6's like line: the same errand widget, running "like this post for me" */
const AgentLike: W = ({ active }) => <AgentErrand active={active} start={3} />;
const COMPONENTS: Partial<Record<PropId, W>> = {
  "ph-cern": Cern, "ph-memo": Memo, "ph-usenet": Usenet, "ph-pd": PublicDomain, "ph-crash": Crash, "ph-wars": Wars, "ph-aws": Aws,
  "ph-phone": Phone2007, "ph-flat": Flat, "ph-boxes": Boxes, "ph-jam": Jam, "ph-stack": Stack, "ph-agents": Agents, "ph-checkout": Checkout,
  "ph-zero": Zero, "ph-gate": Gate, "ph-lineup": Lineup,
  "w-sticker": Sticker, "w-term": Terminal, "w-coffee": Coffee, "w-modem": Modem, "w-slow": SlowImage, "w-tenday": TenDays, "w-guest": Guestbook,
  "w-gmail": Gmail, "w-map": MapDrag, "w-vote": Vote, "w-npm": LeftPad, "w-jsx": JsxReveal, "w-blank": BlankPage, "w-feed": Feed,
  "w-pend": Pendulum, "w-outage": Outage, "w-stream": Streaming, "w-deploy": Deploy, "w-agent": AgentErrand, "w-views": Views,
  "w-genui": GenUI, "w-pend3": ThreePoles, "w-haggle": Haggle, "w-swing": Swing, "w-optim": Optimistic, "w-agentlike": AgentLike,
};

export function PropView({ id, active }: { id: PropId; active: boolean }) {
  if (id.startsWith("p-")) return <Person id={id.slice(2) as PersonId} />;
  if (id.startsWith("c-")) return <CodeCard id={id.slice(2) as CodeId} />;
  if (id.startsWith("dg")) return <Diorama n={Number(id.slice(2)) as DioramaId as DioN} active={active} />;
  const C = COMPONENTS[id];
  return C ? <C active={active} /> : <div />;
}

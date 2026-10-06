"use client";
import { useStoryText } from "../../i18n/rich";
import { Card, Stamp } from "../util";

export function Checkout() {
  const { t, rich } = useStoryText();
  return (
    <Card width={460} bar={rich("props.checkout.bar")} right={<Stamp />}>
      <div className="po-chat">
        <p className="po-u">{rich("props.checkout.u")}</p>
        <p className="po-a">{rich("props.checkout.a1")}</p>
        <div className="po-buy"><span>{rich("props.checkout.item")}</span><button className="po-btn" type="button" tabIndex={-1}>{t("props.checkout.buy")}</button></div>
        <p className="po-a">{rich("props.checkout.a2")}</p>
      </div>
      <small>{rich("props.checkout.caption")}</small>
    </Card>
  );
}

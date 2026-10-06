"use client";
// SVG fallbacks for the "where it lived" dioramas (used without WebGL or with reduced motion).
// Converted from prototypes/power-on/parts/dg*.svg; labels come from story.dg.d<n>.*.
import type { Ref } from "react";
import { useStoryText } from "../i18n/rich";

export function DiagramSvg({ n, svgRef }: { n: number; svgRef?: Ref<SVGSVGElement> }) {
  const { t } = useStoryText();
  switch (n) {
    case 1:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 640 300" role="img" aria-label={t("dio.aria.d1")} data-dur="2600">
          <rect className="po-zone" x="16" y="16" width="384" height="268" rx="14"/>
          <text className="po-t" x="32" y="40">{t("dg.d1.cern")}</text>
          <path className="po-route" d="M460 112 H430 V262 H76 V206"/>
          
          <text className="po-ts" x="32" y="66">{t("dg.d1.stickerOn")}</text>
          <text className="po-t" x="32" y="84">{t("dg.d1.sticker1")}</text>
          <text className="po-t" x="32" y="100">{t("dg.d1.sticker2")}</text>
          <path className="po-ln" d="M70 106 L70 152"/>
          
          <path className="po-ln po-thick" d="M32 206 H172"/>
          <rect className="po-solid" x="50" y="152" width="52" height="52" rx="2" opacity=".85"/>
          <rect className="po-note" x="58" y="158" width="26" height="14" transform="rotate(-6 71 165)"/>
          <rect className="po-bx" x="112" y="150" width="50" height="38" rx="3"/>
          <path className="po-ln" d="M137 188 V206"/>
          <text className="po-t" x="100" y="228" textAnchor="middle">{t("dg.d1.cube")}</text>
          <text className="po-ts" x="100" y="243" textAnchor="middle">{t("dg.d1.cubeSub")}</text>
          <path className="po-ln" d="M76 206 V262"/>
          
          <text className="po-t" x="290" y="124" textAnchor="middle">{t("dg.d1.term1")}</text>
          <text className="po-t" x="290" y="139" textAnchor="middle">{t("dg.d1.term2")}</text>
          <rect className="po-bx" x="214" y="150" width="64" height="46" rx="4"/>
          <path className="po-ln" d="M222 162 h34 M222 172 h44 M222 182 h24"/>
          <rect className="po-bx" x="304" y="150" width="64" height="46" rx="4"/>
          <path className="po-ln" d="M312 162 h40 M312 172 h28 M312 182 h44"/>
          <path className="po-ln" d="M246 196 V262 M336 196 V262"/>
          
          <path className="po-ln po-thick" d="M76 262 H430"/>
          <text className="po-ts" x="160" y="278">{t("dg.d1.eth")}</text>
          <text className="po-tl" x="268" y="278">{t("dg.d1.ethLat")}</text>
          
          <path className="po-ln" d="M430 262 V112 H460 M430 212 H460"/>
          <text className="po-ts" x="438" y="160">{t("dg.d1.leased1")}</text>
          <text className="po-ts" x="438" y="174">{t("dg.d1.leased2")}</text>
          <text className="po-tl" x="438" y="190">{t("dg.d1.leasedLat")}</text>
          <rect className="po-bx" x="460" y="86" width="170" height="52" rx="6"/>
          <text className="po-t" x="472" y="108">{t("dg.d1.slac")}</text>
          <text className="po-ts" x="472" y="126">{t("dg.d1.slacSub")}</text>
          <rect className="po-bx" x="460" y="186" width="170" height="52" rx="6"/>
          <text className="po-t" x="472" y="208">{t("dg.d1.labs")}</text>
          <text className="po-ts" x="472" y="226">{t("dg.d1.labsSub")}</text>
          <circle className="po-packet" r="6" cx="460" cy="112"/>
        </svg>
      );
    case 2:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 680 260" role="img" aria-label={t("dio.aria.d2")} data-dur="3600">
          <path className="po-route" d="M110 140 H196 q6.5 -10 13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0 H516"/>
          
          <rect className="po-bx" x="20" y="100" width="62" height="48" rx="6"/>
          <rect className="po-ln" x="27" y="107" width="48" height="33" rx="2"/>
          <rect className="po-bx" x="88" y="96" width="22" height="62" rx="2"/>
          <rect className="po-bx" x="20" y="156" width="62" height="8" rx="2"/>
          <text className="po-t" x="62" y="190" textAnchor="middle">{t("dg.d2.pc")}</text>
          <text className="po-ts" x="62" y="205" textAnchor="middle">{t("dg.d2.pcSub")}</text>
          
          <rect className="po-bx" x="140" y="128" width="56" height="22" rx="4"/>
          <circle className="po-led" cx="152" cy="139" r="2.5"/><circle className="po-led" cx="161" cy="139" r="2.5"/><circle className="po-led" cx="170" cy="139" r="2.5"/>
          <text className="po-t" x="168" y="190" textAnchor="middle">{t("dg.d2.modem")}</text>
          <text className="po-ts" x="168" y="205" textAnchor="middle">{t("dg.d2.modemSub")}</text>
          
          <path className="po-ln" d="M196 140 q6.5 -10 13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0"/>
          <text className="po-ts" x="248" y="112" textAnchor="middle">{t("dg.d2.phone")}</text>
          <text className="po-ts" x="248" y="125" textAnchor="middle">{t("dg.d2.phoneSub")}</text>
          <text className="po-tl" x="248" y="168" textAnchor="middle">{t("dg.d2.phoneLat")}</text>
          
          <rect className="po-bx" x="304" y="100" width="60" height="10" rx="2"/>
          <rect className="po-bx" x="304" y="114" width="60" height="10" rx="2"/>
          <rect className="po-bx" x="304" y="128" width="60" height="10" rx="2"/>
          <rect className="po-bx" x="304" y="142" width="60" height="10" rx="2"/>
          <rect className="po-bx" x="304" y="156" width="60" height="10" rx="2"/>
          <text className="po-t" x="334" y="190" textAnchor="middle">{t("dg.d2.isp")}</text>
          <text className="po-ts" x="334" y="205" textAnchor="middle">{t("dg.d2.ispSub")}</text>
          
          <path className="po-ln po-thick" d="M364 140 H516"/>
          <text className="po-ts" x="440" y="128" textAnchor="middle">{t("dg.d2.backbone")}</text>
          <text className="po-tl" x="440" y="160" textAnchor="middle">{t("dg.d2.backboneLat")}</text>
          
          <rect className="po-zone" x="500" y="54" width="164" height="166" rx="4"/>
          <text className="po-t" x="582" y="76" textAnchor="middle">{t("dg.d2.closet")}</text>
          <rect className="po-bx" x="516" y="92" width="40" height="100" rx="3"/>
          <path className="po-ln" d="M522 104 h28 M522 114 h28"/>
          <circle className="po-led" cx="536" cy="178" r="2.5"/>
          <text className="po-ts" x="566" y="110">{t("dg.d2.apache")}</text>
          <text className="po-ts" x="566" y="128">{t("dg.d2.perl")}</text>
          <text className="po-ts" x="566" y="146">{t("dg.d2.mysql")}</text>
          <text className="po-ts" x="566" y="176">{t("dg.d2.one")}</text>
          <text className="po-tl" x="340" y="244" textAnchor="middle">{t("dg.d2.note")}</text>
          <circle className="po-packet" r="6" cx="110" cy="140"/>
        </svg>
      );
    case 3:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 600 330" role="img" aria-label={t("dio.aria.d3")} data-dur="2400">
          <defs><marker id="d3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>
          <path className="po-route" d="M104 150 C130 150 140 92 170 92 H376 L430 73"/>
          
          <rect className="po-bx" x="30" y="128" width="64" height="42" rx="4"/>
          <path className="po-bx" d="M22 174 h80 l-6 8 h-68 z"/>
          <text className="po-t" x="62" y="206" textAnchor="middle">{t("dg.d3.lap")}</text>
          <text className="po-ts" x="62" y="221" textAnchor="middle">{t("dg.d3.lapSub")}</text>
          <text className="po-tl" x="112" y="112">{t("dg.d3.lapLat")}</text>
          <path className="po-ln" d="M104 150 C130 150 140 92 170 92"/>
          <path className="po-ln po-dash" d="M104 162 C140 162 160 258 200 258"/>
          
          <rect className="po-zone" x="150" y="20" width="430" height="132" rx="10"/>
          <text className="po-t" x="166" y="42">{t("dg.d3.colo")}</text>
          <rect className="po-bx" x="170" y="72" width="70" height="40" rx="4"/>
          <text className="po-t" x="205" y="96" textAnchor="middle">{t("dg.d3.lb")}</text>
          <text className="po-ts" x="205" y="132" textAnchor="middle">{t("dg.d3.lbSub")}</text>
          <path className="po-ln" d="M240 92 H290 M262 92 L290 69 M262 92 L290 115"/>
          <text className="po-tl" x="248" y="84">{t("dg.d3.lbLat")}</text>
          <rect className="po-bx" x="290" y="62" width="86" height="14" rx="2"/>
          <rect className="po-bx" x="290" y="85" width="86" height="14" rx="2"/>
          <rect className="po-bx" x="290" y="108" width="86" height="14" rx="2"/>
          <circle className="po-led" cx="368" cy="69" r="2.2"/><circle className="po-led" cx="368" cy="92" r="2.2"/><circle className="po-led" cx="368" cy="115" r="2.2"/>
          <text className="po-ts" x="333" y="140" textAnchor="middle">{t("dg.d3.lamp")}</text>
          <rect className="po-bx" x="430" y="58" width="120" height="28" rx="4"/>
          <text className="po-t" x="490" y="77" textAnchor="middle">{t("dg.d3.mc")}</text>
          <path className="po-ln" d="M376 73 H430 M376 104 L450 110"/>
          <text className="po-tl" x="380" y="62">{t("dg.d3.mcLat")}</text>
          <path className="po-bx" d="M450 98 v28 a40 7 0 0 0 80 0 v-28"/>
          <ellipse className="po-bx" cx="490" cy="98" rx="40" ry="7"/>
          <text className="po-t" x="490" y="122" textAnchor="middle">{t("dg.d3.db")}</text>
          
          <path className="po-ln po-dash" d="M365 152 V186" markerEnd="url(#d3a)"/>
          <text className="po-tl" x="376" y="174">{t("dg.d3.shift")}</text>
          
          <rect className="po-zone" x="150" y="190" width="430" height="124" rx="40"/>
          <text className="po-t" x="176" y="216">{t("dg.d3.cloud")}</text>
          <rect className="po-bx" x="200" y="240" width="56" height="36" rx="4"/><text className="po-t" x="228" y="263" textAnchor="middle">{t("dg.d3.ec2")}</text>
          <rect className="po-bx" x="270" y="240" width="56" height="36" rx="4"/><text className="po-t" x="298" y="263" textAnchor="middle">{t("dg.d3.ec2")}</text>
          <rect className="po-bx" x="340" y="240" width="56" height="36" rx="4"/><text className="po-t" x="368" y="263" textAnchor="middle">{t("dg.d3.ec2")}</text>
          <path className="po-bx" d="M440 244 h80 l-8 40 h-64 z"/>
          <ellipse className="po-bx" cx="480" cy="244" rx="40" ry="6"/>
          <text className="po-t" x="480" y="270" textAnchor="middle">{t("dg.d3.s3")}</text>
          <text className="po-ts" x="365" y="300" textAnchor="middle">{t("dg.d3.virt")}</text>
          <circle className="po-packet" r="6" cx="104" cy="150"/>
        </svg>
      );
    case 4:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 620 300" role="img" aria-label={t("dio.aria.d4")} data-dur="4200" data-mode="oneway">
          <path className="po-route" d="M82 62 H250 H82 V96 C150 96 180 206 250 206 H470 H250 C180 206 150 96 82 96"/>
          
          <rect className="po-bx po-acc" x="42" y="36" width="40" height="72" rx="7"/>
          <path className="po-ln" d="M56 100 h12"/>
          <text className="po-t" x="62" y="128" textAnchor="middle">{t("dg.d4.phone")}</text>
          <rect className="po-bx po-acc" x="30" y="170" width="64" height="42" rx="4"/>
          <path className="po-bx" d="M22 216 h80 l-6 8 h-68 z"/>
          <text className="po-t" x="62" y="244" textAnchor="middle">{t("dg.d4.lap")}</text>
          <text className="po-tl" x="62" y="268" textAnchor="middle">{t("dg.d4.runs")}</text>
          <text className="po-ts" x="62" y="283" textAnchor="middle">{t("dg.d4.runsSub")}</text>
          
          <path className="po-ln" d="M82 62 H250"/>
          <text className="po-tl" x="166" y="54" textAnchor="middle">{t("dg.d4.l1")}</text>
          <rect className="po-bx" x="250" y="36" width="130" height="52" rx="6"/>
          <text className="po-t" x="315" y="58" textAnchor="middle">{t("dg.d4.cdn")}</text>
          <text className="po-ts" x="315" y="76" textAnchor="middle">{t("dg.d4.cdnSub")}</text>
          
          <path className="po-ln" d="M82 96 C150 96 180 206 250 206"/>
          <path className="po-ln po-dash" d="M94 192 C150 192 200 214 250 214"/>
          <text className="po-tl" x="196" y="140">{t("dg.d4.l2")}</text>
          <rect className="po-bx" x="250" y="176" width="130" height="60" rx="6"/>
          <text className="po-t" x="315" y="198" textAnchor="middle">{t("dg.d4.api")}</text>
          <rect className="po-bx" x="262" y="210" width="22" height="14" rx="2"/><rect className="po-bx" x="290" y="210" width="22" height="14" rx="2"/><rect className="po-bx" x="318" y="210" width="22" height="14" rx="2"/><rect className="po-bx" x="346" y="210" width="22" height="14" rx="2"/>
          <text className="po-ts" x="315" y="256" textAnchor="middle">{t("dg.d4.apiSub")}</text>
          
          <path className="po-ln" d="M380 206 H470"/>
          <text className="po-tl" x="425" y="198" textAnchor="middle">{t("dg.d4.dbLat")}</text>
          <path className="po-bx" d="M470 186 v42 a40 7 0 0 0 80 0 v-42"/>
          <ellipse className="po-bx" cx="510" cy="186" rx="40" ry="7"/>
          <text className="po-t" x="510" y="214" textAnchor="middle">{t("dg.d4.db")}</text>
          <text className="po-ts" x="510" y="256" textAnchor="middle">{t("dg.d4.dbSub")}</text>
          <circle className="po-packet" r="6" cx="82" cy="62"/>
        </svg>
      );
    case 5:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 680 330" role="img" aria-label={t("dio.aria.d5")} data-dur="3000">
          <defs><marker id="d5a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>
          <rect className="po-zone" x="20" y="20" width="640" height="220" rx="12"/>
          <path className="po-grid" d="M20 60 H660 M20 100 H660 M20 140 H660 M20 180 H660 M20 220 H660 M100 20 V240 M180 20 V240 M260 20 V240 M340 20 V240 M420 20 V240 M500 20 V240 M580 20 V240"/>
          <path className="po-route" d="M540 172 L525 145 Q370 -10 206 84"/>
          
          <g className="po-ts">
            <circle cx="123" cy="83" r="4.5" className="po-solid"/><text x="123" y="72" textAnchor="middle">{t("dg.d5.c1")}</text>
            <circle cx="258" cy="187" r="4.5" className="po-solid"/><text x="258" y="206" textAnchor="middle">{t("dg.d5.c2")}</text>
            <circle cx="340" cy="60" r="4.5" className="po-solid"/><text x="340" y="50" textAnchor="middle">{t("dg.d5.c3")}</text>
            <circle cx="346" cy="136" r="4.5" className="po-solid"/><text x="346" y="125" textAnchor="middle">{t("dg.d5.c4")}</text>
            <circle cx="373" cy="204" r="4.5" className="po-solid"/><text x="373" y="223" textAnchor="middle">{t("dg.d5.c5")}</text>
            <circle cx="470" cy="115" r="4.5" className="po-solid"/><text x="470" y="104" textAnchor="middle">{t("dg.d5.c6")}</text>
            <circle cx="588" cy="86" r="4.5" className="po-solid"/><text x="588" y="75" textAnchor="middle">{t("dg.d5.c7")}</text>
            <circle cx="609" cy="204" r="4.5" className="po-solid"/><text x="609" y="223" textAnchor="middle">{t("dg.d5.c8")}</text>
          </g>
          
          <circle cx="525" cy="145" r="10" fill="none" className="po-acc"/>
          <circle cx="525" cy="145" r="4.5" className="po-accfill"/>
          <text className="po-t" x="510" y="149" textAnchor="end">{t("dg.d5.edge")}</text>
          <text className="po-ts" x="510" y="164" textAnchor="end">{t("dg.d5.edgeSub")}</text>
          <text className="po-tl" x="548" y="148">{t("dg.d5.near")}</text>
          
          <rect className="po-bx" x="534" y="170" width="14" height="24" rx="3"/>
          <text className="po-ts" x="556" y="186">{t("dg.d5.you")}</text>
          
          <path className="po-bx" d="M194 76 v14 a12 3 0 0 0 24 0 v-14"/>
          <ellipse className="po-bx" cx="206" cy="76" rx="12" ry="3"/>
          <text className="po-t" x="206" y="112" textAnchor="middle">{t("dg.d5.db")}</text>
          <text className="po-ts" x="206" y="126" textAnchor="middle">{t("dg.d5.dbSub")}</text>
          <text className="po-tl" x="370" y="44" textAnchor="middle">{t("dg.d5.far")}</text>
          
          <rect className="po-bx" x="30" y="266" width="120" height="36" rx="6"/><text className="po-t" x="90" y="289" textAnchor="middle">{t("dg.d5.push")}</text>
          <path className="po-ln" d="M150 284 H196" markerEnd="url(#d5a)"/>
          <rect className="po-bx" x="200" y="266" width="120" height="36" rx="6"/><text className="po-t" x="260" y="289" textAnchor="middle">{t("dg.d5.build")}</text>
          <path className="po-ln" d="M320 284 H366" markerEnd="url(#d5a)"/>
          <text className="po-tl" x="343" y="318" textAnchor="middle">{t("dg.d5.buildLat")}</text>
          <rect className="po-bx" x="370" y="266" width="160" height="36" rx="6"/><text className="po-t" x="450" y="289" textAnchor="middle">{t("dg.d5.deploy")}</text>
          <path className="po-ln" d="M530 284 H556" markerEnd="url(#d5a)"/>
          <rect className="po-bx" x="560" y="266" width="100" height="36" rx="6"/><text className="po-t" x="610" y="289" textAnchor="middle">{t("dg.d5.preview")}</text>
          <circle className="po-packet" r="6" cx="540" cy="172"/>
        </svg>
      );
    case 6:
      return (
        <svg ref={svgRef} className="po-dg" viewBox="0 0 640 280" role="img" aria-label={t("dio.aria.d6")} data-dur="3200">
<path className="po-route" d="M70 200 C110 130 150 120 190 140 C260 90 320 90 380 110 L470 80"/>
<circle className="po-bx" cx="70" cy="200" r="16"/><text className="po-t" x="70" y="236" textAnchor="middle">{t("dg.d6.you")}</text>
<circle className="po-accfill" cx="190" cy="140" r="22"/><text className="po-t" x="190" y="186" textAnchor="middle">{t("dg.d6.agent")}</text>
<rect className="po-bx" x="370" y="80" width="8" height="70"/><rect className="po-bx" x="410" y="80" width="8" height="70"/><rect className="po-bx" x="366" y="74" width="56" height="8"/><text className="po-ts" x="394" y="168" textAnchor="middle">{t("dg.d6.gate")}</text>
<rect className="po-bx" x="470" y="50" width="110" height="60" rx="6"/><text className="po-t" x="525" y="78" textAnchor="middle">{t("dg.d6.shop")}</text><text className="po-ts" x="525" y="96" textAnchor="middle">{t("dg.d6.shopSub")}</text>
<rect className="po-bx" x="470" y="140" width="110" height="50" rx="6"/><text className="po-t" x="525" y="162" textAnchor="middle">{t("dg.d6.news")}</text><text className="po-ts" x="525" y="178" textAnchor="middle">{t("dg.d6.newsSub")}</text>
<rect className="po-bx" x="470" y="210" width="110" height="50" rx="6"/><text className="po-t" x="525" y="232" textAnchor="middle">{t("dg.d6.bank")}</text><text className="po-ts" x="525" y="248" textAnchor="middle">{t("dg.d6.bankSub")}</text>
<path className="po-ln po-dash" d="M212 146 L470 165 M212 152 L470 232"/>
<circle className="po-packet" r="6" cx="70" cy="200"/>
</svg>
      );
    default:
      return null;
  }
}

import { Investment } from "@/types/finance";

export function isSelicLinkedInvestment(inv: Pick<Investment, "name" | "ticker">) {
  const text = `${inv.name} ${inv.ticker ?? ""}`.toLowerCase();

  return (
    text.includes("tesouro selic") ||
    /(^|\s)lft(\s|$)/.test(text) ||
    text.includes("selic")
  );
}

export function estimateSelicCurrentValue(params: {
  investedValue: number;
  createdAt: Date;
  selicRateAnnualPercent: number;
}) {
  const { investedValue, createdAt, selicRateAnnualPercent } = params;

  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / msPerDay));
  const years = days / 365;

  const rate = selicRateAnnualPercent / 100;
  const growth = Math.pow(1 + rate, years);

  return investedValue * growth;
}

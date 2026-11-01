import type { Metadata } from "next";
import { StatisticsClient } from "@/components/statistics/statistics-client";

export const metadata: Metadata = {
  title: "Statistics",
};

export default function StatisticsPage() {
  return <StatisticsClient />;
}

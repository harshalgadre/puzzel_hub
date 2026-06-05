import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "🔒 Admin Panel – Crack the Code",
  description: "Host admin panel for Crack the Code puzzle",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import React from "react";
import type { Metadata } from "next";
import AuthLayout from "@/components/Layout/AuthLayout";

export const metadata: Metadata = {
  title: "The Economist AI - Auth",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

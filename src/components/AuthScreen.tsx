"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import React from "react";
import { AuthPanel } from "@/components/AuthPanel";

type AuthScreenProps = {
  mode: "connexion" | "inscription";
  errorCode?: string;
};

export function AuthScreen({ mode, errorCode }: AuthScreenProps) {
  return (
    <main className="auth-page auth-page-immersive">
      <Link className="brand auth-brand auth-brand-overlay" href="/">
        <span className="brand-mark">W</span>
        <span>Welix</span>
      </Link>

      <section className="auth-layout auth-layout-immersive">
        <div className="auth-hero-frame">
          <Image
            alt="Présentation Welix avec tableau de bord clients, devis et relances"
            className="auth-hero-image"
            fill
            priority
            sizes="100vw"
            src="/images/auth-hero-premium.png"
          />
          <div className="auth-hero-overlay" />

          <div className="auth-proof auth-proof-floating">
            <CheckCircle2 size={18} />
            <span>Moins d&apos;administratif, plus de temps pour le chantier</span>
          </div>

          <AuthPanel errorCode={errorCode} mode={mode} />
        </div>
      </section>
    </main>
  );
}

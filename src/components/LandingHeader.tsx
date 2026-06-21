"use client";

import Link from "next/link";
import React from "react";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { AuthPanel } from "@/components/AuthPanel";
import { Modal } from "@/components/ui/modal";

export function LandingHeader() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>Welix</span>
        </Link>
        <nav aria-label="Navigation marketing" className="top-nav">
          <a href="#demo">Démo</a>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#avis">Avis</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-actions">
          <button className="ghost-button" onClick={() => setLoginOpen(true)} type="button">
            Connexion
          </button>
          <Link className="primary-button" href="/inscription">
            Essayer gratuitement
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <Modal className="landing-auth-modal" onClose={() => setLoginOpen(false)} open={loginOpen}>
        <button
          aria-label="Fermer la fenêtre de connexion"
          className="landing-auth-close"
          onClick={() => setLoginOpen(false)}
          type="button"
        >
          <X size={18} />
        </button>
        <AuthPanel mode="connexion" variant="modal" />
      </Modal>
    </>
  );
}

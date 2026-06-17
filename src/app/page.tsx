import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  MousePointerClick,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  WandSparkles,
} from "lucide-react";

const clientLogos = [
  "Bernard Rénovation",
  "Atelier Moreau",
  "BatiLyon",
  "Maison Laurent",
  "Elec & Co",
  "Toitures Martin",
];

const features = [
  {
    title: "Devis généré depuis une simple note",
    text: "Décris le chantier comme tu le ferais sur WhatsApp. Welix structure les lignes, les quantités et les prix.",
    icon: WandSparkles,
  },
  {
    title: "Un rendu professionnel à envoyer",
    text: "Chaque devis est clair, propre, cohérent et pensé pour inspirer confiance au client final.",
    icon: FileText,
  },
  {
    title: "Clients et historique centralisés",
    text: "Retrouve les contacts, les devis envoyés, les statuts et les relances sans chercher dans tes dossiers.",
    icon: UsersRound,
  },
  {
    title: "Pensé pour les artisans",
    text: "Plombiers, électriciens, peintres, maçons, menuisiers et couvreurs gardent leurs habitudes métier.",
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote:
      "Je passe de 45 minutes à quelques minutes pour préparer un devis propre. Le client reçoit quelque chose de net.",
    name: "Marc D.",
    role: "Plombier chauffagiste",
  },
  {
    quote:
      "Welix m'aide à ne rien oublier sur les postes. C'est devenu mon point de départ avant chaque envoi.",
    name: "Sarah L.",
    role: "Peintre en bâtiment",
  },
  {
    quote:
      "La page est simple, le devis est sérieux, et je gagne du temps après les visites chantier.",
    name: "Hugo M.",
    role: "Électricien",
  },
];

const faqs = [
  {
    question: "Welix remplace-t-il mon expertise métier ?",
    answer:
      "Non. Welix accélère la mise en forme, propose une structure et aide à chiffrer plus vite. Tu gardes le contrôle final avant l'envoi.",
  },
  {
    question: "Puis-je créer un devis sans être à l'aise avec les logiciels ?",
    answer:
      "Oui. L'interface est pensée pour partir d'une description simple du chantier, puis ajuster les lignes si besoin.",
  },
  {
    question: "Quels métiers sont concernés ?",
    answer:
      "Welix vise les artisans du bâtiment : plomberie, électricité, peinture, maçonnerie, menuiserie, couverture et rénovation.",
  },
  {
    question: "Est-ce une vraie application ou une maquette ?",
    answer:
      "Cette version présente l'expérience produit et les écrans clés. Elle peut ensuite être branchée à une base de données, l'authentification et l'IA.",
  },
];

export default function Home() {
  return (
    <main className="site-page landing-page">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>Welix</span>
        </Link>
        <nav className="top-nav" aria-label="Navigation marketing">
          <a href="#demo">Démo</a>
          <a href="#fonctionnalites">Fonctionnalités</a>
          <a href="#avis">Avis</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-actions">
          <Link className="ghost-button" href="/connexion">
            Connexion
          </Link>
          <Link className="primary-button" href="/inscription">
            Essayer gratuitement
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="hero-section landing-hero">
        <Image
          className="hero-image"
          src="/images/welix-hero.png"
          alt="Bureau moderne d'artisan avec outils et interface de devis"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay landing-overlay" />
        <div className="hero-content landing-hero-content">
          <div className="hero-copy landing-hero-copy">
            <span className="pill">
              <Sparkles size={15} />
              Assistant devis IA pour artisans
            </span>
            <h1 className="hero-title">Vos devis en moins de 2 minutes.</h1>
            <p className="hero-subtitle">
              L&apos;IA qui aide les artisans à gagner du temps.
            </p>
            <div className="hero-actions">
              <Link className="primary-button large-button" href="/inscription">
                Essayer gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link className="secondary-button large-button" href="#demo">
                <Play size={17} />
                Voir une démo
              </Link>
            </div>
            <div className="hero-metrics" aria-label="Bénéfices Welix">
              <span>
                <Clock3 size={16} />
                2 min par devis
              </span>
              <span>
                <MousePointerClick size={16} />
                Quelques clics
              </span>
              <span>
                <CheckCircle2 size={16} />
                Prêt à envoyer
              </span>
            </div>
          </div>

          <div className="hero-product hero-app-card" aria-label="Capture de Welix">
            <div className="browser-bar">
              <span />
              <span />
              <span />
            </div>
            <div className="mini-dashboard">
              <div className="quote-composer">
                <div>
                  <p className="section-kicker">Assistant IA</p>
                  <h2>Remplacement tableau électrique</h2>
                  <p>Diagnostic, fourniture, pose, mise aux normes et contrôle.</p>
                </div>
                <button>
                  Générer
                  <Sparkles size={15} />
                </button>
              </div>
              <div className="quote-lines">
                <span>Protection et dépose</span>
                <strong>320 EUR</strong>
                <span>Fourniture tableau</span>
                <strong>1 140 EUR</strong>
                <span>Pose et vérification</span>
                <strong>730 EUR</strong>
              </div>
              <div className="quote-total">
                <span>Total HT</span>
                <strong>2 190 EUR</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="client-logo-strip" aria-label="Clients Welix">
        {clientLogos.map((logo) => (
          <span key={logo}>{logo}</span>
        ))}
      </section>

      <section className="section-block demo-section" id="demo">
        <div className="section-heading centered-heading">
          <p className="section-kicker">Capture de l&apos;application</p>
          <h2>Un devis clair, généré pendant que le chantier est encore frais.</h2>
          <p>
            Welix transforme les notes terrain en document structuré, avec les
            postes, les montants, le statut et les actions utiles.
          </p>
        </div>

        <div className="product-capture" aria-label="Capture produit Welix">
          <div className="capture-sidebar">
            <Link className="brand" href="/">
              <span className="brand-mark">W</span>
              <span>Welix</span>
            </Link>
            <span className="capture-nav active">Nouveau devis</span>
            <span className="capture-nav">Clients</span>
            <span className="capture-nav">Historique</span>
          </div>
          <div className="capture-main">
            <div className="capture-toolbar">
              <div>
                <p className="section-kicker">Création assistée</p>
                <h3>Devis prêt à envoyer</h3>
              </div>
              <span className="status status-envoyé">IA active</span>
            </div>
            <div className="capture-grid">
              <div className="capture-panel capture-prompt">
                <span>Note chantier</span>
                <p>
                  Remplacer un chauffe-eau 200L, accès cave, évacuation ancien
                  matériel, prévoir groupe sécurité.
                </p>
              </div>
              <div className="capture-panel capture-total">
                <span>Total HT</span>
                <strong>1 860 EUR</strong>
              </div>
            </div>
            <div className="capture-lines">
              <div>
                <span>Dépose et évacuation</span>
                <strong>260 EUR</strong>
              </div>
              <div>
                <span>Fourniture chauffe-eau</span>
                <strong>1 050 EUR</strong>
              </div>
              <div>
                <span>Pose, sécurité et contrôle</span>
                <strong>550 EUR</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block" id="fonctionnalites">
        <div className="section-heading">
          <p className="section-kicker">Fonctionnalités</p>
          <h2>Tout ce qu&apos;il faut pour passer du chantier au devis.</h2>
        </div>
        <div className="feature-grid landing-feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card landing-feature-card" key={feature.title}>
                <Icon size={22} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-block testimonials-section" id="avis">
        <div className="section-heading centered-heading">
          <p className="section-kicker">Avis artisans</p>
          <h2>Une expérience simple, rapide et professionnelle.</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="stars" aria-label="5 étoiles">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} fill="currentColor" />
                ))}
              </div>
              <p>“{testimonial.quote}”</p>
              <div>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block faq-section" id="faq">
        <div className="section-heading">
          <p className="section-kicker">FAQ</p>
          <h2>Les réponses avant de démarrer.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta landing-final-cta">
        <div>
          <p className="section-kicker">Prêt à gagner du temps ?</p>
          <h2>Crée ton prochain devis avec Welix.</h2>
        </div>
        <Link className="primary-button large-button" href="/inscription">
          Essayer gratuitement
          <ArrowRight size={18} />
        </Link>
      </section>

      <footer className="site-footer landing-footer">
        <Link className="brand" href="/">
          <span className="brand-mark">W</span>
          <span>Welix</span>
        </Link>
        <span>Devis IA pour artisans</span>
        <span>Produit</span>
        <span>Confidentialité</span>
        <span>Contact</span>
      </footer>
    </main>
  );
}

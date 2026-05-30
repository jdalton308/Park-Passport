import { TOTAL_PARKS } from "@/lib/parks-data";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="container hero__content">
        <span className="hero__eyebrow">U.S. National Parks</span>
        <h1 className="hero__title">Every park. One passport.</h1>
        <p className="hero__subtitle">
          Log the national parks you&apos;ve explored, save your progress, and build a ranked
          wishlist for the adventures still ahead.
        </p>
        <div className="hero__actions">
          <a href="#auth-section" className="btn btn--secondary btn--lg">
            Create free account
          </a>
          <a
            href="#auth-section"
            className="btn btn--ghost btn--lg"
            style={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
          >
            Sign in
          </a>
        </div>
        <div className="hero__stats">
          <div>
            <div className="hero__stat-value">{TOTAL_PARKS}</div>
            <div className="hero__stat-label">National parks to discover</div>
          </div>
          <div>
            <div className="hero__stat-value">∞</div>
            <div className="hero__stat-label">Memories to collect</div>
          </div>
        </div>
      </div>
    </section>
  );
}

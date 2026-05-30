import AuthForm from "@/components/AuthForm";
import Hero from "@/components/Hero";
import SiteHeader from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader showAuthLink />
      <main>
        <Hero />
        <section className="auth-section" id="auth-section">
          <div className="container auth-section__grid">
            <div className="auth-section__intro">
              <h2>Start your journey</h2>
              <p>
                Sign in with Google to track visited parks, save your list across devices, and
                rank your bucket-list destinations.
              </p>
              <ul className="auth-section__features">
                <li>Check off all 63 U.S. National Parks</li>
                <li>Save your progress securely in the cloud</li>
                <li>Build a ranked wishlist for parks you haven&apos;t visited yet</li>
              </ul>
            </div>
            <AuthForm />
          </div>
        </section>
      </main>
    </>
  );
}

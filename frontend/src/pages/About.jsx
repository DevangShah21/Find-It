import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      {/* Hero */}
      <div className="about-hero">
        <div>
          <span className="about-hero-tag">OUR ETHOS</span>
          <h1 className="about-hero-title">
            Returning the things that define <em>you.</em>
          </h1>
          <p className="about-hero-text">
            We believe every lost object carries a story. Our mission is to transform the chaos of loss
            into a guided journey of reunification through precision, technology, and empathy.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/lost" className="btn btn-primary">Start a Search</Link>
            <Link to="/about" className="btn btn-green">Learn Our Process</Link>
          </div>
        </div>
        <div>
          <div style={{ position: "relative" }}>
            <img
              src="https://images.unsplash.com/photo-1595079676601-f1adf5be5dee?w=700"
              alt="Lost items"
              style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: "var(--radius-lg)" }}
            />
            <div className="about-hero-quote">
              "It's not just a set of keys. It's the access to a home."
              <cite>— The Curator</cite>
            </div>
          </div>
        </div>
      </div>

      {/* Sanctuary */}
      <div className="about-sanctuary">
        <div>
          <h2 className="about-sanctuary-title">A Sanctuary for Lost Memories</h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 16 }}>
            For most, a lost item is a statistic. For us, it's a commitment. The Empathetic Curator was
            founded on the principle that the value of an object isn't found in its price tag, but in its
            connection to its owner.
          </p>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
            By blending advanced metadata tracking with a human-centric interface, we've created a space
            where the anxiety of loss is met with the calm of professional handling. We aren't just a
            database; we are the bridge between your past and your present.
          </p>
        </div>
        <div>
          <div className="about-sanctuary-imgs">
            <img src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300" alt="Necklace" />
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300" alt="Camera" />
          </div>
        </div>
      </div>

      {/* Process */}
      <div className="process-section">
        <div className="process-inner">
          <h2 className="process-title">The Curated Process</h2>
          <div className="process-grid">
            {/* Step 1 */}
            <div className="process-card" style={{ gridColumn: 1 }}>
              <div className="process-num">01. Precision Logging</div>
              <div className="process-card-title">Every Detail Matters</div>
              <div className="process-card-text">
                Our intake process uses high-fidelity descriptions to ensure no details are overlooked —
                from the tint of a watch to the specific font of a wallet.
              </div>
            </div>

            {/* Step 2 - featured */}
            <div className="process-card featured" style={{ gridColumn: 2 }}>
              <div className="feat-icon">🤝</div>
              <div className="process-num" style={{ color: "rgba(255,255,255,0.5)" }}>02. Empathetic Matching</div>
              <div className="process-card-title" style={{ color: "white" }}>Context-Aware AI</div>
              <div className="process-card-text" style={{ color: "rgba(255,255,255,0.7)" }}>
                We don't just match keywords; we match contexts. Our algorithm considers location, time,
                and descriptive nuance to connect owners with curators.
              </div>
            </div>

            {/* Image */}
            <div style={{ gridColumn: 3, gridRow: "1 / 3" }}>
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400"
                alt="Process"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius)", minHeight: 260 }}
              />
            </div>

            {/* Step 3 */}
            <div className="process-card" style={{ gridColumn: 1 }}>
              <div className="feat-icon">🔒</div>
              <div className="process-num">03. Secure Handoff</div>
              <div className="process-card-title">Trust at Every Step</div>
              <div className="process-card-text">
                Security is our priority. Every reunion is facilitated through a verified identity process
                to ensure items return to their rightful home.
              </div>
            </div>

            {/* Rate */}
            <div className="process-card rate" style={{ gridColumn: 2 }}>
              <div className="process-rate-num">94%</div>
              <div className="process-rate-label">Reunification Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="community-section">
        <div className="community-inner">
          <div>
            <h2 className="community-title">Community Impact</h2>
            <div className="testimonial">
              <div className="testimonial-text">
                "I thought I lost my wedding ring forever at the terminal. The care they took to verify
                the inscription made me cry with relief."
              </div>
              <div className="testimonial-author">— Sarah J., London</div>
            </div>
            <div className="testimonial">
              <div className="testimonial-text">
                "It's refreshing to see a service that treats found objects like treasures rather than
                lost property."
              </div>
              <div className="testimonial-author">— Marcus T., New York</div>
            </div>
          </div>
          <div className="community-img">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500"
              alt="Community"
              style={{ borderRadius: "var(--radius-lg)", height: 300, width: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2 className="cta-title">Need help finding something?</h2>
        <p className="cta-sub">Our curators are standing by to help you search our global registry with the care you deserve.</p>
        <div className="cta-actions">
          <Link to="/report" className="btn btn-primary">Report Lost Item</Link>
          <a href="mailto:support@findit.com" className="btn btn-outline">Contact Support</a>
        </div>
      </div>
    </>
  );
}

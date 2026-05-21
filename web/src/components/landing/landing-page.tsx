import Link from "next/link";

import "./landing.css";

export function LandingPage() {
  return (
    <div className="landing">
      <nav>
        <div className="container nav-inner">
          <Link href="/" className="logo">
            Kindle<span>Dict</span>
          </Link>
          <div className="nav-links">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#faq">FAQ</a>
            <Link href="/app" className="btn btn-primary">
              Try free
            </Link>
          </div>
        </div>
      </nav>

      <header className="hero container">
        <div className="hero-badge">
          Custom Kindle fictionaries — not just another ebook
        </div>
        <h1>
          Look up any word in your book — even when Kindle says &ldquo;not
          found&rdquo;
        </h1>
        <p className="hero-sub">
          KindleDict builds a <strong>custom Kindle dictionary</strong> from the
          book you&apos;re reading. Tap character names, places, and lore terms
          and get definitions right in the dictionary popup — without flipping
          to a glossary.
        </p>
        <div className="hero-cta">
          <Link href="/app" className="btn btn-primary">
            Build your fictionary — free
          </Link>
          <a href="#how-it-works" className="btn btn-secondary">
            See how it works
          </a>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-label">While reading on Kindle</div>
          <div className="lookup-demo">
            …traveling north with <span className="lookup-word">Yoren</span>{" "}
            toward the Wall, Arya kept her hand on{" "}
            <span className="lookup-word">Needle</span>…
          </div>
          <div className="lookup-popup">
            <strong>Yoren</strong>
            <div className="tag">Character · A Clash of Kings, Ch. 4</div>
            Black brother of the Night&apos;s Watch who recruits from the
            dungeons. Currently transporting men and boys to the Wall,
            including Arya in disguise.
          </div>
        </div>
      </header>

      <section id="problem">
        <div className="container">
          <h2>Your Kindle dictionary wasn&apos;t built for fiction</h2>
          <p className="section-sub">
            Built-in dictionaries work for standard English. They fail on the
            words that actually slow you down.
          </p>
          <div className="pain-grid">
            <div className="pain-card">
              <div className="icon">❌</div>
              <h3>&ldquo;Word not found&rdquo;</h3>
              <p>
                Press and hold a character name — Kindle returns nothing. You
                lose the thread of the story.
              </p>
            </div>
            <div className="pain-card">
              <div className="icon">📖</div>
              <h3>Back-of-book glossaries break flow</h3>
              <p>
                Some editions include a glossary, but you have to leave the
                page, search manually, and hope the term is listed.
              </p>
            </div>
            <div className="pain-card">
              <div className="icon">🧠</div>
              <h3>Too many names to track</h3>
              <p>
                Epic fantasy, sci-fi, and literary fiction pile on people,
                places, and invented terms faster than memory allows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works">
        <div className="container">
          <h2>From book to Kindle dictionary in four steps</h2>
          <p className="section-sub">
            Not a PDF. Not a separate ebook. A real dictionary your Kindle uses
            when you tap a word.
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Upload your book</h3>
              <p>
                Add an EPUB or paste a chapter. We scan for names, places, and
                terms readers actually look up.
              </p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>AI builds entries</h3>
              <p>
                Each entry includes context-aware definitions, alternate forms
                (nicknames, possessives), and spoiler-safe scope.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Download .mobi</h3>
              <p>
                We compile a Kindle-compatible dictionary file — the same format
                used by fan-made fictionaries for decades.
              </p>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <h3>Read and tap</h3>
              <p>
                Sideload to your Kindle, set as default dictionary, and look up
                words without leaving the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <h2>Built for how Kindle lookup actually works</h2>
          <p className="section-sub">
            Every feature exists because standard dictionaries miss it.
          </p>
          <div className="features-grid">
            <div className="feature">
              <h3>
                <span className="check">✓</span> True dictionary integration
              </h3>
              <p>
                Works in Kindle&apos;s tap-to-define popup — not a side-loaded
                book you have to open separately.
              </p>
            </div>
            <div className="feature">
              <h3>
                <span className="check">✓</span> Character names &amp; nicknames
              </h3>
              <p>
                &ldquo;Arya&rdquo;, &ldquo;Arry&rdquo;, &ldquo;Yoren&apos;s&rdquo;
                — alternate forms indexed so single-word lookup hits the right
                entry.
              </p>
            </div>
            <div className="feature">
              <h3>
                <span className="check">✓</span> Places, lore &amp; invented
                terms
              </h3>
              <p>
                Valyrian steel, the Wall, sourleaf — book-specific vocabulary
                built-in dictionaries ignore.
              </p>
            </div>
            <div className="feature">
              <h3>
                <span className="check">✓</span> Spoiler-aware by chapter
              </h3>
              <p>
                Definitions only use what you&apos;ve read so far. No future plot
                points leaking into early chapters.
              </p>
            </div>
            <div className="feature">
              <h3>
                <span className="check">✓</span> Falls back gracefully
              </h3>
              <p>
                Words not in your fictionary still query your regular
                dictionaries. Best of both worlds.
              </p>
            </div>
            <div className="feature">
              <h3>
                <span className="check">✓</span> Rare English words too
              </h3>
              <p>
                Courser, fettered, squalid — vocabulary that&apos;s real English
                but too obscure for quick reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="compare">
        <div className="container">
          <h2>KindleDict vs. everything else</h2>
          <p className="section-sub">
            Why a custom fictionary beats the workarounds.
          </p>
          <div className="compare">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>KindleDict</th>
                  <th>Built-in dictionary</th>
                  <th>Back-of-book glossary</th>
                  <th>Kindle X-Ray</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tap-to-define in popup</td>
                  <td className="yes">Yes</td>
                  <td className="yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Character &amp; place names</td>
                  <td className="yes">Yes</td>
                  <td className="no">No</td>
                  <td className="yes">Sometimes</td>
                  <td className="yes">Sometimes</td>
                </tr>
                <tr>
                  <td>Works on every book</td>
                  <td className="yes">Yes</td>
                  <td className="yes">Yes</td>
                  <td className="no">Rare</td>
                  <td className="no">Limited titles</td>
                </tr>
                <tr>
                  <td>Stay on the same page</td>
                  <td className="yes">Yes</td>
                  <td className="yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Custom per your edition</td>
                  <td className="yes">Yes</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                  <td className="no">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="audience">
        <div className="container">
          <h2>Made for readers who hit &ldquo;word not found&rdquo;</h2>
          <p className="section-sub">
            If you&apos;ve ever paused mid-chapter to Google a name, this is for
            you.
          </p>
          <div className="pain-grid">
            <div className="pain-card">
              <h3>Fantasy &amp; sci-fi fans</h3>
              <p>
                Dozens of houses, nicknames, and invented terms per book. Finally
                look them up like normal words.
              </p>
            </div>
            <div className="pain-card">
              <h3>Literary &amp; historical fiction</h3>
              <p>
                Archaic vocabulary and period-specific references — explained in
                context, not from a generic dictionary.
              </p>
            </div>
            <div className="pain-card">
              <h3>English learners reading originals</h3>
              <p>
                When the hard word is also a proper noun or book-specific term,
                standard learner dictionaries won&apos;t help.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>What is a fictionary?</h3>
              <p>
                A fictionary is a custom Kindle dictionary built for one book
                (or series). It behaves like a normal dictionary during reading
                — press and hold a word, see the definition — but the entries
                describe that book&apos;s characters, places, and terms instead of
                standard English.
              </p>
            </div>
            <div className="faq-item">
              <h3>Why doesn&apos;t my Kindle find character names?</h3>
              <p>
                Built-in dictionaries only include general vocabulary. Fictional
                names, locations, and invented words are not in Oxford,
                Merriam-Webster, or any stock Kindle dictionary — so lookup
                fails. KindleDict fills that gap with a book-specific dictionary
                file.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is this just another ebook?</h3>
              <p>
                No. A regular MOBI ebook cannot replace your dictionary.
                KindleDict exports a <strong>dictionary-indexed .mobi</strong>{" "}
                with special metadata and lookup tags. Your Kindle recognizes it
                as a dictionary and uses it in the tap-to-define popup.
              </p>
            </div>
            <div className="faq-item">
              <h3>Which Kindle devices are supported?</h3>
              <p>
                Any Kindle e-reader that supports custom dictionaries — including
                Paperwhite, Oasis, and Scribe. Sideload the .mobi file, then set
                it as your default dictionary under Settings → Language &amp;
                Dictionaries.
              </p>
            </div>
            <div className="faq-item">
              <h3>What file formats can I upload?</h3>
              <p>
                DRM-free EPUB and pasted chapter text. We do not support
                DRM-protected Kindle (AZW/KFX) files. You must own the legal right
                to the content you upload.
              </p>
            </div>
            <div className="faq-item">
              <h3>What happens to words not in my fictionary?</h3>
              <p>
                Kindle searches your fictionary first, then falls back to your
                other installed dictionaries. You keep normal English lookup for
                everything your custom dictionary doesn&apos;t cover.
              </p>
            </div>
            <div className="faq-item">
              <h3>Is my book uploaded to your servers?</h3>
              <p>
                Files are processed to generate your dictionary and deleted after
                a short retention window. We do not use your books to train AI
                models. See our privacy policy for details.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="cta-band" id="try">
        <h2>Stop flipping to the glossary. Start tapping.</h2>
        <p>Upload a chapter free. Download a Kindle-ready fictionary in minutes.</p>
        <Link href="/app" className="btn btn-primary">
          Get started — it&apos;s free
        </Link>
        <p className="cta-note">
          No credit card · DRM-free EPUB or paste text · Personal use
        </p>
      </div>

      <footer>
        <div className="container">
          <p>
            © 2026 KindleDict · Custom Kindle dictionaries &amp; fictionaries
            for serious readers
          </p>
          <p className="footer-links">
            <Link href="/privacy">Privacy</Link> ·{" "}
            <Link href="/terms">Terms</Link> ·{" "}
            <Link href="/contact">Contact</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

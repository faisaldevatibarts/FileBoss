export default function Home() {
  return (
    <div className="workspace">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Fileboss home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>fileboss</span>
        </a>
        <nav className="topnav" aria-label="Main navigation">
          <a className="nav-link active" href="#home">Overview</a>
          <a className="nav-link" href="#files">Files</a>
          <a className="nav-link" href="#shared">Shared</a>
        </nav>
        <div className="profile" aria-label="Your account">FB</div>
      </header>

      <main id="home" className="main-content">
        <section className="welcome" aria-labelledby="welcome-title">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1 id="welcome-title">A little more room to think.</h1>
            <p className="welcome-copy">
              Keep your files, projects, and shared work together in one place.
            </p>
          </div>
          <div className="welcome-note">
            <span className="status-dot" aria-hidden="true" />
            <span>Your space is ready</span>
          </div>
        </section>

        <section id="files" className="content-section" aria-labelledby="files-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR LIBRARY</p>
              <h2 id="files-title">Recent files</h2>
            </div>
            <a className="text-link" href="#shared">View shared work <span aria-hidden="true">-&gt;</span></a>
          </div>
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h3>Your library starts here</h3>
            <p>When you add files, you’ll find them waiting for you here.</p>
          </div>
        </section>

        <section id="shared" className="bottom-row" aria-label="Workspace summary">
          <div className="summary-item">
            <span className="summary-label">STORAGE</span>
            <span className="summary-value">Ready for your first file</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">SHARED WITH YOU</span>
            <span className="summary-value">Nothing here yet</span>
          </div>
          <a className="text-link activity-link" href="#home">Back to overview <span aria-hidden="true">↑</span></a>
        </section>
      </main>
    </div>
  );
}

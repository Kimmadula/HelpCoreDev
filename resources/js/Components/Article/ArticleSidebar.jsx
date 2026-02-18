import CollapsibleSection from "./CollapsibleSection";

export default function ArticleSidebar({ sidebarOpen, nav, activeSubsectionId, onSubsectionClick }) {
    return (
        <aside className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>
            <a href="/">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/coreDev.png" alt="coreDev logo" />
                    </div>
                    <div className="sidebar-brand">Knowledge Base</div>
                </div>
            </a>

            <div className="sidebar-content">
                {nav?.sections?.map((section) => (
                    <CollapsibleSection
                        key={section.id}
                        section={section}
                        activeSubsectionId={activeSubsectionId}
                        onSubsectionClick={onSubsectionClick}
                    />
                ))}
            </div>
        </aside>
    );
}

import { useEffect } from "react";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Process } from "@/components/sections/process";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { ProjectModalProvider } from "@/components/project-modal/use-project-modal";

function App() {
  // In-page links scroll smoothly but keep the URL clean (no "#section").
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);

    // If opened with an old "#section" link, scroll there then clean the URL.
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      history.replaceState(null, "", window.location.pathname + window.location.search);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <ProjectModalProvider>
      <div className="min-h-screen bg-canvas text-ink">
        <Header />
        <main>
          <Hero />
          <Services />
          <Work />
          <Process />
          <Contact />
        </main>
        <Footer />
      </div>
    </ProjectModalProvider>
  );
}

export default App;

import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Work } from "@/components/sections/work";
import { Process } from "@/components/sections/process";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { ProjectModalProvider } from "@/components/project-modal/use-project-modal";

function App() {
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

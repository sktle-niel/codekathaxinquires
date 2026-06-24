import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ProjectModal } from "./project-modal";

type Ctx = { open: () => void; close: () => void; isOpen: boolean };

const ProjectModalContext = createContext<Ctx | null>(null);

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ProjectModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <ProjectModal open={isOpen} onClose={close} />
    </ProjectModalContext.Provider>
  );
}

export function useProjectModal(): Ctx {
  const ctx = useContext(ProjectModalContext);
  if (!ctx) {
    throw new Error("useProjectModal must be used within ProjectModalProvider");
  }
  return ctx;
}

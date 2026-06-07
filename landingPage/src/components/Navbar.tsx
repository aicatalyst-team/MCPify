import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Github } from "lucide-react";
import mcpifyLogo from "@/assets/logo.png";

const repoUrl = "https://github.com/amarnath3003/MCPify";

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const hidden = isScrolled && !isHovered;

  return (
    <div 
      className="fixed top-0 inset-x-0 z-50 pointer-events-none flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 inset-x-0 h-8 pointer-events-auto" />
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="relative pt-4 pointer-events-none"
      >
        <div className="max-w-7xl mx-auto px-6 pointer-events-auto">
          <div 
            className="relative bg-[oklch(0.99_0_0)] border-[3px] border-border rounded-full px-5 py-2.5 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-toon)" }}
          >
            <Link to="/" className="flex items-center gap-2">
              <img
                src={mcpifyLogo}
                alt="MCPify"
                className="h-9 w-auto"
                style={{ filter: "drop-shadow(2px 2px 0 oklch(0.18 0.04 285))" }}
              />
            </Link>
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2">
              <Link 
                to="/" 
                hash="how" 
                activeProps={{ className: "text-foreground font-semibold" }} 
                inactiveProps={{ className: "hover:text-foreground transition-colors" }}
              >
                How it works
              </Link>
              <Link 
                to="/" 
                hash="features" 
                activeProps={{ className: "text-foreground font-semibold" }} 
                inactiveProps={{ className: "hover:text-foreground transition-colors" }}
              >
                Features
              </Link>
              <Link 
                to="/docs" 
                activeProps={{ className: "text-foreground font-semibold" }} 
                inactiveProps={{ className: "hover:text-foreground transition-colors" }}
              >
                Docs
              </Link>
              <Link 
                to="/roadmap" 
                activeProps={{ className: "text-foreground font-semibold" }} 
                inactiveProps={{ className: "hover:text-foreground transition-colors" }}
              >
                Roadmap
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hidden sm:flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <Link
                to="/"
                hash="cta"
                className="inline-flex items-center gap-1.5 text-sm px-5 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.header>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

function useInView() {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(currentRef);
      }
    }, { threshold: 0.1 });

    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return { ref, isInView };
}

export default function Footer() {
  const { ref, isInView } = useInView();

  return (
    <footer 
      ref={ref}
      className={clsx(
        "bg-[#0f0f17] pt-16 pb-8 border-t border-white/5 relative transition-opacity duration-1000",
        isInView ? "animate-fade-in-up opacity-100" : "opacity-0"
      )}
    >
      <div className="absolute top-0 left-0 w-full h-px divider-gradient" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ResumeAI</span>
            </Link>
            <p className="text-sm text-secondary">
              AI-powered resume analysis that understands skills, experience, and potential.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-primary font-semibold mb-4">Product</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/features" className="text-sm text-secondary hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/demo/job-seeker" className="text-sm text-secondary hover:text-primary transition-colors">Demo</Link></li>
              <li><Link to="/pricing" className="text-sm text-secondary hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-primary font-semibold mb-4">Company</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/about" className="text-sm text-secondary hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-sm text-secondary hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-sm text-secondary hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-primary font-semibold mb-4">Legal</h4>
            <ul className="flex flex-col gap-2">
              <li><Link to="/privacy" className="text-sm text-secondary hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-sm text-secondary hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © 2024 ResumeAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

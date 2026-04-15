import React, { useState, useEffect, useRef } from 'react';
import { useGitHubRepos } from './hooks/useGitHubRepos';
import { ProjectCard } from './components/ProjectCard';
import { motion, useScroll, useSpring, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';

// --- COMPONENTES AUXILIARES PREMIUM ---

// 1. Botão Magnético
const MagneticButton = ({ children, className, href }: { children: React.ReactNode, className: string, href?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.2); // Força magnética
    y.set(middleY * 0.2);
  };
  const reset = () => { x.set(0); y.set(0); };

  const Wrapper = href ? motion.a : motion.button;
  return (
    <div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} className="relative inline-block">
      <Wrapper
        href={href}
        style={{ x, y }}
        animate={{ x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        className={className}
      >
        {children}
      </Wrapper>
    </div>
  );
};

// 2. Cartão com Spotlight (Habilidades)
const SpotlightCard = ({ children, title }: { children: React.ReactNode, title: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  return (
    <div onMouseMove={handleMouseMove} className="group relative bg-slate-900/40 p-8 rounded-2xl border border-slate-800/80 backdrop-blur-sm overflow-hidden">
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(52, 211, 153, 0.15), transparent 80%)` }}
      />
      <h3 className="text-white font-semibold text-xl mb-6 relative z-10 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>{title}
      </h3>
      <div className="flex flex-wrap gap-2 relative z-10">{children}</div>
    </div>
  );
};

// 3. Cartão 3D Tilt (Projetos)
const TiltCardWrapper = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }}
      className="group relative transition-transform duration-200 ease-linear"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/30 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative h-full bg-slate-900 border border-slate-800 p-1 rounded-2xl overflow-hidden shadow-2xl">
        {children}
      </div>
    </motion.div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function Portfolio() {
  const { repos, loading, error } = useGitHubRepos('grayfoxbr');
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // CURSOR COM ZERO LATÊNCIA
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const ringX = useSpring(cursorX, { damping: 40, stiffness: 400, mass: 0.5 });
  const ringY = useSpring(cursorY, { damping: 40, stiffness: 400, mass: 0.5 });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ['sobre', 'habilidades', 'projetos', 'contato'];
      const current = sections.find(section => {
        const el = document.getElementById(section);
        return el && el.getBoundingClientRect().top >= -100 && el.getBoundingClientRect().top <= window.innerHeight / 2;
      });
      if (current) setActiveSection(current);
    };

    // A mágica do Zero Delay: Usa motionValue direto
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      setIsHovering(!!(e.target as HTMLElement).closest('a, button, [role="button"]'));
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('joaohenrique@exemplo.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const skillsConfig = [
    { title: "Linguagens", items: ['C', 'Java', 'Kotlin', 'Python', 'JavaScript', 'TypeScript'] },
    { title: "Frontend", items: ['React', 'HTML5', 'CSS3', 'Tailwind CSS'] },
    { title: "Backend", items: ['Node.js', 'MongoDB', 'MySQL', 'SQLite'] }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">
          GrayFox
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 overflow-hidden cursor-none md:cursor-auto">

      {/* Scrollbar Customizada & Glitch Animation */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: rgba(52, 211, 153, 0.3); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(52, 211, 153, 0.8); }
        .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .noise-bg { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E"); }
      `}</style>

      {/* Cursor Zero-Delay */}
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-2 h-2 bg-emerald-400 rounded-full pointer-events-none z-[100] mix-blend-screen"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-12 h-12 border rounded-full pointer-events-none z-[99] flex items-center justify-center"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0)',
          borderColor: isHovering ? 'rgba(52, 211, 153, 0.8)' : 'rgba(52, 211, 153, 0.3)',
          backdropFilter: isHovering ? 'blur(2px)' : 'blur(0px)'
        }}
      />

      {/* Fundo Animado (Ruído e Parallax) */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay noise-bg animate-[pulse_2s_infinite]"></div>
      <motion.div style={{ y: yParallax }} className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px]" />
      </motion.div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50 shadow-xl py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <a href="#" className="text-2xl font-bold tracking-tighter group z-10 glitch-hover">
            <span className="text-white">Gray</span><span className="text-emerald-400">Fox</span>
          </a>

          <div className="hidden md:flex gap-8 text-sm font-medium z-10 bg-slate-900/40 px-6 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
            {['Sobre', 'Habilidades', 'Projetos', 'Contato'].map((item) => {
              const id = item.toLowerCase();
              return (
                <a key={item} href={`#${id}`} className={`transition-colors relative ${activeSection === id ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}>
                  {item}
                  {activeSection === id && <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col justify-center items-start max-w-6xl mx-auto z-10">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Disponível para novos desafios
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold mb-2 tracking-tight text-white">Raul Precechan</h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-slate-400">
            Construindo a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">web do futuro</span>.
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-12">
            Desenvolvedor backend apaixonado por criar soluções eficientes e escaláveis. Com experiência em diversas linguagens e tecnologias, estou sempre em busca de novos desafios para aprimorar minhas habilidades e contribuir para projetos inovadores.
          </p>

          <div className="flex flex-wrap gap-6 items-center">
            <MagneticButton href="#projetos" className="group relative inline-flex items-center justify-center px-8 py-4 font-mono text-sm font-semibold text-slate-900 bg-emerald-400 rounded-md overflow-hidden hover:scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              <span className="relative">Explorar Projetos</span>
            </MagneticButton>
            <MagneticButton href="#" className="group inline-flex items-center justify-center px-8 py-4 font-mono text-sm font-medium text-slate-300 border border-slate-700/80 rounded-md hover:border-emerald-400/80 hover:text-emerald-300">
              Download CV
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-24 px-6 relative z-10 border-t border-slate-800/50 bg-slate-900/20 overflow-hidden">
        {/* Marca d'água */}
        <div className="absolute top-0 right-0 font-extrabold text-[12rem] md:text-[20rem] text-white/[0.02] pointer-events-none uppercase -z-10 select-none leading-none">SOBRE</div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center"><span className="text-emerald-400 font-mono text-xl mr-3">01.</span> Sobre Mim <div className="h-px bg-slate-700 ml-6 flex-grow"></div></h2>

          <div className="grid md:grid-cols-5 gap-16 items-center">
            <div className="md:col-span-2 text-slate-400 space-y-6 text-lg leading-relaxed">
              <p>Sou Raul Nunes. Vou revolucionar o mercado de educação e tecnologia do Brasil.</p>
              <p>Sou fascinado pelo universo da programação. Prezo por desenvolver sistemas robustos, com alta escalabilidade, segurança e consistência, sempre alicerçado nas melhores referências de quem realmente entende do assunto.</p>
            </div>

            <div className="md:col-span-3 relative group w-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                className="relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 shadow-2xl z-10 hover:shadow-[0_0_40px_rgba(52,211,153,0.15)] transition-shadow duration-500"
              >
                <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-black/50">
                  <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div><div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div><div className="w-3 h-3 rounded-full bg-[#27c93f]"></div></div>
                  <span className="text-slate-400 text-xs font-mono ml-4 text-center absolute w-full left-0 pointer-events-none">joao_henrique.ts</span>
                </div>
                {/* Código com Animação de Digitação (Typewriter) */}
                <div className="p-6 font-mono text-sm md:text-base text-emerald-400/90">
                  <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                    {/* Simulando as linhas de código com stagger */}
                    {[
                      <p><span className="text-pink-500">const</span> <span className="text-blue-400 font-bold">developer</span> <span className="text-white">=</span> {'{'}</p>,
                      <p className="ml-6">name: <span className="text-yellow-300">'Raul Precechan'</span>,</p>,
                      <p className="ml-6">role: <span className="text-yellow-300">'Backend Developer'</span>,</p>,
                      <p className="ml-6">skills: [<span className="text-yellow-300">'Java'</span>, <span className="text-yellow-300">'Kotlin'</span>],</p>,
                      <p className="ml-6">hardWorker: <span className="text-purple-400">true</span></p>,
                      <p>{'}'};</p>,
                      <p><span className="text-pink-500">export default</span> <span className="text-blue-400">developer</span>;</p>
                    ].map((line, i) => (
                      <motion.div key={i} variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}>{line}</motion.div>
                    ))}
                  </motion.div>
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-4 bg-emerald-400 mt-2 inline-block"></motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Habilidades Section */}
      <section id="habilidades" className="py-24 px-6 z-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 font-extrabold text-[15rem] text-white/[0.02] pointer-events-none uppercase -z-10 select-none -translate-y-1/2">SKILLS</div>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center"><span className="text-emerald-400 font-mono text-xl mr-3">02.</span> Arsenal Tecnológico <div className="h-px bg-slate-700 ml-6 flex-grow"></div></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {skillsConfig.map((category, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <SpotlightCard title={category.title}>
                  {category.items.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 font-mono text-xs rounded-md cursor-default">
                      {tech}
                    </span>
                  ))}
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projetos Section */}
      <section id="projetos" className="py-24 px-6 relative z-10 border-t border-slate-800/50">
        <div className="absolute top-0 right-0 font-extrabold text-[15rem] text-white/[0.02] pointer-events-none uppercase -z-10 select-none leading-none text-right">WORK</div>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center"><span className="text-emerald-400 font-mono text-xl mr-3">03.</span> Projetos em Destaque <div className="h-px bg-slate-700 ml-6 flex-grow"></div></h2>

          {error ? (
            <div className="p-4 bg-red-900/20 text-red-400">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse h-64 bg-slate-800/30 rounded-2xl" />)
                : repos.map((repo) => (
                  <TiltCardWrapper key={repo.id}>
                    <ProjectCard repo={repo} />
                  </TiltCardWrapper>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-32 px-6 text-center z-10 relative">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto flex flex-col items-center relative">
          <h2 className="text-emerald-400 font-mono mb-4 tracking-widest">04. QUAL O PRÓXIMO PASSO?</h2>
          <h3 className="text-5xl md:text-7xl font-bold text-white mb-6">Vamos Conversar</h3>
          <p className="text-slate-400 text-lg mb-10 max-w-lg">Atualmente estou aberto a novas oportunidades. Quer tenha um projeto inovador, ou apenas queira dizer olá, a minha caixa de entrada está aberta.</p>

          <div className="flex gap-4">
            <MagneticButton 
              href="mailto:raulrpn.nunes@proton.me?subject=Contato&body=Olá Raul," 
              className="px-10 py-5 bg-white text-slate-900 font-bold font-mono text-sm rounded-md shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Dizer Olá
            </MagneticButton>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-800/50 bg-slate-950 z-10 relative">
        <p className="text-slate-500 text-sm font-mono">&copy; {new Date().getFullYear()} • Construído com React & Framer Motion</p>
      </footer>
    </div>
  );
}
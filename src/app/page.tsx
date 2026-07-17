"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Fingerprint, Scale, Search } from "lucide-react";
import { getCaseListSummary } from "@/lib/cases";

const cases = getCaseListSummary();

const features = [
  { icon: Search, title: "Collect Evidence", desc: "Crime scenes, forensics, documents, digital trails" },
  { icon: Fingerprint, title: "Interrogate Suspects", desc: "AI-powered suspects who lie, break, and remember" },
  { icon: Scale, title: "Prove Your Case", desc: "Build a chargesheet that holds up in court" },
];

export default function HomePage() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <main className="min-h-screen">
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="/images/hero-detective-office.png"
            alt="Detective investigation office"
            fill
            className="object-cover scale-105"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a12] via-[#060a12]/92 to-[#060a12]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-transparent to-[#060a12]/70" />

        {/* Animated scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <div className="w-full h-32 bg-gradient-to-b from-amber-400 to-transparent animate-[scanline_8s_linear_infinite]" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-amber-400/80 text-xs sm:text-sm font-mono tracking-widest uppercase mb-3 sm:mb-4"
            >
              Detective Investigation Simulator
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6"
            >
              <span className="detective-gradient-text">Case Files</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 sm:mb-8 max-w-xl"
            >
              Five self-contained homicide investigations inspired by true crime. No shortcuts.
              No AI answers. Just evidence, logic, and the nerve to accuse the right person.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link href="/cases" className="btn-primary w-full sm:w-auto animate-pulse-glow">
                Open Case Files <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#cases" className="btn-ghost w-full sm:w-auto text-center">
                View All Cases
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-xs font-mono hidden sm:block"
        >
          scroll ↓
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="glass-panel p-5 sm:p-6"
            >
              <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
                <f.icon className="w-8 h-8 text-amber-400 mb-4" />
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="cases" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Active Case Files</h2>
          <p className="text-slate-400 text-sm sm:text-base">Each case is a complete investigation. Solve one, move to the next.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href={`/investigate/${c.id}`} className="group block glass-panel-hover overflow-hidden">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <Image src={c.coverImage} alt={c.title} fill className="case-card-image" sizes="(max-width:640px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1220] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-300">
                    {c.difficulty}
                  </span>
                  <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-[10px] sm:text-xs font-mono text-slate-300">
                    Case {c.order}
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-base sm:text-lg font-semibold mb-1 group-hover:text-amber-300 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mb-3 line-clamp-2">{c.synopsis}</p>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-mono">
                    <span className="truncate mr-2">{c.crimeType.split("—")[0].trim()}</span>
                    <span className="flex-shrink-0">~{c.estimatedMinutes}m</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-6 sm:py-8 text-center text-xs sm:text-sm text-slate-500 px-4 safe-bottom">
        Case Files — Fictional cases inspired by true crime patterns.
      </footer>
    </main>
  );
}

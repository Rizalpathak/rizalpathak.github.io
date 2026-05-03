import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Instagram, 
  Mail, 
  Phone, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  ExternalLink,
  Menu,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Firebase ---
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); // Use as any to prevent TS error if type missing

enum OperationType {
  CREATE = 'create',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Public contact form
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Types ---
type Category = 'All' | 'IRL Style' | 'Documentary Style' | 'Tech Style' | 'Gaming Style' | 'Entertainment Style';

interface Thumbnail {
  id: number;
  title: string;
  category: Category;
  imageUrl: string;
}

// --- Data ---
const PORTFOLIO_DATA: Thumbnail[] = [
  // IRL Style
 
  { id: 16, title: "I Booked a Vacation on Facebook Marketplace", category: "IRL Style", imageUrl: "https://i.ibb.co/LdM8f97y/facebookmplace.jpg" },
  { id: 17, title: "I Tried Australia's Worst 1-Star Hotels", category: "IRL Style", imageUrl: "https://i.ibb.co/WWg5L9MJ/SIMON.jpg" },
  { id: 18, title: "I Tried Every Tourist Trap In New York City", category: "IRL Style", imageUrl: "https://i.ibb.co/yH20C6q/matt.jpg" },
  { id: 19, title: "Staying in India's Most Haunted City for 48 Hours", category: "IRL Style", imageUrl: "https://i.ibb.co/WNPG5QrP/slay.jpg" },
  { id: 20, title: "Reviewing Every Themed Tourist Trap Restaurant", category: "IRL Style", imageUrl: "https://i.ibb.co/qY2dJW5k/trex.jpg" },
  
  // Documentary Style
  { id: 4, title: "The TRAGIC life of Nepal's FUNNIEST man", category: "Documentary Style", imageUrl: "https://i.ibb.co/8ghZbYzk/bhairav-aryal2.jpg" },
 

  // Tech Style
  { id: 7, title: "Google’s Secret AI Video Tool Just Got MEGA Upgrades", category: "Tech Style", imageUrl: "https://i.ibb.co/k2pLDC9T/THOMAS2.jpg" },
  { id: 8, title: "These ChatGPT Tricks Are Insane", category: "Tech Style", imageUrl: "https://i.ibb.co/YFH7TfzD/aii.jpg" },
{ id: 9, title: "These ChatGPT Tricks Are Insane", category: "Tech Style", imageUrl: "https://i.ibb.co/HLhnq03q/hand.jpg" },

  // Vines Style
  { id: 13, title: "VISA LAGYO", category: "Entertainment Style", imageUrl: "https://i.ibb.co/whKnsGcj/og.jpg" },
];

const CATEGORIES: Category[] = ['All', 'IRL Style', 'Documentary Style', 'Tech Style', 'Entertainment Style'];

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isLight = e.matches;
      setTheme(isLight ? 'light' : 'dark');
      document.documentElement.classList.toggle('light', isLight);
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['home', 'philosophy', 'portfolio', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 200 && rect.bottom >= 200;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Portfolio', href: '#portfolio', id: 'portfolio' },
    { name: 'Philosophy', href: '#philosophy', id: 'philosophy' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-6 pointer-events-none">
      <motion.div 
        className={cn(
          "flex items-center gap-1 pointer-events-auto transition-all duration-500 p-1.5",
          isScrolled 
            ? "bg-black/60 dark:bg-black/60 light:bg-white/80 backdrop-blur-3xl border border-white/20 dark:border-white/20 light:border-black/10 rounded-full shadow-2xl" 
            : "bg-white/5 dark:bg-white/5 light:bg-black/5 backdrop-blur-xl rounded-full border border-white/10 dark:border-white/10 light:border-black/5"
        )}
      >
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className={cn(
                "relative px-7 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 rounded-full",
                activeSection === link.id 
                  ? "text-white dark:text-white light:text-black" 
                  : "text-white/40 dark:text-white/40 light:text-black/40 hover:text-white dark:hover:text-white light:hover:text-black"
              )}
            >
              {activeSection === link.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white/10 dark:bg-white/10 light:bg-black/5 border border-white/20 dark:border-white/20 light:border-black/10 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </a>
          ))}
        </div>

        <button 
          className="md:hidden text-white dark:text-white light:text-black p-3"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-40 md:hidden pointer-events-auto"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-x-6 top-24 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    className={cn(
                      "text-3xl font-extrabold transition-colors",
                      activeSection === link.id ? "text-neon-cyan" : "text-white/50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ThumbnailTicker = () => {
  const images = [
    "https://i.ibb.co/LdM8f97y/facebookmplace.jpg",
    "https://i.ibb.co/WWg5L9MJ/SIMON.jpg",
    "https://i.ibb.co/HLhnq03q/hand.jpg",
    "https://i.ibb.co/8ghZbYzk/bhairav-aryal2.jpg",
    "https://i.ibb.co/k2pLDC9T/THOMAS2.jpg",
    "https://i.ibb.co/WNPG5QrP/slay.jpg",
    "https://i.ibb.co/qY2dJW5k/trex.jpg"
  ];

  return (
    <div className="pt-24 pb-8 bg-transparent overflow-hidden">
      <div className="flex w-max animate-scroll">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4 md:gap-8 pr-4 md:pr-8">
            {images.map((src, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 w-64 md:w-[450px] h-36 md:h-60 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 dark:border-white/5 light:border-black/5"
              >
                <img 
                  src={src} 
                  alt={`Work ${idx}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333333%); }
        }
        .animate-scroll {
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { 
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1]
      } 
    },
  };

  return (
    <section id="home" className="relative pb-24 px-6 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 w-full pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8 md:mb-16"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-10 border border-dashed border-white/5 dark:border-white/5 light:border-black/5 rounded-full"
          />
          
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 2 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              scale: { type: "spring", stiffness: 400, damping: 10 }
            }}
            className="w-48 h-48 md:w-72 md:h-72 rounded-full overflow-hidden border-2 border-white/10 dark:border-white/10 light:border-black/10 p-2 relative shadow-[0_0_80px_rgba(41,121,255,0.2)] cursor-pointer group outline-none ring-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/30 via-neon-cyan/20 to-neon-purple/30 opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-full h-full rounded-full overflow-hidden bg-black dark:bg-black light:bg-gray-100 relative z-10 border border-white/5 dark:border-white/5 light:border-black/5 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]">
              <img 
                src="https://i.ibb.co/ZRfNxfK5/rizal.png" 
                alt="Rizal Pathak"
                className="w-full h-full object-cover scale-110 translate-y-2 transition-transform duration-700 group-hover:scale-125 font-bold"
                referrerPolicy="no-referrer"
              />
            </div>
            <motion.div 
              className="absolute inset-0 rounded-full bg-neon-blue/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="absolute -left-12 top-1/4 bg-[#121212]/80 dark:bg-[#121212]/80 light:bg-white/90 backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-black/10 p-4 rounded-2xl shadow-3xl z-20"
          >
            <p className="text-[10px] font-black text-neon-blue uppercase tracking-widest mb-1">Experience</p>
            <p className="text-xl font-black text-main">2+ YEARS</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
            className="absolute -right-12 bottom-1/4 bg-[#121212]/80 dark:bg-[#121212]/80 light:bg-white/90 backdrop-blur-2xl border border-white/10 dark:border-white/10 light:border-black/10 p-4 rounded-2xl shadow-3xl z-20"
          >
            <p className="text-[10px] font-black text-neon-purple uppercase tracking-widest mb-1">Age</p>
            <p className="text-xl font-black text-main">16 Y/O</p>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="flex flex-col items-center"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02, filter: "brightness(1.2)" }}
            className="text-[clamp(2.5rem,8vw,6.5rem)] font-display font-extrabold leading-[1] mb-6 md:mb-10 tracking-tighter transition-all duration-300 cursor-default text-main whitespace-nowrap"
          >
            RIZAL <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-neon-blue dark:via-neon-cyan dark:to-neon-purple light:from-blue-700 light:via-indigo-800 light:to-purple-900 animate-gradient-move">PATHAK</span>
          </motion.div>
          
          <motion.p 
            variants={itemVariants}
            whileHover={{ x: 5, scale: 1.02, filter: "brightness(1.2)" }}
            className="text-lg md:text-3xl text-muted font-medium mb-10 md:mb-14 flex items-center gap-4 transition-all duration-500"
          >
            <span className="w-6 md:w-12 h-[1px] bg-white/20 dark:bg-white/20 light:bg-black/20" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-neon-blue dark:via-neon-cyan dark:to-neon-purple light:from-blue-700 light:via-indigo-800 light:to-purple-900 animate-gradient-move">YouTube Thumbnail Designer</span>
            <span className="w-6 md:w-12 h-[1px] bg-white/20 dark:bg-white/20 light:bg-black/20" />
          </motion.p>

          <motion.div 
            id="about"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="mb-14 max-w-2xl transition-transform duration-500"
          >
            <p className="text-lg md:text-xl text-muted leading-relaxed font-medium">
              A 16-year-old designer with over 2 years of professional experience. 
              Helping creators get the attention they deserve through <span className="text-main font-bold group-hover:text-neon-cyan transition-colors duration-300">high-CTR visual storytelling</span>.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6"
          >
            <motion.a 
              href="#portfolio"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-6 bg-white dark:bg-white light:bg-black text-black dark:text-black light:text-white font-bold rounded-full transition-all shadow-2xl text-lg hover:shadow-[0_0_40px_rgba(41,121,255,0.4)] relative overflow-hidden group outline-none focus:ring-0 active:scale-95 border-none"
            >
              <span className="relative z-10">View Portfolio</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </motion.a>
            <motion.a 
              href="#contact"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="px-12 py-6 bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/10 text-main font-bold rounded-full transition-all backdrop-blur-sm text-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 hover:border-white/30 light:hover:border-black/20 outline-none focus:ring-0 active:scale-95"
            >
              Hire Me
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const WhyMe = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const philosophy = [
    {
      title: "Why Me?",
      content: "I don’t just design thumbnails. I design click magnets. Every thumbnail I create is focused on grabbing attention in less than 1 second and increasing video performance. I understand what makes viewers stop scrolling and click."
    },
    {
      title: "Why Do My Thumbnails Generate High CTR?",
      content: "Because I design for human psychology, not just visuals. Every thumbnail is strategically built to trigger curiosity, emotion, and immediate attention which increase the chance of a click."
    },
    {
      title: "What Makes Me Different?",
      content: "Most designers just make “good-looking thumbnails.” I design thumbnails that are built for performance and clicks."
    }
  ];

  return (
    <section id="philosophy" className="py-32 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-neon-blue mb-4 transition-all duration-300 hover:tracking-[0.6em]">Philosophy</h2>
          <h3 className="text-4xl md:text-7xl font-display font-extrabold tracking-tighter text-main">Why <span className="inline-block px-2 text-transparent bg-clip-text bg-gradient-to-r dark:from-neon-blue dark:via-neon-cyan dark:to-neon-purple light:from-blue-700 light:via-indigo-800 light:to-purple-900 animate-gradient-move">Choose</span> <span className="text-main">Me?</span></h3>
        </motion.div>

        <div className="space-y-6">
          {philosophy.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div 
                key={index}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className={`rounded-[3rem] overflow-hidden cursor-pointer border transition-all duration-700 shadow-2xl relative glass-box ${
                  isOpen 
                    ? 'border-white/30 dark:border-white/30 light:border-black/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20 dark:ring-white/20 light:ring-black/10' 
                    : 'border-white/5 dark:border-white/5 light:border-black/5 hover:border-white/20 hover:scale-[1.01]'
                }`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {/* Glass Inner Glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/30 light:via-black/10 to-transparent" />
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/10 dark:via-white/10 light:via-black/5 to-transparent" />
                
                <div className="p-8 md:p-14">
                  <h4 className={`text-2xl md:text-5xl font-extrabold tracking-tight transition-all duration-500 mb-2 ${isOpen ? 'text-main scale-105' : 'text-main/40 opacity-40'}`}>
                    {item.title}
                  </h4>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="pt-10 mt-10 border-t border-white/10 dark:border-white/10 light:border-black/10">
                          <p className="text-lg md:text-3xl text-main leading-relaxed font-medium tracking-tight">
                            {item.content}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const PortfolioItem = ({ item, index }: { item: typeof PORTFOLIO_DATA[0], index: number }) => {
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  
  return (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ 
        duration: 0.8, 
        delay: (index % 3) * 0.1,
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
      }}
      className="group relative cursor-pointer"
      onClick={() => setShowMobileOverlay(!showMobileOverlay)}
    >
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#0a0a0a] transition-all duration-700">
        <img 
          src={item.imageUrl} 
          alt={item.title}
          className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-all duration-500 flex flex-col justify-end p-8",
          showMobileOverlay ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className={cn(
            "space-y-2 transition-transform duration-500",
            showMobileOverlay ? "translate-y-0" : "translate-y-4 group-hover:translate-y-0"
          )}>
            <span className="px-3 py-1 bg-neon-blue/20 border border-neon-blue/30 rounded-full text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md inline-block">
              {item.category}
            </span>
            <p className="text-xl font-black text-white leading-tight">
              {item.title}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [filteredThumbnails, setFilteredThumbnails] = useState(PORTFOLIO_DATA);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredThumbnails(PORTFOLIO_DATA);
    } else {
      setFilteredThumbnails(PORTFOLIO_DATA.filter(item => item.category === activeCategory));
    }
  }, [activeCategory]);
  
    return (
      <section id="portfolio" className="py-32 px-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-neon-purple/5 blur-[120px] -z-10" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-neon-cyan/5 blur-[120px] -z-10" />
  
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              className="text-center mb-12 md:mb-20"
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neon-blue mb-6 transition-all duration-300 hover:tracking-[0.6em] cursor-default">Portfolio</h2>
              <h3 className="text-5xl md:text-8xl font-display font-black tracking-tighter text-main">Thumbnails that<br /><span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-neon-blue dark:via-neon-cyan dark:to-neon-purple light:from-blue-700 light:via-indigo-800 light:to-purple-900 hover:brightness-125 transition-all duration-300 cursor-default animate-gradient-move">Dominate.</span></h3>
            </motion.div>
            
            {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-500 border relative overflow-hidden group",
                    activeCategory === cat 
                      ? "bg-white/10 dark:bg-white/10 light:bg-black/5 border-white/20 dark:border-white/20 light:border-black/10 text-main shadow-xl scale-105" 
                      : "bg-white/[0.02] dark:bg-white/[0.02] light:bg-black/[0.02] border-white/5 dark:border-white/5 light:border-black/5 text-muted hover:border-white/10 dark:hover:border-white/10 light:hover:border-black/20 hover:text-main"
                  )}
                >
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>
          </div>
  
          {/* Gallery */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filteredThumbnails.map((item, index) => (
                <PortfolioItem key={item.id} item={item} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ytChannel: '',
    whatsapp: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');
    const path = 'messages';
    try {
      const submissionData: any = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        createdAt: serverTimestamp()
      };

      if (formData.ytChannel) submissionData.ytChannel = formData.ytChannel;
      if (formData.whatsapp) submissionData.whatsapp = formData.whatsapp;

      await addDoc(collection(db, path), submissionData);
      setStatus('success');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2979FF', '#00E5FF', '#D500F9', '#FFFFFF']
      });

      setFormData({ name: '', email: '', ytChannel: '', whatsapp: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus('error');
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <section id="contact" className="py-32 px-6 relative">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="space-y-10 mb-20"
        >
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-neon-blue mb-6 transition-all duration-300 hover:tracking-[0.6em] cursor-default">Contact</h2>
          <h3 className="text-5xl md:text-8xl font-display font-extrabold tracking-tighter leading-[0.9] hover:brightness-110 transition-all duration-300 cursor-default text-main">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r dark:from-neon-cyan dark:via-neon-blue dark:to-neon-purple light:from-blue-700 light:via-indigo-800 light:to-purple-900 animate-gradient-move">Explode</span> your Views?
            </h3>
          </div>
          
          <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto font-medium">
            Let's craft the perfect thumbnail strategy for your next viral video. I usually respond within 24 hours.
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <motion.a 
              href="mailto:rijalpathak7@gmail.com"
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
               <div className="w-14 h-14 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/20 dark:border-white/20 light:border-black/10 flex items-center justify-center group-hover:border-neon-cyan group-hover:bg-neon-cyan/10 transition-all duration-500 shadow-lg backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/20 light:via-black/10 to-transparent" />
                  <Mail className="text-neon-cyan group-hover:scale-110 transition-transform" size={24} />
               </div>
               <div className="text-left bg-white/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] border border-white/10 dark:border-white/10 light:border-black/10 backdrop-blur-md px-6 py-3 rounded-2xl group-hover:bg-white/[0.08] dark:group-hover:bg-white/[0.08] light:group-hover:bg-black/[0.08] transition-all duration-500 group-hover:border-white/20 dark:group-hover:border-white/20 light:group-hover:border-black/20 relative">
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 light:via-black/5 to-transparent" />
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Email Me</p>
                 <p className="text-lg font-bold text-main group-hover:text-neon-cyan transition-colors">rijalpathak7@gmail.com</p>
               </div>
            </motion.a>

            <motion.a 
              href="https://www.instagram.com/riz4l.jpeg" 
              target="_blank" 
              rel="noreferrer"
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
               <div className="w-14 h-14 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/20 dark:border-white/20 light:border-black/10 flex items-center justify-center group-hover:border-neon-purple group-hover:bg-neon-purple/10 transition-all duration-500 shadow-lg backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/20 light:via-black/10 to-transparent" />
                  <Instagram className="text-neon-purple group-hover:scale-110 transition-transform" size={24} />
               </div>
               <div className="text-left bg-white/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] border border-white/10 dark:border-white/10 light:border-black/10 backdrop-blur-md px-6 py-3 rounded-2xl group-hover:bg-white/[0.08] dark:group-hover:bg-white/[0.08] light:group-hover:bg-black/[0.08] transition-all duration-500 group-hover:border-white/20 dark:group-hover:border-white/20 light:group-hover:border-black/20 relative">
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 light:via-black/5 to-transparent" />
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Instagram</p>
                 <p className="text-lg font-bold text-main group-hover:text-neon-purple transition-colors">@riz4l.jpeg</p>
               </div>
            </motion.a>

            {WHATSAPP_NUMBER && (
              <motion.a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.05, y: -5 }}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/20 dark:border-white/20 light:border-black/10 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-500 shadow-lg backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/20 light:via-black/10 to-transparent" />
                    <Phone className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                </div>
                <div className="text-left bg-white/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] border border-white/10 dark:border-white/10 light:border-black/10 backdrop-blur-md px-6 py-3 rounded-2xl group-hover:bg-white/[0.08] dark:group-hover:bg-white/[0.08] light:group-hover:bg-black/[0.08] transition-all duration-500 group-hover:border-white/20 dark:group-hover:border-white/20 light:group-hover:border-black/20 relative">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 dark:via-white/10 light:via-black/5 to-transparent" />
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">WhatsApp</p>
                  <p className="text-lg font-bold text-main group-hover:text-emerald-500 transition-colors">+{WHATSAPP_NUMBER.slice(0, 3)} {WHATSAPP_NUMBER.slice(3)}</p>
                </div>
              </motion.a>
            )}
          </div>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            className="p-8 md:p-14 rounded-[3rem] shadow-3xl relative group overflow-hidden max-w-3xl mx-auto glass-box ring-1 ring-white/10 dark:ring-white/10 light:ring-black/5"
          >
            {/* Real Glass Shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] via-transparent to-white/[0.1] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-white/40 light:via-black/20 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/20 dark:via-white/20 light:via-black/10 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted ml-4">Your Name</label>
              <input 
                type="text" 
                placeholder="Ex. MrBeast"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full glass-box border border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl px-6 py-4 text-main placeholder:text-muted/20 focus:border-neon-blue focus:bg-white/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted ml-4">Your Email</label>
              <input 
                type="email" 
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full glass-box border border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl px-6 py-4 text-main placeholder:text-muted/20 focus:border-neon-blue focus:bg-white/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted ml-4">Your Channel Name</label>
              <input 
                type="text" 
                placeholder="Channel Name or Link"
                value={formData.ytChannel}
                onChange={(e) => setFormData({...formData, ytChannel: e.target.value})}
                className="w-full glass-box border border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl px-6 py-4 text-main placeholder:text-muted/20 focus:border-neon-blue focus:bg-white/10 transition-all outline-none"
              />
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted ml-4">WhatsApp/Number</label>
              <input 
                type="text" 
                placeholder="+1 234 567 890"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full glass-box border border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl px-6 py-4 text-main placeholder:text-muted/20 focus:border-neon-blue focus:bg-white/10 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted ml-4">Message</label>
            <textarea 
              rows={4}
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full glass-box border border-white/10 dark:border-white/10 light:border-black/10 rounded-2xl px-6 py-4 text-main placeholder:text-muted/20 focus:border-neon-blue focus:bg-white/10 transition-all outline-none resize-none"
            />
          </div>

            <button 
              disabled={status === 'loading' || status === 'success'}
              className={cn(
                "w-full py-5 font-extrabold rounded-full transition-all flex items-center justify-center gap-3",
                status === 'success' 
                  ? "bg-white/10 dark:bg-white/10 light:bg-black/10 text-muted shadow-none cursor-default" 
                  : "bg-neon-blue text-white shadow-[0_20px_50px_rgba(0,102,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              )}
            >
              {status === 'loading' ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === 'success' ? (
                "Request Sent"
              ) : (
                <>Send Request <ChevronRight size={20} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/5 dark:border-white/5 light:border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-muted text-sm">
        <p>© {new Date().getFullYear()} Rizal Pathak. All rights reserved.</p>
        <div className="flex items-center gap-8 font-medium">
          <a href="#" className="hover:text-main transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-main transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

const WHATSAPP_NUMBER = "9779845091064";

export default function App() {
  return (
    <div className="font-sans antialiased text-main selection:bg-neon-cyan/30 selection:text-neon-cyan relative min-h-screen">
      <style>{`
        @keyframes shine-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% auto;
          animation: shine-gradient 4s linear infinite;
        }
        .light .nav-glass {
          background: rgba(255, 255, 255, 0.7) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
          color: black !important;
        }
        .light .bg-mesh {
          opacity: 0.4;
        }
      `}</style>

      {/* Apple-style Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[100rem] h-[100rem] bg-neon-blue/12 dark:bg-neon-blue/12 light:bg-blue-400/5 rounded-full blur-[220px] animate-pulse bg-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[100rem] h-[100rem] bg-neon-purple/15 dark:bg-neon-purple/15 light:bg-purple-400/5 rounded-full blur-[220px] animate-pulse bg-mesh" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/10 to-transparent dark:via-[#050505]/10 light:via-white/20" />
      </div>

      <Navbar />
      <main className="relative z-10">
        <ThumbnailTicker />
        <Hero />
        <Portfolio />
        <WhyMe />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

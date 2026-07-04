export const HERO_STATS = [
  { label: "Students Connected", value: 2400000, suffix: "+" },
  { label: "Projects Shared", value: 890000, suffix: "+" },
  { label: "Skills Earned", value: 5200000, suffix: "+" },
  { label: "Clubs Created", value: 48000, suffix: "+" },
] as const;

export const WHY_FEATURES = [
  {
    title: "Build Portfolio",
    description: "Craft a living professional identity from age 5 onward.",
    icon: "Briefcase",
    gradient: "from-blue-500 to-cyan-400",
    href: "#journey",
    cta: "See the journey",
  },
  {
    title: "Learn Skills",
    description: "Gamified skill trees that grow with every achievement.",
    icon: "Brain",
    gradient: "from-violet-500 to-purple-400",
    href: "#journey",
    cta: "How skills grow",
  },
  {
    title: "Join Clubs",
    description: "Find your tribe in coding, robotics, debate, and more.",
    icon: "Users",
    gradient: "from-cyan-500 to-blue-400",
    href: "#clubs",
    cta: "Browse clubs",
  },
  {
    title: "Connect Globally",
    description: "Network with students across schools and continents.",
    icon: "Globe",
    gradient: "from-indigo-500 to-violet-400",
    href: "#students",
    cta: "Meet students",
  },
  {
    title: "Showcase Projects",
    description: "Ship websites, AI builds, and robotics to the world.",
    icon: "Rocket",
    gradient: "from-fuchsia-500 to-pink-400",
    href: "#projects",
    cta: "View projects",
  },
  {
    title: "Discover Careers",
    description: "Explore pathways from engineer to entrepreneur early.",
    icon: "Compass",
    gradient: "from-emerald-500 to-cyan-400",
    href: "#careers",
    cta: "Explore careers",
  },
] as const;

export const JOURNEY_STAGES = [
  { age: "Age 5", title: "First Steps", features: ["Avatar creation", "Interest badges", "Family-safe profile"] },
  { age: "Age 10", title: "Explorer", features: ["Project uploads", "Club discovery", "Skill seeds"] },
  { age: "Age 15", title: "Builder", features: ["Portfolio site", "Peer connections", "Mentor matching"] },
  { age: "Age 18", title: "Leader", features: ["Internship prep", "Leadership roles", "College bridge"] },
  { age: "College", title: "Innovator", features: ["Research showcase", "Startup hub", "Global network"] },
  { age: "Professional", title: "Alumni", features: ["Mentorship", "Hiring pipeline", "Lifetime portfolio"] },
] as const;

export const FEATURED_STUDENTS = [
  { name: "Maya Chen", grade: "Class 10", skills: ["Python", "Robotics", "UI Design"], projects: 12, achievements: 8, avatar: "MC", color: "#6366f1" },
  { name: "Arjun Patel", grade: "Class 12", skills: ["FinTech", "Debate", "Leadership"], projects: 18, achievements: 14, avatar: "AP", color: "#22d3ee" },
  { name: "Sofia Rivera", grade: "Class 8", skills: ["Science Fair", "Art", "Community"], projects: 9, achievements: 11, avatar: "SR", color: "#a855f7" },
  { name: "James Okonkwo", grade: "College", skills: ["AI/ML", "Startups", "Research"], projects: 24, achievements: 19, avatar: "JO", color: "#34d399" },
  { name: "Emma Walsh", grade: "Class 11", skills: ["Web Dev", "Music", "Writing"], projects: 15, achievements: 10, avatar: "EW", color: "#f472b6" },
] as const;

export const CLUBS = [
  { name: "Coding Club", members: 12400, color: "#3b82f6", emoji: "💻" },
  { name: "FinTech Club", members: 8200, color: "#10b981", emoji: "📈" },
  { name: "Robotics Club", members: 9600, color: "#8b5cf6", emoji: "🤖" },
  { name: "Debate Club", members: 7100, color: "#f59e0b", emoji: "🎤" },
  { name: "Science Club", members: 11300, color: "#06b6d4", emoji: "🔬" },
] as const;

export const SHOWCASE_PROJECTS = [
  { title: "Neural Notes", category: "AI", description: "AI study companion for middle schoolers.", tags: ["Python", "LLM"] },
  { title: "EcoTrack", category: "Web", description: "School sustainability dashboard.", tags: ["Next.js", "Charts"] },
  { title: "RoboArm X1", category: "Robotics", description: "3D-printed assistive arm prototype.", tags: ["Arduino", "CAD"] },
  { title: "StockSim Jr", category: "Finance", description: "Paper trading for teen investors.", tags: ["React", "APIs"] },
] as const;

export const CAREER_PATHS = [
  { title: "AI Engineer", x: 10, y: 20 },
  { title: "Software Developer", x: 30, y: 45 },
  { title: "Entrepreneur", x: 50, y: 15 },
  { title: "Financial Analyst", x: 70, y: 50 },
  { title: "Scientist", x: 85, y: 25 },
  { title: "Designer", x: 55, y: 75 },
] as const;

export const TESTIMONIALS = [
  { quote: "ScholarNet helped me build a portfolio before college apps even opened.", name: "Priya K.", role: "Class 12, Delhi", avatar: "PK" },
  { quote: "My robotics club found sponsors through projects we showcased here.", name: "Marcus L.", role: "Age 15, Austin", avatar: "ML" },
  { quote: "Starting at 8, my daughter already thinks like a founder.", name: "Sarah T.", role: "Parent", avatar: "ST" },
] as const;

export const ACHIEVEMENT_BADGES = [
  { name: "Coding Master", icon: "💻", tier: "gold" },
  { name: "Future Entrepreneur", icon: "🚀", tier: "platinum" },
  { name: "FinTech Explorer", icon: "📊", tier: "silver" },
  { name: "Robotics Builder", icon: "🤖", tier: "gold" },
  { name: "Debate Champion", icon: "🏆", tier: "diamond" },
] as const;

export const SKILL_TREE_NODES = [
  { id: "root", label: "Learner", level: 1 },
  { id: "code", label: "Coding", level: 2 },
  { id: "design", label: "Design", level: 2 },
  { id: "lead", label: "Leadership", level: 2 },
  { id: "ai", label: "AI/ML", level: 3 },
  { id: "web", label: "Web Dev", level: 3 },
  { id: "robotics", label: "Robotics", level: 3 },
] as const;

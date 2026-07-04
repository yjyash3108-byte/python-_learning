export const LANDING_STATS = [
  { label: "Students Joined", value: 2400000, suffix: "+" },
  { label: "Projects Shared", value: 890000, suffix: "+" },
  { label: "Clubs Created", value: 48000, suffix: "+" },
  { label: "Certificates Uploaded", value: 1200000, suffix: "+" },
] as const;

export const TRUSTED_SCHOOLS = [
  "Delhi Public School",
  "St. Michael High",
  "National Academy",
  "Greenwood International",
  "Riverside STEM",
  "Cambridge Prep",
] as const;

export const PLATFORM_FEATURES = [
  {
    title: "Student Portfolio",
    description: "A living profile that grows with every achievement, project, and skill.",
    icon: "User",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    title: "Projects",
    description: "Showcase websites, apps, robotics builds, and research in cinematic galleries.",
    icon: "FolderKanban",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    title: "Clubs",
    description: "Join coding, robotics, debate, finance, and science communities.",
    icon: "Orbit",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Achievements & Certificates",
    description: "Upload badges, olympiad wins, and verified certificates to your profile.",
    icon: "Trophy",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Competitions",
    description: "Discover hackathons, science fairs, and academic contests matched to you.",
    icon: "Medal",
    gradient: "from-rose-500 to-red-500",
  },
  {
    title: "Messaging",
    description: "Chat safely with students you mutually follow — built for school networks.",
    icon: "MessageSquare",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Connections",
    description: "Find peers by school, skills, and interests. Build your global network early.",
    icon: "Users",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "AI Features",
    description: "Club assistants, smart recommendations, and portfolio insights with Pro.",
    icon: "Sparkles",
    gradient: "from-indigo-400 to-cyan-400",
  },
  {
    title: "Scholarships",
    description: "Browse scholarships, internships, and programs tailored to your profile.",
    icon: "GraduationCap",
    gradient: "from-teal-500 to-emerald-500",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Create your profile",
    description: "Sign up with your school, grade, and interests. Build your identity in minutes.",
  },
  {
    step: 2,
    title: "Showcase achievements",
    description: "Add projects, certificates, and wins. Your portfolio updates automatically.",
  },
  {
    step: 3,
    title: "Join clubs",
    description: "Find communities that match your passions — from coding to debate.",
  },
  {
    step: 4,
    title: "Connect with students",
    description: "Follow peers, message mutual connections, and grow your network.",
  },
  {
    step: 5,
    title: "Discover opportunities",
    description: "Apply to scholarships, hackathons, and internships recommended for you.",
  },
] as const;

export const TESTIMONIALS = [
  {
    quote:
      "ScholarNet helped me build a portfolio before college applications even opened. Recruiters noticed my projects immediately.",
    name: "Priya K.",
    role: "Class 12 · Delhi",
    avatar: "PK",
    color: "#6366f1",
  },
  {
    quote:
      "Our robotics club found sponsors through projects we showcased. The platform made us look professional.",
    name: "Marcus L.",
    role: "Age 15 · Austin",
    avatar: "ML",
    color: "#22d3ee",
  },
  {
    quote:
      "Starting at age 8, my daughter already thinks like a founder. ScholarNet makes achievement visible and fun.",
    name: "Sarah T.",
    role: "Parent",
    avatar: "ST",
    color: "#a855f7",
  },
  {
    quote:
      "The opportunities feed matched me with a summer internship I never would have found on my own.",
    name: "James O.",
    role: "College · Lagos",
    avatar: "JO",
    color: "#34d399",
  },
] as const;

export const SHOWCASE_CLUBS = [
  { name: "Coding Club", members: 12400, emoji: "💻", color: "#3b82f6", category: "Technology" },
  { name: "Robotics Club", members: 9600, emoji: "🤖", color: "#8b5cf6", category: "STEM" },
  { name: "Finance Club", members: 8200, emoji: "📈", color: "#10b981", category: "Business" },
  { name: "Debate Club", members: 7100, emoji: "🎤", color: "#f59e0b", category: "Leadership" },
  { name: "Science Club", members: 11300, emoji: "🔬", color: "#06b6d4", category: "Research" },
] as const;

export const OPPORTUNITIES = [
  {
    title: "National STEM Scholarship",
    org: "Future Leaders Foundation",
    type: "Scholarship",
    deadline: "Aug 2026",
    tag: "scholarship",
  },
  {
    title: "Global Youth Hackathon",
    org: "CodeForGood",
    type: "Hackathon",
    deadline: "Jul 2026",
    tag: "hackathon",
  },
  {
    title: "Robotics Innovation Challenge",
    org: "Tech Youth Alliance",
    type: "Competition",
    deadline: "Sep 2026",
    tag: "competition",
  },
  {
    title: "Student Leadership Summit",
    org: "ScholarNet Events",
    type: "Event",
    deadline: "Jun 2026",
    tag: "event",
  },
  {
    title: "Women in Tech Fellowship",
    org: "Bridge Academy",
    type: "Scholarship",
    deadline: "Oct 2026",
    tag: "scholarship",
  },
  {
    title: "FinTech Case Competition",
    org: "Young Investors Network",
    type: "Competition",
    deadline: "Aug 2026",
    tag: "competition",
  },
] as const;

export const COMPARISON_ROWS = [
  { feature: "Professional portfolio", traditional: false, scholarnet: true },
  { feature: "Project showcase", traditional: false, scholarnet: true },
  { feature: "Skill tracking", traditional: false, scholarnet: true },
  { feature: "Student clubs", traditional: "Limited", scholarnet: "Unlimited" },
  { feature: "Peer networking", traditional: "School only", scholarnet: "Global" },
  { feature: "Opportunities feed", traditional: false, scholarnet: true },
  { feature: "Certificates & badges", traditional: false, scholarnet: true },
  { feature: "Safe messaging", traditional: false, scholarnet: true },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Who can create a ScholarNet account?",
    a: "ScholarNet is built for students in Classes 4–12. A parent or guardian should help younger students sign up. Accounts require a valid school and grade.",
  },
  {
    q: "Is ScholarNet free to use?",
    a: "Yes. You can create a profile, join clubs, share projects, and connect with students for free. ScholarNet Pro unlocks advanced analytics, AI assistants, and unlimited club features.",
  },
  {
    q: "How do clubs work?",
    a: "Create or join clubs around shared interests — coding, robotics, debate, and more. Club owners can post events, announcements, and manage members. Free accounts can create one club; Pro unlocks unlimited clubs.",
  },
  {
    q: "Is my data private and safe?",
    a: "Yes. ScholarNet is designed for students with moderation on posts and messages, mutual-follow messaging only, and parent-friendly controls. We never sell student data.",
  },
  {
    q: "What is ScholarNet Pro?",
    a: "Pro is our premium plan with unlimited clubs, advanced club analytics, AI club assistant, verified badges, and priority opportunity matching. You can upgrade anytime from your settings.",
  },
  {
    q: "Can I showcase certificates and achievements?",
    a: "Absolutely. Upload certificates, add achievement details, and attach skills gained. They appear on your profile and feed your skill tree.",
  },
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  support: [
    { label: "Help Center", href: "/faq" },
    { label: "FAQ", href: "/faq" },
  ],
  social: [
    { label: "Twitter", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "YouTube", href: "#" },
  ],
} as const;

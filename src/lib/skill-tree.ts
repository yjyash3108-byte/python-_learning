export type SkillTreeNode = {
  id: string;
  label: string;
  level: number;
  unlocked: boolean;
};

export function buildSkillTree(
  profileSkills: string[],
  achievementSkills: string[]
): SkillTreeNode[] {
  const counts = new Map<string, number>();

  for (const skill of profileSkills) {
    const key = skill.trim();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const skill of achievementSkills) {
    const key = skill.trim();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 2);
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const nodes: SkillTreeNode[] = [
    {
      id: "root",
      label: sorted.length > 0 ? "Learner" : "Start learning",
      level: 1,
      unlocked: true,
    },
  ];

  const branchSkills = sorted.slice(0, 3);
  branchSkills.forEach(([label, count], i) => {
    nodes.push({
      id: `branch-${i}`,
      label,
      level: 2,
      unlocked: count > 0,
    });
  });

  const leafSkills = sorted.slice(3, 6);
  leafSkills.forEach(([label, count], i) => {
    nodes.push({
      id: `leaf-${i}`,
      label,
      level: 3,
      unlocked: count >= 2,
    });
  });

  while (nodes.length < 7) {
    const idx = nodes.length;
    nodes.push({
      id: `placeholder-${idx}`,
      label: idx < 4 ? "Add skills" : "Earn badges",
      level: idx < 4 ? 2 : 3,
      unlocked: false,
    });
  }

  return nodes.slice(0, 7);
}

export const SKILL_TREE_LAYOUT = [
  { index: 0, x: "50%", y: "14%" },
  { index: 1, x: "25%", y: "43%" },
  { index: 2, x: "50%", y: "43%" },
  { index: 3, x: "75%", y: "43%" },
  { index: 4, x: "20%", y: "79%" },
  { index: 5, x: "50%", y: "79%" },
  { index: 6, x: "80%", y: "79%" },
] as const;

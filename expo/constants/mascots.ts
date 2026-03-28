export const FROG_MASCOTS_EXCELLENT = [
  {
    id: 'chef-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/7214f116-7809-4059-a5db-85628980eb4a.png',
    name: 'Chef Frog Finger Guns',
    expression: 'excellent' as const,
  },
  {
    id: 'cowboy-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/953bd34c-a46b-49c4-8be8-e2f449c73e41.png',
    name: 'Cowboy Frog Finger Guns',
    expression: 'excellent' as const,
  },
  {
    id: 'crown-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/da984106-64b6-429c-97f8-0a0c2bbcfbde.png',
    name: 'Crown Frog Finger Guns',
    expression: 'excellent' as const,
  },
  {
    id: 'party-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/1410ad7c-86b1-49b6-aee9-00d8eb8c71d7.png',
    name: 'Party Frog Finger Guns',
    expression: 'excellent' as const,
  },
  {
    id: 'wizard-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/60ec0927-67d8-4744-a0ad-912aaaae540e.png',
    name: 'Wizard Frog Finger Guns',
    expression: 'excellent' as const,
  },
  {
    id: 'tophat-fingerguns',
    uri: 'https://r2-pub.rork.com/generated-images/c588084a-d75d-4d40-b9b3-0eda2b6ee76a.png',
    name: 'Top Hat Frog Finger Guns',
    expression: 'excellent' as const,
  },
];

export const FROG_MASCOTS_HAPPY = [
  {
    id: 'chef',
    uri: 'https://r2-pub.rork.com/generated-images/56dade8d-976c-4a9b-ac95-cb4e1f5b75d6.png',
    name: 'Chef Frog',
    expression: 'happy' as const,
  },
  {
    id: 'cowboy',
    uri: 'https://r2-pub.rork.com/generated-images/31b24ec5-4568-4bd0-8f46-3dd00232cca5.png',
    name: 'Cowboy Frog',
    expression: 'happy' as const,
  },
  {
    id: 'crown',
    uri: 'https://r2-pub.rork.com/generated-images/07bba790-3eeb-4d56-8a72-9e4df4787ce2.png',
    name: 'Crown Frog',
    expression: 'happy' as const,
  },
  {
    id: 'party',
    uri: 'https://r2-pub.rork.com/generated-images/e80f51a9-85b4-4d81-9767-cb9a29771cdc.png',
    name: 'Party Frog',
    expression: 'happy' as const,
  },
  {
    id: 'wizard',
    uri: 'https://r2-pub.rork.com/generated-images/61d62311-0ce7-4042-a14f-4bea69e9435f.png',
    name: 'Wizard Frog',
    expression: 'happy' as const,
  },
  {
    id: 'tophat',
    uri: 'https://r2-pub.rork.com/generated-images/4df49b76-596b-4bca-bb15-a91acccc7449.png',
    name: 'Top Hat Frog',
    expression: 'happy' as const,
  },
];

export const FROG_MASCOTS_SAD = [
  {
    id: 'chef-sad',
    uri: 'https://r2-pub.rork.com/generated-images/22ac2268-8332-4521-a454-d8d6e97f6c64.png',
    name: 'Chef Sad Frog',
    expression: 'sad' as const,
  },
  {
    id: 'cowboy-sad',
    uri: 'https://r2-pub.rork.com/generated-images/59a36fd4-495d-46b5-a79e-79e90ed2e48a.png',
    name: 'Cowboy Sad Frog',
    expression: 'sad' as const,
  },
  {
    id: 'crown-sad',
    uri: 'https://r2-pub.rork.com/generated-images/e005a542-1203-4005-b5a8-7598809c2699.png',
    name: 'Crown Sad Frog',
    expression: 'sad' as const,
  },
  {
    id: 'party-sad',
    uri: 'https://r2-pub.rork.com/generated-images/7ce8a0a0-a8d7-4883-8eb4-65cab2340411.png',
    name: 'Party Sad Frog',
    expression: 'sad' as const,
  },
  {
    id: 'wizard-sad',
    uri: 'https://r2-pub.rork.com/generated-images/09a613d8-8e55-42e0-84d8-520cb7745cf8.png',
    name: 'Wizard Sad Frog',
    expression: 'sad' as const,
  },
  {
    id: 'tophat-sad',
    uri: 'https://r2-pub.rork.com/generated-images/96c4f2a3-6ff5-456f-a1e1-848ea453019d.png',
    name: 'Top Hat Sad Frog',
    expression: 'sad' as const,
  },
];

let lastExcellentIndex = 0;
let lastHappyIndex = 0;
let lastSadIndex = 0;

export function getRandomFrogExcellent() {
  lastExcellentIndex = (lastExcellentIndex + 1) % FROG_MASCOTS_EXCELLENT.length;
  const randomIndex = (Math.floor(Math.random() * FROG_MASCOTS_EXCELLENT.length) + lastExcellentIndex) % FROG_MASCOTS_EXCELLENT.length;
  return FROG_MASCOTS_EXCELLENT[randomIndex];
}

export function getRandomFrogHappy() {
  lastHappyIndex = (lastHappyIndex + 1) % FROG_MASCOTS_HAPPY.length;
  const randomIndex = (Math.floor(Math.random() * FROG_MASCOTS_HAPPY.length) + lastHappyIndex) % FROG_MASCOTS_HAPPY.length;
  return FROG_MASCOTS_HAPPY[randomIndex];
}

export function getRandomFrogSad() {
  lastSadIndex = (lastSadIndex + 1) % FROG_MASCOTS_SAD.length;
  const randomIndex = (Math.floor(Math.random() * FROG_MASCOTS_SAD.length) + lastSadIndex) % FROG_MASCOTS_SAD.length;
  return FROG_MASCOTS_SAD[randomIndex];
}

export const STREAK_WIZARD_FROG = {
  id: 'streak-wizard',
  uri: 'https://r2-pub.rork.com/generated-images/61d62311-0ce7-4042-a14f-4bea69e9435f.png',
  name: 'Streak Wizard Frog',
  expression: 'happy' as const,
};

export type BudgetPerformance = {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  percentageUsed: number;
};

export function calculateBudgetPerformance(
  totalIncome: number,
  totalExpenses: number
): BudgetPerformance {
  if (totalIncome === 0) {
    if (totalExpenses > 0) {
      return { status: 'critical', percentageUsed: 100 };
    }
    return { status: 'good', percentageUsed: 0 };
  }

  const percentageUsed = (totalExpenses / totalIncome) * 100;

  if (percentageUsed >= 100) {
    return { status: 'critical', percentageUsed };
  } else if (percentageUsed >= 80) {
    return { status: 'warning', percentageUsed };
  } else if (percentageUsed >= 50) {
    return { status: 'good', percentageUsed };
  } else {
    return { status: 'excellent', percentageUsed };
  }
}

export function getFrogByBudgetStatus(
  totalIncome: number,
  totalExpenses: number,
  categoriesWithTotals?: { goal?: number; total: number }[]
) {
  if (categoriesWithTotals) {
    const isOverBudgetInAnyCategory = categoriesWithTotals.some(
      (category) => category.goal && category.goal > 0 && category.total > category.goal
    );
    if (isOverBudgetInAnyCategory) {
      return getRandomFrogSad();
    }
  }

  const performance = calculateBudgetPerformance(totalIncome, totalExpenses);

  switch (performance.status) {
    case 'critical':
      return getRandomFrogSad();
    case 'warning':
      return getRandomFrogSad();
    case 'good':
      return getRandomFrogHappy();
    case 'excellent':
      return getRandomFrogExcellent();
    default:
      return getRandomFrogHappy();
  }
}

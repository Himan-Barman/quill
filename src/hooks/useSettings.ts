import { useState, useEffect } from 'react';

const DAILY_GOAL_KEY = 'lexora_daily_goal';

export function useSettings() {
  const [dailyGoal, setDailyGoal] = useState<number>(10);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedGoal = localStorage.getItem(DAILY_GOAL_KEY);
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
    }
    setIsLoaded(true);
  }, []);

  const updateDailyGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem(DAILY_GOAL_KEY, newGoal.toString());
  };

  return {
    dailyGoal,
    updateDailyGoal,
    isLoaded
  };
}

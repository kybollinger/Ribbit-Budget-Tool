import createContextHook from '@nkzw/create-context-hook';
import { useState, useMemo, useCallback } from 'react';

export const [AnalysisProvider, useAnalysis] = createContextHook(() => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const updateSelectedDate = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  }, []);

  const selectedDateInfo = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth, 1);
    const currentDate = new Date();
    return {
      month: selectedMonth,
      year: selectedYear,
      label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isCurrentMonth: selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear(),
    };
  }, [selectedMonth, selectedYear]);

  return {
    selectedMonth,
    selectedYear,
    selectedDateInfo,
    updateSelectedDate,
    resetToCurrentMonth,
  };
});

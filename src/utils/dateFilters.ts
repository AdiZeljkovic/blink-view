import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export const filterTransactionsByPeriod = <T extends { datum: string }>(
  transactions: T[],
  period: "week" | "month",
  currentDate: Date
): T[] => {
  const start = period === "week" 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);
  
  const end = period === "week"
    ? endOfWeek(currentDate, { weekStartsOn: 1 })
    : endOfMonth(currentDate);

  return transactions.filter(transaction => {
    try {
      const transactionDate = parseISO(transaction.datum);
      return isWithinInterval(transactionDate, { start, end });
    } catch {
      return false;
    }
  });
};

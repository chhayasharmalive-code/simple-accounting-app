import { IContactRepository } from "../../domain/repositories/contact-repository.interface";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { TransactionType } from "../../domain/entities/transaction.entity";

export interface DashboardStats {
  kpis: {
    netBalance: number;       // total lent - total borrowed
    totalReceivable: number;  // total owed to us (sum of positive contact balances)
    totalPayable: number;     // total we owe (sum of negative contact balances, absolute)
    activeDebtors: number;    // contacts who owe us
    activeCreditors: number;  // contacts we owe
    totalContacts: number;
    totalTransactionsCount: number;
  };
  charts: {
    dailyTrends: Array<{
      date: string; // YYYY-MM-DD
      lent: number;
      borrowed: number;
    }>;
    monthlyTrends: Array<{
      month: string; // YYYY-MM
      lent: number;
      borrowed: number;
    }>;
    distribution: {
      totalLentEver: number;
      totalBorrowedEver: number;
    };
  };
  insights: {
    topDebtors: Array<{
      contactId: string;
      contactName: string;
      contactAvatar: string | null;
      balance: number;
    }>;
    topCreditors: Array<{
      contactId: string;
      contactName: string;
      contactAvatar: string | null;
      balance: number; // absolute value representing how much we owe them
    }>;
    peakLendingMonth: { month: string; amount: number } | null;
    peakBorrowingMonth: { month: string; amount: number } | null;
    peakLendingDay: { date: string; amount: number } | null;
    peakBorrowingDay: { date: string; amount: number } | null;
  };
  recentActivities: Array<{
    id: string;
    contactId: string;
    contactName: string;
    contactAvatar: string | null;
    amount: number;
    type: TransactionType;
    reference: string | null;
    createdAt: Date;
  }>;
}

export class DashboardService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async getDashboardData(userId: string): Promise<DashboardStats> {
    const contacts = await this.contactRepository.findByUserId(userId);
    const transactions = await this.transactionRepository.findManyByUserId(userId);

    // 1. Calculate contact-level balances
    const contactsMap = new Map(contacts.map(c => [c.id, c]));
    const contactBalances = new Map<string, number>();

    // Initialize all contacts with 0 balance
    for (const c of contacts) {
      contactBalances.set(c.id, 0);
    }

    // Process transactions to calculate each contact's net balance
    let totalLentEver = 0;
    let totalBorrowedEver = 0;

    for (const tx of transactions) {
      const currentBal = contactBalances.get(tx.contactId) || 0;
      if (tx.type === TransactionType.GIVEN) {
        contactBalances.set(tx.contactId, currentBal + tx.amount);
        totalLentEver += tx.amount;
      } else {
        contactBalances.set(tx.contactId, currentBal - tx.amount);
        totalBorrowedEver += tx.amount;
      }
    }

    // Compute KPIs
    let totalReceivable = 0;
    let totalPayable = 0;
    let activeDebtors = 0;
    let activeCreditors = 0;

    contactBalances.forEach((balance) => {
      if (balance > 0) {
        totalReceivable += balance;
        activeDebtors++;
      } else if (balance < 0) {
        totalPayable += Math.abs(balance);
        activeCreditors++;
      }
    });

    const netBalance = totalReceivable - totalPayable;

    // 2. Generate Daily Trends (Last 7 Days)
    const dailyTrendsMap = new Map<string, { lent: number; borrowed: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyTrendsMap.set(dateStr, { lent: 0, borrowed: 0 });
    }

    // 3. Generate Monthly Trends (Last 6 Months)
    const monthlyTrendsMap = new Map<string, { lent: number; borrowed: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrendsMap.set(monthStr, { lent: 0, borrowed: 0 });
    }

    // Fill trends from transactions
    for (const tx of transactions) {
      const txDate = new Date(tx.createdAt);
      
      // Daily
      const dateStr = txDate.toISOString().split("T")[0];
      if (dailyTrendsMap.has(dateStr)) {
        const trend = dailyTrendsMap.get(dateStr)!;
        if (tx.type === TransactionType.GIVEN) {
          trend.lent += tx.amount;
        } else {
          trend.borrowed += tx.amount;
        }
      }

      // Monthly
      const monthStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyTrendsMap.has(monthStr)) {
        const trend = monthlyTrendsMap.get(monthStr)!;
        if (tx.type === TransactionType.GIVEN) {
          trend.lent += tx.amount;
        } else {
          trend.borrowed += tx.amount;
        }
      }
    }

    const dailyTrends = Array.from(dailyTrendsMap.entries()).map(([date, trends]) => ({
      date,
      lent: Number(trends.lent.toFixed(2)),
      borrowed: Number(trends.borrowed.toFixed(2)),
    }));

    const monthlyTrends = Array.from(monthlyTrendsMap.entries()).map(([month, trends]) => ({
      month,
      lent: Number(trends.lent.toFixed(2)),
      borrowed: Number(trends.borrowed.toFixed(2)),
    }));

    // 4. Deep Insights Calculations
    const debtorsList: Array<{ contactId: string; contactName: string; contactAvatar: string | null; balance: number }> = [];
    const creditorsList: Array<{ contactId: string; contactName: string; contactAvatar: string | null; balance: number }> = [];

    contactBalances.forEach((balance, id) => {
      const contact = contactsMap.get(id);
      const name = contact ? contact.name : "Deleted Contact";
      const avatar = (contact && contact.avatar) ? contact.avatar : null;

      if (balance > 0) {
        debtorsList.push({ contactId: id, contactName: name, contactAvatar: avatar, balance: Number(balance.toFixed(2)) });
      } else if (balance < 0) {
        creditorsList.push({ contactId: id, contactName: name, contactAvatar: avatar, balance: Number(Math.abs(balance).toFixed(2)) });
      }
    });

    const topDebtors = debtorsList.sort((a, b) => b.balance - a.balance).slice(0, 5);
    const topCreditors = creditorsList.sort((a, b) => b.balance - a.balance).slice(0, 5);

    // Calculate peaks across all history
    const historicalDailyLending = new Map<string, number>();
    const historicalDailyBorrowing = new Map<string, number>();
    const historicalMonthlyLending = new Map<string, number>();
    const historicalMonthlyBorrowing = new Map<string, number>();

    for (const tx of transactions) {
      const txDate = new Date(tx.createdAt);
      const dateStr = txDate.toISOString().split("T")[0];
      const monthStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;

      if (tx.type === TransactionType.GIVEN) {
        historicalDailyLending.set(dateStr, (historicalDailyLending.get(dateStr) || 0) + tx.amount);
        historicalMonthlyLending.set(monthStr, (historicalMonthlyLending.get(monthStr) || 0) + tx.amount);
      } else {
        historicalDailyBorrowing.set(dateStr, (historicalDailyBorrowing.get(dateStr) || 0) + tx.amount);
        historicalMonthlyBorrowing.set(monthStr, (historicalMonthlyBorrowing.get(monthStr) || 0) + tx.amount);
      }
    }

    const getPeakKey = (map: Map<string, number>) => {
      let maxKey: string | null = null;
      let maxVal = 0;
      map.forEach((val, key) => {
        if (val > maxVal) {
          maxVal = val;
          maxKey = key;
        }
      });
      return maxKey ? { key: maxKey, amount: Number(maxVal.toFixed(2)) } : null;
    };

    const peakLendingDayRaw = getPeakKey(historicalDailyLending);
    const peakLendingDay = peakLendingDayRaw ? { date: peakLendingDayRaw.key, amount: peakLendingDayRaw.amount } : null;

    const peakBorrowingDayRaw = getPeakKey(historicalDailyBorrowing);
    const peakBorrowingDay = peakBorrowingDayRaw ? { date: peakBorrowingDayRaw.key, amount: peakBorrowingDayRaw.amount } : null;

    const peakLendingMonthRaw = getPeakKey(historicalMonthlyLending);
    const peakLendingMonth = peakLendingMonthRaw ? { month: peakLendingMonthRaw.key, amount: peakLendingMonthRaw.amount } : null;

    const peakBorrowingMonthRaw = getPeakKey(historicalMonthlyBorrowing);
    const peakBorrowingMonth = peakBorrowingMonthRaw ? { month: peakBorrowingMonthRaw.key, amount: peakBorrowingMonthRaw.amount } : null;

    // 5. Recent Activities (recent 10 transactions mapped with contact details)
    const recentActivities = transactions.slice(0, 10).map((tx) => {
      const contact = contactsMap.get(tx.contactId);
      return {
        id: tx.id,
        contactId: tx.contactId,
        contactName: contact ? contact.name : "Deleted Contact",
        contactAvatar: (contact && contact.avatar) ? contact.avatar : null,
        amount: tx.amount,
        type: tx.type,
        reference: tx.reference || null,
        createdAt: tx.createdAt,
      };
    });

    return {
      kpis: {
        netBalance: Number(netBalance.toFixed(2)),
        totalReceivable: Number(totalReceivable.toFixed(2)),
        totalPayable: Number(totalPayable.toFixed(2)),
        activeDebtors,
        activeCreditors,
        totalContacts: contacts.length,
        totalTransactionsCount: transactions.length,
      },
      charts: {
        dailyTrends,
        monthlyTrends,
        distribution: {
          totalLentEver: Number(totalLentEver.toFixed(2)),
          totalBorrowedEver: Number(totalBorrowedEver.toFixed(2)),
        },
      },
      insights: {
        topDebtors,
        topCreditors,
        peakLendingMonth,
        peakBorrowingMonth,
        peakLendingDay,
        peakBorrowingDay,
      },
      recentActivities,
    };
  }
}

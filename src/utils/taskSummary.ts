import { TaskListItem } from '../types/task.types';

export interface TaskSummaryCounts {
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
  todayCompleted: number; // 🔥 NEW
  total: number;
}

export const calculateTaskSummary = (tasks: TaskListItem[]): TaskSummaryCounts => {
  let overdue = 0;
  let today = 0;
  let upcoming = 0;
  let completed = 0;
  let todayCompleted = 0;

  const now = new Date();

  console.log("🕒 CURRENT TIME:", now);
  console.log("📦 TASKS:", tasks);

  tasks.forEach((task) => {
    console.log("👉 Task:", task.title);
    console.log("   status:", task.status);
    console.log("   dueDate:", task.dueDate);

    if (!task.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    console.log("   diffHours:", diffHours);

    // ✅ COMPLETED
    if (task.status === 'COMPLETED') {
      completed++;

      // 🔥 If completed within today window
      if (diffHours >= -24 && diffHours <= 24) {
        todayCompleted++;
        console.log("   ✅ TODAY COMPLETED");
      }

      return;
    }

    // ✅ ONLY OPEN tasks consider
    if (task.status !== 'OPEN') {
      console.log("   ⛔ Skipped (not OPEN)");
      return;
    }

    // 🔥 MAIN LOGIC
    if (diffHours < -24) {
      overdue++;
      console.log("   🔴 OVERDUE");
    } else if (diffHours >= -24 && diffHours <= 24) {
      today++;
      console.log("   🟡 TODAY");
    } else {
      upcoming++;
      console.log("   🔵 UPCOMING");
    }
  });

  const result = {
    overdue,
    today,
    upcoming,
    completed,
    todayCompleted,
    total: tasks.length,
  };

  console.log("📊 FINAL SUMMARY:", result);

  return result;
};

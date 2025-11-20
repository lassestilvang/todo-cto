"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/lib/hooks/useTasks";
import { useMemo } from "react";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Calendar,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { isToday, isThisWeek, format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";

export function AnalyticsDashboard() {
  const { data: allTasks = [] } = useTasks({ includeCompleted: true });

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const last7Days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    });

    const completedTasks = allTasks.filter((task) => task.completed);
    const completedToday = completedTasks.filter(
      (task) => task.completedAt && isToday(task.completedAt)
    ).length;
    const completedThisWeek = completedTasks.filter(
      (task) => task.completedAt && isThisWeek(task.completedAt)
    ).length;

    const totalFocusTime = completedTasks.reduce(
      (sum, task) => sum + (task.actualMinutes || 0),
      0
    );

    const tasksWithTime = completedTasks.filter((task) => task.actualMinutes);
    const averageCompletionTime =
      tasksWithTime.length > 0
        ? Math.round(
            tasksWithTime.reduce((sum, task) => sum + (task.actualMinutes || 0), 0) /
              tasksWithTime.length
          )
        : 0;

    const totalTasks = allTasks.length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // Calculate current streak
    let streak = 0;
    let checkDate = new Date();
    const sortedCompleted = [...completedTasks]
      .filter((t) => t.completedAt)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));

    for (let i = 0; i < 365; i++) {
      const hasTaskOnDate = sortedCompleted.some(
        (task) => task.completedAt && isToday(task.completedAt)
      );
      if (hasTaskOnDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Group by priority
    const tasksByPriority = {
      high: allTasks.filter((t) => t.priority === "high").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      low: allTasks.filter((t) => t.priority === "low").length,
      none: allTasks.filter((t) => t.priority === "none").length,
    };

    // Productivity trend (last 7 days)
    const productivityTrend = last7Days.map((day) => ({
      date: format(day, "EEE"),
      completed: completedTasks.filter(
        (task) =>
          task.completedAt &&
          format(task.completedAt, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
      ).length,
    }));

    // Best productivity day
    const bestDay = productivityTrend.reduce(
      (best, day) => (day.completed > best.completed ? day : best),
      productivityTrend[0]
    );

    // Time estimation accuracy
    const tasksWithEstimates = completedTasks.filter(
      (t) => t.estimatedMinutes && t.actualMinutes
    );
    const estimateAccuracy =
      tasksWithEstimates.length > 0
        ? Math.round(
            (tasksWithEstimates.reduce(
              (sum, t) =>
                sum +
                (1 - Math.abs((t.actualMinutes! - t.estimatedMinutes!) / t.estimatedMinutes!)),
              0
            ) /
              tasksWithEstimates.length) *
              100
          )
        : 0;

    return {
      completedToday,
      completedThisWeek,
      totalFocusTime,
      averageCompletionTime,
      completionRate,
      streak,
      tasksByPriority,
      productivityTrend,
      bestDay,
      estimateAccuracy,
    };
  }, [allTasks]);

  const maxTrend = Math.max(...stats.productivityTrend.map((d) => d.completed), 1);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Productivity Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Track your progress and optimize your workflow
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalFocusTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.averageCompletionTime} min avg per task
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-4" />
              7-Day Productivity Trend
            </CardTitle>
            <CardDescription>Tasks completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.productivityTrend.map((day) => (
                <div key={day.date} className="flex items-center gap-2">
                  <div className="w-12 text-sm text-muted-foreground">{day.date}</div>
                  <Progress
                    value={(day.completed / maxTrend) * 100}
                    className="flex-1"
                  />
                  <div className="w-8 text-right text-sm font-medium">{day.completed}</div>
                </div>
              ))}
            </div>
            {stats.bestDay && (
              <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-500" />
                  <span>
                    Best day: <strong>{stats.bestDay.date}</strong> with{" "}
                    {stats.bestDay.completed} tasks
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Tasks by Priority
            </CardTitle>
            <CardDescription>Distribution across priority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="w-20 justify-center">
                    High
                  </Badge>
                  <span className="text-2xl font-bold">{stats.tasksByPriority.high}</span>
                </div>
                <Progress
                  value={
                    allTasks.length > 0
                      ? (stats.tasksByPriority.high / allTasks.length) * 100
                      : 0
                  }
                  className="h-2 w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-20 justify-center bg-orange-500">
                    Medium
                  </Badge>
                  <span className="text-2xl font-bold">{stats.tasksByPriority.medium}</span>
                </div>
                <Progress
                  value={
                    allTasks.length > 0
                      ? (stats.tasksByPriority.medium / allTasks.length) * 100
                      : 0
                  }
                  className="h-2 w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="w-20 justify-center bg-blue-500">
                    Low
                  </Badge>
                  <span className="text-2xl font-bold">{stats.tasksByPriority.low}</span>
                </div>
                <Progress
                  value={
                    allTasks.length > 0
                      ? (stats.tasksByPriority.low / allTasks.length) * 100
                      : 0
                  }
                  className="h-2 w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-20 justify-center">
                    None
                  </Badge>
                  <span className="text-2xl font-bold">{stats.tasksByPriority.none}</span>
                </div>
                <Progress
                  value={
                    allTasks.length > 0
                      ? (stats.tasksByPriority.none / allTasks.length) * 100
                      : 0
                  }
                  className="h-2 w-32"
                />
              </div>
            </div>

            {stats.estimateAccuracy > 0 && (
              <div className="mt-4 rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Time Estimation Accuracy</span>
                  <span className="font-semibold">{stats.estimateAccuracy}%</span>
                </div>
                <Progress value={stats.estimateAccuracy} className="mt-2 h-1" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Most Productive Time</div>
              <div className="mt-1 text-xl font-semibold">
                {stats.bestDay ? stats.bestDay.date : "N/A"}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Weekly Average</div>
              <div className="mt-1 text-xl font-semibold">
                {Math.round(stats.completedThisWeek / 7)} tasks/day
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Hours Tracked</div>
              <div className="mt-1 text-xl font-semibold">
                {Math.round(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

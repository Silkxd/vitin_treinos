import React, { useEffect, useState, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';

// Hooks & Utils
import { useStudents } from '../hooks/useStudents';
import { useWorkouts } from '../hooks/useWorkouts';
import { getAggregateExerciseHistory } from '../utils/workoutUtils';

// New Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { GlobalStatsRow } from '../components/dashboard/GlobalStatsRow';
import { DashboardToolbar } from '../components/dashboard/DashboardToolbar';
import { ExerciseChartCard } from '../components/dashboard/ExerciseChartCard';
import { StudentProfileCard } from '../components/dashboard/StudentProfileCard';
import { StudentPerformanceList } from '../components/dashboard/StudentPerformanceList';
import { RecentHistoryList } from '../components/dashboard/RecentHistoryList';

export const Dashboard = () => {
  const { students, fetchStudents } = useStudents();
  const { workouts, fetchWorkouts, fetchWorkoutDetails, selectedWorkout, fetchStudentHistory, studentHistory } = useWorkouts();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
    fetchWorkouts();
  }, []);

  // GLOBAL STATS
  const activeStudents = students.filter(s => s.active !== false).length;
  const activeWorkouts = workouts.filter(w => new Date(w.end_date) >= new Date()).length;

  // Filtered Students for Overview List
  const filteredStudents = useMemo(() => {
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  // Selected Student Data
  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId) || null, [students, selectedStudentId]);

  // Handle Student Selection
  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentHistory(selectedStudentId);

      // Find latest workout for context (dates, name etc)
      const studentWorkouts = workouts
        .filter(w => w.student_id === selectedStudentId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (studentWorkouts.length > 0) {
        // Fetch details of the LAST workout to determine which exercises to show
        fetchWorkoutDetails(studentWorkouts[0].id);
      }
    }
  }, [selectedStudentId, workouts]);

  const handleExport = async () => {
    // Small timeout to allow charts to render completely if needed, though they should be ready
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
        useCORS: true // vital for some images
      });
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = selectedStudent
        ? `${selectedStudent.name} - ${dateStr}.png`
        : `dashboard-relatorio-${dateStr}.png`;

      link.download = fileName;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Group exercises to show. 
  // We use the LATEST workout as the "template" for what exercises are relevant to track right now.
  const uniqueExercises = useMemo(() => {
    if (!selectedWorkout?.workout_exercises) return [];

    const seen = new Set();
    const unique: any[] = [];
    const sortedExercises = [...selectedWorkout.workout_exercises].sort((a, b) => a.order_index - b.order_index);

    sortedExercises.forEach(we => {
      if (!seen.has(we.exercise_id)) {
        seen.add(we.exercise_id);
        unique.push(we);
      }
    });
    return unique;
  }, [selectedWorkout]);

  // Global Exercises (All exercises from all workouts)
  const allUniqueExercises = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    const seen = new Set();
    const unique: any[] = [];

    // Iterate all workouts to find all exercises
    workouts.forEach(w => {
      if (w.workout_exercises) {
        w.workout_exercises.forEach(we => {
          if (we.exercises && !seen.has(we.exercise_id)) {
            seen.add(we.exercise_id);
            unique.push(we);
          }
        });
      }
    });

    // Sort alphabetically
    return unique.sort((a, b) => (a.exercises?.name || '').localeCompare(b.exercises?.name || ''));
  }, [workouts]);

  // Global History Helper
  // Global History Helper
  const getGlobalExerciseHistory = (exerciseId: string) => {
    // Group by 'week_number' provided in the workout plan
    const weeklyMap = new Map<number, { sumWeight: number, count: number, max: number, min: number }>();

    workouts.forEach(w => {
      w.workout_exercises?.forEach(we => {
        if (we.exercise_id === exerciseId && we.performances && we.performances.length > 0) {
          // Use the explicit week_number from the plan
          const weekNum = we.week_number;

          if (!weeklyMap.has(weekNum)) {
            weeklyMap.set(weekNum, { sumWeight: 0, count: 0, max: 0, min: 9999 });
          }

          const entry = weeklyMap.get(weekNum)!;

          let maxWeightInSession = 0;
          we.performances.forEach(p => {
            maxWeightInSession = Math.max(maxWeightInSession, p.weight);
          });

          if (maxWeightInSession > 0) {
            entry.sumWeight += maxWeightInSession;
            entry.count += 1;
            entry.max = Math.max(entry.max, maxWeightInSession);
            entry.min = Math.min(entry.min, maxWeightInSession);
          }
        }
      });
    });

    // Convert to Chart Data
    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        date: `Semana ${week}`,
        weight: Math.round(data.sumWeight / data.count), // Average
        reps: 0
      }))
      .sort((a, b) => a.week - b.week);
  };


  // Calculate Student Stats (Best/Worst Improvement)
  const studentStats = useMemo(() => {
    if (!studentHistory || studentHistory.length === 0) return { mostImproved: null, leastImproved: null };

    // Get all unique exercises from history
    const allExercisesMap = new Map<string, string>(); // id -> name
    studentHistory.forEach(w => {
      w.workout_exercises?.forEach(we => {
        if (we.exercises?.name) {
          allExercisesMap.set(we.exercise_id, we.exercises.name);
        }
      });
    });

    const evolutions: { name: string, value: number, exerciseId: string }[] = [];

    allExercisesMap.forEach((name, id) => {
      const { history } = getAggregateExerciseHistory(studentHistory, id);
      if (history.length > 1) { // Need at least 2 points for evolution
        const weights = history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(h => h.weight);
        const first = weights[0];
        const last = weights[weights.length - 1];
        const evo = first > 0 ? ((last - first) / first) * 100 : 0;
        evolutions.push({ name, value: Math.round(evo), exerciseId: id });
      }
    });

    if (evolutions.length === 0) return { mostImproved: null, leastImproved: null };

    // Sort by evolution value
    evolutions.sort((a, b) => b.value - a.value);

    return {
      mostImproved: evolutions[0],
      leastImproved: evolutions[evolutions.length - 1]
    };
  }, [studentHistory]);


  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" ref={dashboardRef}>
      {/* Top Navigation Border Removed */}

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-8">

        {/* Header */}
        <DashboardHeader />

        {/* Global Stats */}
        <div data-html2canvas-ignore="true">
          <GlobalStatsRow
            activeStudents={activeStudents}
            activeWorkouts={activeWorkouts}
          />
        </div>

        {/* Toolbar */}
        <div data-html2canvas-ignore="true">
          <DashboardToolbar
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onExport={handleExport}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Charts (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedStudentId ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Desempenho dos Alunos</h2>
                  <span className="text-sm text-gray-500">Visão geral por aluno</span>
                </div>
                <StudentPerformanceList
                  students={filteredStudents}
                  workouts={workouts}
                  onSelectStudent={setSelectedStudentId}
                />
              </div>
            ) : uniqueExercises.length > 0 ? (
              uniqueExercises.map((we) => {
                const { history } = getAggregateExerciseHistory(studentHistory, we.exercise_id);
                return (
                  <ExerciseChartCard
                    key={we.exercise_id}
                    exerciseName={we.exercises?.name}
                    muscleGroup={we.exercises?.muscle_group}
                    history={history}
                  />
                );
              })
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                Este aluno não possui treinos ou exercícios registrados recentemente.
              </div>
            )}
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {selectedStudentId && (
              <>
                <StudentProfileCard
                  student={selectedStudent}
                  currentWorkout={selectedWorkout ? { id: selectedWorkout.id, name: selectedWorkout.name } : null}
                  mostImproved={studentStats.mostImproved}
                  leastImproved={studentStats.leastImproved}
                />
                <RecentHistoryList history={studentHistory} />
              </>
            )}
            {!selectedStudentId && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm opacity-50 pointer-events-none grayscale">
                <p className="text-center text-sm text-gray-400">Selecione um aluno para ver o perfil</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

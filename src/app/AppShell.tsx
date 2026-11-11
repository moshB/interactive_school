import { useState } from 'react';
import { GraduationCap, PencilRuler } from 'lucide-react';
import { StudentWorkspace } from '../modules/student';
import { TeacherDashboard } from '../modules/teacher';

type WorkspaceRole = 'student' | 'teacher';

const roleLabels: Record<WorkspaceRole, string> = {
  student: 'מרחב תלמיד',
  teacher: 'מרחב מורה',
};

export default function AppShell() {
  const [activeRole, setActiveRole] = useState<WorkspaceRole>('student');

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-900" dir="rtl">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#home" className="flex shrink-0 items-center gap-3" aria-label="מרחב מתמטי - עמוד הבית">
            <span className="flex size-10 items-center justify-center rounded-[14px] bg-indigo-600 text-white shadow-lg shadow-indigo-200"><PencilRuler size={20} aria-hidden="true" /></span>
            <span><span className="block text-sm font-extrabold tracking-tight text-slate-900">מרחב מתמטי</span><span className="mt-0.5 block text-[10px] font-medium tracking-wide text-slate-400">לומדים לראות את המתמטיקה</span></span>
          </a>
          <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="בחירת סביבת עבודה">
            {(['student', 'teacher'] as const).map((role) => {
              const isActive = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveRole(role)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {role === 'student' ? <GraduationCap size={16} aria-hidden="true" /> : <PencilRuler size={15} aria-hidden="true" />}
                  {roleLabels[role]}
                </button>
              );
            })}
          </nav>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex"><span className="size-1.5 rounded-full bg-emerald-500" />סביבת תרגול</span>
        </div>
      </header>
      <div role="tabpanel" aria-label={roleLabels[activeRole]}>
        {activeRole === 'student' ? <StudentWorkspace /> : <TeacherDashboard />}
      </div>
      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-slate-400 sm:px-8">
          <span>מרחב מתמטי · סביבת למידה אינטראקטיבית</span><span>נבנה כדי להפוך מתמטיקה למוחשית</span>
        </div>
      </footer>
    </div>
  );
}

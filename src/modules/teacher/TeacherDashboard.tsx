import { BarChart3, ClipboardList, UsersRound } from 'lucide-react';

const dashboardSections = [
  { title: 'הקבוצות שלי', description: 'ניהול קבוצות וקודי הצטרפות', icon: UsersRound },
  { title: 'תרגילים', description: 'הגדרת משימות ופעילויות לתלמידים', icon: ClipboardList },
  { title: 'מעקב והתקדמות', description: 'סקירת התקדמות והגשות', icon: BarChart3 },
];

export default function TeacherDashboard() {
  return (
    <main className="mx-auto min-h-[calc(100vh-150px)] max-w-[1440px] px-4 pb-16 pt-9 sm:px-8 sm:pt-12">
      <section className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-wide text-indigo-600">מרחב ההוראה</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">שלום, מורה</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">כאן תוכלו לנהל קבוצות, להגדיר תרגילים ולעקוב אחר התקדמות התלמידים.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="אזורי ניהול">
        {dashboardSections.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} aria-hidden="true" /></div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><UsersRound size={22} aria-hidden="true" /></div>
        <h2 className="mt-4 font-bold text-slate-800">עדיין אין נתוני כיתה</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">תשתית המורה הוקמה. ניהול קבוצות, תרגילים והגשות יתווסף בשלבים הבאים.</p>
      </section>
    </main>
  );
}

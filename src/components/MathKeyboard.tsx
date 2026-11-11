import { Delete, Divide, Radical, Superscript } from 'lucide-react';
import type { MathToken } from '../hooks/useMathInput';

type MathKeyboardProps = {
  onInsert: (token: MathToken) => void;
};

const tokenGroups: { title: string; tokens: MathToken[] }[] = [
  {
    title: 'תבניות',
    tokens: [
      { label: 'a/b', value: '()/()', cursorOffset: 1, description: 'הוספת תבנית שבר' },
      { label: '√x', value: 'sqrt()', cursorOffset: 5, description: 'הוספת שורש ריבועי' },
      { label: 'x²', value: '^2', description: 'הוספת חזקה שנייה' },
      { label: 'x³', value: '^3', description: 'הוספת חזקה שלישית' },
    ],
  },
  {
    title: 'פעולות',
    tokens: [
      { label: '+', value: '+', description: 'חיבור' },
      { label: '−', value: '-', description: 'חיסור' },
      { label: '×', value: '*', description: 'כפל' },
      { label: '÷', value: '/', description: 'חילוק' },
      { label: '(', value: '(', description: 'פתיחת סוגריים' },
      { label: ')', value: ')', description: 'סגירת סוגריים' },
      { label: 'x', value: 'x', description: 'המשתנה x' },
      { label: '⌫', value: '', description: 'מחיקת התו הקודם', action: 'backspace' },
    ],
  },
];

export default function MathKeyboard({ onInsert }: MathKeyboardProps) {
  const handleToken = (token: MathToken) => {
    onInsert(token);
  };

  return (
    <section aria-label="מקלדת מתמטית" className="space-y-5">
      {tokenGroups.map((group) => (
        <div key={group.title}>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wide text-slate-500">{group.title}</h3>
            {group.title === 'תבניות' && <Superscript size={15} className="text-slate-400" aria-hidden="true" />}
            {group.title === 'פעולות' && <Divide size={15} className="text-slate-400" aria-hidden="true" />}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {group.tokens.map((token) => (
              <button
                key={`${group.title}-${token.label}`}
                type="button"
                aria-label={token.description}
                title={token.description}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleToken(token)}
                className={`keyboard-key ${token.label === '⌫' ? 'text-rose-600 hover:bg-rose-50' : ''}`}
              >
                {token.label === '√x' ? <><Radical size={17} aria-hidden="true" /><span className="text-sm">x</span></> : token.label === '⌫' ? <Delete size={17} aria-hidden="true" /> : token.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
        לחיצה על כפתור תוסיף את הסימן במקום הסמן בשדה הפונקציה.
      </p>
    </section>
  );
}

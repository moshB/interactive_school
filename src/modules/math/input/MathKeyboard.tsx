import { useState } from 'react';
import { Delete, Divide, FunctionSquare, Radical, Sigma, Superscript } from 'lucide-react';

export type MathToken = {
  value: string;
  cursorOffset?: number;
  action?: 'backspace';
  label: string;
  accessibleLabel: string;
};

type KeyboardSection = 'basic' | 'algebra' | 'trigonometry';
type MathKeyboardProps = { onInsert: (token: MathToken) => void; initialSection?: KeyboardSection };

type KeyDefinition = MathToken & { wide?: boolean; accent?: boolean };

const sections: { id: KeyboardSection; label: string; icon: typeof Divide }[] = [
  { id: 'basic', label: 'בסיסית', icon: Divide },
  { id: 'algebra', label: 'אלגברה', icon: Superscript },
  { id: 'trigonometry', label: 'פונקציות', icon: FunctionSquare },
];

const keys: Record<KeyboardSection, KeyDefinition[]> = {
  basic: [
    { label: '7', value: '7', accessibleLabel: '7' },
    { label: '8', value: '8', accessibleLabel: '8' },
    { label: '9', value: '9', accessibleLabel: '9' },
    { label: '÷', value: '/', accessibleLabel: 'חילוק', accent: true },
    { label: '4', value: '4', accessibleLabel: '4' },
    { label: '5', value: '5', accessibleLabel: '5' },
    { label: '6', value: '6', accessibleLabel: '6' },
    { label: '×', value: '*', accessibleLabel: 'כפל', accent: true },
    { label: '1', value: '1', accessibleLabel: '1' },
    { label: '2', value: '2', accessibleLabel: '2' },
    { label: '3', value: '3', accessibleLabel: '3' },
    { label: '−', value: '-', accessibleLabel: 'חיסור', accent: true },
    { label: '0', value: '0', accessibleLabel: '0' },
    { label: '.', value: '.', accessibleLabel: 'נקודה עשרונית' },
    { label: '(', value: '(', accessibleLabel: 'פתיחת סוגריים' },
    { label: '+', value: '+', accessibleLabel: 'חיבור', accent: true },
  ],
  algebra: [
    { label: 'x', value: 'x', accessibleLabel: 'משתנה x' },
    { label: <>x<sup>2</sup></>, value: '^2', accessibleLabel: 'בחזקת 2', accent: true },
    { label: <>x<sup>3</sup></>, value: '^3', accessibleLabel: 'בחזקת 3', accent: true },
    { label: <>x<sup>n</sup></>, value: '^()', cursorOffset: 2, accessibleLabel: 'חזקה כללית', accent: true },
    { label: '7', value: '7', accessibleLabel: '7' },
    { label: '8', value: '8', accessibleLabel: '8' },
    { label: '9', value: '9', accessibleLabel: '9' },
    { label: '+', value: '+', accessibleLabel: 'חיבור', accent: true },
    { label: '4', value: '4', accessibleLabel: '4' },
    { label: '5', value: '5', accessibleLabel: '5' },
    { label: '6', value: '6', accessibleLabel: '6' },
    { label: '−', value: '-', accessibleLabel: 'חיסור', accent: true },
    { label: '1', value: '1', accessibleLabel: '1' },
    { label: '2', value: '2', accessibleLabel: '2' },
    { label: '3', value: '3', accessibleLabel: '3' },
    { label: '×', value: '*', accessibleLabel: 'כפל', accent: true },
    { label: '0', value: '0', accessibleLabel: '0' },
    { label: '(', value: '(', accessibleLabel: 'פתיחת סוגריים' },
    { label: ')', value: ')', accessibleLabel: 'סגירת סוגריים' },
    { label: '⌫', value: '', action: 'backspace', accessibleLabel: 'מחיקת התו הקודם' },
    { label: 'a/b', value: '()/()', cursorOffset: 1, accessibleLabel: 'שבר', accent: true },
    { label: <><Radical size={17} /> x</>, value: 'sqrt()', cursorOffset: 5, accessibleLabel: 'שורש ריבועי', accent: true },
    { label: 'π', value: 'pi', accessibleLabel: 'פאי' },
    { label: '.', value: '.', accessibleLabel: 'נקודה עשרונית' },
  ],
  trigonometry: [
    { label: 'sin', value: 'sin()', cursorOffset: 4, accessibleLabel: 'סינוס' },
    { label: 'cos', value: 'cos()', cursorOffset: 4, accessibleLabel: 'קוסינוס' },
    { label: 'tan', value: 'tan()', cursorOffset: 4, accessibleLabel: 'טנגנס' },
    { label: 'ln', value: 'log()', cursorOffset: 4, accessibleLabel: 'לוגריתם טבעי' },
    { label: 'log', value: 'log10()', cursorOffset: 6, accessibleLabel: 'לוגריתם בבסיס 10' },
    { label: 'eˣ', value: 'exp()', cursorOffset: 4, accessibleLabel: 'פונקציה מעריכית' },
    { label: 'π', value: 'pi', accessibleLabel: 'פאי' },
    { label: '⌫', value: '', action: 'backspace', accessibleLabel: 'מחיקת התו הקודם' },
  ],
};

export default function MathKeyboard({ onInsert, initialSection = 'basic' }: MathKeyboardProps) {
  const [activeSection, setActiveSection] = useState<KeyboardSection>(initialSection);

  return (
    <section className="math-keyboard" aria-label="מקלדת מתמטית">
      <div className="math-keyboard-tabs" role="tablist" aria-label="קבוצות מקשים">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`keyboard-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={activeSection === id}
            aria-controls="keyboard-keys"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setActiveSection(id)}
            className={`math-keyboard-tab ${activeSection === id ? 'is-active' : ''}`}
          >
            <Icon size={14} aria-hidden="true" />{label}
          </button>
        ))}
      </div>
      <div id="keyboard-keys" role="tabpanel" aria-labelledby={`keyboard-tab-${activeSection}`} className="math-keyboard-grid">
        {keys[activeSection].map((key, index) => (
          <button
            key={`${activeSection}-${key.accessibleLabel}-${index}`}
            type="button"
            aria-label={key.accessibleLabel}
            title={key.accessibleLabel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onInsert(key)}
            className={`math-key ${key.accent ? 'math-key-accent' : ''} ${key.wide ? 'math-key-wide' : ''} ${key.action === 'backspace' ? 'math-key-delete' : ''}`}
          >
            {key.action === 'backspace' ? <Delete size={17} aria-hidden="true" /> : key.label}
          </button>
        ))}
      </div>
      <p className="math-keyboard-hint"><Sigma size={14} aria-hidden="true" /> בחרו ביטוי להוספה לשורה הפעילה</p>
    </section>
  );
}

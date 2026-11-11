export type CurriculumStatus = 'available' | 'planned';

export type CurriculumSubchapter = {
  id: string;
  title: string;
  description: string;
  status: CurriculumStatus;
};

export type CurriculumChapter = {
  id: string;
  title: string;
  status: CurriculumStatus;
  subchapters: CurriculumSubchapter[];
};

export type CurriculumSubject = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  status: CurriculumStatus;
  chapters: CurriculumChapter[];
};

export const gradeTenCurriculum: {
  grade: string;
  track: string;
  subjects: CurriculumSubject[];
} = {
  grade: 'כיתה י׳',
  track: '5 יחידות לימוד',
  subjects: [
    {
      id: 'differential-calculus',
      title: 'חשבון דיפרנציאלי',
      shortTitle: 'חשבון דיפרנציאלי',
      description: 'לומדים לגזור פונקציות ולהבין את השיפוע בכל נקודה.',
      status: 'available',
      chapters: [
        {
          id: 'polynomials',
          title: 'פולינומים',
          status: 'available',
          subchapters: [
            {
              id: 'derivative-rules',
              title: 'הנגזרת',
              description: 'כללי גזירה ותרגול מדורג של פונקציות פולינומיות.',
              status: 'available',
            },
            {
              id: 'derivative-at-point',
              title: 'חישוב ערך נגזרת בנקודה על הגרף',
              description: 'גוזרים, מציבים ערכי x, ומוצאים את שיפוע המשיק בכל נקודה.',
              status: 'available',
            },
            {
              id: 'tangent-slope',
              title: 'חישוב שיפוע המשיק לגרף פונקציה',
              description: 'מחשבים שיפועי משיקים ומוצאים נקודות על גרף לפי שיפוע או חיתוך.',
              status: 'available',
            },
            {
              id: 'tangent-equation',
              title: 'משוואת המשיק לגרף פונקציה ותכונותיו',
              description: 'מוצאים משוואות משיקים, נקודות השקה ומפגשים בין משיקים בעזרת הנגזרת.',
              status: 'available',
            },
            {
              id: 'polynomial-investigation',
              title: 'חקירת פולינומים',
              description: 'נקודות קיצון, תחומי עלייה וירידה ושרטוט סקיצה.',
              status: 'planned',
            },
          ],
        },
        {
          id: 'rational-functions',
          title: 'פונקציות רציונליות',
          status: 'planned',
          subchapters: [
            {
              id: 'rational-domain',
              title: 'תחום הגדרה ואסימפטוטות',
              description: 'מציאת תחום ההגדרה והתנהגות הפונקציה.',
              status: 'planned',
            },
            {
              id: 'rational-monotonicity',
              title: 'עלייה וירידה',
              description: 'שימוש בנגזרת לתיאור התנהגות הפונקציה.',
              status: 'planned',
            },
          ],
        },
      ],
    },
    {
      id: 'trigonometry',
      title: 'טריגונומטריה',
      shortTitle: 'טריגונומטריה',
      description: 'פונקציות טריגונומטריות, גרפים ומשוואות.',
      status: 'planned',
      chapters: [
        {
          id: 'trigonometric-functions',
          title: 'פונקציות טריגונומטריות',
          status: 'planned',
          subchapters: [
            { id: 'trig-graphs', title: 'גרפים ותכונות', description: 'היכרות עם הגרפים והתכונות המרכזיות.', status: 'planned' },
            { id: 'trig-equations', title: 'משוואות טריגונומטריות', description: 'פתרון משוואות בתחום נתון.', status: 'planned' },
          ],
        },
      ],
    },
    {
      id: 'analytic-geometry',
      title: 'גאומטריה אנליטית',
      shortTitle: 'גאומטריה אנליטית',
      description: 'מתארים צורות וקשרים גאומטריים באמצעות צירים ומשוואות.',
      status: 'planned',
      chapters: [
        {
          id: 'lines-and-circles',
          title: 'ישרים ומעגלים',
          status: 'planned',
          subchapters: [
            { id: 'line-equation', title: 'משוואת הישר', description: 'שיפוע, נקודות חיתוך ומשוואת ישר.', status: 'planned' },
            { id: 'circle-equation', title: 'משוואת המעגל', description: 'מרכז, רדיוס ומשוואת מעגל.', status: 'planned' },
          ],
        },
      ],
    },
    {
      id: 'algebra-functions',
      title: 'אלגברה ופונקציות',
      shortTitle: 'אלגברה ופונקציות',
      description: 'מחזקים כלים אלגבריים וקריאה של פונקציות.',
      status: 'planned',
      chapters: [
        {
          id: 'function-foundations',
          title: 'יסודות הפונקציה',
          status: 'planned',
          subchapters: [
            { id: 'function-notation', title: 'ייצוג וסימון פונקציות', description: 'מעבר בין ביטוי, טבלה וגרף.', status: 'planned' },
            { id: 'algebraic-manipulation', title: 'טכניקות אלגבריות', description: 'פירוק, צמצום ופתרון משוואות.', status: 'planned' },
          ],
        },
      ],
    },
  ],
};

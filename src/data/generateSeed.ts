import { Tutor, Student, Session, Payment } from '@/types'

// ── Seeded PRNG (Linear Congruential Generator) ─────────────────────
// Deterministic random number generator for reproducible data
class SeededRandom {
  private seed: number
  constructor(seed: number) {
    this.seed = seed
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0x7fffffff
    return this.seed / 0x7fffffff
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)]
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  chance(probability: number): boolean {
    return this.next() < probability
  }
}

const rng = new SeededRandom(42)

// ── Constants ────────────────────────────────────────────────────────
const SUBJECTS = [
  'Mathematics', 'English', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'French', 'Test Prep SAT/ACT',
]

const GRADES = ['G9', 'G10', 'G11', 'G12']

// Demo date reference: Feb 7, 2025 (matches DEMO_TODAY in dates.ts)
const DEMO_TODAY = new Date('2025-02-07T12:00:00')

// Session time slots (hours in 24h format)
const TIME_SLOTS = [9, 10, 11, 13, 14, 15, 16, 17]

// ── Name pools ───────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Alex', 'Emma', 'Noah', 'Olivia', 'Liam', 'Sophia', 'Ethan', 'Isabella',
  'Mason', 'Ava', 'Lucas', 'Mia', 'Aiden', 'Charlotte', 'James', 'Amelia',
  'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'William', 'Abigail', 'Henry',
  'Ella', 'Sebastian', 'Scarlett', 'Jack', 'Grace', 'Owen', 'Lily',
  'Daniel', 'Chloe', 'Matthew', 'Victoria', 'Joseph', 'Riley', 'David',
  'Aria', 'Carter', 'Zoey', 'Wyatt', 'Nora', 'Jayden', 'Hannah', 'Leo',
  'Stella', 'Nathan', 'Penelope', 'Andrew', 'Layla', 'Caleb', 'Ellie',
  'Ryan', 'Camila', 'Adrian', 'Aurora', 'Miles', 'Hazel', 'Eli', 'Violet',
  'Nolan', 'Paisley', 'Christian', 'Savannah', 'Aaron', 'Audrey', 'Isaac',
  'Brooklyn', 'Thomas', 'Claire', 'Evan', 'Lucy', 'Colton', 'Skylar',
  'Jordan', 'Anna', 'Dominic', 'Naomi', 'Austin', 'Aaliyah', 'Connor',
  'Elena', 'Cameron', 'Maya', 'Gavin', 'Madelyn', 'Jaxon', 'Piper',
  'Dylan', 'Ruby', 'Cole', 'Kennedy', 'Asher', 'Sadie', 'Ian', 'Allison',
  'Kai', 'Gabriella', 'Max', 'Samantha',
]

const LAST_NAMES = [
  'Chen', 'Wilson', 'Sharma', 'Martin', "O'Brien", 'Nguyen', 'Tremblay',
  'Santos', 'Park', 'Kowalski', 'Dubois', 'Thompson', 'Rodriguez', 'Lee',
  'Patel', 'Kim', 'Anderson', 'Taylor', 'Brown', 'Davis', 'Miller',
  'Garcia', 'Martinez', 'Johnson', 'Robinson', 'Clark', 'Lewis', 'Walker',
  'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green',
  'Baker', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Phillips', 'Evans',
  'Turner', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Morris', 'Murphy',
  'Rivera', 'Cook', 'Rogers', 'Morgan', 'Bell', 'Cooper', 'Reed',
  'Bailey', 'Cruz', 'Gomez', 'Murray', 'Freeman', 'Wells', 'Webb',
  'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford',
  'Henry', 'Boyd', 'Mason', 'Kennedy', 'Warren', 'Dixon', 'Burns',
  'Gordon', 'Shaw', 'Holmes', 'Rice', 'Robertson', 'Henderson', 'Coleman',
  'Jenkins', 'Perry', 'Powell', 'Long', 'Patterson', 'Hughes', 'Price',
  'Foster', 'Sanders', 'Ross', 'Morales', 'Sullivan', 'Russell', 'Ortiz',
]

const PARENT_FIRST_NAMES = [
  'Wei', 'Karen', 'Raj', 'Claire', 'Sean', 'Minh', 'Marc', 'Maria',
  'Jin', 'Anna', 'Pierre', 'David', 'Linda', 'Michael', 'Sunita',
  'Robert', 'Patricia', 'Tao', 'Sandra', 'Ahmed', 'Jennifer', 'Carlos',
  'Susan', 'Hiroshi', 'Angela', 'Andrei', 'Katherine', 'Yusuf', 'Lisa',
  'George', 'Nancy', 'Francisco', 'Donna', 'Ivan', 'Priya', 'Thomas',
  'Janet', 'Kenji', 'Helen', 'Omar', 'Christine', 'Sergio', 'Laura',
  'Jun', 'Diana', 'Ricardo', 'Ruth', 'Ali', 'Margaret', 'Stephen',
]

// ── Tutor bios for new tutors ────────────────────────────────────────
const NEW_TUTOR_BIOS: Record<string, string> = {
  'Mathematics': 'Passionate about helping students see the beauty in math through intuitive problem-solving approaches.',
  'English': 'Focused on building strong analytical writing and critical reading skills through engaging discussion.',
  'Physics': 'Uses visual demonstrations and real-world examples to make physics concepts click.',
  'Chemistry': 'Breaks down complex reactions into clear, step-by-step processes students can follow.',
  'Biology': 'Connects biology concepts to everyday life to make learning memorable and relevant.',
  'Computer Science': 'Teaches programming through hands-on projects that students actually want to build.',
  'French': 'Creates an immersive learning environment where students build confidence in conversation.',
  'Test Prep SAT/ACT': 'Develops personalized study strategies based on each student\'s strengths and target scores.',
}

// ── Session notes templates ──────────────────────────────────────────
const SESSION_NOTES: Record<string, Record<string, string[]>> = {
  'Mathematics': {
    'G9': [
      'Reviewed linear equations and graphing basics.',
      'Practiced solving systems of equations using substitution.',
      'Worked through area and perimeter word problems.',
      'Introduction to polynomials — adding and subtracting expressions.',
      'Coordinate geometry — plotting points and calculating distance.',
      'Reviewed fractions, decimals, and percentage conversions.',
      'Practiced factoring simple quadratic expressions.',
      'Worked on ratio and proportion word problems.',
      'Explored basic probability with dice and card examples.',
      'Reviewed order of operations and integer arithmetic.',
    ],
    'G10': [
      'Quadratic equations — factoring and the quadratic formula.',
      'Worked through trigonometric ratios (SOH-CAH-TOA).',
      'Reviewed exponent rules and scientific notation.',
      'Practiced graphing parabolas and identifying vertex form.',
      'Analytic geometry — midpoint and distance formulas.',
      'Explored sequences and series — arithmetic patterns.',
      'Worked on function notation and domain/range.',
      'Reviewed similar triangles and proportional reasoning.',
      'Practiced solving linear inequalities and graphing solutions.',
      'Introduction to radicals and simplifying square roots.',
    ],
    'G11': [
      'Reviewed quadratic equations and factoring techniques.',
      'Worked through trigonometric identities.',
      'Derivatives and limits — foundational calculus review.',
      'Worked through logarithmic and exponential functions.',
      'Integration techniques — substitution and basic integrals.',
      'Explored rational functions and asymptotic behavior.',
      'Practiced sequences and series — geometric and arithmetic.',
      'Reviewed transformations of functions and compositions.',
      'Worked on optimization problems using derivatives.',
      'Introduction to vectors in 2D — magnitude and direction.',
    ],
    'G12': [
      'Integration techniques — worked through substitution problems.',
      'Advanced derivatives — chain rule and implicit differentiation.',
      'Pre-calculus review for university preparation.',
      'Explored limits and continuity in depth.',
      'Worked through related rates problems.',
      'Practiced integration by parts and partial fractions.',
      'Reviewed vector operations and dot product applications.',
      'Explored differential equations — separable type.',
      'Worked on curve sketching using calculus techniques.',
      'Reviewed series convergence tests for exam prep.',
    ],
  },
  'English': {
    'G9': [
      'Paragraph structure and topic sentence development.',
      'Reading comprehension strategies — active annotation.',
      'Reviewed parts of speech and sentence structure.',
      'Creative writing exercise — descriptive paragraphs.',
      'Practiced identifying literary devices in short stories.',
      'Worked on thesis statement development for essays.',
      'Reviewed punctuation rules — commas, semicolons, colons.',
      'Discussed narrative techniques in To Kill a Mockingbird.',
    ],
    'G10': [
      'Shakespeare\'s Macbeth — themes and character analysis.',
      'Essay structure and thesis development for comparative analysis.',
      'Practiced persuasive writing techniques and rhetorical devices.',
      'Analyzed symbolism in Lord of the Flies.',
      'Worked on integrating quotes smoothly into essays.',
      'Reviewed MLA citation format and research skills.',
      'Discussed themes of justice in To Kill a Mockingbird.',
      'Practiced peer editing and revision strategies.',
    ],
    'G11': [
      'Essay structure for comparative analysis of Macbeth themes.',
      'Analyzed modernist poetry — Eliot and Yeats.',
      'Worked on argumentative essay structure and evidence use.',
      'Discussed themes in The Great Gatsby — American Dream.',
      'Practiced close reading and annotation techniques.',
      'Reviewed rhetorical analysis framework for non-fiction.',
      'Worked on literary analysis — character development arcs.',
      'Explored postcolonial literature themes and context.',
    ],
    'G12': [
      'University application essay brainstorming and drafting.',
      'Advanced literary analysis — feminist reading of Jane Eyre.',
      'Worked on research paper outline and thesis refinement.',
      'Discussed existentialist themes in The Stranger.',
      'Practiced timed essay writing for exam preparation.',
      'Reviewed academic writing conventions for university prep.',
      'Analyzed poetry — meter, rhyme scheme, and imagery.',
      'Worked on comparative essay between two novels.',
    ],
  },
  'Physics': {
    'G11': [
      'Newton\'s laws of motion — problem set review.',
      'Kinematics problems — velocity, acceleration, and projectile motion.',
      'Work, energy, and power — conservation of energy problems.',
      'Circular motion and centripetal force applications.',
      'Waves and sound — frequency, wavelength, and interference.',
      'Electric circuits — series and parallel resistor calculations.',
      'Reviewed momentum and impulse with collision problems.',
      'Explored thermal physics — heat transfer and calorimetry.',
    ],
    'G12': [
      'Electromagnetic induction — Faraday\'s law applications.',
      'Advanced mechanics — rotational motion and torque.',
      'Modern physics — photoelectric effect and quantum basics.',
      'Gravitational fields and orbital mechanics problems.',
      'Reviewed electric fields and potential difference.',
      'Worked through interference and diffraction patterns.',
      'Nuclear physics — decay equations and half-life calculations.',
      'Explored special relativity concepts and time dilation.',
    ],
  },
  'Chemistry': {
    'G11': [
      'Stoichiometry practice problems and mole calculations.',
      'Atomic structure and electron configuration review.',
      'Chemical bonding — ionic, covalent, and metallic bonds.',
      'Reviewed periodic trends — electronegativity and atomic radius.',
      'Gas laws — Boyle\'s, Charles\'s, and ideal gas law.',
      'Introduction to organic chemistry — naming alkanes.',
      'Balanced equation writing and types of reactions.',
      'Acid-base chemistry — pH calculations and indicators.',
    ],
    'G12': [
      'Equilibrium — Le Chatelier\'s principle and Kc calculations.',
      'Thermochemistry — enthalpy calculations and Hess\'s law.',
      'Electrochemistry — galvanic and electrolytic cells.',
      'Organic chemistry — functional groups and reaction mechanisms.',
      'Kinetics — rate laws and activation energy.',
      'Reviewed buffer solutions and titration curves.',
      'Worked through redox reaction balancing in acidic/basic solutions.',
      'Explored molecular geometry and VSEPR theory.',
    ],
  },
  'Biology': {
    'G9': [
      'Cell biology review — mitosis and meiosis.',
      'Introduction to ecology — food webs and energy flow.',
      'Reviewed classification systems and taxonomy basics.',
      'Explored microscope techniques and cell observation.',
      'Discussed plant biology — photosynthesis overview.',
      'Reviewed body systems — digestive and circulatory.',
    ],
    'G10': [
      'Genetics fundamentals — Punnett squares and inheritance patterns.',
      'DNA structure and replication overview.',
      'Reviewed natural selection and evidence for evolution.',
      'Explored human body systems — nervous system focus.',
      'Discussed population ecology — growth models.',
      'Practiced interpreting scientific data and graphing.',
    ],
    'G11': [
      'Cellular respiration — glycolysis, Krebs cycle, and ETC.',
      'Photosynthesis — light and dark reactions in detail.',
      'Molecular genetics — transcription and translation.',
      'Reviewed evolution — speciation and adaptive radiation.',
      'Explored human physiology — immune system.',
      'Discussed bioethics and genetic engineering.',
    ],
    'G12': [
      'Advanced genetics — gene expression and regulation.',
      'Ecology — community interactions and succession.',
      'Reviewed biotechnology — PCR, gel electrophoresis.',
      'Explored animal behavior and evolutionary psychology.',
      'Discussed conservation biology and biodiversity.',
      'Worked through AP-style biology practice questions.',
    ],
  },
  'Computer Science': {
    'G10': [
      'Intro to Python — variables, loops, and conditionals.',
      'Practiced writing functions and understanding scope.',
      'Worked on simple algorithms — sorting and searching.',
      'Explored HTML/CSS basics for web development.',
      'Discussed computational thinking and problem decomposition.',
      'Built a simple calculator program in Python.',
    ],
    'G11': [
      'Intro to Python data structures — lists and dictionaries.',
      'Object-oriented programming — classes and methods.',
      'Worked on recursion problems and base cases.',
      'Explored file I/O and data processing in Python.',
      'Discussed algorithm efficiency — Big O notation intro.',
      'Built a text-based game using OOP principles.',
    ],
    'G12': [
      'Java OOP concepts — classes, inheritance, and polymorphism.',
      'Data structures — linked lists, stacks, and queues.',
      'Worked through graph algorithms — BFS and DFS.',
      'Reviewed databases — SQL queries and normalization.',
      'Explored API concepts and HTTP request handling.',
      'Practiced coding interview-style problems.',
    ],
  },
  'French': {
    'G9': [
      'French verb conjugation — present tense regular verbs.',
      'Vocabulary building — school and daily routine.',
      'Practiced basic conversation — introductions and greetings.',
      'Reviewed articles and gender in French nouns.',
      'Worked on reading comprehension with simple texts.',
      'Explored French culture through short videos.',
    ],
    'G10': [
      'French verb conjugation — passé composé and imparfait.',
      'Practiced writing short paragraphs about daily life.',
      'Reviewed adjective agreement and placement rules.',
      'Worked on listening comprehension exercises.',
      'Explored idiomatic expressions and their usage.',
      'Discussed a French short story — comprehension questions.',
    ],
    'G11': [
      'Advanced verb tenses — subjunctive mood introduction.',
      'Essay writing in French — argument structure.',
      'Reviewed pronouns — direct, indirect, and relative.',
      'Worked on oral presentation skills and pronunciation.',
      'Analyzed a French poem — literary vocabulary.',
      'Practiced dictée and spelling rules.',
    ],
    'G12': [
      'Advanced composition — opinion essays and critiques.',
      'Reviewed complex grammatical structures for exam prep.',
      'Worked on French literature analysis — thematic discussion.',
      'Practiced speaking fluency with debate exercises.',
      'Explored advanced vocabulary — politics and society.',
      'Reviewed all tenses for comprehensive exam preparation.',
    ],
  },
  'Test Prep SAT/ACT': {
    'G11': [
      'SAT Math section — practice test review and strategies.',
      'ACT English — grammar rules and passage-based questions.',
      'Reviewed SAT Reading — evidence-based answer techniques.',
      'Timed practice — full SAT Math section under test conditions.',
      'Worked on ACT Science — data interpretation strategies.',
      'Discussed test-taking strategies — pacing and elimination.',
    ],
    'G12': [
      'SAT Math section — practice test review and pacing strategies.',
      'Full practice test review — analyzing error patterns.',
      'ACT Math — advanced topics and time management.',
      'SAT Writing — improving style and concision questions.',
      'Reviewed SAT Reading — dual passage comparison strategies.',
      'Final exam prep — targeted review of weak areas.',
    ],
  },
}

// ── Helper: generate a unique name ───────────────────────────────────
const usedNames = new Set<string>()
function uniqueName(): { first: string; last: string; full: string } {
  for (let i = 0; i < 1000; i++) {
    const first = rng.pick(FIRST_NAMES)
    const last = rng.pick(LAST_NAMES)
    const full = `${first} ${last}`
    if (!usedNames.has(full)) {
      usedNames.add(full)
      return { first, last, full }
    }
  }
  // Fallback with suffix
  const first = rng.pick(FIRST_NAMES)
  const last = rng.pick(LAST_NAMES)
  const suffix = rng.nextInt(1, 99)
  const full = `${first} ${last} ${suffix}`
  usedNames.add(full)
  return { first, last: `${last} ${suffix}`, full }
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getSessionNote(subject: string, grade: string): string {
  const subjectNotes = SESSION_NOTES[subject]
  if (!subjectNotes) return ''
  const gradeNotes = subjectNotes[grade]
  if (!gradeNotes) {
    // Try to find the closest grade
    const available = Object.keys(subjectNotes)
    if (available.length === 0) return ''
    return rng.pick(subjectNotes[rng.pick(available)])
  }
  return rng.pick(gradeNotes)
}

// ── Generate Tutors ──────────────────────────────────────────────────
// Keep existing 8 tutors, add 17 new ones

const EXISTING_TUTORS: Tutor[] = [
  {
    id: 't1', name: 'Sarah Mitchell',
    email: 'sarah.m@willstutoring.com',
    bio: 'Fourth-year Mathematics student at the University of Waterloo. I love making calculus click for students who think it\'s impossible. Two years of tutoring experience with a focus on building problem-solving intuition.',
    subjects: [
      { name: 'Mathematics', grades: ['G9', 'G10', 'G11', 'G12'] },
      { name: 'Physics', grades: ['G11', 'G12'] },
    ],
    grades: ['G9', 'G10', 'G11', 'G12'],
    calendlyLink: 'https://calendly.com/sarah-m-tutoring',
    rating: 4.9, totalSessions: 45, joinedDate: '2024-09-01', avatarInitials: 'SM',
  },
  {
    id: 't2', name: 'James Kim',
    email: 'james.k@willstutoring.com',
    bio: 'English Literature major at the University of Toronto. Passionate about helping students find their voice in writing and develop strong analytical reading skills.',
    subjects: [
      { name: 'English', grades: ['G9', 'G10', 'G11', 'G12'] },
      { name: 'French', grades: ['G9', 'G10', 'G11'] },
    ],
    grades: ['G9', 'G10', 'G11', 'G12'],
    calendlyLink: 'https://calendly.com/james-k-tutoring',
    rating: 4.8, totalSessions: 38, joinedDate: '2024-09-15', avatarInitials: 'JK',
  },
  {
    id: 't3', name: 'Priya Patel',
    email: 'priya.p@willstutoring.com',
    bio: 'Biochemistry student at McMaster University. I break down complex science concepts into digestible pieces and connect them to real-world applications students actually care about.',
    subjects: [
      { name: 'Chemistry', grades: ['G11', 'G12'] },
      { name: 'Biology', grades: ['G11', 'G12'] },
    ],
    grades: ['G11', 'G12'],
    calendlyLink: 'https://calendly.com/priya-p-tutoring',
    rating: 4.7, totalSessions: 32, joinedDate: '2024-10-01', avatarInitials: 'PP',
  },
  {
    id: 't4', name: 'Marcus Chen',
    email: 'marcus.c@willstutoring.com',
    bio: 'Computer Science student at the University of Waterloo with co-op experience at Shopify. I teach coding fundamentals and help students build real projects they can be proud of.',
    subjects: [
      { name: 'Computer Science', grades: ['G10', 'G11', 'G12'] },
      { name: 'Mathematics', grades: ['G9', 'G10'] },
    ],
    grades: ['G9', 'G10', 'G11', 'G12'],
    calendlyLink: 'https://calendly.com/marcus-c-tutoring',
    rating: 4.9, totalSessions: 41, joinedDate: '2024-09-10', avatarInitials: 'MC',
  },
  {
    id: 't5', name: 'Emily Rousseau',
    email: 'emily.r@willstutoring.com',
    bio: 'Bilingual French-English tutor studying Linguistics at the University of Ottawa. I make French grammar feel natural through conversation-based learning and cultural immersion.',
    subjects: [
      { name: 'French', grades: ['G9', 'G10', 'G11', 'G12'] },
      { name: 'English', grades: ['G9', 'G10'] },
    ],
    grades: ['G9', 'G10', 'G11', 'G12'],
    calendlyLink: 'https://calendly.com/emily-r-tutoring',
    rating: 4.6, totalSessions: 28, joinedDate: '2024-10-15', avatarInitials: 'ER',
  },
  {
    id: 't6', name: 'David Okonkwo',
    email: 'david.o@willstutoring.com',
    bio: 'Engineering Physics student at Queen\'s University. My approach combines rigorous problem-solving with intuitive visual explanations to make math and physics accessible.',
    subjects: [
      { name: 'Mathematics', grades: ['G11', 'G12'] },
      { name: 'Physics', grades: ['G11', 'G12'] },
    ],
    grades: ['G11', 'G12'],
    calendlyLink: 'https://calendly.com/david-o-tutoring',
    rating: 4.8, totalSessions: 35, joinedDate: '2024-09-20', avatarInitials: 'DO',
  },
  {
    id: 't7', name: 'Aisha Rahman',
    email: 'aisha.r@willstutoring.com',
    bio: 'Pre-med student at Western University with a passion for biology and chemistry. I focus on building strong foundational understanding so students can tackle any exam question with confidence.',
    subjects: [
      { name: 'Biology', grades: ['G9', 'G10', 'G11', 'G12'] },
      { name: 'Chemistry', grades: ['G11', 'G12'] },
    ],
    grades: ['G9', 'G10', 'G11', 'G12'],
    calendlyLink: 'https://calendly.com/aisha-r-tutoring',
    rating: 4.7, totalSessions: 30, joinedDate: '2024-10-05', avatarInitials: 'AR',
  },
  {
    id: 't8', name: 'Lucas Tremblay',
    email: 'lucas.t@willstutoring.com',
    bio: 'Mathematics graduate from McGill University specializing in test preparation. I\'ve helped over 50 students improve their SAT/ACT scores with structured study plans and proven strategies.',
    subjects: [
      { name: 'Test Prep SAT/ACT', grades: ['G11', 'G12'] },
      { name: 'Mathematics', grades: ['G11', 'G12'] },
    ],
    grades: ['G11', 'G12'],
    calendlyLink: 'https://calendly.com/lucas-t-tutoring',
    rating: 4.5, totalSessions: 52, joinedDate: '2024-08-15', avatarInitials: 'LT',
  },
]

// Mark existing names as used
EXISTING_TUTORS.forEach(t => usedNames.add(t.name))

// New tutor subject assignments
const NEW_TUTOR_CONFIGS: { subjects: { name: string; grades: string[] }[] }[] = [
  { subjects: [{ name: 'Mathematics', grades: ['G9', 'G10', 'G11'] }, { name: 'Physics', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'English', grades: ['G9', 'G10', 'G11', 'G12'] }] },
  { subjects: [{ name: 'Chemistry', grades: ['G11', 'G12'] }, { name: 'Biology', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'Computer Science', grades: ['G10', 'G11', 'G12'] }] },
  { subjects: [{ name: 'French', grades: ['G9', 'G10', 'G11'] }, { name: 'English', grades: ['G9', 'G10'] }] },
  { subjects: [{ name: 'Mathematics', grades: ['G10', 'G11', 'G12'] }] },
  { subjects: [{ name: 'Physics', grades: ['G11', 'G12'] }, { name: 'Mathematics', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'Biology', grades: ['G9', 'G10', 'G11'] }] },
  { subjects: [{ name: 'Test Prep SAT/ACT', grades: ['G11', 'G12'] }, { name: 'Mathematics', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'English', grades: ['G10', 'G11', 'G12'] }, { name: 'French', grades: ['G10', 'G11'] }] },
  { subjects: [{ name: 'Chemistry', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'Computer Science', grades: ['G10', 'G11', 'G12'] }, { name: 'Mathematics', grades: ['G9', 'G10'] }] },
  { subjects: [{ name: 'Mathematics', grades: ['G9', 'G10', 'G11', 'G12'] }] },
  { subjects: [{ name: 'Biology', grades: ['G10', 'G11', 'G12'] }, { name: 'Chemistry', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'French', grades: ['G9', 'G10', 'G11', 'G12'] }] },
  { subjects: [{ name: 'Physics', grades: ['G11', 'G12'] }, { name: 'Chemistry', grades: ['G11', 'G12'] }] },
  { subjects: [{ name: 'English', grades: ['G9', 'G10', 'G11'] }, { name: 'Test Prep SAT/ACT', grades: ['G11', 'G12'] }] },
]

function generateNewTutors(): Tutor[] {
  const newTutors: Tutor[] = []
  for (let i = 0; i < 17; i++) {
    const { full } = uniqueName()
    const config = NEW_TUTOR_CONFIGS[i]
    const allGrades = new Set<string>()
    config.subjects.forEach(s => s.grades.forEach(g => allGrades.add(g)))

    // Rating: most tutors 4.5+, one will be the rating outlier (t17 = index 8 → id t17)
    let rating: number
    if (i === 8) {
      // Rating outlier tutor — 4.1
      rating = 4.1
    } else {
      rating = parseFloat((4.5 + rng.next() * 0.4).toFixed(1))
    }

    const emailName = full.toLowerCase().replace(/[^a-z ]/g, '').split(' ').slice(0, 2).join('.')
    const bio = NEW_TUTOR_BIOS[config.subjects[0].name] ||
      'Dedicated tutor with a passion for helping students succeed.'

    newTutors.push({
      id: `t${9 + i}`,
      name: full,
      email: `${emailName}@willstutoring.com`,
      bio,
      subjects: config.subjects,
      grades: Array.from(allGrades).sort(),
      calendlyLink: `https://calendly.com/${emailName.replace('.', '-')}-tutoring`,
      rating,
      totalSessions: rng.nextInt(15, 50),
      joinedDate: `2024-${String(rng.nextInt(8, 10)).padStart(2, '0')}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
      avatarInitials: getInitials(full),
    })
  }
  return newTutors
}

// ── Generate Students ────────────────────────────────────────────────
// Keep existing 12, add 188 new ones

const EXISTING_STUDENTS: Student[] = [
  { id: 'st1', name: 'Alex Chen', email: 'alex.chen@student.com', grade: 'G11', parentName: 'Wei Chen', parentEmail: 'wei.chen@email.com', joinedDate: '2024-09-05' },
  { id: 'st2', name: 'Emma Wilson', email: 'emma.wilson@student.com', grade: 'G10', parentName: 'Karen Wilson', parentEmail: 'karen.wilson@email.com', joinedDate: '2024-09-10' },
  { id: 'st3', name: 'Noah Sharma', email: 'noah.sharma@student.com', grade: 'G12', parentName: 'Raj Sharma', parentEmail: 'raj.sharma@email.com', joinedDate: '2024-09-12' },
  { id: 'st4', name: 'Olivia Martin', email: 'olivia.martin@student.com', grade: 'G9', parentName: 'Claire Martin', parentEmail: 'claire.martin@email.com', joinedDate: '2024-10-01' },
  { id: 'st5', name: 'Liam O\'Brien', email: 'liam.obrien@student.com', grade: 'G11', parentName: 'Sean O\'Brien', parentEmail: 'sean.obrien@email.com', joinedDate: '2024-09-18' },
  { id: 'st6', name: 'Sophia Nguyen', email: 'sophia.nguyen@student.com', grade: 'G10', parentName: 'Minh Nguyen', parentEmail: 'minh.nguyen@email.com', joinedDate: '2024-10-05' },
  { id: 'st7', name: 'Ethan Tremblay', email: 'ethan.tremblay@student.com', grade: 'G12', parentName: 'Marc Tremblay', parentEmail: 'marc.tremblay@email.com', joinedDate: '2024-09-25' },
  { id: 'st8', name: 'Isabella Santos', email: 'isabella.santos@student.com', grade: 'G9', parentName: 'Maria Santos', parentEmail: 'maria.santos@email.com', joinedDate: '2024-10-10' },
  { id: 'st9', name: 'Mason Park', email: 'mason.park@student.com', grade: 'G11', parentName: 'Jin Park', parentEmail: 'jin.park@email.com', joinedDate: '2024-09-30' },
  { id: 'st10', name: 'Ava Kowalski', email: 'ava.kowalski@student.com', grade: 'G10', parentName: 'Anna Kowalski', parentEmail: 'anna.kowalski@email.com', joinedDate: '2024-10-08' },
  { id: 'st11', name: 'Lucas Dubois', email: 'lucas.dubois@student.com', grade: 'G12', parentName: 'Pierre Dubois', parentEmail: 'pierre.dubois@email.com', joinedDate: '2024-10-12' },
  { id: 'st12', name: 'Mia Thompson', email: 'mia.thompson@student.com', grade: 'G11', parentName: 'David Thompson', parentEmail: 'david.thompson@email.com', joinedDate: '2024-09-22' },
]

// Mark existing student names as used
EXISTING_STUDENTS.forEach(s => usedNames.add(s.name))

function generateNewStudents(): Student[] {
  const students: Student[] = []
  // Distribute ~47 per grade across 188 new students (existing 12 bring us to ~50 each)
  const gradeTargets = { 'G9': 48, 'G10': 47, 'G11': 46, 'G12': 47 }
  const existingCounts = { 'G9': 2, 'G10': 3, 'G11': 4, 'G12': 3 }
  const needed = {
    'G9': gradeTargets['G9'] - existingCounts['G9'],
    'G10': gradeTargets['G10'] - existingCounts['G10'],
    'G11': gradeTargets['G11'] - existingCounts['G11'],
    'G12': gradeTargets['G12'] - existingCounts['G12'],
  }

  let id = 13
  for (const grade of GRADES) {
    const count = needed[grade as keyof typeof needed]
    for (let i = 0; i < count; i++) {
      const { full, first, last } = uniqueName()
      const parentFirst = rng.pick(PARENT_FIRST_NAMES)
      const emailName = full.toLowerCase().replace(/[' ]/g, '.').replace(/[^a-z.]/g, '')
      const parentEmailName = `${parentFirst.toLowerCase()}.${last.toLowerCase().replace(/[' ]/g, '.').replace(/[^a-z.]/g, '')}`

      students.push({
        id: `st${id}`,
        name: full,
        email: `${emailName}@student.com`,
        grade,
        parentName: `${parentFirst} ${last}`,
        parentEmail: `${parentEmailName}@email.com`,
        joinedDate: `2024-${String(rng.nextInt(9, 11)).padStart(2, '0')}-${String(rng.nextInt(1, 28)).padStart(2, '0')}`,
      })
      id++
    }
  }

  return students
}

// ── Generate Sessions ────────────────────────────────────────────────
// ~2000 sessions spanning Sep 2024 – Feb 2025

function generateSessions(tutors: Tutor[], students: Student[]): Session[] {
  const sessions: Session[] = []
  let sessionId = 1

  // Build tutor-subject-grade lookup for valid assignments
  function getValidSubject(tutor: Tutor, studentGrade: string): string | null {
    const valid = tutor.subjects.filter(s => s.grades.includes(studentGrade))
    if (valid.length === 0) return null
    return rng.pick(valid).name
  }

  // Assign students to tutors (each student gets 1-3 tutors)
  const studentTutorMap = new Map<string, string[]>()
  for (const student of students) {
    const compatibleTutors = tutors.filter(t =>
      t.subjects.some(s => s.grades.includes(student.grade))
    )
    if (compatibleTutors.length === 0) continue
    const numTutors = rng.nextInt(1, Math.min(3, compatibleTutors.length))
    const assigned = rng.shuffle(compatibleTutors).slice(0, numTutors)
    studentTutorMap.set(student.id, assigned.map(t => t.id))
  }

  // ── Pattern: Overloaded tutor (t1 assigned to 18+ students) ──
  // Force many students to have t1 as a tutor
  const t1Students = new Set<string>()
  studentTutorMap.forEach((tids, sid) => {
    if (tids.includes('t1')) t1Students.add(sid)
  })
  // Ensure at least 22 students are assigned to t1
  const allStudentIds = students.map(s => s.id)
  const shuffledStudents = rng.shuffle(allStudentIds)
  for (const sid of shuffledStudents) {
    if (t1Students.size >= 22) break
    const student = students.find(s => s.id === sid)!
    if (t1Students.has(sid)) continue
    const t1 = tutors.find(t => t.id === 't1')!
    if (t1.subjects.some(s => s.grades.includes(student.grade))) {
      const existing = studentTutorMap.get(sid) || []
      if (!existing.includes('t1')) {
        existing.push('t1')
        studentTutorMap.set(sid, existing)
      }
      t1Students.add(sid)
    }
  }

  // ── Define special pattern student sets ──
  // Attendance decline cluster: students st13-st19 (7 students)
  const attendanceDeclineStudents = new Set(['st13', 'st14', 'st15', 'st16', 'st17', 'st18', 'st19'])

  // Inactive students: st20-st26 (7 students) — no sessions after Dec 2024
  const inactiveStudents = new Set(['st20', 'st21', 'st22', 'st23', 'st24', 'st25', 'st26'])

  // Chronic late payers: st27, st28, st29
  const chronicLatePayerStudents = new Set(['st27', 'st28', 'st29'])

  // High no-show tutor: t10
  const highNoShowTutor = 't10'

  // Tutor payout backlog tutor: t9
  const payoutBacklogTutor = 't9'

  // ── Generate sessions month by month ──
  // Sep 2024 (month 0) through Feb 2025 (month 5)
  const months = [
    { year: 2024, month: 9, label: 'Sep 2024' },
    { year: 2024, month: 10, label: 'Oct 2024' },
    { year: 2024, month: 11, label: 'Nov 2024' },
    { year: 2024, month: 12, label: 'Dec 2024' },
    { year: 2025, month: 1, label: 'Jan 2025' },
    { year: 2025, month: 2, label: 'Feb 2025' },
  ]

  for (let mi = 0; mi < months.length; mi++) {
    const { year, month } = months[mi]
    const daysInMonth = new Date(year, month, 0).getDate()

    // Seasonal dip: December sessions drop ~40%
    const isDecember = month === 12
    // Base: ~350 sessions/month to hit ~2000 total across 6 months
    // Feb is partial (only up to Feb 7), so reduce
    const isFeb = month === 2
    let targetSessions = 370
    if (isDecember) targetSessions = 220 // ~40% drop
    if (isFeb) targetSessions = 90 // Partial month (7 days out of 28)

    let monthSessions = 0

    // Generate sessions for each student this month
    for (const student of students) {
      const tutorIds = studentTutorMap.get(student.id)
      if (!tutorIds || tutorIds.length === 0) continue

      // Inactive students: only generate sessions Sep-Nov
      if (inactiveStudents.has(student.id) && mi > 2) continue

      // How many sessions this student has this month (1-3 typically)
      let sessionsThisMonth = rng.nextInt(1, 3)

      // G12 students get more Test Prep sessions
      if (student.grade === 'G12' && mi >= 3) {
        sessionsThisMonth = rng.nextInt(2, 4) // Grade 12 test prep surge
      }

      // Cap to not overshoot monthly target
      if (monthSessions + sessionsThisMonth > targetSessions) {
        sessionsThisMonth = Math.max(0, targetSessions - monthSessions)
      }
      if (sessionsThisMonth === 0) continue

      for (let si = 0; si < sessionsThisMonth; si++) {
        const tutorId = rng.pick(tutorIds)
        const tutor = tutors.find(t => t.id === tutorId)!
        const subject = getValidSubject(tutor, student.grade)
        if (!subject) continue

        // G12 Test Prep surge: bias towards Test Prep and Math
        let finalSubject = subject
        if (student.grade === 'G12' && mi >= 3 && rng.chance(0.4)) {
          const testPrepTutor = tutorIds.find(tid => {
            const t = tutors.find(tt => tt.id === tid)!
            return t.subjects.some(s => s.name === 'Test Prep SAT/ACT' && s.grades.includes('G12'))
          })
          if (testPrepTutor) {
            finalSubject = 'Test Prep SAT/ACT'
          }
        }

        // Pick a date
        const maxDay = isFeb ? 7 : daysInMonth
        const day = rng.nextInt(1, maxDay)
        const dayOfWeek = new Date(year, month - 1, day).getDay()
        const hour = rng.pick(TIME_SLOTS)
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`

        // Determine status
        const sessionDate = new Date(dateStr)
        const isPastSession = sessionDate <= DEMO_TODAY

        let status: Session['status']
        if (!isPastSession) {
          status = 'scheduled'
        } else {
          // Tuesday 4pm anomaly: 40% cancel/no-show
          const isTue4pm = dayOfWeek === 2 && hour === 16
          if (isTue4pm) {
            if (rng.chance(0.40)) {
              status = rng.chance(0.5) ? 'cancelled' : 'no-show'
            } else {
              status = 'completed'
            }
          }
          // Attendance decline cluster
          else if (attendanceDeclineStudents.has(student.id)) {
            if (mi <= 2) {
              // Months 1-3: 90% completion
              status = rng.chance(0.90) ? 'completed' : (rng.chance(0.5) ? 'cancelled' : 'no-show')
            } else {
              // Months 4-6: 50% completion
              status = rng.chance(0.50) ? 'completed' : (rng.chance(0.5) ? 'cancelled' : 'no-show')
            }
          }
          // High no-show tutor: 15% no-show rate
          else if (tutorId === highNoShowTutor) {
            if (rng.chance(0.15)) {
              status = 'no-show'
            } else if (rng.chance(0.05)) {
              status = 'cancelled'
            } else {
              status = 'completed'
            }
          }
          // Normal distribution
          else {
            if (rng.chance(0.85)) {
              status = 'completed'
            } else if (rng.chance(0.5)) {
              status = 'cancelled'
            } else {
              status = 'no-show'
            }
          }
        }

        // Notes: only for completed sessions
        const notes = status === 'completed'
          ? getSessionNote(finalSubject, student.grade)
          : ''

        sessions.push({
          id: `s${sessionId}`,
          studentId: student.id,
          tutorId: tutorId,
          subject: finalSubject,
          date: dateStr,
          duration: 60,
          status,
          price: 50,
          notes,
        })

        sessionId++
        monthSessions++
      }
    }
  }

  return sessions
}

// ── Generate Payments ────────────────────────────────────────────────

function generatePayments(sessions: Session[]): Payment[] {
  const payments: Payment[] = []
  let paymentId = 1

  // Chronic late payers
  const chronicLatePayerStudents = new Set(['st27', 'st28', 'st29'])

  // Missing payment records: skip 3 specific completed sessions
  const missingPaymentSessions = new Set<string>()
  const completedSessions = sessions.filter(s => s.status === 'completed')
  // Pick 3 completed sessions to have no payment record
  if (completedSessions.length >= 3) {
    const shuffled = rng.shuffle(completedSessions.map(s => s.id))
    missingPaymentSessions.add(shuffled[0])
    missingPaymentSessions.add(shuffled[1])
    missingPaymentSessions.add(shuffled[2])
  }

  // Tutor payout backlog: t9 — student paid but tutor not paid for 8+ sessions
  const t9BacklogCount = { current: 0, target: 10 }

  for (const session of sessions) {
    // Skip scheduled (future) sessions — no payment yet
    if (session.status === 'scheduled') continue

    // Missing payment records pattern
    if (missingPaymentSessions.has(session.id)) continue

    const isCancelledOrNoShow = session.status === 'cancelled' || session.status === 'no-show'
    const amount = isCancelledOrNoShow ? 0 : 50
    const tutorAmount = isCancelledOrNoShow ? 0 : 25

    let studentPaid = false
    let tutorPaid = false

    if (!isCancelledOrNoShow) {
      // Chronic late payers: 60%+ unpaid
      if (chronicLatePayerStudents.has(session.studentId)) {
        studentPaid = rng.chance(0.35) // Only 35% chance of being paid
        tutorPaid = studentPaid ? rng.chance(0.5) : false
      }
      // Tutor payout backlog for t9
      else if (session.tutorId === 't9' && t9BacklogCount.current < t9BacklogCount.target) {
        studentPaid = true
        tutorPaid = false
        t9BacklogCount.current++
      }
      // Normal payment distribution
      else {
        // Most sessions are paid (~80% student paid)
        studentPaid = rng.chance(0.82)
        if (studentPaid) {
          // If student paid, tutor usually paid too (~75%)
          tutorPaid = rng.chance(0.75)
        }
      }
    }

    payments.push({
      id: `p${paymentId}`,
      sessionId: session.id,
      amount,
      studentPaid,
      tutorPaid,
      tutorAmount,
      createdAt: session.date.split('T')[0],
    })

    paymentId++
  }

  return payments
}

// ── Main generation (singleton) ──────────────────────────────────────

let _cache: {
  tutors: Tutor[]
  students: Student[]
  sessions: Session[]
  payments: Payment[]
} | null = null

function generateAll() {
  if (_cache) return _cache

  const newTutors = generateNewTutors()
  const allTutors = [...EXISTING_TUTORS, ...newTutors]

  const newStudents = generateNewStudents()
  const allStudents = [...EXISTING_STUDENTS, ...newStudents]

  const allSessions = generateSessions(allTutors, allStudents)
  const allPayments = generatePayments(allSessions)

  _cache = {
    tutors: allTutors,
    students: allStudents,
    sessions: allSessions,
    payments: allPayments,
  }

  return _cache
}

// ── Exports ──────────────────────────────────────────────────────────

export const generatedTutors: Tutor[] = generateAll().tutors
export const generatedStudents: Student[] = generateAll().students
export const generatedSessions: Session[] = generateAll().sessions
export const generatedPayments: Payment[] = generateAll().payments

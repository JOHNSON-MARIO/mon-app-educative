// ================= ÉTAT & CONFIG =================
let appContent = null;
let currentClasse = "";
let currentCompId = "";
let currentThemeId = "";
let currentLesson = null;

let quizQuestions = [];
let currentQuestion = 0;
let score = 0;

// Progression sauvegardée
let userProgress = JSON.parse(localStorage.getItem('eduProgress')) || {};

// ================= CHARGEMENT =================
async function loadAppData() {
  try {
    const res = await fetch('data/content-maths-6e.json');
    appContent = await res.json();
    console.log("✅ Contenu chargé:", appContent.meta);
  } catch (err) {
    console.error("❌ Erreur chargement JSON:", err);
    alert("Impossible de charger le contenu pédagogique. Vérifiez le chemin du fichier JSON.");
  }
}

// ================= NAVIGATION =================
function selectClasse(classe) {
  currentClasse = classe;
  showSection('matieres');
  renderMatières();
}

function renderMatières() {
  const container = document.getElementById('matieres-list');
  container.innerHTML = `
    <button onclick="selectSubject('maths')" class="subject-btn">📐 Mathématiques</button>
    <button onclick="alert('Bientôt disponible')" class="subject-btn" disabled>📖 Français</button>
    <button onclick="alert('Bientôt disponible')" class="subject-btn" disabled>🌍 Anglais</button>
    <button onclick="alert('Bientôt disponible')" class="subject-btn" disabled>🔬 SVT</button>
    <button onclick="alert('Bientôt disponible')" class="subject-btn" disabled>⚛️ Physique</button>
  `;
}

function selectSubject(subject) {
  if (!appContent) return;
  currentCompId = "";
  currentThemeId = "";
  showSection('competences');
  renderCompetences();
}

function renderCompetences() {
  const container = document.getElementById('competences-list');
  container.innerHTML = "";
  appContent.competencies.forEach(comp => {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.innerHTML = `🎯 ${comp.name}`;
    btn.onclick = () => selectCompetency(comp.id);
    container.appendChild(btn);
  });
}

function selectCompetency(compId) {
  currentCompId = compId;
  showSection('themes');
  renderThemes();
}

function renderThemes() {
  const comp = appContent.competencies.find(c => c.id === currentCompId);
  const container = document.getElementById('themes-list');
  container.innerHTML = "";
  comp.themes.forEach(theme => {
    const done = getThemeProgress(theme.id);
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.innerHTML = `📖 ${theme.name} <span class="badge">${done}/${theme.lessons.length}</span>`;
    btn.onclick = () => selectTheme(theme.id);
    container.appendChild(btn);
  });
}

function selectTheme(themeId) {
  currentThemeId = themeId;
  showSection('lecons');
  renderLecons();
}

function renderLecons() {
  const comp = appContent.competencies.find(c => c.id === currentCompId);
  const theme = comp.themes.find(t => t.id === currentThemeId);
  const container = document.getElementById('lecons-list');
  container.innerHTML = "";
  theme.lessons.forEach(lesson => {
    const isDone = userProgress[lesson.id]?.completed;
    const btn = document.createElement('button');
    btn.className = `nav-btn ${isDone ? 'completed' : ''}`;
    btn.innerText = isDone ? `✅ ${lesson.title}` : `📝 ${lesson.title}`;
    btn.onclick = () => openLesson(lesson);
    container.appendChild(btn);
  });
}

// ================= COURS =================
function openLesson(lesson) {
  currentLesson = lesson;
  showSection('cours');
  document.getElementById('cours-title').innerText = lesson.title;
  
  document.getElementById('contenuCours').innerHTML = `
    <h3>🎯 Objectifs</h3>
    <ul>${lesson.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
    <h3>📖 Théorie</h3>
    <p>${lesson.content.theory}</p>
    <h3>📝 Exemples</h3>
    <ul>${lesson.content.examples.map(e => `<li>${e}</li>`).join('')}</ul>
    <div class="tip-box">💡 <strong>Astuce :</strong> ${lesson.content.tips}</div>
  `;
}

// ================= QUIZ =================
function startQuiz() {
  showSection('quiz');
  currentQuestion = 0;
  score = 0;
  quizQuestions = generateMockQuestions(currentLesson);
  updateProgressUI();
  showQuestion();
}

function generateMockQuestions(lesson) {
  const questions = [];
  for (let i = 0; i < lesson.quiz.count; i++) {
    questions.push({
      question: `[${lesson.title}] Question ${i + 1}/${lesson.quiz.count}`,
      answers: ["Proposition A", "Proposition B", "Proposition C"],
      correct: Math.floor(Math.random() * 3)
    });
  }
  return questions;
}

function showQuestion() {
  const q = quizQuestions[currentQuestion];
  document.getElementById('question').innerText = q.question;
  
  const answersDiv = document.getElementById('answers');
  answersDiv.innerHTML = "";
  document.getElementById('feedback').className = 'feedback hidden';
  document.getElementById('next-btn').className = 'btn-next hidden';

  q.answers.forEach((ans, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerText = ans;
    btn.onclick = () => handleAnswer(idx, btn);
    answersDiv.appendChild(btn);
  });
  updateProgressUI();
}

function handleAnswer(idx, btn) {
  const q = quizQuestions[currentQuestion];
  const isCorrect = idx === q.correct;
  if (isCorrect) score++;

  btn.classList.add(isCorrect ? 'correct' : 'incorrect');
  const fb = document.getElementById('feedback');
  fb.innerText = isCorrect ? "✅ Bonne réponse !" : `❌ La bonne réponse était : ${q.answers[q.correct]}`;
  fb.className = isCorrect ? 'feedback success' : 'feedback error';
  fb.classList.remove('hidden');

  document.querySelectorAll('.answer-btn').forEach(b => b.disabled = true);
  document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function updateProgressUI() {
  const bar = document.getElementById('progress-bar');
  const txt = document.getElementById('question-count');
  const total = quizQuestions.length;
  bar.max = total;
  bar.value = currentQuestion + 1;
  txt.innerText = `Question ${currentQuestion + 1}/${total}`;
}

function showResults() {
  showSection('resultat');
  const percent = Math.round((score / quizQuestions.length) * 100);
  const passed = score >= currentLesson.quiz.passingScore;

  const scoreEl = document.getElementById('score');
  scoreEl.innerHTML = `
    📊 Score final : <strong>${score}/${quizQuestions.length}</strong> (${percent}%)<br>
    ${passed 
      ? '<span class="status-pass">🎉 Leçon validée !</span>' 
      : '<span class="status-fail">🔄 À retravailler</span>'}
  `;

  if (passed) {
    userProgress[currentLesson.id] = { completed: true, score: percent, date: new Date().toISOString() };
    localStorage.setItem('eduProgress', JSON.stringify(userProgress));
    document.getElementById('retry-btn').classList.add('hidden');
  } else {
    document.getElementById('retry-btn').classList.remove('hidden');
  }
}

// ================= UTILITAIRES =================
function getThemeProgress(themeId) {
  let count = 0;
  appContent.competencies.forEach(comp => {
    comp.themes.forEach(theme => {
      if (theme.id === themeId) {
        theme.lessons.forEach(l => {
          if (userProgress[l.id]?.completed) count++;
        });
      }
    });
  });
  return count;
}

function showSection(id) {
  document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function backTo(section) {
  showSection(section);
  if (section === 'matieres') renderMatières();
  if (section === 'competences') renderCompetences();
  if (section === 'themes') renderThemes();
  if (section === 'lecons') renderLecons();
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', () => {
  loadAppData();
});

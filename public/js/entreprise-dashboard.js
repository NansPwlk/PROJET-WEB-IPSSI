document.addEventListener('DOMContentLoaded', function() {
  loadEnterpriseInfo();
  loadSurveys();
});

async function loadEnterpriseInfo() {
  try {
      const response = await fetch('/php/entreprise/get_enterprise_info.php');
      const data = await response.json();

      if (data.success) {
          document.getElementById('enterpriseName').textContent = `${data.enterprise.name}`;
      }
  } catch (error) {
      console.error('Erreur lors du chargement des informations:', error);
  }
}

async function loadSurveys() {
  try {
      const response = await fetch('/php/entreprise/get_enterprise_surveys.php');
      const data = await response.json();

      const quizList = document.getElementById('quizList');
      if (data.success && data.surveys) {
          quizList.innerHTML = data.surveys.map(survey => createSurveyCard(survey)).join('');
      }
  } catch (error) {
      console.error('Erreur lors du chargement des sondages:', error);
  }
}

function createSurveyCard(survey) {
  return `
      <div class="survey-card">
          <h3>${survey.title}</h3>
          <p>${survey.description}</p>
          <div class="survey-actions">
              <button onclick="viewSurvey('${survey.id}')">Voir les résultats</button>
          </div>
      </div>
  `;
}

function viewSurvey(surveyId) {
  window.location.href = `/public/survey-results.html?id=${surveyId}`;
}
async function createNewQuiz() {
  window.location.href = '/public/create-quiz.html';
}


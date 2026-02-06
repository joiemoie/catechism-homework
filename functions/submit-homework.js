// Using native fetch (Node 18+) to avoid external dependencies
// This keeps the function "light" and avoids "npm install" issues if users dislike Node.

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const body = JSON.parse(event.body);
  const userAnswers = body.answers || {};
  
  // Debug: Log received answers to the terminal
  console.log("Received submission:", JSON.stringify(userAnswers, null, 2));
  
  // --- Configuration ---
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    // Return a friendly error so the UI handles it gracefully
    console.error("Missing GEMINI_API_KEY environment variable");
    return { 
        statusCode: 200, 
        body: JSON.stringify({ 
            totalScore: 0, 
            maxScore: 0, 
            results: [{ 
                id: "error", 
                text: "Configuration Error", 
                type: "error", 
                userAnswer: "N/A", 
                points: 0, 
                maxPoints: 0, 
                analysis: "Server missing API Key. Please contact administrator.", 
                sampleAnswer: "N/A" 
            }]
        }) 
    };
  }

  // --- Answer Key & Rubric ---
  const questions = [
    { id: "book_title", type: "radio", points: 2, correct: "The Imitation of Christ", text: "Book by Thomas à Kempis?" },
    { id: "goretti_dream", type: "radio", points: 2, correct: "14 Lilies", text: "Maria Goretti's gift in the dream?" },
    { id: "contemplative_def", type: "radio", points: 2, correct: "Silent gaze", text: "Definition of Contemplative Prayer?" },
    { id: "praise_vs_thanks", type: "radio", points: 2, correct: "Gift vs Being", text: "Thanksgiving vs Praise?" },
    { id: "prayer_form_intercession", type: "radio", points: 2, correct: "Intercession", text: "Prayer for others?" },
    { id: "daily_bread", type: "radio", points: 2, correct: "Spiritual and physical", text: "Daily Bread meaning?" },
    { id: "dryness_response", type: "radio", points: 2, correct: "Persevere", text: "Response to dryness in prayer?" },
    { id: "sacramentals_def", type: "radio", points: 2, correct: "Prepare grace", text: "Sacramentals vs Sacraments?" },
    { id: "sacramental_examples", type: "checkbox", points: 3, correct: ["Holy Water", "Ashes", "Rosary", "May Crowning"], text: "Examples of Sacramentals" },
    { id: "may_crowning", type: "open", points: 5, text: "What does May Crowning symbolize?" },
    { id: "meditative_vs_contemplative", type: "open", points: 5, text: "Difference between Meditative and Contemplative prayer?" },
    { id: "god_argument", type: "radio", points: 2, correct: "Argument from Fine Tuning", text: "Argument from precise physical constants?" },
    { id: "animals_morality", type: "radio", points: 2, correct: "Cruelty vs Stewardship", text: "Morality regarding animals?" },
    { id: "collective_guilt", type: "radio", points: 2, correct: "Personal Responsibility", text: "Christian view on collective guilt?" },
    { id: "basil_hospitals", type: "radio", points: 2, correct: "Commandment of Love", text: "Motivation for first hospitals?" },
    { id: "judging_lie", type: "radio", points: 2, correct: "Hypocrisy vs Truth", text: "Catholic response to 'Don't judge'?" },
    { id: "definition_goodness", type: "radio", points: 2, correct: "Aligned with Nature", text: "Definition of 'Good'?" },
    { id: "moral_act_parts", type: "checkbox", points: 3, correct: ["The Object Chosen", "The Intention", "The Circumstances"], text: "Three parts of a moral act" },
    { id: "conflict_reality", type: "open", points: 5, text: "Reality of conflict vs Oppressor/Oppressed?" },
    { id: "practical_steps", type: "checkbox", points: 3, correct: ["Priest", "Fr Mike Schmitz", "Catholic Friends", "Catechism and Scripture"], text: "Practical steps to a good life" },
  ];

  let totalScore = 0;
  let maxScore = 0;
  const results = [];
  let holisticFeedback = "No AI feedback generated.";

  // --- Grading Logic ---
  for (const q of questions) {
    maxScore += q.points;
    const userAnswer = userAnswers[q.id];

    if (q.type === "radio") {
      const isCorrect = userAnswer === q.correct;
      const pointsEarned = isCorrect ? q.points : 0;
      totalScore += pointsEarned;
      results.push({
        id: q.id,
        text: q.text,
        type: q.type,
        userAnswer: userAnswer || "No Answer",
        correctAnswer: q.correct,
        isCorrect,
        points: pointsEarned,
        maxPoints: q.points
      });
    } 
    else if (q.type === "checkbox") {
      const userList = Array.isArray(userAnswer) ? userAnswer : [];
      const correctList = q.correct;
      
      const intersection = userList.filter(item => correctList.includes(item));
      const wrongSelections = userList.filter(item => !correctList.includes(item));
      
      let rawScore = (intersection.length / correctList.length) * q.points;
      if (wrongSelections.length > 0) rawScore -= (0.5 * wrongSelections.length); 
      if (rawScore < 0) rawScore = 0;
      
      const pointsEarned = Math.round(rawScore * 10) / 10;
      totalScore += pointsEarned;

      results.push({
        id: q.id,
        text: q.text,
        type: q.type,
        userAnswer: userList.join(", "),
        correctAnswer: correctList.join(", "),
        isCorrect: pointsEarned === q.points, 
        points: pointsEarned,
        maxPoints: q.points
      });
    }
    else if (q.type === "open") {
      results.push({
        id: q.id,
        text: q.text,
        type: q.type,
        userAnswer: userAnswer || "No Answer",
        maxPoints: q.points,
        needsAi: true
      });
    }
  }

  // --- AI Grading & Holistic Feedback ---
  // We send the objective results context AND the open questions to grade
  const openQuestions = results.filter(r => r.needsAi);
  const objectiveResults = results.filter(r => !r.needsAi);

  const promptText = `
    You are a Catholic theology teacher grading confirmation homework.
    
    TASK 1: Grade the following ${openQuestions.length} open-ended student answers.
    For each answer, provide:
    - A score from 0 to MAX_POINTS based on accuracy and depth (integers only).
    - A brief, encouraging, but corrective feedback analysis (1-2 sentences).
    - A sample "perfect" answer.

    TASK 2: Provide a "Holistic Feedback" summary for the student.
    - Review the "Objective Results" (Multiple Choice/Checkbox) provided below to see what they got Right/Wrong.
    - Review their Open-Ended answers.
    - Write a short paragraph (3-4 sentences) addressing the student directly. Praise their strengths (topics they know) and gently point out areas to review (topics they missed). Be encouraging!

    --- DATA ---
    
    [Objective Results Context]:
    ${objectiveResults.map(r => `- Q: "${r.text}" | Student Answer: "${r.userAnswer}" | Correct: ${r.isCorrect ? "YES" : "NO"} (Correct Answer: ${r.correctAnswer})`).join("\n")}

    [Open-Ended Questions to Grade]:
    ${openQuestions.map(q => JSON.stringify({ id: q.id, question: q.text, max_points: q.maxPoints, student_answer: q.userAnswer })).join(",\n")}

    --- OUTPUT FORMAT ---
    Return a SINGLE JSON object strictly following this structure:
    {
      "grades": [
        { "id": "question_id", "score": 5, "analysis": "...", "sample_answer": "..." },
        ...
      ],
      "holistic_feedback": "Dear Student, excellent work on... You might want to review..."
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No content returned from Gemini");

    // Clean markdown JSON if present
    if (text.startsWith("```json")) text = text.replace("```json", "").replace("```", "");
    else if (text.startsWith("```")) text = text.replace("```", "").replace("```", "");

    const aiOutput = JSON.parse(text);
    
    // Process Grades
    if (aiOutput.grades && Array.isArray(aiOutput.grades)) {
        aiOutput.grades.forEach(grade => {
          const target = results.find(r => r.id === grade.id);
          if (target) {
            target.points = grade.score;
            target.analysis = grade.analysis;
            target.sampleAnswer = grade.sample_answer;
            totalScore += grade.score;
            delete target.needsAi;
          }
        });
    }

    // Capture Holistic Feedback
    if (aiOutput.holistic_feedback) {
        holisticFeedback = aiOutput.holistic_feedback;
    }

  } catch (error) {
    console.error("AI Grading Error:", error);
    openQuestions.forEach(q => {
      q.points = 0;
      q.analysis = `Error connecting to grading assistant: ${error.message}`;
      q.sampleAnswer = "N/A";
      delete q.needsAi;
    });
    holisticFeedback = `Error generating AI feedback: ${error.message}`;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      totalScore: Math.round(totalScore * 10) / 10,
      maxScore,
      results,
      holisticFeedback // <--- Sending this to the frontend
    })
  };
};

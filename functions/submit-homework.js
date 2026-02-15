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
    { id: "q1_holiness", type: "radio", points: 5, correct: "B", text: "1. The universal call to holiness teaches that:" },
    { id: "q2_precept", type: "radio", points: 5, correct: "C", text: "2. Which of the following is a required precept of the Church?" },
    { id: "q3_elements", type: "radio", points: 5, correct: "B", text: "3. The three elements of a moral act are:" },
    { id: "q4_evil", type: "radio", points: 5, correct: "C", text: "4. If the object of an act is intrinsically evil:" },
    { id: "q5_lever", type: "radio", points: 5, correct: "B", text: "5. Case Study A (The Lever): Why is this considered permissible?" },
    { id: "q6_bridge_open", type: "open", points: 10, text: "6. Case Study B (The Bridge): Explain moral difference from Lever (Means)." },
    { id: "q7_bomb_open", type: "open", points: 10, text: "7. Case Study C (Nagasaki): Analyze General Groves/Fat Man bomb using moral elements." },
    { id: "q_app_combined", type: "open", points: 10, text: "8. Application (Lies to teacher): Identify Object, Intention, Circumstances." },
    { id: "q9_conscience", type: "radio", points: 5, correct: "C", text: "9. Conscience is best described as:" },
    { id: "q10_formed", type: "radio", points: 5, correct: "B", text: "10. A properly formed conscience requires:" },
    { id: "q11_end_means", type: "radio", points: 5, correct: "C", text: "11. The principle 'the end does not justify the means' means:" },
    { id: "q12_christ", type: "radio", points: 5, correct: "C", text: "12. Christ fulfilled the Ten Commandments by:" },
    { id: "q13_omission", type: "radio", points: 5, correct: "B", text: "13. A sin of omission is:" },
    { id: "q14_venial", type: "radio", points: 5, correct: "C", text: "14. Venial sin:" },
    { id: "q15_mortal", type: "radio", points: 5, correct: "C", text: "15. Mortal sin requires:" },
    { id: "q16_penance", type: "radio", points: 5, correct: "C", text: "16. The Sacrament of Penance restores:" },
    { id: "q17_silent_friend_mc", type: "radio", points: 5, correct: "B", text: "17. Case Study (The Silent Friend): This is an example of:" },
    { id: "q18_final_reflection", type: "open", points: 5, text: "18. Final Reflection: Justifying evil by good outcomes." }
  ];

  // Map individual fields to combined questions if necessary
  userAnswers.q_app_combined = `Object: ${userAnswers.q_app_object || 'N/A'}, Intention: ${userAnswers.q_app_intention || 'N/A'}, Circumstances: ${userAnswers.q_app_circumstances || 'N/A'}`;

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
    You are a Catholic theology teacher grading a Confirmation Moral Reasoning Assessment.
    
    TASK 1: Grade the following ${openQuestions.length} open-ended student answers.
    For each answer, provide:
    - A score from 0 to MAX_POINTS based on accuracy and depth (integers only).
    - A brief, encouraging, but corrective feedback analysis (1-2 sentences).
    - A sample "perfect" answer.

    TASK 2: Provide a "Holistic Feedback" summary for the student.
    - Review the "Objective Results" (Multiple Choice) provided below to see what they got Right/Wrong.
    - Review their Open-Ended answers.
    - Write a short paragraph (3-4 sentences) addressing the student directly. Praise their moral reasoning where it is sound, and gently correct any consequentialist errors (e.g., "the end justifies the means"). Be encouraging!

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
      "holistic_feedback": "Dear Student, your reasoning on the principle of double effect was strong..."
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

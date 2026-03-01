document.getElementById('homework-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show loading state
    const form = document.getElementById('homework-form');
    const loading = document.getElementById('loading-indicator');
    const resultsArea = document.getElementById('results-area');
    
    form.style.display = 'none';
    loading.style.display = 'block';

    try {
        // Collect form data
        const formData = new FormData(e.target);
        const answers = {};
        
        // Get due date from the page
        const dueDateElement = document.querySelector('.due-date');
        const dueDate = dueDateElement ? dueDateElement.textContent.replace('Due: ', '').trim() : "Feb 17th, 2026";

        // Name validation: Must be at least two words
        const studentName = formData.get('name');
        if (!studentName || studentName.trim().split(' ').filter(s => s !== '').length < 2) {
            alert('Please enter your full name (at least two words).');
            form.style.display = 'block'; // Show form again
            loading.style.display = 'none';
            return; // Stop further processing
        }
        
        // Handle multi-value fields (checkboxes) correctly
        for (const [key, value] of formData.entries()) {
            if (answers[key]) {
                if (!Array.isArray(answers[key])) {
                    answers[key] = [answers[key]];
                }
                answers[key].push(value);
            } else {
                answers[key] = value;
            }
        }

        // Add due_date to answers so the backend knows which homework this is
        answers.due_date = dueDate;

        // Ensure specific checkbox fields are arrays even if only one item is selected
        const arrayFields = [];
        arrayFields.forEach(field => {
            if (answers[field] && !Array.isArray(answers[field])) {
                answers[field] = [answers[field]];
            }
        });

        // Send to Netlify Function
        const response = await fetch('/.netlify/functions/submit-homework', {
            method: 'POST',
            body: JSON.stringify({ answers }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        // Calculate percentage score
        const percentScore = data.maxScore > 0 ? ((data.totalScore / data.maxScore) * 100).toFixed(1) : 0;

        // Use the holistic feedback from the server
        const aiFeedbackSummary = data.holisticFeedback || "No AI feedback available.";

        // --- Generate Full HTML Email Report ---
        const studentNameVal = answers.name || 'Anonymous';
        let emailHtml = `
            <div style="font-family: 'Georgia', serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border: 1px solid #eee;">
                <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Confirmation Assessment Results</h2>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 5px 0; color: #666;">Student: <strong>${studentNameVal}</strong></p>
                    <p style="margin: 5px 0; color: #666;">Due Date: <strong>${dueDate}</strong></p>
                    <div style="font-size: 24px; font-weight: bold; color: #D4AF37; margin-top: 10px;">Score: ${percentScore}%</div>
                </div>

                <div style="margin-bottom: 30px; padding: 15px; background-color: rgba(212, 175, 55, 0.1); border-left: 4px solid #D4AF37;">
                    <h3 style="margin-top: 0; color: #8a6d1c;">Teacher's Feedback</h3>
                    <p style="line-height: 1.5;">${aiFeedbackSummary}</p>
                </div>

                <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Detailed Breakdown</h3>
        `;

        // Add each question to the email HTML
        data.results.forEach((result, index) => {
            const isCorrect = result.isCorrect || (result.type === 'open' && result.points > 0); // Simplified logic
            const statusColor = isCorrect ? '#27ae60' : '#c0392b';
            const statusIcon = isCorrect ? '✓' : '✗';
            
            emailHtml += `
                <div style="margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                    <p style="font-weight: bold; margin-bottom: 5px; color: #444;">
                        <span style="color: ${statusColor}; font-weight: bold; margin-right: 5px;">${statusIcon}</span>
                        ${index + 1}. ${result.text}
                        <span style="float: right; font-size: 0.85em; color: #888;">${result.points}/${result.maxPoints} pts</span>
                    </p>
                    <div style="margin-left: 20px; font-size: 0.95em;">
                        <p style="margin: 3px 0;"><strong>Student Answer:</strong> <span style="font-style: italic;">${result.userAnswer}</span></p>
            `;

            if (result.type !== 'open' && !result.isCorrect) {
                emailHtml += `<p style="margin: 3px 0; color: #27ae60;"><strong>Correct Answer:</strong> ${result.correctAnswer}</p>`;
            }

            if (result.type === 'open') {
                emailHtml += `
                    <div style="background: #f5f5f5; padding: 10px; margin-top: 8px; border-radius: 4px; font-size: 0.9em;">
                        <p style="margin: 0 0 5px 0;"><strong>Analysis:</strong> ${result.analysis || 'N/A'}</p>
                        <p style="margin: 0; color: #666;"><strong>Sample:</strong> ${result.sampleAnswer || 'N/A'}</p>
                    </div>
                `;
            }
            emailHtml += `</div></div>`;
        });

        emailHtml += `
                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
                    &copy; 2026 Our Lady of Peace Catechism Program
                </div>
            </div>
        `;

        // Prepare data for Netlify Forms submission (including grade)
        const netlifyFormData = new FormData();
        netlifyFormData.append('form-name', 'homework-grades'); // Must match the name of your hidden form
        netlifyFormData.append('student_name', answers.name || 'Anonymous');
        netlifyFormData.append('parent_email', answers.email || ''); // Capture email
        netlifyFormData.append('due_date', dueDate);
        netlifyFormData.append('percent_score', percentScore);
        netlifyFormData.append('ai_feedback', aiFeedbackSummary);
        netlifyFormData.append('email_html_body', emailHtml); // <--- The full report

        // Submit to Netlify Forms (asynchronously, fire and forget)
        fetch('/', {
            method: 'POST',
            body: netlifyFormData
        }).then(() => console.log('Submission saved to Netlify Forms.')).catch(error => console.error('Netlify Forms submission error:', error));

        // Render Results
        document.getElementById('final-score').textContent = data.totalScore;
        document.getElementById('max-score').textContent = data.maxScore;

        const resultsContainer = document.getElementById('detailed-results');
        resultsContainer.innerHTML = ''; // Clear previous

        // Display Holistic Feedback
        if (data.holisticFeedback) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'holistic-feedback';
            feedbackDiv.style.marginBottom = '2rem';
            feedbackDiv.style.padding = '1.5rem';
            feedbackDiv.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'; // Gold tint
            feedbackDiv.style.border = '1px solid var(--accent-gold)';
            feedbackDiv.style.borderRadius = '8px';
            
            feedbackDiv.innerHTML = `
                <h3 style="font-family: var(--font-heading); color: var(--primary-color); margin-top: 0;">Teacher's Feedback</h3>
                <p style="font-size: 1.1em; line-height: 1.6; color: #333;">${data.holisticFeedback}</p>
            `;
            resultsContainer.appendChild(feedbackDiv);
        }

        data.results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.style.marginBottom = '2rem';
            resultDiv.style.padding = '1.5rem';
            resultDiv.style.borderLeft = result.isCorrect || result.points === result.maxPoints 
                ? '5px solid #2e7d32' // Green
                : '5px solid #c62828'; // Red
            resultDiv.style.backgroundColor = '#fff';
            resultDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';

            let content = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="font-family: var(--font-subheading); color: var(--primary-color); margin: 0;">${result.text}</h4>
                    <span style="font-weight: bold; color: var(--text-light); white-space: nowrap;">${result.points} / ${result.maxPoints} pts</span>
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <strong>Your Answer:</strong> <span style="font-style: italic; color: #444;">${result.userAnswer}</span>
                </div>
            `;

            // If it's an objective question and they got it wrong, show the correct answer
            if ((result.type === 'radio' || result.type === 'checkbox') && !result.isCorrect) {
                content += `
                    <div style="color: #2e7d32; margin-top: 0.5rem;">
                        <strong>Correct Answer:</strong> ${result.correctAnswer}
                    </div>
                `;
            }

            // If it's an open ended question, show AI analysis
            if (result.type === 'open') {
                content += `
                    <div style="background-color: #f5f5f5; padding: 1rem; margin-top: 1rem; border-radius: 4px;">
                        <p style="margin-bottom: 0.5rem;"><strong>AI Analysis:</strong> ${result.analysis || 'No analysis available.'}</p>
                        <p style="margin: 0; font-size: 0.9em; color: #555;"><strong>Sample Answer:</strong> ${result.sampleAnswer || 'N/A'}</p>
                    </div>
                `;
            }

            resultDiv.innerHTML = content;
            resultsContainer.appendChild(resultDiv);
        });

        // Switch views
        loading.style.display = 'none';
        resultsArea.style.display = 'block';
        
        // Scroll to top
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        form.style.display = 'block'; // Show form again
        alert('There was an error submitting your homework. Please try again. \n\nDetails: ' + error.message);
    }
});
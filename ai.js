//AI FEATURES 

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

//HELPER: CALL GROQ API 
async function callGroq(prompt) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

//SHOW AI OUTPUT 
function showAiOutput(text) {
  const output = document.getElementById('aiOutput');
  output.classList.remove('hidden');
  output.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--accent);font-weight:600;">✦ AI Result</span>
      <button onclick="document.getElementById('aiOutput').classList.add('hidden')"
        style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:13px;">✕</button>
    </div>
    <div style="font-size:13.5px;line-height:1.7;color:var(--text);">${text}</div>
  `;
}

//SET LOADING STATE
function setAiLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.textContent = '⏳ Thinking...';
    btn.disabled = true;
  } else {
    const labels = {
      aiSummariseBtn: '✦ Summarise',
      aiTagsBtn:      '✦ Suggest Tags',
      aiRewriteBtn:   '✦ Improve',
    };
    btn.textContent = labels[btnId];
    btn.disabled = false;
  }
}

//AI SUMMARISE 
async function aiSummarise() {
  const content = document.getElementById('noteContent').value.trim();

  if (!content) {
    alert('Please write some content first!');
    return;
  }

  setAiLoading('aiSummariseBtn', true);

  try {
    const prompt = `Summarise the following note in 2-3 clear, concise sentences. 
Just give the summary, no preamble:

${content}`;

    const result = await callGroq(prompt);
    showAiOutput(result);
  } catch (err) {
    showAiOutput(`❌ Error: ${err.message}`);
  } finally {
    setAiLoading('aiSummariseBtn', false);
  }
}

// AI SUGGEST TAGS (placeholder for commit #13)
async function aiSuggestTags() {}

// AI REWRITE (placeholder for commit #14) 
async function aiRewrite() {}
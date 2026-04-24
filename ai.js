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

//AI SUGGEST TAGS
async function aiSuggestTags() {
  const content = document.getElementById('noteContent').value.trim();
  const title   = document.getElementById('noteTitle').value.trim();

  if (!content && !title) {
    alert('Please write some content first!');
    return;
  }

  setAiLoading('aiTagsBtn', true);

  try {
    const prompt = `Suggest 3-5 short, relevant tags for this note. 
Return ONLY a JSON array of strings, nothing else. 
Example: ["javascript", "learning", "web-dev"]

Title: ${title}
Content: ${content}`;

    const result  = await callGroq(prompt);
    const cleaned = result.replace(/```json|```/g, '').trim();
    const tags    = JSON.parse(cleaned);

    // show suggested tags as clickable chips
    const suggestHtml = tags.map(tag => `
      <span onclick="applySuggestedTag('${tag}')"
        style="display:inline-flex;align-items:center;gap:5px;
        background:rgba(124,106,247,0.15);color:#a99df9;
        padding:4px 12px;border-radius:20px;font-size:12px;
        cursor:pointer;border:1px solid rgba(124,106,247,0.3);
        margin:3px;transition:background 0.15s;"
        onmouseover="this.style.background='rgba(124,106,247,0.3)'"
        onmouseout="this.style.background='rgba(124,106,247,0.15)'">
        + ${tag}
      </span>`).join('');

    showAiOutput(`<div style="margin-bottom:8px;font-size:12px;color:var(--muted);">Click a tag to add it:</div>${suggestHtml}`);

  } catch (err) {
    showAiOutput(`❌ Error: ${err.message}`);
  } finally {
    setAiLoading('aiTagsBtn', false);
  }
}

//APPLY SUGGESTED TAG 
function applySuggestedTag(tag) {
  const val = tag.toLowerCase().replace(/\s+/g, '-');
  if (currentTags.includes(val)) return;
  if (currentTags.length >= 5)   { alert('Max 5 tags per note.'); return; }
  currentTags.push(val);
  renderTagsPreview();
}

//AI REWRITE 
async function aiRewrite() {
  const content = document.getElementById('noteContent').value.trim();

  if (!content) {
    alert('Please write some content first!');
    return;
  }

  setAiLoading('aiRewriteBtn', true);

  try {
    const prompt = `Improve the following note by fixing grammar, improving clarity and making it more concise. 
Keep the same meaning and structure.
Return ONLY the improved text, no preamble or explanation:

${content}`;

    const result = await callGroq(prompt);

    // show result with apply button
    showAiOutput(`
      <div style="margin-bottom:10px;font-size:12px;color:var(--muted);">
        Improved version — click Apply to replace your note:
      </div>
      <div style="font-size:13.5px;line-height:1.7;color:var(--text);
        background:var(--surface3);padding:12px;border-radius:8px;margin-bottom:12px;">
        ${result}
      </div>
      <button onclick="applyRewrite(\`${result.replace(/`/g, '\\`')}\`)"
        style="background:var(--accent);border:none;border-radius:8px;
        color:#fff;padding:8px 18px;cursor:pointer;font-size:13px;font-weight:600;">
        ✓ Apply to Note
      </button>
    `);

  } catch (err) {
    showAiOutput(`❌ Error: ${err.message}`);
  } finally {
    setAiLoading('aiRewriteBtn', false);
  }
}

//APPLY REWRITE 
function applyRewrite(newContent) {
  document.getElementById('noteContent').value = newContent;
  document.getElementById('aiOutput').classList.add('hidden');

  // flash the textarea to show it was updated
  const textarea = document.getElementById('noteContent');
  textarea.style.borderColor = 'var(--accent)';
  setTimeout(() => {
    textarea.style.borderColor = '';
  }, 1000);
}
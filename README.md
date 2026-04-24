# 🧠 Smart Notes — AI-Powered Notes App

> A modern, feature-rich notes app with built-in AI assistance. Built with pure HTML, CSS and Vanilla JS — no frameworks, no build tools.

![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)

🔗 **Live Demo:** [97chopra.github.io/smart-notes](https://97chopra.github.io/smart-notes/)

---

## ✨ Features

### 📝 Notes
- Create, edit and delete notes
- Markdown support with live write/preview toggle
- Pin important notes to the top
- Colour label notes (7 colours)
- Export notes as `.md` or `.txt`

### 🏷️ Organisation
- Tag system with up to 5 tags per note
- Sidebar tag filter — click any tag to filter instantly
- Live search across title, content and tags
- Sort by newest, oldest or A→Z

### 🤖 AI Features (powered by Groq)
- **✦ Summarise** — get a 2-3 sentence summary of any note
- **✦ Suggest Tags** — AI suggests relevant tags, click to apply
- **✦ Improve** — AI rewrites your note for clarity and grammar

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+M` | New note |
| `Ctrl+S` | Save note |
| `Esc` | Close modal |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Semantic structure |
| CSS3 | Dark theme, animations, layout |
| Vanilla JS (ES6+) | App logic, localStorage |
| [marked.js](https://marked.js.org/) | Markdown rendering |
| [Groq API](https://console.groq.com) | AI features (llama-3.3-70b) |

---

## 🚀 Setup & Run Locally

No build step needed — just clone and open!

```bash
git clone https://github.com/97chopra/smart-notes.git
cd smart-notes
```

**To enable AI features:**
1. Get a free API key from [console.groq.com](https://console.groq.com)
2. Create a `config.js` file in the project root:

```javascript
const CONFIG = {
  GROQ_API_KEY: 'your-key-here',
  MODEL: 'llama-3.3-70b-versatile',
};
```

3. Open `index.html` in your browser — done! 

>  `config.js` is in `.gitignore` and will never be pushed to GitHub.
> The app works without AI features if no key is provided.

---

## 📁 Project Structure
smart-notes/
├── index.html      
├── style.css       
├── app.js          
├── ai.js           
├── config.js      
├── .gitignore      
└── README.md
---

## 📌 Project Background

Built as a portfolio project during my final year at **AUT (Auckland University of Technology)**, studying **Software Programming and Data Science AI**.

This project demonstrates:
- Clean vanilla JS architecture with no frameworks
- Real AI API integration (Groq / Llama 3)
- Git workflow with meaningful commit history
- Responsive dark UI built from scratch

---

## 👩‍💻 Author

**Aarti** — AUT Final Year Student  
Software Programming & Data Science AI  

[![GitHub](https://img.shields.io/badge/GitHub-97chopra-black?logo=github)](https://github.com/97chopra)    

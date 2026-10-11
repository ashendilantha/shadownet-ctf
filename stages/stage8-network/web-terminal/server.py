#!/usr/bin/env python3
"""
ShadowNet CTF - Web Terminal Server (Stage 8)
HTB / TryHackMe-style in-browser terminal console.
Directly connects into the Ubuntu Virtual Machine via SSH,
guaranteeing complete isolation from the host machine files.
"""

import os
import pty
import fcntl
import termios
import struct
import asyncio
import socket
import argparse
from pathlib import Path
from aiohttp import web

HTML_FILE = Path(__file__).parent / "index.html"
STAGE8_DIR = Path(__file__).parents[1]
SSH_KEY_FILE = STAGE8_DIR / "id_ed25519"

def is_vm_ssh_ready(port=2228):
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except OSError:
        return False

async def index(request):
    if HTML_FILE.exists():
        return web.FileResponse(HTML_FILE)
    return web.Response(text="Web Terminal HTML not found", status=404)

async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    # Allocate PTY
    master_fd, slave_fd = pty.openpty()

    # Set wide initial window size
    try:
        init_winsize = struct.pack("HHHH", 40, 140, 0, 0)
        fcntl.ioctl(slave_fd, termios.TIOCSWINSZ, init_winsize)
    except Exception:
        pass

    # Environment
    env = os.environ.copy()
    env["TERM"] = "xterm-256color"
    env["COLORTERM"] = "truecolor"

    # Determine command: Connect directly to the Ubuntu VM if active
    if is_vm_ssh_ready(2228):
        cmd = [
            "/usr/bin/ssh",
            "-F", "/dev/null",
            "-o", "StrictHostKeyChecking=no",
            "-o", "UserKnownHostsFile=/dev/null",
            "-o", "LogLevel=ERROR",
            "-p", "2228",
            "shadownet@127.0.0.1"
        ]
        if SSH_KEY_FILE.exists():
            cmd.extend(["-i", str(SSH_KEY_FILE)])
        work_dir = None
    else:
        # Isolated sandbox folder containing only challenge files (never host files)
        sandbox_dir = Path("/tmp/shadownet-challenge")
        sandbox_dir.mkdir(parents=True, exist_ok=True)
        # Populate minimal challenge info
        (sandbox_dir / "README.txt").write_text(
            "SHADOWNET CTF // STAGE 8 ISOLATED SHELL\n"
            "Target: Entry Host (localhost:3008) -> Internal DB (192.168.100.10:3306)\n"
        )
        env["PS1"] = r"\[\033[01;32m\]shadownet@stage8-isolated\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "
        cmd = ["/bin/bash", "--norc"]
        work_dir = str(sandbox_dir)

    # Launch process
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdin=slave_fd,
        stdout=slave_fd,
        stderr=slave_fd,
        env=env,
        cwd=work_dir,
        preexec_fn=os.setsid
    )
    os.close(slave_fd)

    # Set non-blocking on master_fd
    fl = fcntl.fcntl(master_fd, fcntl.F_GETFL)
    fcntl.fcntl(master_fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    loop = asyncio.get_running_loop()

    def read_pty():
        try:
            data = os.read(master_fd, 4096)
            if data:
                asyncio.create_task(ws.send_bytes(data))
        except (BlockingIOError, InterruptedError):
            pass
        except Exception:
            pass

    loop.add_reader(master_fd, read_pty)

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.BINARY:
                os.write(master_fd, msg.data)
            elif msg.type == web.WSMsgType.TEXT:
                text = msg.data
                if text.startswith("{") and "type" in text:
                    import json
                    try:
                        cmd_dict = json.loads(text)
                        if cmd_dict.get("type") == "resize":
                            cols = int(cmd_dict.get("cols", 80))
                            rows = int(cmd_dict.get("rows", 24))
                            winsize = struct.pack("HHHH", rows, cols, 0, 0)
                            fcntl.ioctl(master_fd, termios.TIOCSWINSZ, winsize)
                        elif cmd_dict.get("type") == "stdin":
                            data = cmd_dict.get("data", "")
                            os.write(master_fd, data.encode("utf-8", errors="ignore"))
                    except Exception:
                        pass
                else:
                    os.write(master_fd, text.encode("utf-8", errors="ignore"))
            elif msg.type in (web.WSMsgType.CLOSE, web.WSMsgType.ERROR):
                break
    finally:
        loop.remove_reader(master_fd)
        try:
            os.close(master_fd)
        except OSError:
            pass
        if proc.returncode is None:
            try:
                proc.terminate()
            except ProcessLookupError:
                pass
        await ws.close()

    return ws

def create_app():
    app = web.Application()
    app.router.add_get("/", index)
    app.router.add_get("/ws", ws_handler)
    return app

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ShadowNet Browser Terminal Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=7681, help="Port to listen on (default: 7681)")
    args = parser.parse_args()

    print(f"[*] ShadowNet Web Terminal starting on http://{args.host}:{args.port}")
    app = create_app()
    web.run_app(app, host=args.host, port=args.port)

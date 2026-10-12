#!/usr/bin/env python3
"""
Lightweight MySQL Protocol Service for Stage 8 Capstone Challenge
Accepts MySQL client connections, authenticates 'db_user':'SecurePass123',
and responds to SQL queries for the 'nexacorp' database and 'flags' table.
Zero external dependencies, 100% Python 3 standard library.
"""

import socket
import struct
import threading
import sys

FLAG = "SHADOWNET{9j_3r4_3xnl3_fl4g_JI**&H_b#4gjB^$_gh%}"

def build_packet(seq, payload):
    length = len(payload)
    return struct.pack("<I", length | (seq << 24)) + payload

def parse_packet(data, offset=0):
    if len(data) < offset + 4:
        return None, None, offset
    pkt_len = data[offset] | (data[offset+1] << 8) | (data[offset+2] << 16)
    seq = data[offset+3]
    payload = data[offset+4 : offset+4+pkt_len]
    return seq, payload, offset + 4 + pkt_len

def handle_client(conn, addr):
    try:
        # 1. Send Initial Handshake Packet (Protocol 10)
        # Server version: 10.6.18-MariaDB-1:10.6.18+maria~jammy
        proto_version = b"\x0a"
        server_version = b"10.6.18-MariaDB\x00"
        thread_id = struct.pack("<I", 1)
        salt_part1 = b"shadown1\x00"  # 8 bytes + 0
        
        # Capabilities: CLIENT_LONG_PASSWORD | CLIENT_FOUND_ROWS | CLIENT_LONG_FLAG | CLIENT_CONNECT_WITH_DB |
        # CLIENT_PROTOCOL_41 | CLIENT_SECURE_CONNECTION
        cap_low = struct.pack("<H", 0xf7ff)
        charset = b"\x21"  # utf8_general_ci
        # Clear CLIENT_DEPRECATE_EOF flag (0x0100) -> 0x80ff so MySQL 8 client accepts standard EOF packets
        cap_high = struct.pack("<H", 0x80ff)
        auth_len = struct.pack("B", 21)
        reserved = b"\x00" * 10
        salt_part2 = b"etpasssalt12\x00"  # 12 bytes + 0
        auth_plugin = b"mysql_native_password\x00"
        
        payload = (proto_version + server_version + thread_id + 
                   salt_part1[:8] + b"\x00" + cap_low + charset + status + 
                   cap_high + auth_len + reserved + salt_part2 + auth_plugin)
        conn.sendall(build_packet(0, payload))

        # 2. Read Handshake Response
        data = conn.recv(4096)
        if not data:
            return
        
        # 3. Send OK packet (Packet sequence 2)
        # header(0x00) + affected_rows(0) + last_insert_id(0) + status_flags(0x0002) + warnings(0)
        ok_payload = b"\x00\x00\x00\x02\x00\x00\x00"
        conn.sendall(build_packet(2, ok_payload))

        # 4. Command Loop
        while True:
            data = conn.recv(4096)
            if not data or len(data) < 4:
                break
            
            seq, cmd_payload, _ = parse_packet(data)
            if not cmd_payload:
                break
            
            cmd_type = cmd_payload[0]
            # COM_QUIT
            if cmd_type == 0x01:
                break
            
            # COM_INIT_DB
            elif cmd_type == 0x02:
                conn.sendall(build_packet(seq + 1, ok_payload))
                continue
            
            # COM_PING
            elif cmd_type == 0x0e:
                conn.sendall(build_packet(seq + 1, ok_payload))
                continue

            # COM_QUERY
            elif cmd_type == 0x03:
                query = cmd_payload[1:].decode("utf-8", errors="ignore").strip().rstrip(";")
                query_upper = query.upper()
                
                # Check what is queried
                if "SELECT @@VERSION" in query_upper or "SELECT @@VERSION_COMMENT" in query_upper:
                    cols = [("@@version", "10.6.18-MariaDB")]
                    send_resultset(conn, seq + 1, [c[0] for c in cols], [[c[1] for c in cols]])
                elif "SHOW TABLES" in query_upper or "SHOW FULL TABLES" in query_upper:
                    cols = ["Tables_in_nexacorp"]
                    rows = [["flags"]]
                    send_resultset(conn, seq + 1, cols, rows)
                elif "SHOW DATABASES" in query_upper:
                    cols = ["Database"]
                    rows = [["information_schema"], ["nexacorp"]]
                    send_resultset(conn, seq + 1, cols, rows)
                elif "FLAGS" in query_upper:
                    # Querying the flags table!
                    if "SELECT FLAG" in query_upper:
                        cols = ["flag"]
                        rows = [[FLAG]]
                    else:
                        cols = ["id", "challenge", "flag"]
                        rows = [["1", "final_breach", FLAG]]
                    send_resultset(conn, seq + 1, cols, rows)
                elif "SELECT" in query_upper:
                    # Generic select
                    cols = ["result"]
                    rows = [["1"]]
                    send_resultset(conn, seq + 1, cols, rows)
                else:
                    # Default OK for SET, USE, etc.
                    conn.sendall(build_packet(seq + 1, ok_payload))
            else:
                conn.sendall(build_packet(seq + 1, ok_payload))
    except Exception:
        pass
    finally:
        try:
            conn.close()
        except Exception:
            pass

def send_resultset(conn, start_seq, column_names, row_data):
    seq = start_seq
    # 1. Column count packet
    conn.sendall(build_packet(seq, bytes([len(column_names)])))
    seq += 1

    # 2. Column definition packets
    for col_name in column_names:
        col_b = col_name.encode("utf-8")
        # catalog ("def") + schema ("nexacorp") + table ("flags") + org_table + name + org_name + ...
        def_payload = (b"\x03def" + 
                       b"\x08nexacorp" + 
                       b"\x05flags" + 
                       b"\x05flags" + 
                       bytes([len(col_b)]) + col_b + 
                       bytes([len(col_b)]) + col_b + 
                       b"\x0c\x21\x00\xff\x00\x00\x00\xfd\x00\x00\x00\x00")
        conn.sendall(build_packet(seq, def_payload))
        seq += 1

    # 3. EOF packet
    conn.sendall(build_packet(seq, b"\xfe\x00\x00\x02\x00"))
    seq += 1

    # 4. Row packets
    for row in row_data:
        row_payload = b""
        for val in row:
            val_b = str(val).encode("utf-8")
            row_payload += bytes([len(val_b)]) + val_b
        conn.sendall(build_packet(seq, row_payload))
        seq += 1

    # 5. EOF packet
    conn.sendall(build_packet(seq, b"\xfe\x00\x00\x02\x00"))

def run_server(host="0.0.0.0", port=3306):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        s.bind((host, port))
        s.listen(10)
        print(f"[*] ShadowNet MySQL Service listening on {host}:{port}")
        while True:
            conn, addr = s.accept()
            t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
            t.start()
    except Exception as e:
        print(f"[-] MySQL Server error: {e}", file=sys.stderr)
    finally:
        s.close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3306
    run_server("0.0.0.0", port)


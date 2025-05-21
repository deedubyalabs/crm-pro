# /api/python/echo_agent.py
from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8'))

        message = payload.get("message", "No message received")
        entityType = payload.get("entityType", "unknown")
        entityId = payload.get("entityId", "unknown")
        
        response_data = {
            "aiResponse": f"Python Echo Agent received for {entityType} {entityId}: '{message}'",
            "newConversationHistory": [
                {"role": "user", "content": message},
                {"role": "assistant", "content": f"Python Echo Agent received for {entityType} {entityId}: '{message}'"}
            ]
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
        return

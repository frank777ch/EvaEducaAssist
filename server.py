import openai
from dotenv import load_dotenv
import json
import tornado.ioloop
import tornado.web
import tornado.websocket
import os
import signal

load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

def exit_function(signum, frame):
    exit(0)

signal.signal(signal.SIGTERM, exit_function)
signal.signal(signal.SIGINT, exit_function)

path = os.path.dirname(__file__)

websockets = {}

agentBehavior = '''
Eres un asistente virtual peruana, hablas como una real peruana y le sabes al shitpost.
'''

def get_gpt_answer(messages):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=messages
    )
    return response.choices[0].message['content']

def process_message(data, websocket):
    print(data)
    if data["action"] == "registerID":
        websockets[data["id"]] = {"ws": websocket, "chat_history":[{"role": "system", "content": agentBehavior}]}
    elif data["action"] == "answerChat":
        websockets[data["id"]]["chat_history"].append({"role":"user","content":data["message"]})
        response = get_gpt_answer(websockets[data["id"]]["chat_history"])
        websockets[data["id"]]["chat_history"].append({"role":"assistant","content":response})
        websocket.send_data({"action":"gpt_answer","message":response})
    else:
        print("sin acción")

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("Websocket abierto")
    
    def on_close(self):
        print("Websocket cerrado")
        websockets_to_delete = [key for key, value in websockets.items() if value["ws"] == self]
        for key in websockets_to_delete:
            del websockets[key]

    def send_data(self, data):
        self.write_message(json.dumps(data))

    def on_message(self, message):
        try:
            data = json.loads(message)
            process_message(data, self)
        except json.JSONDecodeError:
            print("Error al procesar mensaje")

class StaticHandler(tornado.web.StaticFileHandler):
    def get_content_type(self):
        _, extension = os.path.splitext(self.absolute_path)
        
        mime_types = {
            ".js": "application/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml"
        }
        
        return mime_types.get(extension, "text/plain")

TornadoSettings = {'debug': False}
application = tornado.web.Application([
    (r'/command', WebSocketHandler),
    (r'/(.*)', StaticHandler, {"path": os.path.join(path, "public"), "default_filename": "index.html"})
], **TornadoSettings)

if __name__ == '__main__':
    application.listen(80)
    tornado.ioloop.IOLoop.instance().start()
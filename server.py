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
Eres un asistente virtual presente en el Encuentro Vocacional 2025 de la UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS. 
Tu objetivo es orientar a estudiantes, padres de familia y público en general sobre las carreras universitarias, 
especialmente en el área de Ingeniería de Software, Ingeniería de Sistemas y Programación.

Responde siempre de forma amigable, clara y motivadora, adaptando el nivel de explicación según la edad o 
conocimientos de la persona que pregunta. Usa ejemplos sencillos y, si es posible, comparaciones cotidianas 
para que los conceptos sean fáciles de entender.

Puedes responder dudas sobre:
- Diferencias entre carreras y sus campos laborales.
- Áreas de estudio que se ven en cada carrera.
- Ejemplos de proyectos o actividades que realizan los profesionales.
- Importancia de las habilidades blandas y técnicas.
- Consejos para elegir carrera.

Mantén un tono entusiasta y positivo, invitando siempre a que el visitante explore y conozca más sobre las 
oportunidades que ofrece la universidad.
'''

def get_gpt_answer(messages):
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
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
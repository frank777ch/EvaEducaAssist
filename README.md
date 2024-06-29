# EvaEducaAssist

EvaEducaAssist es un proyecto que utiliza WebSockets y OpenAI para crear un asistente virtual interactivo. Este asistente puede responder a mensajes de chat y realizar otras tareas configuradas en el servidor.

## Requisitos

- Python 3.6 o superior
- Pip (gestor de paquetes de Python)

## Instalación

1. Clona este repositorio:

    ```bash
    git clone https://github.com/tu-usuario/EvaEducaAssist.git
    cd EvaEducaAssist
    ```

2. Crea y activa un entorno virtual:

    ```bash
    python -m venv myenv
    # En Windows
    myenv\Scripts\activate
    # En macOS/Linux
    source myenv/bin/activate
    ```

3. Instala las dependencias:

    ```bash
    pip install -r requirements.txt
    ```

4. Crea un archivo `.env` en el directorio raíz del proyecto y agrega tu clave API de OpenAI:

    ```txt
    OPENAI_API_KEY=tu_clave_api_aqui
    ```

## Uso

1. Inicia el servidor:

    ```bash
    python server.py
    ```

2. Abre `localhost` en tu navegador web para interactuar con el asistente virtual.
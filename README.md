# Exercício Técnico DELL
## Participante: Rian Cordoni da Veiga

Este projeto faz parte de um exercício técnico para a empresa DELL.
Se trata de uma aplicação em *Python* utilizando *Flask*, *Flask-SQLAlchemy* e integração com o *Ollama*, além de *html*, *CSS* e *Javascript* para a interface web.

## Instalação

Para executar a aplicação, certifique-se de ter o Python instalado.

Instale as dependências com o seguinte comando:

```bash
pip install Flask flask_sqlalchemy
```

Caso queira utilizar o recurso da feature extra, o Judge.IA (não é necessário para o funcionamento do resto do programa), deve-se também ter instalado o ollama e ter feito o download do modelo llama3.2. Assim, basta também rodar o seguinte comando:

```bash
pip install ollama
```

## Execução

Depois de ter instalado os pacotes, basta executar com:

```bash
python app.py
```

A aplicação será iniciada e abrirá automaticamente o navegador, depois de 2 segundos, em ```http://localhost:5000```.

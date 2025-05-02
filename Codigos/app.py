from flask import Flask, render_template, request, jsonify
import webbrowser
import threading
from flask_sqlalchemy import SQLAlchemy
#import ollama

app = Flask(__name__)


############ START DATABASE SQLITE CONFIGURATION ####################
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///startups.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Startup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    slogan = db.Column(db.String(200), nullable=False)
    ano_lancamento = db.Column(db.Integer, nullable=False)
    points = db.Column(db.Integer, nullable=False)
    isAlive = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
            return {
                "id": self.id,
                "nome": self.nome,
                "slogan": self.slogan,
                "ano_lancamento": self.ano_lancamento,
                "points": self.points,
                "isAlive": self.isAlive
            }

class Voto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    startup_id = db.Column(db.Integer, db.ForeignKey('startup.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False) #pitch_convincente, produto com bugs, etc.
    
    def to_dict(self):
        return{
            "id": self.id,
            "startup_id": self.startup_id,
            "tipo": self.tipo
        }
    

############ END DATABASE SQLITE CONFIGURATION ####################
        

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/startups', methods=['POST', 'GET'])
def startups():
    if(request.method == 'POST'): # se for post, para cada startup adiciona no BD
        data = request.get_json()
        db.session.query(Startup).delete() # e deleta o que ja tinha previamente no bd, antes de adicionar os novos.
        db.session.query(Voto).delete()
        db.session.commit()
        for item in data:
            startup = Startup(
                nome= item['nome'],
                slogan= item['slogan'],
                ano_lancamento= item['ano_lancamento'],
                points= item['points']
            )
            db.session.add(startup)
        db.session.commit()
        return jsonify({"message": "Received successfully", "data": data})
    elif(request.method == 'GET'): # se for get, apenas retornar todas as startups
        startups = Startup.query.all()
        return jsonify([s.to_dict() for s in startups]) # usa a funcao criada para colocar em dict, e depois json.

@app.route('/vote', methods=['POST'])
def vote():
    data = request.get_json()
    startup = Startup.query.get(data['id'])
    
    if startup:
        startup.points = data['points']
        novo_voto = Voto(startup_id=data['id'], tipo=data['vote_type'])
        db.session.add(novo_voto)
        db.session.commit()
        return jsonify({'message': 'voted!'})
    return jsonify({'error': 'startup not found'}), 404

@app.route('/manage_battle', methods=['POST'])
def manage_battle():
    data = request.get_json()
    winner_startup = Startup.query.get(data['id_champion'])
    loser_startup = Startup.query.get(data['id_loser'])
    if(winner_startup and loser_startup):
        loser_startup.isAlive = False
        winner_startup.points += 30
        db.session.commit()
        return jsonify({'message': 'Updated!'})
    return jsonify({'error': 'Startup not found'}), 404

@app.route('/update_points', methods=['POST'])
def update_points():
    data = request.get_json()
    startup = Startup.query.get(data['id'])
    if(startup):
        startup.points += 2
        db.session.commit()
        return jsonify({'message': 'Updated!'})
    return jsonify({'error': 'Startup not found'}), 404
    

@app.route('/kill', methods=['POST'])
def kill():
    data = request.get_json()
    startup = Startup.query.get(data['id'])
    if(startup):
        startup.isAlive = False
        db.session.commit()
        return jsonify({'message': 'Updated!'})
    return jsonify({'error': 'Startup not found'}), 404

@app.route('/data_results')
def data_results():
    startups = [row.to_dict() for row in Startup.query.all()]
    votes = [row.to_dict() for row in Voto.query.all()]
    return jsonify({
        'startups': startups,
        'votes': votes})


@app.route('/battle')
def battles():
    return render_template('battles.html')

@app.route('/results')
def results():
    return render_template('results.html')

try:
    import ollama
    ollama_on = True
except ImportError:
    print("Ollama não está instalado. Parte da IA será desativada.")
    ollama_on = False
    
PRE_PROMPT = """You are an investor who has reached the end of a startup competition.
    You have a lot of market knowledge and can tell why a company is successful or not.
    I'm going to give you the name and the slogan of the winning company and with these two pieces of information, 
    you have to tell me in a few lines why you think this company has won a championship 
    for innovative startups. The answer must contain at maximum 260 characters. The slogan is: """
@app.route("/chat", methods=["POST"])
def chat():
    if not ollama_on:
        return jsonify({"response": "O recurso de IA não está disponível no momento. Instale o ollama para ativar."})
    
    data = request.get_json()
    slogan = data.get("slogan", "")
    name = data.get("name", "")

    try:
        response = ollama.chat(model="llama3.2", messages=[{"role": "user", "content": f'{PRE_PROMPT} name: {name}, slogan: {slogan}'}])
        return jsonify({"response": response["message"]["content"]})
    except Exception as e:
        print(f"Erro detalhado: {e}")
        return jsonify({"response": "Erro ao gerar resposta da IA. Verifique se o modelo está rodando."})



# Abrir o navegador automaticamente
def abrir_navegador():
    webbrowser.open_new("http://127.0.0.1:5000/")

if __name__ == '__main__':
    with app.app_context(): # cria o database quando ele nao existir
        db.create_all()
    threading.Timer(2, abrir_navegador).start() # para abrir o index.html quando rodar o app.py
    app.run(host='127.0.0.1', port=5000, debug=True)
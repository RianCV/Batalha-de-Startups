const battlesList = document.getElementById('battles');
const btn_play_music = document.getElementById('play');
const btn_result = document.getElementById('btn-result');

const audio = new Audio('static/audio/tiger.mp3');
btn_play_music.addEventListener('click', () => {
    audio.play();
});

async function getData(){
    try{
        const response = await fetch('startups');
        const data = await response.json();
        return data;
    }catch (error){
        console.log(error.message);
    }
}

getData().then(startups => {
    

    let alive_list = [];
    for (const key in startups){
        //console.log(startups[key]);
        if(startups[key].isAlive === true){
            alive_list.push(startups[key]);
        }
    }

    console.log(alive_list);
    
    let alive_count = alive_list.length

    if(alive_count === 3){
        alert('Numero de equipes ímpar, eliminando o com menor pontuaçao!');
        const weak_startup = alive_list.reduce((minStartup, currentStartup) => {
            return currentStartup.points < minStartup.points ? currentStartup : minStartup;
        });
        alert('Matando a startup ' + weak_startup.nome + 'com ' + weak_startup.points + 'pontos!');
        fetch('/kill', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: weak_startup.id
            })
        });

        window.location.href = '/battle';
    }

    let stage_of_the_game;
    if(alive_count === 8){
        stage_of_the_game = 'Quarter-Finals';
    }

    if(alive_count === 6){
        stage_of_the_game = '3x3 Model';
    }

    if(alive_count === 4){
        stage_of_the_game = 'Semi-Final';
    }
    if(alive_count == 2){
        stage_of_the_game = 'Grand Final';
    }
    let battles = {}
    // Separando as batalhas aleatoriamente !
    for (let i = 0; i < alive_count/2; i++) {
        let random_index = Math.floor(Math.random() * (alive_list.length));
        chosen1 = alive_list[random_index];
        alive_list.splice(random_index,1);

        random_index = Math.floor(Math.random() * (alive_list.length));
        chosen2 = alive_list[random_index];
        alive_list.splice(random_index,1);

        battles[i] = {chosen1, chosen2}
    }

    console.log(battles);


    const stage_h2 = document.createElement('h2');
    stage_h2.textContent = stage_of_the_game;
    battlesList.appendChild(stage_h2);

    const buttons_names = {
        "Pitch convincente": 6,
        "Produto com bugs": -4,
        "Boa tração de usuários": 3,
        "Investidor irritado": -6,
        "Fake news no pitch": -8
    };

    //console.log(battles);
    // Object.entries(battles).forEach(([key, battle], index) => {
    //     console.log(key);
    // });


    function createStartupDiv(startup) {    // func pra criar uma startup em uma div
        const div = document.createElement('div');

        const h2 = document.createElement('h2');
        h2.textContent = startup.nome;

        const h3 = document.createElement('h3');
        h3.textContent = `Pontos: ${startup.points}`;

        const p = document.createElement('p');
        p.textContent = startup.slogan;

        div.appendChild(h2);
        div.appendChild(h3);
        div.appendChild(p);

        //criando os botoes
        //buttons_names.forEach(btnLabel => {
        Object.entries(buttons_names).forEach(([btnLabel, value], index) => { 
            const btn = document.createElement('button');
            btn.textContent = `${btnLabel} (${value})`;
            btn.classList.add('vote-button');

            let isClicked = false; // para garantir que será clicado apenas uma vez
            btn.addEventListener('click', () => {
                if(!isClicked){
                    //alert(`Você votou: "${btnLabel}" para ${startup.nome} com id ${startup.id}`);
                    startup.points += value;
                    h3.textContent = `Pontos: ${startup.points}`;
                    fetch('/vote', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: startup.id,
                            points: startup.points,
                            vote_type: btnLabel
                        })
                    });
                    btn.classList.add('vote-button-pressed');
                    isClicked = true;
                }else{
                    alert('Botao já clicado!');
                }
            });

            div.appendChild(btn);
        });

        return div;
    }

    Object.entries(battles).forEach(([key, battle], index) => {
        const li = document.createElement('li');
    
        const game_text = document.createTextNode(`GAME ${parseInt(key) + 1}`);
        li.appendChild(game_text);
    
        const div1 = createStartupDiv(battle.chosen1, key);
        const div2 = createStartupDiv(battle.chosen2, key);

        li.appendChild(div1);
        li.appendChild(div2);
        battlesList.appendChild(li);
    });



    btn_result.addEventListener('click', () =>{

        function manage_battle(to_be_added_points_id, to_be_killed_id){ //funcao pra manejar uma batalha
            fetch('/manage_battle', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id_champion: to_be_added_points_id,
                    id_loser: to_be_killed_id
                })
            });
            if(stage_of_the_game === 'Grand Final'){
                window.location.href = '/results';
            }else{
                window.location.href = '/battle';
            }
        }

        Object.entries(battles).forEach(([key, battle], index) => {
            console.log(battle);
            if(battle.chosen1.points > battle.chosen2.points){
                manage_battle(battle.chosen1.id, battle.chosen2.id);
            }
            if(battle.chosen1.points < battle.chosen2.points){
                manage_battle(battle.chosen2.id, battle.chosen1.id);
            }
            if(battle.chosen1.points === battle.chosen2.points){ // logica de empate (Shark Fight!)
                const random_choice = Math.floor(Math.random() * 2);
                alert('BATALHA DE DESEMPATE!');
                console.log('BATALHA DE DESEMPATE!');
                console.log(battle.chosen1.nome + 'vs' + battle.chosen2.nome);
                const choosen_to_be_KILLED = Object.keys(battle)[random_choice];
                if(battle[choosen_to_be_KILLED] === battle.chosen1){
                    alert('Campeao do desempate foi: ' + battle.chosen2.nome);
                    fetch('/update_points', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: battle.chosen2.id,
                        })
                    });
                    manage_battle(battle.chosen2.id, battle.chosen1.id);
                }else{
                    alert('Campeao do desempate foi: ' + battle.chosen1.nome);
                    fetch('/update_points', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: battle.chosen1.id,
                        })
                    });
                    manage_battle(battle.chosen1.id, battle.chosen2.id);
                }
            }
        })
    })



});

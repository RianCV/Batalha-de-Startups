const registration_list = document.getElementById('registration-list');
const btn_criar = document.getElementById('btn-criar-startups');
const btn_play_music = document.getElementById('play');

const audio = new Audio('static/audio/my_song.mp3');
btn_play_music.addEventListener('click', () => {
    audio.play();
});

function change_list_number(num){
    registration_list.innerHTML = '';
    for (let i = 0; i < num; i++) {
        const div = document.createElement('div');
        div.classList.add('startup');

        const label1 = document.createElement("label");
        label1.innerHTML = "Nome:<br>";
        const input1 = document.createElement("input");
        input1.type = "text";
        input1.name = 'nome';
        label1.appendChild(input1);
        div.appendChild(label1);

        const label2 = document.createElement("label");
        label2.innerHTML = "Slogan:<br>";
        const input2 = document.createElement("input");
        input2.type = "text";
        input2.name = 'slogan';
        label2.appendChild(input2);
        div.appendChild(label2);

        const label3 = document.createElement("label");
        label3.innerHTML = "Ano de Lançamento:<br>";
        const input3 = document.createElement("input");
        input3.type = "number";
        input3.name = 'ano_lancamento';
        label3.appendChild(input3);
        div.appendChild(label3);

        registration_list.appendChild(div);
    }
}

btn_criar.addEventListener('click', async () => {
    const startupDivs = document.querySelectorAll('.startup');
    const startups_list = [];

    if (startupDivs.length === 0) {
        alert("Escolha a quantidade de startups antes de continuar.");
        return;
    }

    let isProblem = false;

    for(const div of startupDivs){
        const nome = div.querySelector('input[name="nome"]').value.trim();
        const slogan = div.querySelector('input[name="slogan"]').value.trim();
        const ano = div.querySelector('input[name="ano_lancamento"]').value.trim();

        if (!nome || !slogan || !ano) {
            alert("Todos os campos devem ser preenchidos.");
            isProblem = true;
            break;
        }

        const ano_lancamento = parseInt(ano);
        if (isNaN(ano_lancamento) || ano_lancamento < 1950 || ano_lancamento > new Date().getFullYear()) {
            alert("Ano inválido. Refazer");
            isProblem = true;
            break;
        }

        startups_list.push({
            nome,
            slogan,
            ano_lancamento: ano,
            points: 70,
            isAlive: true
        });
    };

    if(isProblem){
        return;
    }
    try {
        const response = await fetch('/startups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(startups_list)
        });
        if (response.ok) {
            window.location.href = '/battle';
        } else {
            alert('Erro ao enviar os dados!');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
});
const campeao_h1 = document.getElementById('campeao');
const slogan_h2 = document.getElementById('slogan');

async function getData(){
    try{
        const response = await fetch('/data_results');
        const data = await response.json();
        return data;
    }catch (error){
        console.log(error.message);
    }
}

getData().then((data) => {
    const startups = data['startups']
    const votes = data['votes'] 

    const stats = {};
    
    

    for (const startup of startups) {
        stats[startup.id] = {
            nome: startup.nome,
            points: startup.points,
            slogan: startup.slogan,
            'Pitch convincente': 0,
            'Produto com bugs': 0,
            'Boa tração de usuários': 0,
            'Investidor irritado': 0,
            'Fake news no pitch': 0
        };
    }
    
    for (const vote of votes) {
        const startup_id = vote.startup_id;
        const tipo = vote.tipo;
        stats[vote.startup_id][tipo]++;
    }


    const table = document.querySelector('table');

    const sortedStats = Object.values(stats).sort((a, b) => b.points - a.points); //ordenando
    campeao_h1.textContent = sortedStats[0].nome;
    slogan_h2.textContent = sortedStats[0].slogan;
    for (const startup of sortedStats) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startup.nome}</td>
            <td>${startup['Boa tração de usuários']}</td>
            <td>${startup['Fake news no pitch']}</td>
            <td>${startup['Investidor irritado']}</td>
            <td>${startup['Pitch convincente']}</td>
            <td>${startup['Produto com bugs']}</td>
            <td>${startup.points}</td>
        `;

        table.appendChild(row);
    }

    console.log(sortedStats[0].slogan);
    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slogan: sortedStats[0].slogan, name: sortedStats[0].nome})
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("judgeIA_answer").textContent = data.response;
    })
    .catch(error => console.error("Error:", error));
})
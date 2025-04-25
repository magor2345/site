let decks
loadCards()

const main = "main"
let btn = document.getElementById("challenge")
let list = document.getElementById("roll-list")
btn.onclick = (e) => printCards(e);

function printCards(e) {
    e.preventDefault()
    if (!decks || !decks[main]) return
    const cards = getCards(decks[main])
    cards.forEach((card)=>{
        list.appendChild(createCard(card))
    })
    btn.classList.add("clicked")
    list.classList.add("shown")
}

function createCard(rollValue) {
    const card = document.createElement("div");
    card.classList.add("roll-item")
    const title = document.createElement("h2")
    title.innerText = rollValue.name
    const content = document.createElement("h3")
    content.innerText = rollValue.value
    card.appendChild(title)
    card.appendChild(content)
    return card
}

function getCards(deck) {
    let cards = []
    deck.pools.forEach((pool)=>{
        let weight_pool = getPool(pool)
        for (let i = getRolls(pool); i > 0; i--) {
            index = randomIndexByWeight(weight_pool)
            console.log(weight_pool)
            entry = pool.entries[index]
            if (entry.type == "deck") {
                if (entry.value in decks){
                    cards = [...cards, ...getCards(decks[entry.value])]
                }
            } else {
                cards.push(
                    {
                        name: pool.name,
                        value: entry.value
                    }
                )
            }
        }
    })
    return cards
}

function getRolls(pool) {
    if (!("rolls" in pool)) return 1
    if (Number.isInteger(pool.rolls) && pool.rolls > 0) return pool.rolls
    if (Number.isInteger(pool.rolls.min) && Number.isInteger(pool.rolls.max) && pool.rolls.max - pool.rolls.min > 0) {
        return pool.rolls.min + Math.floor((pool.rolls.max - pool.rolls.min + 1) * Math.random())
    }
    return 0
}

function getWeights(pool) {
    let total = 0
    const arr = pool.entries.map((entry)=>{
        const weight = "weight" in entry ? entry.weight : 1
        total += weight
        return weight
    })
    const indexes = []
    for (let i = 0; i < arr.length; i++) indexes.push[i]
    return [total, arr, indexes]
}

function randomIndexByWeight(card_pool) {
    let roll = card_pool.weight * Math.random()
    let current = -1
    let sum = 0
    do {
        current += 1
        sum += card_pool.pool[current].weight
    } while (roll > sum)
    const index = card_pool.pool[current].index
    if ("limit" in card_pool.pool[current]) {
        card_pool.pool[current].limit -= 1
        if (card_pool.pool[current].limit <= 0) {
            card_pool.weight -= card_pool.pool[current].weight
            card_pool.pool.splice(current, 1)
        }
    }
    return index
}

function getPool(pool) {
    const arr = []
    let total = 0
    pool.entries.forEach((entry, i)=>{
        const weight = "weight" in entry ? entry.weight : 1
        total += weight
        if ("limit" in entry) {
            if (entry.limit > 0) arr.push({weight, limit: entry.limit, index: i})
        } else {
            arr.push({weight, index: i})
        }
    })
    return {
        pool: arr,
        weight: total
    }
}

async function loadCards() {
    const new_decks = {}
    const card_index = await loadJSON('./card_index.json')
    if (card_index.sucess && Array.isArray(card_index.data)) {
        card_index.data.forEach(async (deck_name)=>{
            const deck = await loadJSON('./cards/' + deck_name + '.json')
            if (!deck.sucess) return
            new_decks[deck_name] = deck.data
        })
    }
    decks = new_decks
}

async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return {sucess:1, data}
    } catch {
        return {sucess: 0}
    }
}
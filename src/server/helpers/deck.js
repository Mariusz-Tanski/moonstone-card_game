var cardsData = [
  {
    mass: 1000,
    name: 'sun',
    count: 4
  },
  {
    mass: 100,
    name: 'moon',
    count: 1
  },
  {
    mass: 1,
    name: 'stone',
    count: 1
  },
  {
    mass: 150,
    name: 'mercury',
    count: 4
  },
  {
    mass: 250,
    name: 'venus',
    count: 4
  },
  {
    mass: 300,
    name: 'earth',
    count: 4
  },
  {
    mass: 200,
    name: 'mars',
    count: 4
  },
  {
    mass: 500,
    name: 'jupiter',
    count: 4
  },
  {
    mass: 450,
    name: 'saturn',
    count: 4
  },
  {
    mass: 400,
    name: 'uranus',
    count: 4
  },
  {
    mass: 350,
    name: 'neptune',
    count: 4
  },
  {
    mass: 50,
    name: 'pluto',
    count: 4
  }
]

var deck = [];

cardsData.forEach(data => {
  for(var i = 0; i < data.count; i++) {
    var { name, mass } = data;
    deck.push({ name, mass })
  }
});

export default deck;

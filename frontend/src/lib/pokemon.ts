export async function GetRandomPokemonTeamByGenerations(inputGens: number[]): Promise<number[]> {
  const availablePokemon: number[] = [];
  const generationMap = await buildGenPokemonMap();

  inputGens.forEach((gen) => {
    if (generationMap[gen]) {
      availablePokemon.push(...generationMap[gen]);
    }
  });

  const selected: Set<number> = new Set();

  while (selected.size < 6 && selected.size < availablePokemon.length) {
    const randomIndex = Math.floor(Math.random() * availablePokemon.length);
    selected.add(availablePokemon[randomIndex]);
  }

  return Array.from(selected);
}

type GenerationMap = Record<number, number[]>;

function romanToNumber(roman: string): number {
  const map: Record<string, number> = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };
  return map[roman.toLowerCase()] || 0;
}

export async function buildGenPokemonMap(): Promise<GenerationMap> {
  const map: GenerationMap = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  };

  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1400&offset=0');
  const data = await res.json();

  const results: { name: string; url: string }[] = data.results;

  await Promise.all(
    results.map(async (pokemon) => {
      try {
        const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);

        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${id}/`;
        const speciesRes = await fetch(speciesUrl);
        const species = await speciesRes.json();

        if (species.is_legendary || species.is_mythical) return;

        const genName: string = species.generation.name; // e.g. 'generation-iii'
        const roman = genName.replace('generation-', '');
        const genNum = romanToNumber(roman);

        if (genNum >= 1 && genNum <= 9) {
          map[genNum].push(id);
        }
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      } catch (error) {
        // silently fail
      }
    })
  );

  return map;
}

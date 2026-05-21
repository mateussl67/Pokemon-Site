import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, GitCompareArrows, Shield, Sparkles, Swords } from 'lucide-react';
import './styles.css';

type TypeName =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy';

type Pokemon = {
  id: number;
  name: string;
  types: TypeName[];
  stats?: PokemonStats;
  moves?: PokemonMoveRef[];
};

type TypeFilter = TypeName | 'All';
type ViewMode = 'pokedex' | 'compare' | 'moves' | 'items' | 'nature';
type PokedexMode = 'list' | 'detail';

type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

type PokemonMove = {
  id: number;
  name: string;
  type: TypeName;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damageClass: string;
  learnedByCount: number;
};

type PokemonItem = {
  id: number;
  name: string;
  category: string;
  cost: number;
  sprite: string;
  utility: string;
};

type PokemonMoveRef = {
  name: string;
  url: string;
};

type ApiPokemon = {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
};

type ApiGenerationList = {
  results: Array<{
    name: string;
    url: string;
  }>;
};

type ApiGeneration = {
  id: number;
  pokemon_species: Array<{
    name: string;
    url: string;
  }>;
};

type ApiMoveList = {
  results: Array<{
    name: string;
    url: string;
  }>;
};

type ApiMove = {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  damage_class: {
    name: string;
  };
  learned_by_pokemon: Array<{
    name: string;
    url: string;
  }>;
  type: {
    name: string;
  };
};

type ApiItemList = {
  results: Array<{
    name: string;
    url: string;
  }>;
};

type ApiItem = {
  id: number;
  name: string;
  cost: number;
  category: {
    name: string;
  };
  sprites: {
    default: string | null;
  };
  effect_entries: Array<{
    short_effect: string;
    language: {
      name: string;
    };
  }>;
  flavor_text_entries: Array<{
    text: string;
    language: {
      name: string;
    };
  }>;
};

const types: TypeName[] = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
];

const typeColors: Record<TypeName, string> = {
  Normal: '#8f98a1',
  Fire: '#f26d3d',
  Water: '#348ad9',
  Electric: '#f2c94c',
  Grass: '#4fad5d',
  Ice: '#62c6d7',
  Fighting: '#c94c4c',
  Poison: '#9657c8',
  Ground: '#c3924a',
  Flying: '#7d9bd8',
  Psychic: '#e85b91',
  Bug: '#92a93b',
  Rock: '#a68a52',
  Ghost: '#675491',
  Dragon: '#5d66d6',
  Dark: '#4c4f56',
  Steel: '#7f9aa8',
  Fairy: '#dd78b4',
};

const weaknesses: Record<TypeName, TypeName[]> = {
  Normal: ['Fighting'],
  Fire: ['Water', 'Ground', 'Rock'],
  Water: ['Electric', 'Grass'],
  Electric: ['Ground'],
  Grass: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
  Ice: ['Fire', 'Fighting', 'Rock', 'Steel'],
  Fighting: ['Flying', 'Psychic', 'Fairy'],
  Poison: ['Ground', 'Psychic'],
  Ground: ['Water', 'Grass', 'Ice'],
  Flying: ['Electric', 'Ice', 'Rock'],
  Psychic: ['Bug', 'Ghost', 'Dark'],
  Bug: ['Fire', 'Flying', 'Rock'],
  Rock: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
  Ghost: ['Ghost', 'Dark'],
  Dragon: ['Ice', 'Dragon', 'Fairy'],
  Dark: ['Fighting', 'Bug', 'Fairy'],
  Steel: ['Fire', 'Fighting', 'Ground'],
  Fairy: ['Poison', 'Steel'],
};

const strengths: Record<TypeName, TypeName[]> = {
  Normal: [],
  Fire: ['Grass', 'Ice', 'Bug', 'Steel'],
  Water: ['Fire', 'Ground', 'Rock'],
  Electric: ['Water', 'Flying'],
  Grass: ['Water', 'Ground', 'Rock'],
  Ice: ['Grass', 'Ground', 'Flying', 'Dragon'],
  Fighting: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
  Poison: ['Grass', 'Fairy'],
  Ground: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
  Flying: ['Grass', 'Fighting', 'Bug'],
  Psychic: ['Fighting', 'Poison'],
  Bug: ['Grass', 'Psychic', 'Dark'],
  Rock: ['Fire', 'Ice', 'Flying', 'Bug'],
  Ghost: ['Psychic', 'Ghost'],
  Dragon: ['Dragon'],
  Dark: ['Psychic', 'Ghost'],
  Steel: ['Ice', 'Rock', 'Fairy'],
  Fairy: ['Fighting', 'Dragon', 'Dark'],
};

const noEffect: Partial<Record<TypeName, TypeName[]>> = {
  Normal: ['Ghost'],
  Electric: ['Ground'],
  Fighting: ['Ghost'],
  Poison: ['Steel'],
  Ground: ['Flying'],
  Psychic: ['Dark'],
  Ghost: ['Normal'],
  Dragon: ['Fairy'],
};

const notVeryEffective: Record<TypeName, TypeName[]> = {
  Normal: ['Rock', 'Steel'],
  Fire: ['Fire', 'Water', 'Rock', 'Dragon'],
  Water: ['Water', 'Grass', 'Dragon'],
  Electric: ['Electric', 'Grass', 'Dragon'],
  Grass: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
  Ice: ['Fire', 'Water', 'Ice', 'Steel'],
  Fighting: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
  Poison: ['Poison', 'Ground', 'Rock', 'Ghost'],
  Ground: ['Grass', 'Bug'],
  Flying: ['Electric', 'Rock', 'Steel'],
  Psychic: ['Psychic', 'Steel'],
  Bug: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
  Rock: ['Fighting', 'Ground', 'Steel'],
  Ghost: ['Dark'],
  Dragon: ['Steel'],
  Dark: ['Fighting', 'Dark', 'Fairy'],
  Steel: ['Fire', 'Water', 'Electric', 'Steel'],
  Fairy: ['Fire', 'Poison', 'Steel'],
};

const fallbackPokemon: Pokemon[] = [
  { id: 282, name: 'Gardevoir', types: ['Psychic', 'Fairy'], stats: { hp: 68, attack: 65, defense: 65, specialAttack: 125, specialDefense: 115, speed: 80 } },
  { id: 306, name: 'Aggron', types: ['Steel', 'Rock'], stats: { hp: 70, attack: 110, defense: 180, specialAttack: 60, specialDefense: 60, speed: 50 } },
  { id: 330, name: 'Flygon', types: ['Ground', 'Dragon'], stats: { hp: 80, attack: 100, defense: 80, specialAttack: 80, specialDefense: 80, speed: 100 } },
  { id: 373, name: 'Salamence', types: ['Dragon', 'Flying'], stats: { hp: 95, attack: 135, defense: 80, specialAttack: 110, specialDefense: 80, speed: 100 } },
  { id: 376, name: 'Metagross', types: ['Steel', 'Psychic'], stats: { hp: 80, attack: 135, defense: 130, specialAttack: 95, specialDefense: 90, speed: 70 } },
  { id: 384, name: 'Rayquaza', types: ['Dragon', 'Flying'], stats: { hp: 105, attack: 150, defense: 90, specialAttack: 150, specialDefense: 90, speed: 95 } },
  { id: 448, name: 'Lucario', types: ['Fighting', 'Steel'], stats: { hp: 70, attack: 110, defense: 70, specialAttack: 115, specialDefense: 70, speed: 90 } },
  { id: 658, name: 'Greninja', types: ['Water', 'Dark'], stats: { hp: 72, attack: 95, defense: 67, specialAttack: 103, specialDefense: 71, speed: 122 } },
  { id: 700, name: 'Sylveon', types: ['Fairy'], stats: { hp: 95, attack: 65, defense: 65, specialAttack: 110, specialDefense: 130, speed: 60 } },
  { id: 812, name: 'Rillaboom', types: ['Grass'], stats: { hp: 100, attack: 125, defense: 90, specialAttack: 60, specialDefense: 70, speed: 85 } },
  { id: 887, name: 'Dragapult', types: ['Dragon', 'Ghost'], stats: { hp: 88, attack: 120, defense: 75, specialAttack: 100, specialDefense: 75, speed: 142 } },
  { id: 908, name: 'Meowscarada', types: ['Grass', 'Dark'], stats: { hp: 76, attack: 110, defense: 70, specialAttack: 81, specialDefense: 70, speed: 123 } },
  { id: 1000, name: 'Gholdengo', types: ['Steel', 'Ghost'], stats: { hp: 87, attack: 60, defense: 95, specialAttack: 133, specialDefense: 91, speed: 84 } },
];

const fallbackMoves: PokemonMove[] = [
  { id: 33, name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, pp: 35, damageClass: 'physical', learnedByCount: 257 },
  { id: 52, name: 'Ember', type: 'Fire', power: 40, accuracy: 100, pp: 25, damageClass: 'special', learnedByCount: 72 },
  { id: 55, name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, pp: 25, damageClass: 'special', learnedByCount: 81 },
  { id: 85, name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, pp: 15, damageClass: 'special', learnedByCount: 119 },
  { id: 89, name: 'Earthquake', type: 'Ground', power: 100, accuracy: 100, pp: 10, damageClass: 'physical', learnedByCount: 202 },
  { id: 94, name: 'Psychic', type: 'Psychic', power: 90, accuracy: 100, pp: 10, damageClass: 'special', learnedByCount: 158 },
  { id: 126, name: 'Fire Blast', type: 'Fire', power: 110, accuracy: 85, pp: 5, damageClass: 'special', learnedByCount: 103 },
  { id: 247, name: 'Shadow Ball', type: 'Ghost', power: 80, accuracy: 100, pp: 15, damageClass: 'special', learnedByCount: 174 },
  { id: 337, name: 'Dragon Claw', type: 'Dragon', power: 80, accuracy: 100, pp: 15, damageClass: 'physical', learnedByCount: 78 },
  { id: 583, name: 'Moonblast', type: 'Fairy', power: 95, accuracy: 100, pp: 15, damageClass: 'special', learnedByCount: 54 },
];

const fallbackItems: PokemonItem[] = [
  {
    id: 1,
    name: 'Master Ball',
    category: 'Standard Balls',
    cost: 0,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
    utility: 'Captura qualquer Pokemon selvagem sem chance de falha.',
  },
  {
    id: 2,
    name: 'Ultra Ball',
    category: 'Standard Balls',
    cost: 800,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
    utility: 'Aumenta bastante a chance de capturar Pokemon selvagens.',
  },
  {
    id: 17,
    name: 'Potion',
    category: 'Healing',
    cost: 200,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
    utility: 'Restaura uma pequena quantidade de HP de um Pokemon.',
  },
  {
    id: 21,
    name: 'Revive',
    category: 'Revival',
    cost: 2000,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png',
    utility: 'Reanima um Pokemon desmaiado e recupera parte do HP.',
  },
  {
    id: 80,
    name: 'Fire Stone',
    category: 'Evolution',
    cost: 3000,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fire-stone.png',
    utility: 'Evolui Pokemon compativeis com a Pedra de Fogo.',
  },
  {
    id: 126,
    name: 'Rare Candy',
    category: 'Leveling',
    cost: 10000,
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
    utility: 'Aumenta o nivel de um Pokemon em 1.',
  },
];

const apiTypeMap: Record<string, TypeName> = {
  normal: 'Normal',
  fire: 'Fire',
  water: 'Water',
  electric: 'Electric',
  grass: 'Grass',
  ice: 'Ice',
  fighting: 'Fighting',
  poison: 'Poison',
  ground: 'Ground',
  flying: 'Flying',
  psychic: 'Psychic',
  bug: 'Bug',
  rock: 'Rock',
  ghost: 'Ghost',
  dragon: 'Dragon',
  dark: 'Dark',
  steel: 'Steel',
  fairy: 'Fairy',
};

function formatPokemonName(name: string) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function cleanApiText(text: string) {
  return text.replace(/\s+/g, ' ').replace(/\f/g, ' ').trim();
}

function readIdFromUrl(url: string) {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : 0;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function toPokemon(entry: ApiPokemon): Pokemon {
  const stats = entry.stats.reduce(
    (total, item) => {
      if (item.stat.name === 'hp') total.hp = item.base_stat;
      if (item.stat.name === 'attack') total.attack = item.base_stat;
      if (item.stat.name === 'defense') total.defense = item.base_stat;
      if (item.stat.name === 'special-attack') total.specialAttack = item.base_stat;
      if (item.stat.name === 'special-defense') total.specialDefense = item.base_stat;
      if (item.stat.name === 'speed') total.speed = item.base_stat;
      return total;
    },
    { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
  );

  return {
    id: entry.id,
    name: formatPokemonName(entry.name),
    types: entry.types.sort((a, b) => a.slot - b.slot).map((item) => apiTypeMap[item.type.name]),
    stats,
    moves: entry.moves.map((item) => item.move),
  };
}

function toMove(entry: ApiMove): PokemonMove | null {
  const type = apiTypeMap[entry.type.name];
  if (!type || entry.learned_by_pokemon.length === 0) {
    return null;
  }

  return {
    id: entry.id,
    name: formatPokemonName(entry.name),
    type,
    power: entry.power,
    accuracy: entry.accuracy,
    pp: entry.pp,
    damageClass: formatPokemonName(entry.damage_class.name),
    learnedByCount: entry.learned_by_pokemon.length,
  };
}

function toItem(entry: ApiItem): PokemonItem {
  const localizedText =
    entry.flavor_text_entries.find((item) => item.language.name === 'pt-BR')?.text ??
    entry.flavor_text_entries.find((item) => item.language.name === 'pt')?.text ??
    entry.flavor_text_entries.find((item) => item.language.name === 'en')?.text ??
    entry.effect_entries.find((item) => item.language.name === 'en')?.short_effect ??
    'Item usado durante a aventura Pokemon.';

  return {
    id: entry.id,
    name: formatPokemonName(entry.name),
    category: formatPokemonName(entry.category.name),
    cost: entry.cost,
    sprite: entry.sprites.default ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${entry.name}.png`,
    utility: cleanApiText(localizedText),
  };
}

function getTypeEffectiveness(attackType: TypeName, defenseType: TypeName) {
  if (noEffect[attackType]?.includes(defenseType)) {
    return 0;
  }

  if (strengths[attackType].includes(defenseType)) {
    return 2;
  }

  if (notVeryEffective[attackType].includes(defenseType)) {
    return 0.5;
  }

  return 1;
}

function getDamageMultiplier(attackType: TypeName, defenderTypes: TypeName[]) {
  return defenderTypes.reduce((multiplier, defenseType) => multiplier * getTypeEffectiveness(attackType, defenseType), 1);
}

function getDamageLabel(multiplier: number) {
  if (multiplier === 0) {
    return 'Imune';
  }

  if (multiplier > 1) {
    return 'Super efetivo';
  }

  if (multiplier < 1) {
    return 'Nao efetivo';
  }

  return 'Dano normal';
}

function getDamageTone(multiplier: number) {
  if (multiplier === 0) {
    return 'immune';
  }

  if (multiplier > 1) {
    return 'strong';
  }

  if (multiplier < 1) {
    return 'weak';
  }

  return 'normal';
}

async function loadAllPokemon() {
  const generationList = await fetchJson<ApiGenerationList>('https://pokeapi.co/api/v2/generation?limit=100');
  const generationUrls = generationList.results
    .map((generation) => ({ id: readIdFromUrl(generation.url), url: generation.url }))
    .sort((a, b) => a.id - b.id);

  const generations = await Promise.all(generationUrls.map((generation) => fetchJson<ApiGeneration>(generation.url)));
  const pokemonIds = [...new Set(generations.flatMap((generation) => generation.pokemon_species.map((species) => readIdFromUrl(species.url))))].sort(
    (a, b) => a - b,
  );
  const loadedPokemon: Pokemon[] = [];

  for (let index = 0; index < pokemonIds.length; index += 40) {
    const batch = pokemonIds.slice(index, index + 40);
    const results = await Promise.all(batch.map((id) => fetchJson<ApiPokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`)));
    loadedPokemon.push(...results.map(toPokemon));
  }

  return loadedPokemon.sort((a, b) => a.id - b.id);
}

async function loadAllMoves() {
  const moveList = await fetchJson<ApiMoveList>('https://pokeapi.co/api/v2/move?limit=2000');
  const loadedMoves: PokemonMove[] = [];

  for (let index = 0; index < moveList.results.length; index += 50) {
    const batch = moveList.results.slice(index, index + 50);
    const results = await Promise.all(batch.map((move) => fetchJson<ApiMove>(move.url)));
    loadedMoves.push(...results.map(toMove).filter((move): move is PokemonMove => Boolean(move)));
  }

  return loadedMoves.sort((a, b) => a.id - b.id);
}

async function loadAllItems() {
  const itemList = await fetchJson<ApiItemList>('https://pokeapi.co/api/v2/item?limit=3000');
  const loadedItems: PokemonItem[] = [];

  for (let index = 0; index < itemList.results.length; index += 60) {
    const batch = itemList.results.slice(index, index + 60);
    const results = await Promise.all(batch.map((item) => fetchJson<ApiItem>(item.url)));
    loadedItems.push(...results.map(toItem));
  }

  return loadedItems.sort((a, b) => a.id - b.id);
}

function TypeBadge({ type }: { type: TypeName }) {
  return (
    <span className="type-badge" style={{ '--type-color': typeColors[type] } as React.CSSProperties}>
      {type}
    </span>
  );
}

function TypeGroup({ title, icon, items, empty }: { title: string; icon: React.ReactNode; items: TypeName[]; empty?: string }) {
  return (
    <section className="info-panel">
      <div className="panel-title">
        {icon}
        <h2>{title}</h2>
      </div>
      <div className="badge-grid">
        {items.length ? items.map((type) => <TypeBadge key={type} type={type} />) : <p className="empty">{empty}</p>}
      </div>
    </section>
  );
}

function PokemonSelect({
  inputId,
  label,
  pokemon,
  value,
  onChange,
}: {
  inputId: string;
  label: string;
  pokemon: Pokemon[];
  value: number;
  onChange: (id: number) => void;
}) {
  const selected = pokemon.find((entry) => entry.id === value) ?? pokemon[0] ?? fallbackPokemon[0];
  const [search, setSearch] = useState('');
  const datalistId = `${inputId}-options`;

  useEffect(() => {
    setSearch(`#${String(selected.id).padStart(3, '0')} ${selected.name}`);
  }, [selected.id, selected.name]);

  function selectFromSearch(nextSearch: string) {
    setSearch(nextSearch);

    const normalized = nextSearch.trim().toLowerCase();
    const match = pokemon.find((entry) => {
      const paddedId = String(entry.id).padStart(3, '0');
      return (
        normalized === entry.name.toLowerCase() ||
        normalized === String(entry.id) ||
        normalized === `#${entry.id}` ||
        normalized === `#${paddedId}` ||
        normalized === `#${paddedId} ${entry.name.toLowerCase()}`
      );
    });

    if (match) {
      onChange(match.id);
    }
  }

  return (
    <label className="pokemon-select">
      <span>{label}</span>
      <input
        aria-label={`Pesquisar ${label}`}
        list={datalistId}
        onBlur={() => setSearch(`#${String(selected.id).padStart(3, '0')} ${selected.name}`)}
        onChange={(event) => selectFromSearch(event.target.value)}
        placeholder="Digite nome ou numero"
        value={search}
      />
      <datalist id={datalistId}>
        {pokemon.map((entry) => (
          <option key={entry.id} value={`#${String(entry.id).padStart(3, '0')} ${entry.name}`} />
        ))}
      </datalist>
    </label>
  );
}

function ComparisonSide({ attacker, defender }: { attacker: Pokemon; defender: Pokemon }) {
  const outcomes = attacker.types.map((type) => {
    const multiplier = getDamageMultiplier(type, defender.types);
    return {
      type,
      multiplier,
      label: getDamageLabel(multiplier),
      tone: getDamageTone(multiplier),
    };
  });

  const weaknessesFromAttacker = outcomes.filter((outcome) => outcome.multiplier > 1);

  return (
    <article className="comparison-card">
      <div className="comparison-pokemon">
        <img
          alt={attacker.name}
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${attacker.id}.png`}
        />
        <div>
          <p>Atacante</p>
          <h3>{attacker.name}</h3>
          <div className="mini-badges">{attacker.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
        </div>
      </div>

      <div className="comparison-target">
        <p>Contra {defender.name}</p>
        <div className="mini-badges">{defender.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
      </div>

      <div className="damage-list">
        {outcomes.map((outcome) => (
          <div className={`damage-row ${outcome.tone}`} key={outcome.type}>
            <TypeBadge type={outcome.type} />
            <strong>{outcome.multiplier}x</strong>
            <span>{outcome.label}</span>
          </div>
        ))}
      </div>

      <div className="weakness-summary">
        <p>Fraquezas exploradas</p>
        {weaknessesFromAttacker.length ? (
          <div className="badge-grid">{weaknessesFromAttacker.map((outcome) => <TypeBadge key={outcome.type} type={outcome.type} />)}</div>
        ) : (
          <span>Nenhum tipo do atacante e super efetivo contra esse alvo.</span>
        )}
      </div>
    </article>
  );
}

function CompareView({ pokemon }: { pokemon: Pokemon[] }) {
  const firstDefault = pokemon[0]?.id ?? fallbackPokemon[0].id;
  const secondDefault = pokemon[1]?.id ?? fallbackPokemon[1].id;
  const [firstId, setFirstId] = useState(firstDefault);
  const [secondId, setSecondId] = useState(secondDefault);

  useEffect(() => {
    if (!pokemon.some((entry) => entry.id === firstId)) {
      setFirstId(firstDefault);
    }

    if (!pokemon.some((entry) => entry.id === secondId)) {
      setSecondId(secondDefault);
    }
  }, [firstDefault, firstId, pokemon, secondDefault, secondId]);

  const first = pokemon.find((entry) => entry.id === firstId) ?? pokemon[0] ?? fallbackPokemon[0];
  const second = pokemon.find((entry) => entry.id === secondId) ?? pokemon[1] ?? fallbackPokemon[1];

  return (
    <section className="compare-section">
      <div className="compare-controls">
        <PokemonSelect inputId="pokemon-a" label="Pokemon A" pokemon={pokemon} value={first.id} onChange={setFirstId} />
        <button
          className="swap-button"
          onClick={() => {
            setFirstId(second.id);
            setSecondId(first.id);
          }}
          type="button"
          title="Trocar Pokemon"
        >
          <GitCompareArrows size={20} />
        </button>
        <PokemonSelect inputId="pokemon-b" label="Pokemon B" pokemon={pokemon} value={second.id} onChange={setSecondId} />
      </div>

      <div className="comparison-grid">
        <ComparisonSide attacker={first} defender={second} />
        <ComparisonSide attacker={second} defender={first} />
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="stat-pill">
      <strong>{value}</strong>
      {label}
    </span>
  );
}

function getRecommendedNature(pokemon: Pokemon) {
  const stats = pokemon.stats;
  if (!stats) {
    return {
      name: 'Hardy',
      boosts: 'Neutro',
      lowers: 'Neutro',
      reason: 'Stats indisponiveis. Nature neutra recomendada como base segura.',
    };
  }

  const physicalScore = stats.attack + stats.speed * 0.45;
  const specialScore = stats.specialAttack + stats.speed * 0.45;
  const isPhysical = physicalScore >= specialScore;
  const mainAttack = isPhysical ? stats.attack : stats.specialAttack;
  const speedGap = Math.abs(stats.speed - mainAttack);
  const shouldBoostSpeed = stats.speed >= 95 && speedGap <= 35;

  if (isPhysical) {
    return shouldBoostSpeed
      ? {
          name: 'Jolly',
          boosts: 'Speed',
          lowers: 'Special Attack',
          reason: 'Acelera um atacante fisico e reduz o Special Attack, que tende a ser menos usado.',
        }
      : {
          name: 'Adamant',
          boosts: 'Attack',
          lowers: 'Special Attack',
          reason: 'Aumenta o dano fisico e reduz o Special Attack, preservando o papel ofensivo principal.',
        };
  }

  return shouldBoostSpeed
    ? {
        name: 'Timid',
        boosts: 'Speed',
        lowers: 'Attack',
        reason: 'Acelera um atacante especial e reduz Attack, que tende a ser menos importante.',
      }
    : {
        name: 'Modest',
        boosts: 'Special Attack',
        lowers: 'Attack',
        reason: 'Aumenta o dano especial e reduz Attack, focando no melhor stat ofensivo.',
  };
}

function calculateStatRange(statName: keyof PokemonStats, base: number) {
  const isHp = statName === 'hp';
  const min = isHp ? Math.floor(((2 * base) * 50) / 100) + 60 : Math.floor((Math.floor(((2 * base) * 50) / 100) + 5) * 0.9);
  const normal = isHp ? Math.floor(((2 * base + 31) * 50) / 100) + 60 : Math.floor(((2 * base + 31) * 50) / 100) + 5;
  const max = isHp
    ? Math.floor(((2 * base + 31 + 63) * 50) / 100) + 60
    : Math.floor((Math.floor(((2 * base + 31 + 63) * 50) / 100) + 5) * 1.1);

  return { min, normal, max };
}

function PokemonDetailPanel({ pokemon, onBack }: { pokemon: Pokemon; onBack?: () => void }) {
  const [detailMoves, setDetailMoves] = useState<PokemonMove[]>([]);
  const [movesLoading, setMovesLoading] = useState(false);
  const [movesError, setMovesError] = useState('');
  const nature = getRecommendedNature(pokemon);
  const moveRefs = pokemon.moves ?? [];

  useEffect(() => {
    let isMounted = true;

    async function loadPokemonMoves() {
      if (!moveRefs.length) {
        setDetailMoves([]);
        return;
      }

      setMovesLoading(true);
      setMovesError('');

      try {
        const loadedMoves: PokemonMove[] = [];
        for (let index = 0; index < moveRefs.length; index += 40) {
          const batch = moveRefs.slice(index, index + 40);
          const results = await Promise.all(batch.map((move) => fetchJson<ApiMove>(move.url)));
          loadedMoves.push(...results.map(toMove).filter((move): move is PokemonMove => Boolean(move)));
        }

        if (isMounted) {
          setDetailMoves(loadedMoves.sort((a, b) => a.id - b.id));
        }
      } catch {
        if (isMounted) {
          setDetailMoves([]);
          setMovesError('Nao foi possivel carregar os ataques desse Pokemon agora.');
        }
      } finally {
        if (isMounted) {
          setMovesLoading(false);
        }
      }
    }

    loadPokemonMoves();

    return () => {
      isMounted = false;
    };
  }, [pokemon.id]);

  const statRows = pokemon.stats
    ? [
        ['HP', 'hp', pokemon.stats.hp],
        ['Attack', 'attack', pokemon.stats.attack],
        ['Defense', 'defense', pokemon.stats.defense],
        ['Sp. Atk', 'specialAttack', pokemon.stats.specialAttack],
        ['Sp. Def', 'specialDefense', pokemon.stats.specialDefense],
        ['Speed', 'speed', pokemon.stats.speed],
      ] as Array<[string, keyof PokemonStats, number]>
    : [];

  return (
    <section className="pokemon-detail-panel">
      {onBack && (
        <button className="back-button" onClick={onBack} type="button">
          Voltar para Pokedex
        </button>
      )}
      <div className="detail-hero">
        <img
          alt={pokemon.name}
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
        />
        <div>
          <p>Pokemon selecionado</p>
          <h2>{pokemon.name}</h2>
          <div className="mini-badges">{pokemon.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
        </div>
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <div className="detail-card-title">
            <h3>Nature recomendada</h3>
            <strong>{nature.name}</strong>
          </div>
          <div className="nature-highlight">
            <strong>{nature.name}</strong>
            <span>+{nature.boosts} / -{nature.lowers}</span>
          </div>
          <p className="nature-reason">{nature.reason}</p>
        </article>

        <article className="detail-card">
          <div className="detail-card-title">
            <h3>Status nivel 50</h3>
            <span>min / normal / max</span>
          </div>
          <div className="stat-range-table">
            {statRows.map(([label, statName, base]) => {
              const range = calculateStatRange(statName, base);
              return (
                <div className="stat-range-row" key={statName}>
                  <span>{label}</span>
                  <strong>{base}</strong>
                  <em>{range.min}</em>
                  <em>{range.normal}</em>
                  <em>{range.max}</em>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <article className="detail-card">
        <div className="detail-card-title">
          <h3>Ataques que pode aprender</h3>
          <span>{movesLoading ? 'Carregando...' : `${detailMoves.length} ataques`}</span>
        </div>
        {movesError && <p className="status-message">{movesError}</p>}
        <div className="detail-moves-grid">
          {detailMoves.map((move) => (
            <div className="detail-move-row" key={move.id}>
              <TypeBadge type={move.type} />
              <strong>{move.name}</strong>
              <span>{move.damageClass}</span>
              <em>{move.power ?? '-'} Pow</em>
            </div>
          ))}
          {!detailMoves.length && (
            <div className="no-results">
              <p>{movesLoading ? 'Buscando ataques do Pokemon selecionado.' : 'Nenhum ataque encontrado para esse Pokemon.'}</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function NatureView({ pokemon }: { pokemon: Pokemon[] }) {
  const [natureQuery, setNatureQuery] = useState('');

  const filteredPokemon = useMemo(() => {
    const normalized = natureQuery.trim().toLowerCase();
    return pokemon.filter((entry) => {
      return (
        normalized.length === 0 ||
        entry.name.toLowerCase().includes(normalized) ||
        String(entry.id) === normalized ||
        entry.types.some((type) => type.toLowerCase().includes(normalized))
      );
    });
  }, [natureQuery, pokemon]);

  return (
    <section className="nature-section">
      <div className="section-heading">
        <h2>Melhor nature por Pokemon</h2>
        <span>{filteredPokemon.length} recomendacoes</span>
      </div>
      <label className="search-box moves-search">
        <Activity size={18} />
        <input
          aria-label="Buscar Pokemon para nature"
          onChange={(event) => setNatureQuery(event.target.value)}
          placeholder="Buscar Pokemon, numero ou tipo"
          value={natureQuery}
        />
      </label>

      <div className="nature-grid">
        {filteredPokemon.map((entry) => {
          const nature = getRecommendedNature(entry);
          return (
            <article className="nature-card" key={entry.id}>
              <img
                alt={entry.name}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
              />
              <div className="nature-card-body">
                <p>#{String(entry.id).padStart(3, '0')}</p>
                <h3>{entry.name}</h3>
                <div className="mini-badges">{entry.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
                <div className="nature-highlight">
                  <strong>{nature.name}</strong>
                  <span>+{nature.boosts} / -{nature.lowers}</span>
                </div>
                <p className="nature-reason">{nature.reason}</p>
                {entry.stats && (
                  <div className="nature-stats">
                    <StatPill label="Atk" value={entry.stats.attack} />
                    <StatPill label="SpA" value={entry.stats.specialAttack} />
                    <StatPill label="Spe" value={entry.stats.speed} />
                  </div>
                )}
              </div>
            </article>
          );
        })}
        {!filteredPokemon.length && (
          <div className="no-results">
            <p>Nenhum Pokemon encontrado para esse filtro.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MovesView({
  moves,
  isLoading,
  error,
}: {
  moves: PokemonMove[];
  isLoading: boolean;
  error: string;
}) {
  const [selectedMoveType, setSelectedMoveType] = useState<TypeFilter>('All');
  const [moveQuery, setMoveQuery] = useState('');

  const filteredMoves = useMemo(() => {
    const normalized = moveQuery.trim().toLowerCase();
    return moves.filter((move) => {
      const matchesType = selectedMoveType === 'All' || move.type === selectedMoveType;
      const matchesQuery =
        normalized.length === 0 ||
        move.name.toLowerCase().includes(normalized) ||
        move.damageClass.toLowerCase().includes(normalized) ||
        move.type.toLowerCase().includes(normalized);
      return matchesType && matchesQuery;
    });
  }, [moveQuery, moves, selectedMoveType]);

  return (
    <section className="moves-section">
      <div className="moves-toolbar">
        <div className="move-type-tabs" role="tablist" aria-label="Tipos dos ataques">
          <button
            className={selectedMoveType === 'All' ? 'active' : ''}
            onClick={() => setSelectedMoveType('All')}
            style={{ '--type-color': '#e11d48' } as React.CSSProperties}
            type="button"
          >
            Todos
          </button>
          {types.map((type) => (
            <button
              className={selectedMoveType === type ? 'active' : ''}
              key={type}
              onClick={() => setSelectedMoveType(type)}
              style={{ '--type-color': typeColors[type] } as React.CSSProperties}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>

        <label className="search-box moves-search">
          <Activity size={18} />
          <input
            aria-label="Buscar ataques"
            onChange={(event) => setMoveQuery(event.target.value)}
            placeholder="Buscar ataque, tipo ou categoria"
            value={moveQuery}
          />
        </label>
      </div>

      <div className="section-heading">
        <h2>Ataques que Pokemon podem aprender</h2>
        <span>{isLoading ? 'Carregando ataques...' : `${filteredMoves.length} ataques`}</span>
      </div>
      {error && <p className="status-message">{error}</p>}

      <div className="moves-grid">
        {filteredMoves.map((move) => (
          <article className="move-card" key={move.id}>
            <div className="move-card-header">
              <div>
                <p>#{String(move.id).padStart(3, '0')}</p>
                <h3>{move.name}</h3>
              </div>
              <TypeBadge type={move.type} />
            </div>
            <div className="move-stats">
              <StatPill label="Poder" value={move.power ?? '-'} />
              <StatPill label="Precisao" value={move.accuracy ? `${move.accuracy}%` : '-'} />
              <StatPill label="PP" value={move.pp ?? '-'} />
              <StatPill label="Classe" value={move.damageClass} />
            </div>
            <p className="learned-count">{move.learnedByCount} Pokemon podem aprender</p>
          </article>
        ))}
        {!filteredMoves.length && (
          <div className="no-results">
            <p>{isLoading ? 'Buscando ataques da PokeAPI.' : 'Nenhum ataque encontrado para esse filtro.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ItemsView({
  items,
  isLoading,
  error,
}: {
  items: PokemonItem[];
  isLoading: boolean;
  error: string;
}) {
  const [itemQuery, setItemQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalized = itemQuery.trim().toLowerCase();
    return items.filter((item) => {
      return (
        normalized.length === 0 ||
        item.name.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized) ||
        item.utility.toLowerCase().includes(normalized)
      );
    });
  }, [itemQuery, items]);

  return (
    <section className="items-section">
      <div className="section-heading">
        <h2>Itens da Pokedex</h2>
        <span>{isLoading ? 'Carregando itens...' : `${filteredItems.length} itens`}</span>
      </div>
      <label className="search-box moves-search">
        <Activity size={18} />
        <input
          aria-label="Buscar itens"
          onChange={(event) => setItemQuery(event.target.value)}
          placeholder="Buscar item, categoria ou utilidade"
          value={itemQuery}
        />
      </label>
      {error && <p className="status-message">{error}</p>}

      <div className="items-grid">
        {filteredItems.map((item) => (
          <article className="item-card" key={item.id}>
            <div className="item-icon">
              <img alt={item.name} src={item.sprite} />
            </div>
            <div className="item-card-body">
              <div className="item-card-header">
                <div>
                  <p>#{String(item.id).padStart(3, '0')}</p>
                  <h3>{item.name}</h3>
                </div>
                <span>{item.category}</span>
              </div>
              <p className="item-utility">{item.utility}</p>
              <div className="item-meta">
                <StatPill label="Custo" value={item.cost ? `${item.cost}` : '-'} />
              </div>
            </div>
          </article>
        ))}
        {!filteredItems.length && (
          <div className="no-results">
            <p>{isLoading ? 'Buscando itens da PokeAPI.' : 'Nenhum item encontrado para esse filtro.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>(fallbackPokemon);
  const [moves, setMoves] = useState<PokemonMove[]>(fallbackMoves);
  const [items, setItems] = useState<PokemonItem[]>(fallbackItems);
  const [selectedType, setSelectedType] = useState<TypeFilter>('All');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isMovesLoading, setIsMovesLoading] = useState(false);
  const [movesError, setMovesError] = useState('');
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('pokedex');
  const [selectedPokemonId, setSelectedPokemonId] = useState(fallbackPokemon[0].id);
  const [pokedexMode, setPokedexMode] = useState<PokedexMode>('list');

  useEffect(() => {
    let isMounted = true;

    async function loadPokemon() {
      try {
        const results = await loadAllPokemon();
        if (!isMounted) {
          return;
        }

        setPokemon(results);
        setLoadError('');
      } catch {
        if (isMounted) {
          setLoadError('Nao foi possivel carregar a Pokedex completa agora. Mostrando alguns exemplos salvos.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPokemon();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMoves() {
      if (viewMode !== 'moves' || moves.length > fallbackMoves.length) {
        return;
      }

      setIsMovesLoading(true);
      try {
        const results = await loadAllMoves();
        if (!isMounted) {
          return;
        }

        setMoves(results);
        setMovesError('');
      } catch {
        if (isMounted) {
          setMovesError('Nao foi possivel carregar todos os ataques agora. Mostrando alguns exemplos salvos.');
        }
      } finally {
        if (isMounted) {
          setIsMovesLoading(false);
        }
      }
    }

    loadMoves();

    return () => {
      isMounted = false;
    };
  }, [moves.length, viewMode]);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      if (viewMode !== 'items' || items.length > fallbackItems.length) {
        return;
      }

      setIsItemsLoading(true);
      try {
        const results = await loadAllItems();
        if (!isMounted) {
          return;
        }

        setItems(results);
        setItemsError('');
      } catch {
        if (isMounted) {
          setItemsError('Nao foi possivel carregar todos os itens agora. Mostrando alguns exemplos salvos.');
        }
      } finally {
        if (isMounted) {
          setIsItemsLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [items.length, viewMode]);

  const filteredPokemon = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return pokemon.filter((entry) => {
      const matchesType = selectedType === 'All' || entry.types.includes(selectedType);
      const matchesQuery =
        normalized.length === 0 ||
        entry.name.toLowerCase().includes(normalized) ||
        entry.types.some((type) => type.toLowerCase().includes(normalized));
      return matchesType && matchesQuery;
    });
  }, [pokemon, query, selectedType]);

  const spotlight = filteredPokemon[0] ?? pokemon[0];
  const selectedColor = selectedType === 'All' ? '#e11d48' : typeColors[selectedType];
  const title = selectedType === 'All' ? 'Todos' : selectedType;
  const selectedPokemon = pokemon.find((entry) => entry.id === selectedPokemonId) ?? filteredPokemon[0] ?? pokemon[0];
  const viewTitle =
    viewMode === 'pokedex'
      ? title
      : viewMode === 'compare'
        ? 'Comparar'
        : viewMode === 'moves'
          ? 'Ataques'
          : viewMode === 'items'
            ? 'Itens'
            : 'Nature';
  const viewEyebrow =
    viewMode === 'pokedex'
      ? 'Tabela interativa de tipos'
      : viewMode === 'compare'
        ? 'Comparador de batalha'
        : viewMode === 'moves'
          ? 'Biblioteca de ataques'
          : viewMode === 'items'
            ? 'Inventario da Pokedex'
            : 'Nature recomendada';

  useEffect(() => {
    if (filteredPokemon.length && !filteredPokemon.some((entry) => entry.id === selectedPokemonId)) {
      setSelectedPokemonId(filteredPokemon[0].id);
      setPokedexMode('list');
    }
  }, [filteredPokemon, selectedPokemonId]);

  return (
    <main className="app-shell">
      <aside className="type-rail" aria-label="Tipos de Pokemon">
        <div className="rail-header">
          <Sparkles size={22} />
          <div>
            <p>Pokemon</p>
            <h1>Type Lab</h1>
          </div>
        </div>
        <div className="type-list">
          <button
            className={selectedType === 'All' ? 'type-button active' : 'type-button'}
            onClick={() => setSelectedType('All')}
            style={{ '--type-color': '#e11d48' } as React.CSSProperties}
            type="button"
          >
            <span />
            Todos
          </button>
          {types.map((type) => (
            <button
              className={type === selectedType ? 'type-button active' : 'type-button'}
              key={type}
              onClick={() => setSelectedType(type)}
              style={{ '--type-color': typeColors[type] } as React.CSSProperties}
              type="button"
            >
              <span />
              {type}
            </button>
          ))}
        </div>
      </aside>

      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">{viewEyebrow}</p>
            <h2>{viewTitle}</h2>
          </div>
          <div className="top-actions">
            <div className="view-tabs" role="tablist" aria-label="Areas do site">
              <button className={viewMode === 'pokedex' ? 'active' : ''} onClick={() => setViewMode('pokedex')} type="button">
                Pokedex
              </button>
              <button className={viewMode === 'compare' ? 'active' : ''} onClick={() => setViewMode('compare')} type="button">
                Comparar
              </button>
              <button className={viewMode === 'moves' ? 'active' : ''} onClick={() => setViewMode('moves')} type="button">
                Ataques
              </button>
              <button className={viewMode === 'items' ? 'active' : ''} onClick={() => setViewMode('items')} type="button">
                Itens
              </button>
              <button className={viewMode === 'nature' ? 'active' : ''} onClick={() => setViewMode('nature')} type="button">
                Nature
              </button>
            </div>
            {viewMode === 'pokedex' && (
              <label className="search-box">
                <Activity size={18} />
                <input
                  aria-label="Buscar Pokemon"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPokedexMode('list');
                  }}
                  placeholder="Buscar por nome ou tipo"
                  value={query}
                />
              </label>
            )}
          </div>
        </div>

        {viewMode === 'pokedex' ? (
          <>
        <div className="hero-strip" style={{ '--type-color': selectedColor } as React.CSSProperties}>
          <div>
            <p>{selectedType === 'All' ? 'Pokedex completa' : 'Tipo selecionado'}</p>
            <h3>{title}</h3>
            <span>
              {selectedType === 'All' ? filteredPokemon.length : strengths[selectedType].length || 0} {selectedType === 'All' ? 'Pokemon exibidos' : 'vantagens ofensivas'} - {pokemon.length} Pokemon na base
            </span>
          </div>
          <img
            alt={spotlight.name}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${spotlight.id}.png`}
          />
        </div>

        {selectedType !== 'All' && (
          <div className="info-grid">
            <TypeGroup title="Forte contra" icon={<Swords size={20} />} items={strengths[selectedType]} empty="Sem vantagem direta." />
            <TypeGroup title="Fraco contra" icon={<Shield size={20} />} items={weaknesses[selectedType]} />
          </div>
        )}

        <section className="pokemon-section">
          <div className="section-heading">
            <h2>{pokedexMode === 'detail' && selectedPokemon ? selectedPokemon.name : 'Todos os Pokemon da Pokedex'}</h2>
            <span>
              {pokedexMode === 'detail'
                ? 'Detalhes do Pokemon selecionado'
                : isLoading
                  ? 'Carregando Pokedex completa...'
                  : `${filteredPokemon.length} encontrados`}
            </span>
          </div>
          {loadError && <p className="status-message">{loadError}</p>}
          {pokedexMode === 'detail' && selectedPokemon ? (
            <PokemonDetailPanel pokemon={selectedPokemon} onBack={() => setPokedexMode('list')} />
          ) : (
            <div className="pokemon-grid">
              {filteredPokemon.map((entry) => (
                <button
                  className={entry.id === selectedPokemon?.id ? 'pokemon-card selected' : 'pokemon-card'}
                  key={entry.id}
                  onClick={() => {
                    setSelectedPokemonId(entry.id);
                    setPokedexMode('detail');
                  }}
                  type="button"
                >
                  <img
                    alt={entry.name}
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                  />
                  <div>
                    <p>#{String(entry.id).padStart(3, '0')}</p>
                    <h3>{entry.name}</h3>
                    <div className="mini-badges">{entry.types.map((type) => <TypeBadge key={type} type={type} />)}</div>
                  </div>
                </button>
              ))}
              {!filteredPokemon.length && (
                <div className="no-results">
                  <p>{isLoading ? 'Buscando dados da Pokedex completa.' : 'Nenhum Pokemon encontrado para esse filtro.'}</p>
                </div>
              )}
              </div>
          )}
        </section>
          </>
        ) : viewMode === 'compare' ? (
          <>
            {loadError && <p className="status-message">{loadError}</p>}
            <CompareView pokemon={pokemon} />
          </>
        ) : viewMode === 'moves' ? (
          <MovesView moves={moves} isLoading={isMovesLoading} error={movesError} />
        ) : viewMode === 'items' ? (
          <ItemsView items={items} isLoading={isItemsLoading} error={itemsError} />
        ) : (
          <>
            {loadError && <p className="status-message">{loadError}</p>}
            <NatureView pokemon={pokemon} />
          </>
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

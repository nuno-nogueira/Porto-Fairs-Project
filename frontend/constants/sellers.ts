/** 
 * Mock data for the application's sellers/vendors 
 */
export const SELLERS = [
  {
    id: 101,
    name: "Albertina Magalhães",
    location: "Matosinhos",
    imageUri: "https://randomuser.me/api/portraits/women/66.jpg",
    description:
      "Vendo produtos frescos da minha horta familiar. Trabalho com dedicação e carinho há muitos anos.",
    categories: ["Alimentação"],
    marketIds: [1, 2],
  },
  {
    id: 102,
    name: "Joaquim Fonseca",
    location: "Porto",
    imageUri: "https://randomuser.me/api/portraits/men/32.jpg",
    description:
      "Produzo queijos artesanais há mais de 20 anos, utilizando métodos tradicionais e leite de alta qualidade.",
    categories: ["Alimentação"],
    marketIds: [1, 3],
  },
  {
    id: 103,
    name: "Carolina Deslandes",
    location: "Vila Nova de Gaia",
    imageUri: "https://randomuser.me/api/portraits/women/44.jpg",
    description:
      "Apaixonada por antiguidades, ofereço uma seleção única de peças vintage e colecionáveis.",
    categories: ["Velharias", "Decoração"],
    marketIds: [1, 3],
  },
  {
    id: 104,
    name: "Maria Silva",
    location: "Maia",
    imageUri: "https://randomuser.me/api/portraits/women/12.jpg",
    description:
      "Especialista em produtos caseiros e artesanais, feitos com receitas tradicionais de família.",
    categories: ["Artesanato"],
    marketIds: [2, 3],
  },
];

/** 
 * Mock data for announcements/posts made by sellers 
 */
export const POSTS = [
  {
    id: "p1",
    sellerId: 101,
    text: "Esta semana tenho laranjas a 1.20€ o kilo 🍊",
    date: "Hoje",
  },
  {
    id: "p2",
    sellerId: 101,
    text: "Bom dia! Hoje até se vende bem, graças a Deus.",
    date: "Ontem",
  },
  {
    id: "p3",
    sellerId: 102,
    text: "Queijo artesanal acabado de chegar 🧀",
    date: "Hoje",
  },
  {
    id: "p4",
    sellerId: 103,
    text: "Novas peças vintage disponíveis! Venha descobrir tesouros únicos.",
    date: "2 dias atrás",
  },
  {
    id: "p5",
    sellerId: 104,
    text: "Produtos artesanais feitos com muito carinho ❤️",
    date: "Hoje",
  },
];

/** 
 * Mock data for physical market locations 
 */
export const MARKETS = [
  {
    id: 1,
    title: "Mercado do Bolhão",
    schedule: "Seg - Sex 11:00 - 19:00",
    address: "R. Formosa 322, 4000-248 Porto",
    latitude: 41.1496,
    longitude: -8.6109,
    image: require("../assets/markets/bolhao.png"),
  },
  {
    id: 2,
    title: "WOW É Natal",
    schedule: "30 Nov 2025",
    address: "WOW - World of Wine, Gaia",
    latitude: 41.1375,
    longitude: -8.6128,
    image: require("../assets/markets/bolhao.png"),
  },
  {
    id: 3,
    title: "Time Out Market Porto",
    schedule: "Todos os dias 10:00 - 00:00",
    address: "Praça De Almeida Garrett, Porto 40",
    latitude: 41.1579,
    longitude: -8.6291,
    image: require("../assets/markets/bolhao.png"),
  },
];

export const SELLERS = [
    {
        id: 101,
        name: "Albertina Magalhães",
        location: "Matosinhos",
        avatar: "https://randomuser.me/api/portraits/women/66.jpg",
        bio: "Vendo produtos frescos da minha horta familiar."
    },
    {
        id: 102,
        name: "Joaquim Fonseca",
        location: "Porto",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
        id: 103,
        name: "Carolina Deslandes",
        location: "Vila Nova de Gaia",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
        id: 104,
        name: "Maria Silva",
        location: "Maia",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg"
    }
];

export const MARKETS = [
    {
        id: 1,
        title: "Mercado do Bolhão",
        schedule: "Seg - Sex 11:00 - 19:00",
        address: "R. Formosa 322, 4000-248 Porto",
        latitude: 41.1496, 
        longitude: -8.6109,
        image: require("@/assets/markets/bolhao.jpeg"),
        description:"Uma das feiras mais tradicionais do Porto, conhecida pelos seus produtos frescos do mar e legumes da região. Ambiente familiar e acolhedor, perfeito para passeios de fim de semana e compras sustentáveis diretas do produtor."
    },
    {
        id: 2,
        title: "WOW É Natal",
        schedule: "30 Nov 2025",
        address: "WOW - World of Wine, Gaia",
        latitude: 41.1375, 
        longitude: -8.6128,
        image: require("@/assets/markets/bolhao.jpeg"),
        description:"Um mercado sazonal que celebra o espírito natalício com uma variedade de produtos artesanais, decorações festivas e iguarias típicas da época. Localizado no coração do WOW - World of Wine, este mercado é ideal para encontrar presentes únicos e desfrutar de atividades temáticas para toda a família."
    },
    {
        id: 3,
        title: "Time Out Market Porto",
        schedule: "Todos os dias 10:00 - 00:00",
        address: "Praça De Almeida Garrett, Porto 40",
        latitude: 41.1579, 
        longitude: -8.6291,
        image: require("@/assets/markets/bolhao.jpeg"),
        description:"Um mercado gastronómico que reúne o melhor da culinária local e internacional sob o mesmo teto. Com uma seleção curada de restaurantes, bares e quiosques, o Time Out Market é o destino perfeito para os amantes da boa comida que procuram uma experiência culinária diversificada e vibrante."
    }
];

export const POSTS = [
  { id: 1, text: "Esta semana tenho laranjas a 1.20€ o kilo. Aproveitem enquanto há stock! 🍊", date: "Hoje, 10:00" },
  { id: 2, text: "Bom dia! Hoje até se vende bem, graças a Deus.", date: "Ontem" },
];
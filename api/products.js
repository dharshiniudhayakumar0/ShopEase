// Mock Data for Demo
const mockProducts = [
    { id: 1, title: "Radiant Liquid Foundation", price: 24.99, category: "face", rating: 4.8, image: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600", description: "Experience the luxury of our Radiant Liquid Foundation." },
    { id: 2, title: "Velvet Matte Lipstick", price: 18.50, category: "lips", rating: 4.5, image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600", description: "Perfect matte finish for all day wear." },
    { id: 3, title: "Luminous Setting Powder", price: 22.00, category: "face", rating: 4.7, image: "https://images.unsplash.com/photo-1512496015851-a1dc8a477d48?auto=format&fit=crop&q=80&w=600", description: "Set your look with a natural glow." }
];

module.exports = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(mockProducts));
};

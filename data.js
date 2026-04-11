// data.js - Dynamically generates 300 Cosmetic Products

const categories = ['face', 'eyes', 'lips', 'skincare'];

const adjectives = ["Radiant", "Flawless", "Velvet", "Luminous", "Matte", "Hydrating", "Glow", "Sunset", "Nourishing", "High-Shine", "Silky", "Vibrant", "Sheer", "Intense", "Soft"];
const types = {
    face: ["Liquid Foundation", "Powder Blush", "Concealer", "Setting Powder", "Bronzer", "Primer", "Highlighter", "Tinted Moisturizer"],
    eyes: ["Eyeshadow Palette", "Waterproof Mascara", "Liquid Eyeliner", "Brow Gel", "Gel Eyeliner", "Lash Serum", "Eye Primer"],
    lips: ["Matte Lipstick", "Lip Gloss", "Lip Liner", "Lip Balm", "Lip Tint", "Liquid Lipstick", "Lip Plumper"],
    skincare: ["Rose Water Toner", "Night Cream", "Vitamin C Serum", "Exfoliating Scrub", "Hydrating Mask", "Eye Cream", "Cleansing Oil", "Micellar Water"]
};

// General makeup/cosmetic images from Unsplash to ensure they look excellent
const imagePool = [
    "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1512496015851-a1dc8a477d48?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1631214532130-184518776092?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1571781926291-c477eb31f76e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1580870059345-4202e86121b6?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1590156546946-ce55a12a6a5d?auto=format&fit=crop&q=80&w=600"
];

const generatedProducts = [];

for (let i = 1; i <= 300; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const typeList = types[category];
    const type = typeList[Math.floor(Math.random() * typeList.length)];
    
    const title = `${adjective} ${type}`;
    // Price between $12 and $85
    const price = Math.floor(Math.random() * 73) + 12 - 0.01; 
    // Rating between 3.5 and 5.0
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    const image = imagePool[Math.floor(Math.random() * imagePool.length)];

    generatedProducts.push({
        id: i,
        title: title,
        price: parseFloat(price.toFixed(2)),
        category: category,
        rating: parseFloat(rating),
        image: image,
        description: `Experience the luxury of our '${title}'. Formulated with premium ingredients to provide long-lasting wear and a phenomenal finish. Perfect for everyday use or special occasions.`
    });
}

// Make globally available
window.shopProducts = generatedProducts;

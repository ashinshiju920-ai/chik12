import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'glorious-eyewear',
    name: 'Glorious Eyewear',
    tagline: 'Precision handcrafted lightweight acetate frames for daily elegance.',
    description: 'Designed in Stockholm, the Glorious Eyewear frames combine timeless Nordic minimalism with featherlight Japanese titanium hinges and scratch-resistant CR-39 anti-glare lenses. Perfect for prescription lenses or blue-light blocking everyday wear.',
    details: [
      'Handcrafted Italian Mazzucchelli acetate frame',
      'Ultra-durable custom 5-barrel hinge design',
      '100% UV400 protection with anti-reflective coating',
      'Includes recycled leather protective case and microfiber cloth',
      'Prescription lens adaptable by any licensed optician'
    ],
    category: 'glasses',
    categoryTag: 'Optics & Eyewear',
    price: 37.00,
    originalPrice: 45.00,
    rating: 4.8,
    reviewCount: 28,
    isSoldOut: true,
    isSale: false,
    isTrendingEyewear: true,
    sku: 'HT-GLS-001',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Onyx Black', hex: '#1C1C1C' },
      { name: 'Tortoise Shell', hex: '#63422B' },
      { name: 'Clear Crystal', hex: '#EAEAEA' }
    ],
    sizes: ['Narrow (48mm)', 'Medium (50mm)', 'Wide (52mm)'],
    specifications: {
      dimensions: 'Frame Width: 140mm | Lens: 50mm | Bridge: 20mm | Temple: 145mm',
      materials: 'Hand-polished Bio-Acetate, OBE German hinges, CR-39 lenses',
      weight: '24 grams',
      origin: 'Crafted in Belluno, Italy',
      care: 'Rinse with lukewarm water and wipe with provided microfiber cloth.'
    },
    reviews: [
      {
        id: 'rev-1',
        author: 'Julian Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 18, 2026',
        title: 'Exceptionally lightweight and stylish',
        comment: 'I receive compliments on these glasses almost every single day. The fit is snug without pinching the temples. Very sturdy yet light as a feather!',
        verified: true,
        helpfulCount: 14,
        images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop']
      },
      {
        id: 'rev-2',
        author: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'July 29, 2026',
        title: 'Flawless optical clarity',
        comment: 'Got my prescription put in by my local optician with zero issues. The acetate finish is super glossy and luxurious.',
        verified: true,
        helpfulCount: 9
      }
    ]
  },
  {
    id: 'prod-2',
    slug: 'retro-liner-socks',
    name: 'Retro Liner Socks',
    tagline: 'Ultra-soft combed Egyptian cotton low-cut no-slip socks.',
    description: 'Constructed from premium combed cotton with seamless toe stitching and silicone heel grips, the Retro Liner Socks deliver breathable comfort and stay invisible in low-top sneakers or loafers.',
    details: [
      'Pack of 3 premium pairs',
      '80% Combed Cotton, 17% Polyamide, 3% Elastane',
      'Non-slip silicone heel grip prevents sliding',
      'Reinforced heel and toe for 3x durability',
      'Moisture-wicking breathable mesh arch support'
    ],
    category: 'apparel',
    categoryTag: 'Apparel & Knitwear',
    price: 70.00,
    originalPrice: 85.00,
    rating: 5.0,
    reviewCount: 42,
    isSoldOut: false,
    isSale: true,
    isNewArrival: true,
    sku: 'HT-SCK-002',
    stockQuantity: 28,
    images: [
      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Heather Grey', hex: '#B5B5B5' },
      { name: 'Chalk White', hex: '#F5F5F5' },
      { name: 'Charcoal Black', hex: '#262626' }
    ],
    sizes: ['S (US 5-7)', 'M (US 8-10)', 'L (US 11-13)'],
    specifications: {
      dimensions: 'Low-cut invisible profile (2.5 inches depth)',
      materials: '80% Combed Organic Cotton, 17% Polyamide, 3% Elastane',
      weight: '45 grams per pair',
      origin: 'Made in Portugal',
      care: 'Machine wash warm at 40°C. Do not tumble dry.'
    },
    reviews: [
      {
        id: 'rev-3',
        author: 'Marcus Brody',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 24, 2026',
        title: 'Truly do not slip down!',
        comment: 'I was skeptical about the price until I tried them. These are literally the only no-show socks that stay firmly locked to the back of my heel all day.',
        verified: true,
        helpfulCount: 22
      }
    ]
  },
  {
    id: 'prod-3',
    slug: 'national-geographic-tee',
    name: 'National Geographic Tee',
    tagline: 'Heavyweight organic cotton graphic vintage expedition tee.',
    description: 'An iconic vintage mountaineering graphic printed on 240 GSM organic ring-spun cotton. Pre-shrunk with a relaxed drop-shoulder silhouette and ribbed collar.',
    details: [
      '100% Certified Organic Ring-Spun Cotton',
      'Vintage distressed Mount Everest archival artwork',
      'Relaxed, slightly boxy streetwear fit',
      'Garment-dyed for rich, long-lasting wash patina',
      'Fair Trade Certified manufacturing'
    ],
    category: 'apparel',
    categoryTag: 'Apparel & Tops',
    price: 24.00,
    originalPrice: 32.00,
    rating: 4.7,
    reviewCount: 39,
    isSoldOut: false,
    isSale: true,
    isNewArrival: true,
    isFeatured: true,
    sku: 'HT-TEE-003',
    stockQuantity: 15,
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Washed Charcoal', hex: '#2B2B2B' },
      { name: 'Vintage Olive', hex: '#4B5320' },
      { name: 'Sand Khaki', hex: '#C2B280' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    specifications: {
      dimensions: 'Chest: 44" (Size M) | Length: 28.5"',
      materials: '240 GSM 100% Heavyweight Organic Cotton',
      weight: '290 grams',
      origin: 'Crafted in Istanbul, Turkey',
      care: 'Machine wash cold with like colors inside out. Hang dry.'
    },
    reviews: [
      {
        id: 'rev-4',
        author: 'Sarah Lin',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 12, 2026',
        title: 'Perfect boxy fit & amazing print quality',
        comment: 'The cotton is dense and doesn’t lose shape after washing. Looks amazing tucked in with wide-leg trousers.',
        verified: true,
        helpfulCount: 16
      }
    ]
  },
  {
    id: 'prod-4',
    slug: 'quilted-crossbody-bag',
    name: 'Quilted Crossbody Bag',
    tagline: 'Patent geometric quilted mini tote with dual chain handles.',
    description: 'An architectural mini crossbody sculpted in glossy deep sapphire patent faux-leather. Features geometric diamond embossing, gold-tone hardware, and detachable braided chain shoulder strap.',
    details: [
      'Glossy patent geometric quilted silhouette',
      'Dual structured top handles + detachable chain crossbody strap',
      'Secure zip closure with internal card slots',
      'Polished brass hardware with anti-tarnish coating',
      'Structured base with protective metal feet'
    ],
    category: 'accessories',
    categoryTag: 'Handbags & Totes',
    price: 21.00,
    originalPrice: 25.00,
    rating: 5.0,
    reviewCount: 56,
    isSoldOut: true,
    isSale: true,
    isFeatured: true,
    sku: 'HT-BAG-004',
    stockQuantity: 0,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Midnight Navy', hex: '#152238' },
      { name: 'Burnt Terracotta', hex: '#C85A32' },
      { name: 'Glossy Emerald', hex: '#0B4F3F' }
    ],
    sizes: ['One Size (7.5" x 6" x 3.5")'],
    specifications: {
      dimensions: 'Height: 15cm | Width: 19cm | Depth: 9cm | Strap Drop: 52cm',
      materials: 'Vegan Patent Leather, Satin Jacquard Lining, Brass Alloy',
      weight: '380 grams',
      origin: 'Designed in Paris',
      care: 'Wipe clean with a damp microfiber cloth.'
    },
    reviews: [
      {
        id: 'rev-5',
        author: 'Chloe Dupont',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 03, 2026',
        title: 'Adorable evening bag',
        comment: 'Fits my phone, lip gloss, and cards easily. The shine is subtle and very chic.',
        verified: true,
        helpfulCount: 31
      }
    ]
  },
  {
    id: 'prod-5',
    slug: 'selected-homme-scarf',
    name: 'Selected Homme Scarf',
    tagline: '100% brushed Merino wool scarf with hand-knotted fringe.',
    description: 'Woven in the Scottish Highlands from 100% fine Merino wool, this brushed heather charcoal scarf provides cloud-like softness and winter-grade insulation without any itchiness.',
    details: [
      '100% Extra-fine Merino Wool (19.5 micron)',
      'Classic hand-twisted tassel fringe borders',
      'Naturally thermo-regulating and odor resistant',
      'Generous length for multiple versatile drape styles',
      'Dry clean only'
    ],
    category: 'accessories',
    categoryTag: 'Scarves & Knitwear',
    price: 40.00,
    originalPrice: 55.00,
    rating: 4.9,
    reviewCount: 19,
    isSoldOut: false,
    isSale: false,
    isFeatured: true,
    sku: 'HT-SCF-005',
    stockQuantity: 18,
    images: [
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Heather Charcoal', hex: '#4A4A4A' },
      { name: 'Camel Tan', hex: '#C19A6B' },
      { name: 'Forest Moss', hex: '#3B4D3C' }
    ],
    sizes: ['70" x 14" (Standard)'],
    specifications: {
      dimensions: '180cm x 35cm + 8cm fringe',
      materials: '100% Pure Extra-fine Merino Wool',
      weight: '210 grams',
      origin: 'Woven in Scotland',
      care: 'Dry clean only. Steam gently if creased.'
    },
    reviews: [
      {
        id: 'rev-6',
        author: 'Arthur Pendelton',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'July 14, 2026',
        title: 'Luxuriously soft and warm',
        comment: 'Merino wool is top tier. Zero itch around the neck, and keeps you warm even during sub-zero winds.',
        verified: true,
        helpfulCount: 11
      }
    ]
  },
  {
    id: 'prod-6',
    slug: 'urban-rolltop-backpack',
    name: 'Nordic Canvas Backpack',
    tagline: 'Water-resistant coated canvas daypack with padded laptop sleeve.',
    description: 'An ergonomic utilitarian backpack built with weatherproof 16oz waxed canvas and vegetable-tanned leather straps. Features an expandable roll-top, side water bottle pocket, and 16" laptop partition.',
    details: [
      'Heavy-duty 16oz water-repellent waxed canvas',
      'Dedicated padded sleeve fits up to 16" MacBook Pro',
      'Ergonomic breathable mesh padded back panel',
      'Quick-access magnetic Fidlock front closures',
      'Reinforced base with waterproof Cordura liner'
    ],
    category: 'backpack',
    categoryTag: 'Backpacks & Rucksacks',
    price: 89.00,
    originalPrice: 110.00,
    rating: 4.9,
    reviewCount: 64,
    isSoldOut: false,
    isSale: true,
    isFeatured: true,
    sku: 'HT-BPK-006',
    stockQuantity: 22,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Mustard Amber', hex: '#D99B26' },
      { name: 'Olive Green', hex: '#4A5B42' },
      { name: 'Matte Black', hex: '#1F1F1F' }
    ],
    sizes: ['20L Daily', '28L Travel'],
    specifications: {
      dimensions: '46cm x 30cm x 15cm (20 Liters capacity)',
      materials: '16oz Organic Waxed Canvas, Full-grain Leather, YKK Aquaguard Zips',
      weight: '820 grams',
      origin: 'Handcrafted in Denmark',
      care: 'Spot clean with damp sponge and cold water. Re-wax every 18 months.'
    },
    reviews: [
      {
        id: 'rev-7',
        author: 'Kasper Lindqvist',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 10, 2026',
        title: 'Best daily commuter bag I have owned',
        comment: 'Survived a torrential downpour in Copenhagen and my laptop stayed completely bone dry inside. The mustard color is stunning in person.',
        verified: true,
        helpfulCount: 38
      }
    ]
  },
  {
    id: 'prod-7',
    slug: 'timberland-leather-trail-boots',
    name: 'Timberland Heritage Leather Boots',
    tagline: 'Waterproof full-grain nubuck leather boots with Vibram lug sole.',
    description: 'Rugged yet refined, these heritage leather boots feature seam-sealed waterproof construction, rust-proof hardware, and shock-absorbing anti-fatigue footbeds designed for both city pavements and rugged trails.',
    details: [
      'Premium waterproof full-grain nubuck leather upper',
      'Seam-sealed construction guaranteed to keep feet dry',
      'Durable rubber lug outsole for maximum traction in rain & mud',
      'Padded leather collar for comfortable ankle support',
      '100% recycled PET laces and breathable lining'
    ],
    category: 'shoes',
    categoryTag: 'Footwear & Boots',
    price: 145.00,
    originalPrice: 175.00,
    rating: 4.9,
    reviewCount: 51,
    isSoldOut: false,
    isSale: true,
    isNewArrival: true,
    sku: 'HT-SH-007',
    stockQuantity: 12,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Wheat Tan', hex: '#C29B62' },
      { name: 'Dark Rust Brown', hex: '#5C3826' },
      { name: 'Stealth Black', hex: '#1C1C1C' }
    ],
    sizes: ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
    specifications: {
      dimensions: 'Shaft height: 6 inches | Heel: 1.25 inches',
      materials: 'Waterproof Full-grain Leather, Vibram Rubber Lug Sole',
      weight: '640 grams per boot',
      origin: 'Made in USA',
      care: 'Use leather cleaner and conditioner. Air dry away from direct heat.'
    },
    reviews: [
      {
        id: 'rev-8',
        author: 'Daniel Craig',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 01, 2026',
        title: 'Indestructible and stylish',
        comment: 'Wore them right out of the box through wet forest trails and they were comfortable from mile 1 with zero blisters.',
        verified: true,
        helpfulCount: 25
      }
    ]
  },
  {
    id: 'prod-8',
    slug: 'streetwear-embroidered-cap',
    name: 'Streetwear Embroidered Cap',
    tagline: 'Structured 6-panel cotton twill cap with curved visor.',
    description: 'An elevated street staple made with washed organic cotton twill, tonal embroidered front insignia, brass buckle adjuster, and interior moisture-absorbing sweatband.',
    details: [
      '100% Heavy Washed Cotton Twill',
      'Embroidered contrast typographic script logo',
      'Unstructured low-profile crown with pre-curved visor',
      'Adjustable antique brass clasp buckle strap',
      'Embroidered eyelets for continuous airflow'
    ],
    category: 'hats',
    categoryTag: 'Headwear & Caps',
    price: 32.00,
    originalPrice: 38.00,
    rating: 4.8,
    reviewCount: 33,
    isSoldOut: false,
    isSale: false,
    isNewArrival: true,
    sku: 'HT-HAT-008',
    stockQuantity: 25,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Jet Black', hex: '#111111' },
      { name: 'Chalk Off-White', hex: '#EBEBEB' },
      { name: 'Terracotta Rust', hex: '#C85A32' }
    ],
    sizes: ['One Size (Adjustable 54-61cm)'],
    specifications: {
      dimensions: 'Crown height: 4.7" | Visor length: 2.8"',
      materials: '100% Chino Cotton Twill, Brass Hardware',
      weight: '90 grams',
      origin: 'Designed in Brooklyn, NY',
      care: 'Hand wash in cold water with mild detergent.'
    },
    reviews: [
      {
        id: 'rev-9',
        author: 'Jessica Meyers',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'July 20, 2026',
        title: 'Fits perfectly on smaller heads too',
        comment: 'The brass slider makes it easy to adjust tightly without bunching in the back. Love the minimalist embroidery!',
        verified: true,
        helpfulCount: 15
      }
    ]
  },
  {
    id: 'prod-9',
    slug: 'weekend-collective-hoodie',
    name: 'Weekend Collective Puffer Jacket',
    tagline: 'Oversized quilted down puffer jacket in vivid marigold.',
    description: 'Stay cozy and bold throughout freezing seasons. Filled with RDS-certified 700 fill-power duck down and finished with a water-repellent matte shell, storm flap, and fleece-lined pockets.',
    details: [
      '700 Fill Power Responsible Down Standard (RDS) insulation',
      'Durable Water Repellent (DWR) micro-ripstop shell',
      'High-stand collar with internal storm cuffs',
      'Dual-entry fleece-lined hand warmer pockets',
      'Interior zippered chest pocket with headphone port'
    ],
    category: 'apparel',
    categoryTag: 'Outerwear & Jackets',
    price: 135.00,
    originalPrice: 165.00,
    rating: 4.9,
    reviewCount: 78,
    isSoldOut: false,
    isSale: true,
    isFeatured: true,
    sku: 'HT-JCK-009',
    stockQuantity: 9,
    images: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Marigold Yellow', hex: '#F2A900' },
      { name: 'Onyx Black', hex: '#1C1C1C' },
      { name: 'Dusty Rose', hex: '#C28B8B' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    specifications: {
      dimensions: 'Chest: 48" (Size M) | Length: 27"',
      materials: 'Shell: 100% Recycled Nylon | Fill: 90% Duck Down, 10% Feathers',
      weight: '750 grams',
      origin: 'Made in Canada',
      care: 'Machine wash delicate cold with down wash. Tumble dry low with dryer balls.'
    },
    reviews: [
      {
        id: 'rev-10',
        author: 'Mia Sorensen',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 19, 2026',
        title: 'Warmest jacket in my wardrobe',
        comment: 'The marigold yellow is vibrant and cheering on dark winter days. Extremely warm and light as air.',
        verified: true,
        helpfulCount: 47
      }
    ]
  },
  {
    id: 'prod-10',
    slug: 'vintage-tortoise-prescription-frames',
    name: 'Vintage Tortoise Optical Frames',
    tagline: 'Classic rounded retro frames with keyhole bridge.',
    description: 'Channeling mid-century intellect and modern studio chic, these round frames feature handcrafted Japanese cellulose acetate with amber honey undertones.',
    details: [
      'Sculpted keyhole bridge distributing nose weight evenly',
      'Embedded core wire with laser-etched Nordic filigree',
      'Hypoallergenic acetate with mirror-polished bevels',
      'Includes hard shell case and anti-fog cleaning spray'
    ],
    category: 'glasses',
    categoryTag: 'Optics & Frames',
    price: 65.00,
    originalPrice: 80.00,
    rating: 4.9,
    reviewCount: 37,
    isSoldOut: false,
    isSale: false,
    isTrendingEyewear: true,
    sku: 'HT-GLS-010',
    stockQuantity: 14,
    images: [
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop'
    ],
    colors: [
      { name: 'Honey Tortoise', hex: '#8B5A2B' },
      { name: 'Champagne Smoke', hex: '#D2B48C' }
    ],
    sizes: ['Medium (49mm)', 'Large (52mm)'],
    specifications: {
      dimensions: 'Lens: 49mm | Bridge: 21mm | Temple: 142mm',
      materials: 'Bio-Cellulose Acetate, German Stainless Steel Hinges',
      weight: '22 grams',
      origin: 'Handcrafted in Sabae, Japan',
      care: 'Clean with microfiber cloth and specialized lens cleaner.'
    },
    reviews: [
      {
        id: 'rev-11',
        author: 'Liam O’Connor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        rating: 5,
        date: 'August 07, 2026',
        title: 'Timeless silhouette',
        comment: 'Very lightweight on the nose bridge. Look great for both work video calls and casual weekends.',
        verified: true,
        helpfulCount: 19
      }
    ]
  }
];

export const INITIAL_COUPONS = [
  {
    code: 'DIVA10',
    discountPercent: 10,
    description: '10% off your entire Diva\'Chik order'
  },
  {
    code: 'DIVACHIK20',
    discountPercent: 20,
    minSpend: 100,
    description: '20% off orders over $100'
  },
  {
    code: 'HAUTE10',
    discountPercent: 10,
    description: '10% off your entire order'
  },
  {
    code: 'FREESHIP',
    discountAmount: 5.00,
    description: 'Free standard flat-rate delivery'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-88392',
    orderNumber: 'DIVA-2026-88392',
    date: 'August 28, 2026',
    items: [
      {
        productId: 'prod-3',
        name: 'National Geographic Tee',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=400&auto=format&fit=crop',
        price: 24.00,
        quantity: 1,
        selectedColor: 'Washed Charcoal',
        selectedSize: 'L'
      },
      {
        productId: 'prod-5',
        name: 'Selected Homme Scarf',
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=400&auto=format&fit=crop',
        price: 40.00,
        quantity: 1,
        selectedColor: 'Heather Charcoal',
        selectedSize: 'Standard'
      }
    ],
    subtotal: 64.00,
    shippingFee: 5.00,
    discount: 0.00,
    tax: 4.80,
    total: 73.80,
    status: 'in_transit' as const,
    shippingAddress: {
      id: 'addr-1',
      fullName: 'Ashin Shiju',
      phone: '+1 (555) 438-9201',
      street: '742 Evergreen Terrace',
      apartment: 'Suite 4B',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94107',
      country: 'United States',
      type: 'home' as const,
      isDefault: true
    },
    paymentMethod: 'Credit Card (ending in •••• 4242)',
    paymentStatus: 'paid' as const,
    trackingNumber: 'TRK-994827104-US',
    carrier: 'DHL Express Nordic',
    estimatedDeliveryDate: 'September 04, 2026',
    timeline: [
      {
        title: 'Order Confirmed & Verified',
        description: 'Payment authorization successful. Items allocated from Copenhagen central fulfillment hub.',
        timestamp: 'Aug 28, 2026 - 10:24 AM',
        location: 'Stockholm, Sweden',
        completed: true
      },
      {
        title: 'Package Dispatched & Scanned',
        description: 'Order inspected, custom packed in recyclable matte box, and handed over to carrier.',
        timestamp: 'Aug 29, 2026 - 02:15 PM',
        location: 'Copenhagen Sort Facility',
        completed: true
      },
      {
        title: 'In International Transit',
        description: 'Customs cleared. Flight en route to San Francisco International Logistics Terminal.',
        timestamp: 'Aug 31, 2026 - 08:45 AM',
        location: 'In Transit',
        completed: true,
        current: true
      },
      {
        title: 'Out for Delivery',
        description: 'Courier assigned. Expected delivery between 10:00 AM - 02:00 PM.',
        timestamp: 'Pending',
        location: 'San Francisco, CA',
        completed: false
      },
      {
        title: 'Delivered',
        description: 'Package handed directly to recipient or placed in secure parcel locker.',
        timestamp: 'Pending',
        location: 'San Francisco, CA',
        completed: false
      }
    ]
  }
];

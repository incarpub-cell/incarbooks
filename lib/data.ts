export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
}

export const SAMPLE_PRODUCTS: Product[] = [
    {
        id: '1',
        title: 'The Ultimate Freelancer Guide',
        description: 'Master the art of freelancing with this comprehensive 50-page guide. Includes templates and strategies.',
        price: 29.99,
        imageUrl: '/images/freelancer-guide.jpg', // Placeholder
    },
    {
        id: '2',
        title: 'Pro Design Assets Bundle',
        description: 'A collection of high-quality UI kits, icons, and mockups to speed up your design workflow.',
        price: 49.99,
        imageUrl: '/images/design-assets.jpg', // Placeholder
    },
    {
        id: '3',
        title: 'Startup Pitch Deck Template',
        description: 'Secure funding for your startup with this investor-ready pitch deck template. customizable and professional.',
        price: 19.99,
        imageUrl: '/images/pitch-deck.jpg', // Placeholder
    },
    {
        id: '4',
        title: 'Modern SEO Strategy eBook',
        description: 'Learn the latest SEO techniques to rank higher and drive organic traffic to your website.',
        price: 34.50,
        imageUrl: '/images/seo-ebook.jpg', // Placeholder
    },
];

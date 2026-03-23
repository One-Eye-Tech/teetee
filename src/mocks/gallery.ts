export interface GalleryItem {
  id: number
  title: string
  category: string
  image: string
  stats: { likes: number; sales: number }
  avatar?: string
}

export const mockGallery: GalleryItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  title: `示例系列 #${i + 1}`,
  category: ['Art', 'NFT', 'Lifestyle', 'Hobby', 'Social'][i % 5],
  image: `https://picsum.photos/seed/${i + 1}/800/500` ,
  avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
  stats: { likes: 300 + i * 7, sales: 50 + i * 3 }
}))


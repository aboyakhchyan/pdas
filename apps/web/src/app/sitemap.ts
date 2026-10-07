// import { api } from '@weareconceptstudio/core';

// export default async function sitemap() {
// 	const data = await api.get({ url: 'sitemap' }).catch(() => []);

// 	if (!Array.isArray(data)) {
// 		return [];
// 	}

// 	return data.map((item) => ({
// 		url: item.url == '/' ? process.env.NEXT_PUBLIC_URL + '/' : process.env.NEXT_PUBLIC_URL + '/' + item.url,
// 		lastModified: new Date(),
// 		changeFrequency: 'yearly',
// 		priority: item.priority,
// 	}));
// }

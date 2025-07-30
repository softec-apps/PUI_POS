export const generateBackgroundColor = (name: string): string => {
	const colors = [
		'#c9caee',
		'#c2dbe9',
		'#fac2d9',
		'#c3e9de',
		'#e6dade',
		'#a8edea',
		'#ff9a9e',
		'#ffecd2',
		'#a18cd1',
		'#84fab0',
		'#fad0c4',
		'#d299c2',
		'#ff6b6b',
		'#4ecdc4',
		'#45b7d1',
		'#96ceb4',
		'#ffeaa7',
		'#dda0dd',
		'#98d8c8',
		'#f7dc6f',
		'#bb8fce',
		'#85c1e9',
	]

	let hash = 0
	for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
	return colors[Math.abs(hash) % colors.length]
}

export async function log() {
	await new Promise(resolve => {
		setTimeout(resolve, 1000)
		console.log('Page view logged')
	})
}

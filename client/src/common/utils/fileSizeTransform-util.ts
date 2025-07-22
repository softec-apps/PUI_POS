export const bytesToMB = (bytes: number, decimals = 0) => {
	return (bytes / (1024 * 1024)).toFixed(decimals)
}

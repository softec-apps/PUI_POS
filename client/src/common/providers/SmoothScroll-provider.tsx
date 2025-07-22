'use client'

import { SmoothScroll } from 'react-smooth-scrolll'

const SmoothScrollProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<SmoothScroll scrollSpeed={1.5} smoothness={0.07}>
			{children}
		</SmoothScroll>
	)
}

export default SmoothScrollProvider

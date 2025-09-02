export const animations = {
	container: {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				when: 'beforeChildren',
				staggerChildren: 0.02,
			},
		},
	},

	viewTransition: {
		initial: { opacity: 0, scale: 0.98, y: 10 },
		animate: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: {
				duration: 0.35,
				ease: [0.16, 1, 0.3, 1],
			},
		},
		exit: {
			opacity: 0,
			scale: 0.98,
			y: -10,
			transition: {
				duration: 0.3,
				ease: [0.16, 1, 0.3, 1],
			},
		},
	},

	rowItem: {
		hidden: { opacity: 0, y: -10, scaleY: 0.95 },
		visible: {
			opacity: 1,
			y: 0,
			scaleY: 1,
			transition: {
				type: 'spring',
				damping: 25,
				stiffness: 350,
				mass: 0.3,
			},
		},
	},

	cardItem: {
		hidden: { opacity: 0, y: 15, scale: 0.97, rotateX: -5 },
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			rotateX: 0,
			transition: {
				type: 'spring',
				damping: 20,
				stiffness: 300,
				mass: 0.5,
			},
		},
	},

	listItem: {
		hidden: { opacity: 0, x: -30, scaleX: 0.98 },
		visible: {
			opacity: 1,
			x: 0,
			scaleX: 1,
			transition: {
				type: 'spring',
				damping: 25,
				stiffness: 300,
			},
		},
	},
}

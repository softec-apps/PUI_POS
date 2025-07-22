'use client'

import { usePathname } from 'next/navigation'
import { useBreadcrumbs } from '@/common/hooks/use-breadcrumbs'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Icons } from './icons'

export function Breadcrumbs() {
	const items = useBreadcrumbs()
	const rawPathname = usePathname()
	const pathname = decodeURIComponent(rawPathname) // Decodifica rutas como %E4%BB%AA%E8%A1%A8%E6%9D%BF
	const shouldReduceMotion = useReducedMotion()

	if (!items.length) return null

	const variants = shouldReduceMotion
		? { initial: {}, animate: {}, exit: {} }
		: {
				initial: { opacity: 0, y: 0, x: -10 },
				animate: { opacity: 1, y: 0, x: 0 },
				exit: { opacity: 0, y: 0, x: 10 },
			}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<AnimatePresence mode='wait'>
					<motion.div
						key={pathname}
						variants={variants}
						initial='initial'
						animate='animate'
						exit='exit'
						transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
						className='flex items-center gap-1'>
						{items.map((item, i) => (
							<div key={i} className='flex items-center gap-1'>
								{i !== items.length - 1 ? (
									<BreadcrumbItem className='hidden md:block'>
										<BreadcrumbLink href={item.link}>{decodeURIComponent(item.title)}</BreadcrumbLink>
									</BreadcrumbItem>
								) : (
									<BreadcrumbPage>{decodeURIComponent(item.title)}</BreadcrumbPage>
								)}
								{i < items.length - 1 && (
									<div className='hidden md:block'>
										<Icons.slash className='h-4 w-4' />
									</div>
								)}
							</div>
						))}
					</motion.div>
				</AnimatePresence>
			</BreadcrumbList>
		</Breadcrumb>
	)
}

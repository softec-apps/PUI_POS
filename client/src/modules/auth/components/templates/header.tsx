'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogoType } from '@/components/logos/LogoType'
import { HelpCircle, Info, Users } from 'lucide-react'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'

export const HeaderAuth = () => {
	const [mounted, setMounted] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	useEffect(() => {
		setMounted(true)
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}
		}

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<>
			<header
				className={`bg-muted/20 sticky top-0 z-50 w-full border-b backdrop-blur-lg transition-all duration-300 ${
					isScrolled ? 'bg-background shadow-none' : 'bg-transparent'
				}`}>
				<div className='container mx-auto flex h-16 items-center justify-between px-6 md:px-0'>
					<LogoType />

					{/* Versión desktop */}
					<div className='hidden items-center gap-4 md:flex'>
						<ModeToggle />
					</div>
				</div>
			</header>

			{/* Menú móvil mejorado */}
			{mobileMenuOpen && (
				<div className='bg-background/95 fixed inset-0 top-16 z-40 backdrop-blur-lg md:hidden'>
					<div className='flex h-[calc(100vh-4rem)] flex-col justify-between'>
						{/* Contenido principal del menú */}
						<div className='container mx-auto flex flex-col gap-2 p-6'>
							<Link href='/info' className='hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 text-lg'>
								<Info className='h-5 w-5' />
								Información
							</Link>

							<Link href='/about' className='hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 text-lg'>
								<Users className='h-5 w-5' />
								Quiénes somos
							</Link>

							<Link href='/help' className='hover:bg-accent flex items-center gap-3 rounded-lg px-4 py-3 text-lg'>
								<HelpCircle className='h-5 w-5' />
								Ayuda
							</Link>
						</div>

						{/* Fila inferior con switcher y tema */}
						<div className='border-muted bg-muted/30 border-t p-4 backdrop-blur-sm'>
							<div className='container mx-auto flex items-center justify-between'>
								<ModeToggle />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

'use client'

import { Icons } from '@/components/icons'
import React, { useCallback, useMemo } from 'react'
import { Typography } from '@/components/ui/typography'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Dialog, DialogTitle, DialogFooter, DialogHeader, DialogContent } from '@/components/ui/dialog'

type VariantType = 'default' | 'destructive' | 'success' | 'warning' | 'info'

interface ConfirmationModalProps {
	isOpen: boolean
	title: string
	description?: string
	message: React.ReactNode
	alertMessage?: string | React.ReactNode
	isProcessing: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
	confirmText?: string
	cancelText?: string
	variant?: VariantType
	icon?: React.ReactNode
	autoFocus?: boolean
	confirmKey?: string
}

const variantStyles = {
	default: {
		title: 'text-primary',
		button: 'bg-primary text-primary-foreground hover:bg-primary/90',
		icon: <Icons.check />,
		alert: 'default',
		iconBg: 'bg-primary/10',
		iconColor: 'text-primary',
	},
	destructive: {
		title: 'text-red-600 dark:text-red-400',
		button: 'bg-red-600 dark:bg-red-500 text-red-50 hover:bg-red-500 focus:ring-red-500',
		icon: <Icons.trash />,
		alert: 'destructive',
		iconBg: 'bg-red-50 dark:bg-red-900/30',
		iconColor: 'text-red-600 dark:text-red-400',
	},
	success: {
		title: 'text-emerald-600 dark:text-emerald-400',
		button: 'bg-emerald-600 dark:bg-emerald-500 text-emerald-50 hover:bg-emerald-500 focus:ring-emerald-500',
		icon: <Icons.checkCircle />,
		alert: 'success',
		iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
		iconColor: 'text-emerald-600 dark:text-emerald-400',
	},
	warning: {
		title: 'text-amber-600 dark:text-amber-400',
		button: 'bg-amber-600 dark:bg-amber-500 text-amber-50 hover:bg-amber-500 focus:ring-amber-500',
		icon: <Icons.alertTriangle />,
		alert: 'warning',
		iconBg: 'bg-amber-50 dark:bg-amber-900/30',
		iconColor: 'text-amber-600 dark:text-amber-400',
	},
	info: {
		title: 'text-blue-600 dark:text-blue-400',
		button: 'bg-blue-600 dark:bg-blue-500 text-blue-50 hover:bg-blue-500 focus:ring-blue-500',
		icon: <Icons.infoCircle />,
		alert: 'info',
		iconBg: 'bg-blue-50 dark:bg-blue-900/30',
		iconColor: 'text-blue-600 dark:text-blue-400',
	},
} as const

const contentVariants = {
	hidden: {
		opacity: 0,
		y: 15,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			delay: 0.1,
			duration: 0.3,
			ease: [0.25, 0.8, 0.25, 1],
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		scale: 0.98,
		transition: {
			duration: 0.15,
			ease: [0.25, 0.8, 0.25, 1],
		},
	},
}

const iconVariants = {
	hidden: {
		scale: 0,
		rotate: -45,
		opacity: 0,
	},
	visible: {
		scale: 1,
		rotate: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 500,
			damping: 30,
			delay: 0.2,
		},
	},
	exit: {
		scale: 0,
		rotate: 45,
		opacity: 0,
		transition: {
			duration: 0.1,
		},
	},
}

const buttonVariants = {
	hidden: {
		opacity: 0,
		y: 10,
		scale: 0.98,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			delay: 0.15,
			duration: 0.2,
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -5,
		scale: 0.98,
		transition: {
			duration: 0.1,
		},
	},
	hover: {
		scale: 1.02,
		y: -1,
		transition: {
			duration: 0.1,
			ease: 'easeOut',
		},
	},
	tap: {
		scale: 0.98,
		y: 0,
		transition: {
			duration: 0.05,
		},
	},
}

const alertVariants = {
	hidden: {
		opacity: 0,
		y: 10,
		scale: 0.98,
		filter: 'blur(2px)',
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			delay: 0.25,
			duration: 0.25,
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -5,
		scale: 0.98,
		filter: 'blur(2px)',
		transition: {
			duration: 0.1,
		},
	},
}

const titleVariants = {
	hidden: {
		opacity: 0,
		x: -15,
	},
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			delay: 0.15,
			duration: 0.3,
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		x: -10,
		transition: {
			duration: 0.1,
		},
	},
}

const footerVariants = {
	hidden: {
		opacity: 0,
		y: 15,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			delay: 0.2,
			duration: 0.25,
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.1,
		},
	},
}

export const ConfirmationModal = React.memo(function ConfirmationModal({
	isOpen,
	title,
	description,
	message,
	alertMessage,
	isProcessing,
	onClose,
	onConfirm,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
	variant = 'default',
	icon,
	confirmKey,
}: ConfirmationModalProps) {
	React.useEffect(() => {
		if (isOpen) {
			setCopied(false)
			setInputValue('')
		}
	}, [isOpen])

	const [inputValue, setInputValue] = React.useState('')
	const isConfirmEnabled = useMemo(() => {
		if (!confirmKey) return true
		return inputValue.trim() === confirmKey
	}, [inputValue, confirmKey])

	const [copied, setCopied] = React.useState(false)
	const handleCopy = useCallback(() => {
		if (confirmKey) {
			navigator.clipboard.writeText(confirmKey)
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		}
	}, [confirmKey])

	const styles = useMemo(() => variantStyles[variant], [variant])
	const handleConfirm = useCallback(async () => await onConfirm(), [onConfirm])
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && !isProcessing) handleConfirm()
		},
		[isProcessing, handleConfirm]
	)

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent
					className='bg-card border-border/50 rounded-3xl border p-0 shadow-2xl sm:max-w-lg'
					onKeyDown={handleKeyDown}>
					<div className='relative'>
						<DialogHeader className='p-6 text-start'>
							<div className='flex items-center gap-4'>
								{/* Icon Container */}
								<motion.div
									variants={iconVariants}
									initial='hidden'
									animate='visible'
									className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}>
									<div className={`h-6 w-6 ${styles.iconColor}`}>{icon || styles.icon}</div>
								</motion.div>

								{/* Title and Description */}
								<div className='min-w-0 flex-1'>
									<motion.div variants={titleVariants} initial='hidden' animate='visible'>
										<DialogTitle className={`text-lg font-semibold ${styles.title}`}>{title}</DialogTitle>
										{description && (
											<motion.p
												className='text-muted-foreground mt-0.5 text-sm leading-relaxed'
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 0.2, duration: 0.2 }}>
												{description}
											</motion.p>
										)}
									</motion.div>
								</div>
							</div>
						</DialogHeader>

						<motion.div
							variants={contentVariants}
							initial='hidden'
							animate='visible'
							className='flex flex-col gap-4 px-6'>
							<Typography variant='span' className='text-muted-foreground text-sm leading-relaxed break-words'>
								{message}
							</Typography>

							<AnimatePresence>
								{alertMessage && (
									<motion.div variants={alertVariants} initial='hidden' animate='visible' exit='exit'>
										<AlertMessage variant={styles.alert} message={alertMessage} />
									</motion.div>
								)}

								{confirmKey && (
									<div className='mt-2'>
										<div className='text-muted-foreground mb-1 flex items-center justify-between text-sm'>
											<span>
												Escribe <span className='font-medium'>&quot;{confirmKey}&quot;</span> para confirmar.
											</span>
											<ActionButton
												onClick={handleCopy}
												variant='ghost'
												type='button'
												icon={<Icons.copy />}
												size='xs'
												text={copied ? 'Copiado' : 'Copiar'}
											/>
										</div>

										<input
											type='text'
											value={inputValue}
											onChange={e => setInputValue(e.target.value)}
											className='border-border bg-background text-foreground focus:ring-primary w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none'
											placeholder='Escribe aquí...'
										/>
									</div>
								)}
							</AnimatePresence>
						</motion.div>

						{/* Footer con botones que ocupan todo el ancho en una fila */}
						<DialogFooter className='flex-row gap-3 space-y-0 px-6 pt-8'>
							<motion.div variants={buttonVariants} initial='hidden' animate='visible' className='flex-1'>
								<ActionButton
									text={cancelText}
									onClick={onClose}
									disabled={isProcessing}
									variant='ghost'
									size='lg'
									className='w-full font-medium transition-all duration-200'
								/>
							</motion.div>

							<motion.div variants={buttonVariants} initial='hidden' animate='visible' className='flex-1'>
								<ActionButton
									onClick={handleConfirm}
									disabled={isProcessing || !isConfirmEnabled}
									className={`w-full font-medium transition-all duration-200 ${styles.button}`}
									size='lg'
									icon={isProcessing ? <Icons.spinnerSimple className='animate-spin' /> : null}
									text={isProcessing ? 'Procesando...' : confirmText}
								/>
							</motion.div>
						</DialogFooter>
					</div>

					<motion.div variants={footerVariants} initial='hidden' animate='visible' className='flex-1'>
						<motion.div
							variants={alertVariants}
							initial='hidden'
							animate='visible'
							className='text-muted-foreground/80 bg-card/30 border-border/50 flex justify-between rounded-b-3xl border-t px-6 py-4 text-xs'>
							<div className='flex items-center gap-2'>
								<kbd className='bg-muted rounded-sm px-2 py-1'>ESC</kbd>
								<span>Cerrar</span>
							</div>

							<div className='flex items-center gap-2'>
								<kbd className='bg-muted rounded-sm px-2 py-1'>Enter</kbd>
								<span>Confirmar</span>
							</div>
						</motion.div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</>
	)
})

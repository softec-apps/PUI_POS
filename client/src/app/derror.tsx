'use client'

import { useEffect, useState } from 'react'
import {
	AlertTriangle,
	Bug,
	Copy,
	Check,
	RefreshCw,
	FileText,
	MapPin,
	Clock,
	Code,
	Zap,
	Eye,
	EyeOff,
	Server,
	Wifi,
	Search,
	Download,
	Info,
	X,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Terminal,
	Activity,
	Shield,
	Layers,
	RefreshCcwDot,
	RefreshCcwIcon,
	HomeIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Mock Icons object for compatibility
const Icons = {
	alertTriangle: AlertTriangle,
	bug: Bug,
	copy: Copy,
	check: Check,
	refresh: RefreshCw,
	fileText: FileText,
	mapPin: MapPin,
	clock: Clock,
	code: Code,
	zap: Zap,
	eye: Eye,
	eyeOff: EyeOff,
	server: Server,
	wifi: Wifi,
	search: Search,
	download: Download,
	infoCircle: Info,
	x: X,
	chevronDown: ChevronDown,
	chevronRight: ChevronRight,
	externalLink: ExternalLink,
	spinnerSimple: RefreshCw,
	terminal: Terminal,
	activity: Activity,
	shield: Shield,
	layers: Layers,
}

interface ErrorPageProps {
	error: Error & { digest?: string; cause?: Error }
	reset: () => void
}

interface ErrorDetails {
	timestamp: Date
	userAgent: string
	url: string
	userId?: string
	sessionId?: string
}

interface EnhancedError extends Error {
	code?: string
	statusCode?: number
	fileName?: string
	lineNumber?: number
	columnNumber?: number
	componentStack?: string
	errorBoundary?: string
}

interface FileLocation {
	file: string
	line?: number
	column?: number
	fullPath: string
	sourcePath?: string
	isCompiled: boolean
	displayName?: string
	compiledFile?: string
	rawStackLine?: string
}

export default function ErrorDashboard({ error, reset }: ErrorPageProps) {
	const [copied, setCopied] = useState(false)
	const [isRetrying, setIsRetrying] = useState(false)
	const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null)
	const [isStackExpanded, setIsStackExpanded] = useState(false)
	const [selectedStackFrame, setSelectedStackFrame] = useState<number | null>(null)
	const [activeTab, setActiveTab] = useState<'details' | 'files' | 'stack' | 'system'>('details')

	useEffect(() => {
		console.error('Error capturado:', error)

		const details: ErrorDetails = {
			timestamp: new Date(),
			userAgent: navigator.userAgent,
			url: window.location.href,
		}

		setErrorDetails(details)
	}, [error])

	// Mapear archivos compilados a rutas reales del código fuente
	const mapCompiledToSource = (compiledPath: string): string | null => {
		const compiledPatterns = [
			{ pattern: /src_[a-f0-9]+\._\.js/, replacement: 'src/' },
			{ pattern: /_app-[a-f0-9]+\.js/, replacement: 'pages/_app.js' },
			{ pattern: /index-[a-f0-9]+\.js/, replacement: 'pages/index.js' },
			{ pattern: /index\.[a-f0-9]+\.js/, replacement: 'src/index.js' },
			{ pattern: /main\.[a-f0-9]+\.js/, replacement: 'src/main.js' },
			{ pattern: /component\.[a-f0-9]+\.js/, replacement: 'src/components/' },
		]

		for (const { pattern, replacement } of compiledPatterns) {
			if (pattern.test(compiledPath)) {
				return replacement
			}
		}

		const hashMatch = compiledPath.match(/(.+)\.[a-f0-9]{8,}\.js$/)
		if (hashMatch) {
			return `src/${hashMatch[1]}.js`
		}

		return null
	}

	// Extraer información del archivo donde ocurrió el error
	const extractFileLocations = (error: EnhancedError): FileLocation[] => {
		const locations: FileLocation[] = []

		// Si el error tiene fileName directo
		if (error.fileName) {
			const mappedPath = mapCompiledToSource(error.fileName)
			locations.push({
				file: error.fileName.split('/').pop() || error.fileName,
				line: error.lineNumber,
				column: error.columnNumber,
				fullPath: error.fileName,
				sourcePath: mappedPath,
				isCompiled: !!mappedPath,
				displayName: mappedPath || error.fileName,
			})
		}

		// Extraer del stack trace
		const stackLines = error.stack?.split('\n') || []

		for (const line of stackLines) {
			const patterns = [
				// Chrome/Edge: at functionName (file:line:column)
				/at\s+.*?\s*\((.+):(\d+):(\d+)\)/,
				// Firefox: functionName@file:line:column
				/(.+):(\d+):(\d+)$/,
				// Safari: functionName@file:line:column
				/@(.+):(\d+):(\d+)/,
				// Node.js/Webpack: at file:line:column
				/at\s+(.+):(\d+):(\d+)/,
			]

			for (const pattern of patterns) {
				const match = line.match(pattern)
				if (match) {
					const [, filePath, lineNum, colNum] = match

					// Filtrar rutas que no son útiles
					if (
						filePath &&
						!filePath.includes('node_modules') &&
						!filePath.includes('webpack-internal:') &&
						!filePath.includes('chrome-extension:') &&
						!filePath.includes('<anonymous>') &&
						!filePath.includes('webpack://') &&
						!locations.find(loc => loc.fullPath === filePath) // Evitar duplicados
					) {
						const fileName = filePath.split('/').pop() || filePath
						const mappedPath = mapCompiledToSource(fileName)

						// Limpiar y mejorar la ruta mostrada
						let displayPath = filePath
						if (filePath.includes('/.next/')) {
							// Para Next.js, extraer la ruta después de .next
							const nextMatch = filePath.match(/\.next\/.*?\/(.+)/)
							if (nextMatch) {
								displayPath = nextMatch[1]
							}
						} else if (filePath.startsWith('webpack://')) {
							// Para rutas de webpack
							displayPath = filePath.replace('webpack://', '').replace(/^[^/]+\//, '')
						}

						locations.push({
							file: fileName,
							line: parseInt(lineNum),
							column: parseInt(colNum),
							fullPath: filePath,
							sourcePath: mappedPath,
							isCompiled: !!mappedPath,
							displayName: mappedPath || displayPath,
							compiledFile: mappedPath ? fileName : undefined,
							rawStackLine: line.trim(),
						})
					}
				}
			}

			// Limitar a los primeros 5 archivos más relevantes
			if (locations.length >= 5) break
		}

		return locations
	}

	const fileLocations = extractFileLocations(error as EnhancedError)

	const generateErrorId = () => {
		const timestamp = Date.now().toString(36)
		const random = Math.random().toString(36).substring(2, 8)
		return `${timestamp}-${random}`
	}

	const getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
		if (error.message.includes('ChunkLoadError') || error.message.includes('Network')) return 'medium'
		if (error.message.includes('500') || error.message.includes('Internal')) return 'high'
		if (error.message.includes('Database') || error.message.includes('Auth')) return 'critical'
		return 'low'
	}

	const errorMessages: Record<
		string,
		{
			title: string
			description: string
			icon: keyof typeof Icons
			severity: 'low' | 'medium' | 'high' | 'critical'
			suggestions: string[]
		}
	> = {
		ChunkLoadError: {
			title: 'Resource Load Error',
			description: 'Some application resources could not be loaded.',
			icon: 'download',
			severity: 'medium',
			suggestions: ['Refresh the page', 'Clear browser cache', 'Check your internet connection'],
		},
		NetworkError: {
			title: 'Connection Error',
			description: 'Could not connect to the server.',
			icon: 'wifi',
			severity: 'medium',
			suggestions: [
				'Check your internet connection',
				'Try again in a few moments',
				'Contact support if the issue persists',
			],
		},
		default: {
			title: 'Unexpected Error',
			description: 'An error occurred that we could not identify.',
			icon: 'alertTriangle',
			severity: 'medium',
			suggestions: [
				'Try refreshing the page',
				'Check that your browser is up to date',
				'Contact support with the error code',
			],
		},
	}

	const getErrorType = (): string => {
		if (error.message.includes('ChunkLoadError')) return 'ChunkLoadError'
		if (error.message.includes('Network') || error.message.includes('fetch')) return 'NetworkError'
		return 'default'
	}

	const errorType = getErrorType()
	const errorConfig = errorMessages[errorType]
	const errorId = generateErrorId()

	const copyErrorDetails = async () => {
		const errorReport = {
			errorId,
			timestamp: errorDetails?.timestamp,
			type: errorType,
			message: error.message,
			stack: error.stack,
			url: errorDetails?.url,
			userAgent: errorDetails?.userAgent,
		}

		try {
			await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Error al copiar:', err)
		}
	}

	const handleRetry = async () => {
		setIsRetrying(true)
		await new Promise(resolve => setTimeout(resolve, 1000))
		try {
			reset()
		} catch (err) {
			console.error('Error al reintentar:', err)
		} finally {
			setIsRetrying(false)
		}
	}

	const getSeverityColors = (severity: string) => {
		switch (severity) {
			case 'low':
				return {
					bg: 'bg-blue-50',
					border: 'border-blue-200',
					icon: 'text-blue-600',
					text: 'text-blue-700',
					badge: 'bg-blue-100 text-blue-800',
				}
			case 'medium':
				return {
					bg: 'bg-amber-50',
					border: 'border-amber-200',
					icon: 'text-amber-600',
					text: 'text-amber-700',
					badge: 'bg-amber-100 text-amber-800',
				}
			case 'high':
				return {
					bg: 'bg-orange-50',
					border: 'border-orange-200',
					icon: 'text-orange-600',
					text: 'text-orange-700',
					badge: 'bg-orange-100 text-orange-800',
				}
			case 'critical':
				return {
					bg: 'bg-red-50',
					border: 'border-red-200',
					icon: 'text-red-600',
					text: 'text-red-700',
					badge: 'bg-red-100 text-red-800',
				}
			default:
				return {
					bg: 'bg-muted',
					border: 'border-border',
					icon: 'text-muted-foreground',
					text: 'text-foreground',
					badge: 'bg-muted text-muted-foreground',
				}
		}
	}

	const IconComponent = Icons[errorConfig.icon] || Icons.alertTriangle
	const severityColors = getSeverityColors(errorConfig.severity)

	const tabs = [
		{ id: 'details', label: 'Details', icon: Info },
		{ id: 'files', label: 'Files', icon: FileText, count: fileLocations.length },
		{ id: 'stack', label: 'Stack Trace', icon: Terminal },
		{ id: 'system', label: 'System', icon: Activity },
	]

	return (
		<div className='bg-background min-h-screen'>
			{/* Navigation Bar */}
			<div className='bg-card border-border border-b'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className={`rounded-lg ${severityColors.bg} ${severityColors.border} border p-2`}>
								<IconComponent className={`h-5 w-5 ${severityColors.icon}`} />
							</div>
							<div>
								<h1 className='text-foreground text-lg font-semibold'>Error</h1>
								<p className='text-muted-foreground text-sm'>Application Error Analysis</p>
							</div>
						</div>

						<div className='flex items-center gap-3'>
							<Button onClick={copyErrorDetails} size='sm' variant='ghost'>
								{copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
								{copied ? 'Copied' : 'Copy Report'}
							</Button>

							<Button onClick={() => window.location.reload()} size='sm' variant='secondary'>
								<HomeIcon /> Reload
							</Button>

							<Button onClick={handleRetry} disabled={isRetrying} size='sm'>
								{isRetrying ? (
									<>
										<RefreshCw className='h-4 w-4 animate-spin' />
										Retrying...
									</>
								) : (
									<>
										<RefreshCw className='h-4 w-4' />
										Retry
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
					{/* Sidebar - Error Overview */}
					<div className='lg:col-span-4'>
						<div className='sticky top-8 space-y-6'>
							{/* Error Status Card */}
							<div className='border-border bg-card rounded-xl border p-6 shadow-sm'>
								<div className='mb-4 flex items-start justify-between'>
									<div className={`rounded-lg ${severityColors.bg} ${severityColors.border} border p-3`}>
										<IconComponent className={`h-6 w-6 ${severityColors.icon}`} />
									</div>
									<span
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityColors.badge}`}>
										{errorConfig.severity.toUpperCase()}
									</span>
								</div>
								<h2 className='text-card-foreground mb-2 text-xl font-bold'>{errorConfig.title}</h2>
								<p className='text-muted-foreground mb-4'>{errorConfig.description}</p>

								<div className='border-border space-y-3 border-t pt-4'>
									<div className='text-muted-foreground flex items-center gap-2 text-sm'>
										<Clock className='h-4 w-4' />
										<span>{errorDetails?.timestamp.toLocaleString()}</span>
									</div>
									<div className='text-muted-foreground flex items-center gap-2 text-sm'>
										<Code className='h-4 w-4' />
										<code className='bg-muted text-muted-foreground rounded px-2 py-1 font-mono text-xs'>
											{errorId}
										</code>
									</div>
								</div>
							</div>

							{/* Suggestions */}
							<div className='border-border bg-card rounded-xl border p-6 shadow-sm'>
								<h3 className='text-card-foreground mb-4 font-semibold'>Suggested Actions</h3>
								<ul className='space-y-3'>
									{errorConfig.suggestions.map((suggestion, index) => (
										<li key={index} className='text-muted-foreground flex items-start gap-3 text-sm'>
											<div className='bg-muted-foreground/50 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full' />
											<span>{suggestion}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className='lg:col-span-8'>
						{/* Tab Navigation */}
						<div className='mb-6'>
							<div className='border-border border-b'>
								<nav className='-mb-px flex space-x-8'>
									{tabs.map(tab => {
										const TabIcon = tab.icon
										return (
											<button
												key={tab.id}
												onClick={() => setActiveTab(tab.id as any)}
												className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
													activeTab === tab.id
														? 'border-primary text-primary'
														: 'text-muted-foreground hover:border-border hover:text-foreground border-transparent'
												}`}>
												<TabIcon className='h-4 w-4' />
												{tab.label}
												{tab.count !== undefined && (
													<span className='bg-muted text-muted-foreground ml-1 rounded-full px-2 py-0.5 text-xs font-medium'>
														{tab.count}
													</span>
												)}
											</button>
										)
									})}
								</nav>
							</div>
						</div>

						{/* Tab Content */}
						<div className='space-y-6'>
							{activeTab === 'details' && (
								<div className=''>
									<h3 className='text-card-foreground mb-4 text-lg font-semibold'>Error Message</h3>
									<div className='border-destructive/20 bg-destructive/10 rounded-lg border p-4'>
										<div className='flex items-start gap-3'>
											<AlertTriangle className='text-destructive mt-0.5 h-5 w-5 flex-shrink-0' />
											<div className='min-w-0 flex-1'>
												<h4 className='text-destructive text-sm font-medium'>{error.name || 'Error'}</h4>
												<pre className='text-destructive/90 mt-2 font-mono text-sm break-words whitespace-pre-wrap'>
													{error.message}
												</pre>
											</div>
										</div>
									</div>
								</div>
							)}

							{activeTab === 'files' && (
								<div className='space-y-4'>
									{fileLocations.length > 0 ? (
										fileLocations.map((location, index) => (
											<div key={index} className='border-border bg-card rounded-xl border p-6 shadow-sm'>
												<div className='flex items-start justify-between'>
													<div className='min-w-0 flex-1'>
														<div className='mb-3 flex items-center gap-3'>
															<div className='bg-muted rounded-lg p-2'>
																<FileText className='text-muted-foreground h-4 w-4' />
															</div>
															<div>
																<h4 className='text-card-foreground font-mono text-sm font-semibold'>
																	{location.displayName}
																</h4>
																<p className='text-muted-foreground text-xs'>{location.fullPath}</p>
															</div>
														</div>
														<div className='flex items-center gap-2'>
															{location.line && (
																<span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'>
																	Line {location.line}
																</span>
															)}
															{location.column && (
																<span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400'>
																	Col {location.column}
																</span>
															)}
															{location.isCompiled && (
																<span className='inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'>
																	Compiled
																</span>
															)}
														</div>
													</div>
													<span className='bg-muted text-muted-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium'>
														{index + 1}
													</span>
												</div>
											</div>
										))
									) : (
										<div className='border-border bg-card rounded-xl border p-12 text-center shadow-sm'>
											<FileText className='text-muted-foreground mx-auto h-12 w-12' />
											<h3 className='text-card-foreground mt-4 text-lg font-medium'>No File Locations</h3>
											<p className='text-muted-foreground mt-2'>
												No specific file locations could be extracted from the error.
											</p>
										</div>
									)}
								</div>
							)}

							{activeTab === 'stack' && (
								<div className='border-border bg-card rounded-xl border shadow-sm'>
									<div className='p-6'>
										<pre className='font-mono text-xs whitespace-pre-wrap text-slate-100'>
											{error.stack || 'No stack trace available'}
										</pre>
									</div>
								</div>
							)}

							{activeTab === 'system' && (
								<div className='space-y-6'>
									<div className='border-border bg-card rounded-xl border p-6 shadow-sm'>
										<h3 className='text-card-foreground mb-4 text-lg font-semibold'>Environment Details</h3>
										<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
											<div className='space-y-3'>
												<div>
													<label className='text-foreground text-sm font-medium'>URL</label>
													<p className='text-muted-foreground mt-1 truncate font-mono text-sm'>{errorDetails?.url}</p>
												</div>
												<div>
													<label className='text-foreground text-sm font-medium'>Error Type</label>
													<p className='text-muted-foreground mt-1 font-mono text-sm'>{error.name || 'Error'}</p>
												</div>
											</div>
											<div className='space-y-3'>
												<div>
													<label className='text-foreground text-sm font-medium'>Timestamp</label>
													<p className='text-muted-foreground mt-1 text-sm'>{errorDetails?.timestamp.toISOString()}</p>
												</div>
												<div>
													<label className='text-foreground text-sm font-medium'>User Agent</label>
													<p className='text-muted-foreground mt-1 truncate text-sm'>
														{errorDetails?.userAgent?.split(' ')[0] || 'Unknown'}
													</p>
												</div>
											</div>
										</div>
									</div>

									<div className='rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800/20 dark:bg-amber-900/10'>
										<div className='flex items-start gap-3'>
											<Info className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
											<div>
												<h3 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
													Need Additional Help?
												</h3>
												<p className='mt-2 text-sm text-amber-700 dark:text-amber-300'>
													Share this error ID with support for faster assistance:
												</p>
												<code className='mt-2 inline-block rounded bg-amber-100 px-2 py-1 font-mono text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'>
													{errorId}
												</code>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

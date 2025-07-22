import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
	children?: React.ReactNode
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(({ className, children, ...props }, ref) => {
	return (
		<pre ref={ref} className={cn('bg-muted overflow-x-auto rounded-md p-4 text-sm', className)} {...props}>
			{children}
		</pre>
	)
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }

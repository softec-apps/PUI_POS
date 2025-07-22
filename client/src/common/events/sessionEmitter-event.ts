import mitt from 'mitt'

type Events = {
	unauthorized: void
	forbidden: void
	serverError: string
}

export const emitter = mitt<Events>()

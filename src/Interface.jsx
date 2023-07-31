import { useEffect, useRef } from "react"
import useGame from "./stores/useGame"
import { addEffect } from "@react-three/fiber"

export const Interface = () => {

	const time = useRef()

	const restart = useGame(state => state.restart)
	const phase = useGame(state => state.phase)

	useEffect(() => {
		const unsubscribeEffect = addEffect(() => {
			
			const state = useGame.getState()

			let elapsedTime = 0

			if (state.phase === 'playing') {
				elapsedTime = Date.now() - state.startTime
			} else if (state.phase === 'ended') {
				elapsedTime = state.endTime - state.startTime
			}

			elapsedTime /= 1000
			elapsedTime = elapsedTime.toFixed(2)

			if (time.current) {
				time.current.textContent = elapsedTime
			}

		})

		return () => {
			unsubscribeEffect()
		}
	}, [])
	
	return (
		<div className='interface'>
			{(phase === 'playing' || phase === 'ended') && (
				<div ref={time} className="time">
					0.00
				</div>	
			)}
			{phase === 'ended' && (
				<div className="restart" onClick={ restart }>
					Restart
				</div>
			)}
		</div>
	)
}

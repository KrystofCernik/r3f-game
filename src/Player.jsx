import { useEffect, useRef, useState } from "react"
import * as THREE from 'three'
import { RigidBody, useRapier } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import useGame from "./stores/useGame"

export const Player = () => {

	let music

	music = new Audio('/song.mp3')
	music.loop = true	
	music.volume = 1

	const body = useRef()

	const [ subscribeKeys, getKeys ] = useKeyboardControls()
	const { rapier, world } = useRapier()

	const [ smoothCameraPosition ] = useState(() => new THREE.Vector3(10, 10, 10))
	const [ smoothCameraTarget ] = useState(() => new THREE.Vector3())

	const start = useGame((state) => state.start)
	const end = useGame((state) => state.end)
	const restart = useGame((state) => state.restart)
	const blockCounts = useGame((state) => state.blocksCount)

	const jump = () => {

		const origin = body.current.translation()
		origin.y -= 0.31
		const direction = { x: 0, y: -1, z: 0 }
		const ray = new rapier.Ray(origin, direction)
		const hit = world.castRay(ray, 10, true)
	
		hit.toi < 0.15 ? body.current.applyImpulse({ x: 0, y: 0.5, z: 0 }) : null	
	}

	const reset = () => {
		body.current.setTranslation({ x: 0, y: 1, z: 0 })
		body.current.setLinvel({ x: 0, y: 0, z: 0 })
		body.current.setAngvel({ x: 0, y: 0, z: 0 })
	}

	useEffect(() => {

		const unsubscribeReset = useGame.subscribe(
			state => state.phase,
			value => {
				if (value === 'ready') {
					reset()
				}
			}
		)

		const unsubscribeJump = subscribeKeys(
			(state) => state.jump,
			(value) => {
				jump()
			}
		)

		const unsubscribeAny = subscribeKeys(
			() => {
				start()
				music.play()
			}
		)

		return () => {
			unsubscribeJump()
			unsubscribeAny()
			unsubscribeReset()
		}
	}, [])

	useFrame((state, delta) => {

		const { forward, backward, leftward, rightward, jump, r } = getKeys()

		const impulse = { x: 0, y: 0, z: 0 }
		const torque = { x: 0, y: 0, z: 0 }

		const impulseStrength = delta * 0.6
		const torqueStrength = delta * 0.2

		if (forward) {
			impulse.z -= impulseStrength
			torque.x -= torqueStrength
		}

		if (backward) {
			impulse.z += impulseStrength
			torque.x += torqueStrength
		}

		if (leftward) {
			impulse.x -= impulseStrength
			torque.x -= torqueStrength
		}

		if (rightward) {
			impulse.x += impulseStrength
			torque.z -= torqueStrength
		}

		body.current.applyImpulse(impulse)
		body.current.applyTorqueImpulse(torque)

		if (r) {
			restart()
		}

		/**
		 * Camera
		 */
		const bodyPosition = body.current.translation()

		const cameraPosition = new THREE.Vector3()
		cameraPosition.copy(bodyPosition)
		cameraPosition.z += 2.25
		cameraPosition.y += 0.65

		const cameraTarget = new THREE.Vector3()
		cameraTarget.copy(bodyPosition)
		cameraTarget.y += 0.25

		smoothCameraPosition.lerp(cameraPosition, 5 * delta)
		smoothCameraTarget.lerp(cameraTarget, 5 * delta)

		state.camera.position.copy(smoothCameraPosition)
		state.camera.lookAt(smoothCameraTarget)

		/**
		 * Phases
		 */
		if (bodyPosition.z < - (blockCounts * 4 + 2)) {
			end()
		}

		if (bodyPosition.y < - 4) {
			restart()
		}
	})

	return (
		<RigidBody ref={body} canSleep={false} linearDamping={ 0.5 } angularDamping={ 0.5 } colliders="ball" restitution={ 0.2 } friction={ 1 } position={[ 0, 1, 0 ]}>
			<mesh castShadow>
				<icosahedronGeometry args={[ 0.3, 1 ]} />
				<meshStandardMaterial flatShading color="mediumpurple" />
			</mesh>	
		</RigidBody>
	)
}
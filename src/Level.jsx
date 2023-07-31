import { useState, useRef, useMemo } from 'react'
import * as THREE from 'three'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Float, Text } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen' })
const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow' })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' })
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey' })

const BlockStart = ({ position = [0, 0, 0] }) => {
	return (
		<group position={ position }>
			<Float>
				<Text
					font='/bebas-neue-v9-latin-regular.woff'
					scale={ 0.4 }
					maxWidth={ 4 }
					lineHeight={ 1 }
					textAlign='right'
					position={[ 0.5, 0.75, 0 ]}
					rotation-y={ - 0.4 }
				>
					Enter the game
				</Text>
			</Float>
			<mesh
				geometry={ boxGeometry }
				material={ floor1Material }
				scale={[ 4, 0.2, 4 ]}
				position-y={ -0.1 }
				receiveShadow
			/>
		</group>
	)
}

export const BlockSpinner = ({ position = [0, 0, 0] }) => {
	const [ speed ] = useState(() => (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1))

	const obstacle = useRef()

	useFrame((state, delta) => {
		const time = state.clock.getElapsedTime()

		const rotation = new THREE.Quaternion()
		rotation.setFromEuler(new THREE.Euler(0, time * speed, 0))
		obstacle.current.setNextKinematicRotation(rotation)
	})

	return (
		<group position={ position }>
			<mesh
				geometry={ boxGeometry }
				material={ floor2Material }
				scale={[ 4, 0.2, 4 ]}
				position-y={ -0.1 }
				receiveShadow
			/>
			<RigidBody
				ref={obstacle}
				type='kinematicPosition'
				position={[ 0, 0.3, 0 ]}
				restitution={ 0.2 }
				friction={ 0 }
			>
				<mesh
					geometry={ boxGeometry }
					material={ obstacleMaterial }
					scale={[ 3.5, 0.3, 0.3 ]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	)
}

export const BlockLimbo = ({ position = [0, 0, 0] }) => {
	const [ timeOffset ] = useState(Math.random() * Math.PI * 2)

	const obstacle = useRef()

	useFrame((state, delta) => {
		const time = state.clock.getElapsedTime()

		const y = Math.sin(time + timeOffset) + 1.15
		obstacle.current.setNextKinematicTranslation({
			x: position[0],
			y: position[1] + y,
			z: position[2]
		})
	})

	return (
		<group position={ position }>
			<mesh
				geometry={ boxGeometry }
				material={ floor2Material }
				scale={[ 4, 0.2, 4 ]}
				position-y={ -0.1 }
				receiveShadow
			/>
			<RigidBody
				ref={obstacle}
				type='kinematicPosition'
				position={[ 0, 0.3, 0 ]}
				restitution={ 0.2 }
				friction={ 0 }
			>
				<mesh
					geometry={ boxGeometry }
					material={ obstacleMaterial }
					scale={[ 3.5, 0.3, 0.3 ]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	)
}

export const BlockAxe = ({ position = [0, 0, 0] }) => {
	const [ timeOffset ] = useState(Math.random() * Math.PI * 2)

	const obstacle = useRef()

	useFrame((state, delta) => {
		const time = state.clock.getElapsedTime()

		const x = Math.sin(time + timeOffset) * 1.25
		obstacle.current.setNextKinematicTranslation({
			x: position[0] + x,
			y: position[1] + 0.75,
			z: position[2]
		})
	})

	return (
		<group position={ position }>
			<mesh
				geometry={ boxGeometry }
				material={ floor2Material }
				scale={[ 4, 0.2, 4 ]}
				position-y={ -0.1 }
				receiveShadow
			/>
			<RigidBody
				ref={obstacle}
				type='kinematicPosition'
				position={[ 0, 0.3, 0 ]}
				restitution={ 0.2 }
				friction={ 0 }
			>
				<mesh
					geometry={ boxGeometry }
					material={ obstacleMaterial }
					scale={[ 1.5, 1.5, 0.3 ]}
					castShadow
					receiveShadow
				/>
			</RigidBody>
		</group>
	)
}

const BlockEnd = ({ position = [0, 0, 0] }) => {

	const burger = useGLTF('/hamburger.glb')

	burger.scene.children.forEach((mesh) => {
		mesh.castShadow = true
	})

	return (
		<group position={ position }>
			<Text
				font='/bebas-neue-v9-latin-regular.woff'
				scale={ 1 }
				lineHeight={ 1 }
				textAlign='center'
				position={[ 0, 2.5, 2 ]}
			>
				Finish
				<meshBasicMaterial toneMapped={ false } />
			</Text>
			<mesh
				geometry={ boxGeometry }
				material={ floor1Material }
				scale={[ 4, 0.2, 4 ]}
				receiveShadow
			/>
			<RigidBody type='fixed' colliders="hull" position={[ 0, 0.25, 0 ]} restitution={ 0.2 } friction={ 0 }>
				<primitive object={burger.scene} scale={0.2} />
			</RigidBody>
		</group>
	)
}

const Bounds = ({ length = 1 }) => {
	return (
		<RigidBody type='fixed' restitution={ 0.3 } friction={ 0 }>
			<mesh
				position={[ 2.15, 0.75, - (length * 2) + 2 ]}
				geometry={boxGeometry}
				material={wallMaterial}
				scale={[ 0.3, 1.5, length * 4 ]}
				castShadow
			/>
			<mesh
				position={[ - 2.15, 0.75, - (length * 2) + 2 ]}
				geometry={boxGeometry}
				material={wallMaterial}
				scale={[ 0.3, 1.5, length * 4 ]}
				receiveShadow
			/>
			<mesh
				position={[ 0, 0.75, - (length * 4) + 2 ]}
				geometry={boxGeometry}
				material={wallMaterial}
				scale={[ 4, 1.5, 0.3 ]}
				receiveShadow
			/>
			<CuboidCollider
				args={[ 2, 0.1, length * 2 ]}
				position={[ 0, - 0.1, - (length * 2) + 2 ]}
				restitution={ 0.2 }
				friction={ 1 }
			/>
		</RigidBody>
	)
}

export const Level = ({ count = 5, types = [BlockSpinner, BlockAxe, BlockLimbo] }) => {

	const blocks = useMemo(() => {
		const blocks = []

		for (let i = 0; i < count; i++) {
			// const type = types[i]
			const type = types[Math.floor(Math.random() * types.length)]
			blocks.push(type)
		}

		return blocks
	}, [count, types])

	return (
		<>

			<BlockStart position={[ 0, 0, 0 ]} />

			{blocks.map((Block, index) => <Block key={index} position={[ 0, 0, - (index + 1)  * 4 ]} />)}

			<BlockEnd position={[ 0, 0, - (count + 1) * 4 ]} />

			<Bounds length={count + 2} />

		</>
	)
}

import { useState } from 'react'
import EntryPhase from './phases/EntryPhase'
import ExperiencePhase from './phases/ExperiencePhase'
import ExitPhase from './phases/ExitPhase'

/**
 * 발표용 경험 흐름의 중심.
 * phase 하나만으로 입장→진행→종료를 명확히 분리합니다.
 */
export default function App() {
  const [phase, setPhase] = useState('entry') // 'entry' | 'experience' | 'exit'
  const [completedEquipment, setCompletedEquipment] = useState(null)

  if (phase === 'entry') {
    return <EntryPhase onStart={() => setPhase('experience')} />
  }

  if (phase === 'experience') {
    return (
      <ExperiencePhase
        onComplete={(equipment) => {
          setCompletedEquipment(equipment)
          setPhase('exit')
        }}
      />
    )
  }

  return (
    <ExitPhase
      equipment={completedEquipment}
      onRestart={() => {
        setCompletedEquipment(null)
        setPhase('entry')
      }}
      onNext={() => setPhase('experience')}
    />
  )
}

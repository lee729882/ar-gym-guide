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
  const [hasStarted, setHasStarted] = useState(false)

  const handleStart = () => {
    setHasStarted(true)
    setPhase('experience')
  }

  return (
    <>
      {phase === 'entry' && <EntryPhase onStart={handleStart} />}

      {hasStarted && (
        <div style={{ display: phase === 'experience' ? 'block' : 'none', width: '100%', height: '100%', position: 'absolute' }}>
          <ExperiencePhase
            isActive={phase === 'experience'}
            onComplete={(equipment) => {
              setCompletedEquipment(equipment)
              setPhase('exit')
            }}
          />
        </div>
      )}

      {phase === 'exit' && (
        <ExitPhase
          equipment={completedEquipment}
          onRestart={() => {
            setCompletedEquipment(null)
            setPhase('entry')
            setHasStarted(false) // 완전히 처음으로 갈 때는 다시 언마운트 해줍니다
          }}
          onNext={() => setPhase('experience')}
        />
      )}
    </>
  )
}
